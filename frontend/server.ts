import express from 'express';
import { createServer as createViteServer } from 'vite';
import multer from 'multer';
import { PDFDocument } from 'pdf-lib';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

// ---- PDF Text Extraction (pdfjs-dist) ----
async function extractPdfText(buffer: Buffer): Promise<string> {
  try {
    const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs' as any);
    const loadingTask = pdfjs.getDocument({ data: new Uint8Array(buffer) });
    const pdfDoc = await loadingTask.promise;
    let text = '';
    for (let i = 1; i <= pdfDoc.numPages; i++) {
      const page = await pdfDoc.getPage(i);
      const content = await page.getTextContent();
      text += content.items.map((item: any) => item.str).join(' ') + '\n';
    }
    return text.trim();
  } catch {
    return '';
  }
}

// ---- Jaccard Similarity ----
function jaccardSimilarity(text1: string, text2: string): number {
  if (!text1 || !text2) return 0;
  const stopWords = new Set(['the','a','an','and','or','but','in','on','at','to','for','of','with','by','from','is','are','was','were','be','been','being','have','has','had','do','does','did','will','would','could','should','may','might','this','that','these','those']);
  const tokenize = (t: string) => new Set(
    t.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(w => w.length > 2 && !stopWords.has(w))
  );
  const set1 = tokenize(text1);
  const set2 = tokenize(text2);
  if (set1.size === 0 || set2.size === 0) return 0;
  const intersection = new Set([...set1].filter(x => set2.has(x)));
  const union = new Set([...set1, ...set2]);
  return intersection.size / union.size;
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 5173;

app.use(express.json());

// Ensure uploads directory exists
const UPLOADS_DIR = path.join(__dirname, 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR);
}

// Serve uploaded files statically
app.use('/uploads', express.static(UPLOADS_DIR));

// Users & Auth Config
const EDITOR_ACCOUNT = {
	name: "Editor",
	email: "editor@tnf.com",
	password: "editor@123",
};

export interface Submission {
  id: string;
  timestamp: number;
  email: string;
  author_name: string;
  journal: string;
  title: string;
  fingerprint: string;
  file_name: string;
  file_size: number;
  metadata: {
    author: string;
    creator: string;
    producer: string;
    creationDate: string;
    modDate: string;
    content_hash?: string;
    text_sample?: string;
    text_content?: string;
    document_type?: string;
    document_kind?: string;
    similarity_score?: number;
  };
  score: number;
  risk_level: string;
  signals: string[];
  risk_factors: any;
  linked_accounts: string[];
  account_count: number;
  workflow_status: string;
  analysis_status: string;
  review_status: string;
  review_decision: string | null;
  reviewer_name: string | null;
  reviewed_at: number | null;
  scan_started_at: number | null;
  scan_completed_at: number | null;
  file_url: string;
  similar_document?: any;
}

let db: Submission[] = [];

// Multer for in-memory file uploads
const upload = multer({ storage: multer.memoryStorage() });

// -- Endpoints --

// 1. Auth Endpoints
app.get('/api/auth/editor', (req, res) => {
  res.json({
    success: true,
    editor: {
      name: EDITOR_ACCOUNT.name,
      email: EDITOR_ACCOUNT.email,
      role: "editor",
    },
  });
});

app.post('/api/auth/editor', (req, res) => {
  const { email, password } = req.body;
  if (email.trim().toLowerCase() === EDITOR_ACCOUNT.email && password === EDITOR_ACCOUNT.password) {
    res.json({
      success: true,
      session: {
        name: EDITOR_ACCOUNT.name,
        email: EDITOR_ACCOUNT.email,
        role: "editor",
        authenticated: true,
      }
    });
  } else {
    res.status(401).json({ detail: "Invalid editor credentials" });
  }
});

