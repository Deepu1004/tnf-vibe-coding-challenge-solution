import React, { useEffect, useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { FileText, Search, Eye, X, AlertCircle, CheckCircle, Fingerprint, Hash, ShieldAlert, Filter, Trash2 } from 'lucide-react';
import { DocumentModal } from '../DocumentModal';
import { api, normalizeFileUrl } from '../../api';

type RiskFilter = 'all' | 'safe' | 'considerable' | 'risky';

function cleanSignal(sig: string): string {
  return sig
    .replace(/[🔴⚠✓•]/g, '')
    .replace(/^\s*[\.\-]\s*/, '')
    .trim();
}

function riskLabel(score: number) {
  if (score < 25) return { label: 'Safe', bg: 'bg-emerald-100 text-emerald-800' };
  if (score < 65) return { label: 'Considerable', bg: 'bg-amber-100 text-amber-800' };
  return { label: 'Risky', bg: 'bg-red-100 text-red-800' };
}

function signalColor(sig: string) {
  if (sig.includes('🔴') || sig.toUpperCase().includes('DUPLICATE') || sig.toUpperCase().includes('BULK') || sig.toUpperCase().includes('EXACT') || sig.toUpperCase().includes('HIGH SIMILARITY')) {
    return 'bg-red-50 text-red-700 border-red-200';
  }
  if (sig.includes('⚠') || sig.toUpperCase().includes('MODERATE')) {
    return 'bg-amber-50 text-amber-700 border-amber-200';
  }
  return 'bg-gray-50 text-gray-600 border-gray-200';
}

export function EditorReports() {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [riskFilter, setRiskFilter] = useState<RiskFilter>('all');
  const [viewDoc, setViewDoc] = useState<{ url: string; name: string; fingerprint?: string | null } | null>(null);
  const [detailsDoc, setDetailsDoc] = useState<any>(null);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  const fetchSubmissions = async () => {
    try {
      const data = await api.get('/api/submissions');
      setSubmissions(data.submissions || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRecord = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this record? This action cannot be undone.')) {
      return;
    }
    try {
      await api.delete(`/api/submissions/${id}`);
      setDetailsDoc(null);
      fetchSubmissions();
      showNotification('Record deleted successfully.', 'success');
    } catch (err: any) {
      showNotification('Failed to delete record: ' + err.message, 'error');
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const filtered = submissions.filter(s => {
    const search = searchTerm.toLowerCase();
    const matchSearch =
      (s.title || s.file_name || '').toLowerCase().includes(search) ||
      (s.author_name || '').toLowerCase().includes(search) ||
      (s.email || '').toLowerCase().includes(search);

    const matchRisk =
      riskFilter === 'all' ||
      (riskFilter === 'safe' && s.score < 25) ||
      (riskFilter === 'considerable' && s.score >= 25 && s.score < 65) ||
      (riskFilter === 'risky' && s.score >= 65);

    return matchSearch && matchRisk;
  });

  return (
    <div className="max-w-7xl mx-auto py-10 px-6 w-full">
      <div className="flex items-center justify-between mb-8 animate-slide-up">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight gradient-text">All Reports</h1>
          <p className="mt-2 text-gray-500 text-sm font-medium">Full history of submissions and integrity scans.</p>
        </div>
      </div>

      {notification && (
        <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 shadow-md animate-slide-up ${notification.type === 'success' ? 'bg-green-50 border border-green-200 text-green-800' : 'bg-red-50 border border-red-200 text-red-800'}`}>
          <AlertCircle size={20} className={notification.type === 'success' ? 'text-green-600' : 'text-red-600'} />
          <p className="font-semibold text-sm">{notification.message}</p>
        </div>
      )}

      <div className="card overflow-hidden animate-slide-up">
        {/* Filters Bar */}
        <div className="p-4 border-b border-gray-100 bg-gray-50 flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search title, author, email..."
              className="block w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#005A9C] focus:border-[#005A9C] bg-white"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={14} className="text-gray-400" />
            <select
              value={riskFilter}
              onChange={e => setRiskFilter(e.target.value as RiskFilter)}
              className="text-xs font-semibold border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#005A9C]"
            >
              <option value="all">All Risk Levels</option>
              <option value="safe">Safe (0–24)</option>
              <option value="considerable">Considerable (25–64)</option>
              <option value="risky">Risky (65+)</option>
            </select>
          </div>
          <span className="ml-auto text-xs text-gray-400 font-medium">{filtered.length} result{filtered.length !== 1 ? 's' : ''}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                <th className="p-4 pl-6">Date / ID</th>
                <th className="p-4">Manuscript &amp; Author</th>
                <th className="p-4 text-center">Score</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-center">Details</th>
                <th className="p-4 pr-6 text-center">Document</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={6} className="p-10 text-center text-gray-400">Loading records...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="p-10 text-center text-gray-400">No records match your search or filter.</td></tr>
              ) : filtered.map((sub: any) => {
                const risk = riskLabel(sub.score);
                return (
                  <tr key={sub.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 pl-6 align-top">
                      <p className="text-xs font-mono text-gray-400">{new Date(sub.timestamp).toLocaleDateString()}</p>
                      <p className="text-[10px] font-mono text-gray-300 mt-0.5">{sub.id?.substring(0, 16)}...</p>
                    </td>
                    <td className="p-4 align-top">
                      <p className="font-semibold text-gray-900 max-w-[220px] truncate" title={sub.title || sub.file_name}>{sub.title || sub.file_name}</p>
                      <p className="text-sm text-[#005A9C] mt-0.5">{sub.author_name}</p>
                      <p className="text-xs text-gray-400">{sub.email}</p>
                    </td>
                    <td className="p-4 align-top text-center">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${risk.bg}`}>
                        {sub.score}/100
                      </span>
                      <p className="text-[10px] text-gray-400 mt-1">{risk.label}</p>
                    </td>
                    <td className="p-4 align-top">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${
                        sub.workflow_status === 'pending' ? 'bg-amber-100 text-amber-800' :
                        sub.workflow_status === 'accepted' ? 'bg-emerald-100 text-emerald-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {sub.workflow_status.charAt(0).toUpperCase() + sub.workflow_status.slice(1)}
                      </span>
                    </td>
                    <td className="p-4 pr-6 align-top text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => setDetailsDoc(sub)}
                          title="View full risk report"
                          className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors border border-blue-100"
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          onClick={() => handleDeleteRecord(sub.id)}
                          title="Delete record"
                          className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-red-50 text-red-600 hover:bg-red-100 transition-colors border border-red-100"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                    <td className="p-4 pr-6 align-top text-center">
                      <button
                        onClick={() => setViewDoc({ url: normalizeFileUrl(sub.file_url), name: sub.file_name || sub.title, fingerprint: sub.fingerprint })}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#005A9C] bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-100 transition-colors"
                      >
                        <FileText size={12} /> Open
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <DocumentModal isOpen={!!viewDoc} onClose={() => setViewDoc(null)} fileUrl={viewDoc?.url || null} fileName={viewDoc?.name || ''} />

      {/* Detailed Report Modal */}
      {detailsDoc && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden border border-gray-100">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${detailsDoc.score >= 65 ? 'bg-red-100 text-red-600' : detailsDoc.score >= 25 ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'}`}>
                  <ShieldAlert size={20} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">Risk Intelligence Report</h3>
                  <p className="text-xs text-gray-400 truncate max-w-[320px]">{detailsDoc.title || detailsDoc.file_name}</p>
                </div>
              </div>
              <button onClick={() => setDetailsDoc(null)} className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-white">
              {/* Identity Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-1"><Hash size={10} /> Submission ID</p>
                  <p className="text-xs font-mono text-gray-700 break-all">{detailsDoc.id}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-1"><Fingerprint size={10} /> Hardware Fingerprint</p>
                  <p className="text-xs font-mono text-gray-700 break-all">{detailsDoc.fingerprint || detailsDoc.hardware_fingerprint || 'Not captured'}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Author</p>
                  <p className="text-xs font-semibold text-gray-700">{detailsDoc.author_name}</p>
                  <p className="text-[11px] text-gray-400">{detailsDoc.email}</p>
                </div>
                <div className={`rounded-xl p-4 border flex flex-col items-center justify-center ${detailsDoc.score >= 65 ? 'bg-red-50 border-red-200' : detailsDoc.score >= 25 ? 'bg-amber-50 border-amber-200' : 'bg-emerald-50 border-emerald-200'}`}>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Risk Score</p>
                  <p className={`text-4xl font-black ${detailsDoc.score >= 65 ? 'text-red-600' : detailsDoc.score >= 25 ? 'text-amber-600' : 'text-emerald-600'}`}>{detailsDoc.score}</p>
                  <p className="text-[11px] font-bold text-gray-400">{riskLabel(detailsDoc.score).label}</p>
                </div>
              </div>

              {/* Risk Signals */}
              <div>
                <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                  <AlertCircle size={15} className="text-red-500" /> Risk Signals
                </h4>
                {detailsDoc.signals?.length === 0 ? (
                  <p className="text-sm text-gray-400 italic bg-gray-50 p-3 rounded-lg">No risk signals detected.</p>
                ) : (
                  <div className="space-y-2">
                    {detailsDoc.signals?.map((sig: string, idx: number) => (
                      <div key={idx} className={`text-sm px-3 py-2.5 rounded-lg border font-medium ${signalColor(sig)}`}>
                        {cleanSignal(sig)}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Points to Consider */}
              <div>
                <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                  <CheckCircle size={15} className="text-emerald-500" /> Points to Consider
                </h4>
                <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 space-y-1.5 text-sm text-gray-700">
                  <p>{detailsDoc.score < 25 ? '✓ Low risk profile.' : detailsDoc.score < 65 ? '⚠ Moderate risk — review carefully.' : '✗ High risk — strong fraud indicators.'}</p>
                  {(detailsDoc.linked_accounts?.length || 0) <= 1 && <p>✓ Only one account linked to this device.</p>}
                  {(detailsDoc.linked_accounts?.length || 0) > 1 && <p>✗ Multiple accounts linked — possible coordinated submission.</p>}
                  {!detailsDoc.similar_document && <p>✓ No similar documents found in the database.</p>}
                  {detailsDoc.similar_document && <p>✗ Similar content found — verify this is not a duplicate.</p>}
                </div>
              </div>

              {/* Similar Document */}
              {detailsDoc.similar_document && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <h4 className="text-sm font-bold text-red-800 mb-2 flex items-center gap-2">
                    <AlertCircle size={14} />
                    {detailsDoc.similar_document.match_type === 'exact' ? 'Exact Duplicate Detected' : 'Similar Document Match'}
                  </h4>
                  {detailsDoc.similar_document.similarity_score !== undefined && (
                    <div className="mb-3">
                      <div className="flex justify-between text-xs font-bold text-red-600 mb-1">
                        <span>Content Similarity</span><span>{detailsDoc.similar_document.similarity_score}%</span>
                      </div>
                      <div className="w-full bg-red-100 rounded-full h-1.5">
                        <div className="bg-red-500 h-1.5 rounded-full" style={{ width: `${detailsDoc.similar_document.similarity_score}%` }} />
                      </div>
                    </div>
                  )}
                  <div className="bg-white rounded-lg border border-red-100 p-3 text-sm text-gray-800 space-y-1">
                    <p><strong>File:</strong> {detailsDoc.similar_document.file_name}</p>
                    <p><strong>Type:</strong> {detailsDoc.similar_document.type} — <strong>Kind:</strong> {detailsDoc.similar_document.kind}</p>
                  </div>
                </div>
              )}

              {/* Linked Accounts */}
              {(detailsDoc.linked_accounts?.length || 0) > 1 && (
                <div>
                  <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                    <Fingerprint size={15} className="text-purple-500" /> Linked Accounts via Device
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {detailsDoc.linked_accounts.map((acc: string, idx: number) => (
                      <span key={idx} className="text-xs font-mono bg-purple-50 text-purple-700 border border-purple-100 px-2.5 py-1 rounded-full">{acc}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-between items-center gap-3">
              <button
                onClick={() => handleDeleteRecord(detailsDoc.id)}
                className="px-4 py-2 bg-red-50 text-red-600 text-sm font-bold rounded-lg hover:bg-red-100 border border-red-200 transition-colors flex items-center gap-2"
              >
                <Trash2 size={15} /> Delete Record
              </button>
              <button onClick={() => setDetailsDoc(null)} className="px-5 py-2 bg-gray-100 text-gray-700 text-sm font-bold rounded-lg hover:bg-gray-200 transition-colors">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