// 2. Upload Endpoint
app.post('/api/upload', upload.single('file'), async (req, res) => {
  try {
    const { fingerprint, email, title, journal, author_name, document_type, document_kind } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Extract Metadata from PDF
    const content_hash = crypto.createHash('sha256').update(file.buffer).digest('hex');
    let metadata: any = {
      author: '',
      creator: '',
      producer: '',
      creationDate: '',
      modDate: '',
      content_hash
    };

    // Extract full text for similarity analysis
    const text_content = await extractPdfText(file.buffer);
    metadata.text_content = text_content;
    metadata.text_sample = text_content.substring(0, 500);

    if (file.mimetype === 'application/pdf') {
      try {
        const pdfDoc = await PDFDocument.load(file.buffer, { ignoreEncryption: true });
        metadata = {
          ...metadata,
          author: pdfDoc.getAuthor() || '',
          creator: pdfDoc.getCreator() || '',
          producer: pdfDoc.getProducer() || '',
          creationDate: pdfDoc.getCreationDate()?.toISOString() || '',
          modDate: pdfDoc.getModificationDate()?.toISOString() || '',
          document_type: document_type || 'Paper',
          document_kind: document_kind || 'Science',
        };
      } catch (e) {
        console.warn('Could not extract PDF metadata', e);
      }
    }

    // Risk Scoring Logic (Ported from risk_scoring.py)
    let score = 0;
    const signals: string[] = [];
    const risk_factors: any = {};
    const linked_accounts: string[] = [];
    
    // Get prior subs
    const matching_subs = db.filter(s => s.fingerprint === fingerprint);
    const prior_emails = new Set(matching_subs.map(s => s.email));
    prior_emails.add(email);
    linked_accounts.push(...Array.from(prior_emails));

    // Layer 1: Fingerprint
    if (matching_subs.length === 0) {
        signals.push("✓ New device fingerprint");
        risk_factors.first_submission = true;
    } else if (matching_subs.length === 1) {
        signals.push("• Device seen before (1 prior account)");
        risk_factors.prior_accounts = 1;
        score += 5;
    } else if (matching_subs.length <= 3) {
        signals.push(`⚠ Device fingerprint matches ${matching_subs.length} prior accounts`);
        risk_factors.prior_accounts = matching_subs.length;
        score += 30;
    } else {
        signals.push(`🔴 Device fingerprint matches ${matching_subs.length} prior accounts`);
        risk_factors.prior_accounts = matching_subs.length;
        score += 40;
    }

    // Layer 2: Metadata
    if (metadata.author) {
        const authorMatches = db.filter(s => s.metadata.author === metadata.author);
        if (authorMatches.length > 0) {
            score += 20;
            signals.push(`⚠ Document author metadata matches ${authorMatches.length} submissions`);
            risk_factors.author_matches = authorMatches.length;
        }
    }

    // Layer 3: Behavior Velocity
    const now = Date.now();
    const tenMins = 10 * 60 * 1000;
    const recent = db.filter(s => now - s.timestamp < tenMins);
    const fp_velocity = recent.filter(s => s.fingerprint === fingerprint).length;
    
    if (fp_velocity >= 5) {
        score += 35;
        signals.push(`🔴 BULK UPLOAD: ${fp_velocity} files in 10 minutes`);
    } else if (fp_velocity >= 3) {
        score += 25;
        signals.push(`⚠ Multiple uploads: ${fp_velocity} files in 10 minutes`);
    } else if (fp_velocity >= 2) {
        score += 10;
        signals.push(`• ${fp_velocity} uploads in short timeframe`);
    }

    const email_submissions = db.filter(s => s.email === email);
    if (email_submissions.length > 0) {
        score += 5;
        signals.push(`• Email seen in ${email_submissions.length} past submissions`);
    }

    score = Math.min(score, 100);

    let risk_level = "critical";
    if (score < 30) risk_level = "low";
    else if (score < 60) risk_level = "medium";
    else if (score < 85) risk_level = "high";

    // Save file to disk so it can be viewed
    const savedFileName = `${now}_${file.originalname}`;
    fs.writeFileSync(path.join(UPLOADS_DIR, savedFileName), file.buffer);
    const file_url = `http://localhost:${PORT}/uploads/${savedFileName}`;

    const submission: Submission = {
      id: `sub_${now}_${Math.random().toString(36).substring(7)}`,
      timestamp: now,
      email,
      author_name: author_name || 'Anonymous',
      journal: journal || 'Unknown Journal',
      title,
      fingerprint,
      file_name: file.originalname,
      file_size: file.size,
      metadata: { ...metadata, document_type, document_kind },
      score,
      risk_level,
      signals,
      risk_factors,
      linked_accounts,
      account_count: linked_accounts.length,
      workflow_status: "pending",
      analysis_status: "queued",
      review_status: "pending",
      review_decision: null,
      reviewer_name: null,
      reviewed_at: null,
      scan_started_at: null,
      scan_completed_at: null,
      file_url,
      similar_document: null as any
    };

    // Check for similar/duplicate documents using Jaccard text similarity
    let similar_document = null;
    let bestMatch: { sub: any; score: number } | null = null;

    for (const existingSub of db) {
      // Exact content hash = guaranteed duplicate
      if (existingSub.metadata.content_hash === content_hash) {
        similar_document = {
          file_name: existingSub.file_name,
          type: existingSub.metadata.document_type || document_type,
          kind: existingSub.metadata.document_kind || document_kind,
          similarity_score: 100,
          match_type: 'exact',
          content_preview: existingSub.metadata.text_sample || 'No preview available.'
        };
        signals.push(`🔴 EXACT DUPLICATE: Identical file content matches "${existingSub.file_name}"`);
        score = Math.min(score + 50, 100);
        break;
      }

      // Text similarity for non-identical files
      if (text_content && existingSub.metadata.text_content) {
        const sim = jaccardSimilarity(text_content, existingSub.metadata.text_content);
        if (sim > 0.25 && (!bestMatch || sim > bestMatch.score)) {
          bestMatch = { sub: existingSub, score: sim };
        }
      }
    }

    if (!similar_document && bestMatch) {
      const simPct = Math.round(bestMatch.score * 100);
      similar_document = {
        file_name: bestMatch.sub.file_name,
        type: bestMatch.sub.metadata.document_type || document_type,
        kind: bestMatch.sub.metadata.document_kind || document_kind,
        similarity_score: simPct,
        match_type: 'content',
        content_preview: bestMatch.sub.metadata.text_sample || 'No preview available.'
      };
      if (simPct >= 70) {
        signals.push(`🔴 HIGH SIMILARITY: ${simPct}% text overlap with "${bestMatch.sub.file_name}"`);
        score = Math.min(score + 40, 100);
      } else if (simPct >= 45) {
        signals.push(`⚠ MODERATE SIMILARITY: ${simPct}% text overlap with "${bestMatch.sub.file_name}"`);
        score = Math.min(score + 20, 100);
      } else {
        signals.push(`• LOW SIMILARITY: ${simPct}% text overlap with "${bestMatch.sub.file_name}"`);
        score = Math.min(score + 5, 100);
      }
    }

    // Recalculate risk level after similarity adjustments
    risk_level = score < 30 ? 'low' : score < 60 ? 'medium' : score < 85 ? 'high' : 'critical';

    submission.similar_document = similar_document;
    submission.score = score;
    submission.risk_level = risk_level;

    db.push(submission);

    res.json({
      success: true,
      submission_id: submission.id,
      status: "pending",
      analysis_status: "completed",
      risk_score: score,
      risk_level,
      signals,
      linked_accounts,
      account_count: linked_accounts.length,
      similar_document
    });
  } catch (error: any) {
    console.error('Upload Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// 3. Scan Endpoint
app.post('/api/scan/:submission_id', (req, res) => {
    const { submission_id } = req.params;
    const subIndex = db.findIndex(s => s.id === submission_id);
    if (subIndex === -1) return res.status(404).json({ detail: "Submission not found" });

    const scanned_at = Date.now();
    db[subIndex].analysis_status = "completed";
    db[subIndex].scan_started_at = db[subIndex].scan_started_at || scanned_at;
    db[subIndex].scan_completed_at = scanned_at;

    res.json({
        success: true,
        submission: db[subIndex],
        analysis: {
            risk_score: db[subIndex].score,
            risk_level: db[subIndex].risk_level,
            signals: db[subIndex].signals,
            linked_accounts: db[subIndex].linked_accounts,
            account_count: db[subIndex].account_count,
        }
    });
});

// 4. Update Decision Endpoint
app.post('/api/submissions/:submission_id/decision', (req, res) => {
    const { submission_id } = req.params;
    const { decision, reviewer_name } = req.body;
    
    const subIndex = db.findIndex(s => s.id === submission_id);
    if (subIndex === -1) return res.status(404).json({ detail: "Submission not found" });

    const normalized_decision = decision.toLowerCase().trim();
    if (normalized_decision !== "accept" && normalized_decision !== "reject") {
        return res.status(400).json({ detail: "Decision must be accept or reject" });
    }

    const review_status = normalized_decision === "accept" ? "accepted" : "rejected";
    
    db[subIndex].workflow_status = review_status;
    db[subIndex].review_status = review_status;
    db[subIndex].review_decision = normalized_decision;
    db[subIndex].reviewer_name = reviewer_name || "Editor";
    db[subIndex].reviewed_at = Date.now();

    res.json({
        success: true,
        submission: db[subIndex]
    });
});

// 5. Get all submissions
app.get('/api/submissions', (req, res) => {
  res.json({
      success: true,
      total_submissions: db.length,
      submissions: [...db].sort((a, b) => b.timestamp - a.timestamp)
  });
});

// 6. Get a specific submission
app.get('/api/submissions/:submission_id', (req, res) => {
    const sub = db.find(s => s.id === req.params.submission_id);
    if (!sub) return res.status(404).json({ detail: "Submission not found" });
    res.json({ success: true, submission: sub });
});

// 7. Get Fingerprint Stats
app.get('/api/fingerprint/:fingerprint', (req, res) => {
    const subs = db.filter(s => s.fingerprint === req.params.fingerprint);
    res.json({
        success: true,
        fingerprint: req.params.fingerprint,
        submission_count: subs.length,
        submissions: subs
    });
});

// 8. Overall Stats
app.get('/api/stats', (req, res) => {
    const high_risk = db.filter(s => s.score >= 60).length;
    const critical_risk = db.filter(s => s.score >= 85).length;
    const unique_fingerprints = new Set(db.map(s => s.fingerprint)).size;
    const unique_emails = new Set(db.map(s => s.email)).size;
    const avg_risk = db.length > 0 ? db.reduce((acc, s) => acc + s.score, 0) / db.length : 0;
    
    const now = Date.now();
    const recent = db.filter(s => now - s.timestamp < 60 * 60 * 1000).length;

    res.json({
        success: true,
        total_submissions: db.length,
        unique_fingerprints,
        unique_emails,
        high_risk_submissions: high_risk,
        critical_risk_submissions: critical_risk,
        average_risk_score: Math.round(avg_risk * 10) / 10,
        recent_submissions: recent
    });
});

// 9. Clear
app.post('/api/clear', (req, res) => {
    db = [];
    res.json({ success: true, message: "All data cleared" });
});


// Add health endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
