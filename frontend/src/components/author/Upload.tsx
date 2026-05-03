import React, { useState, useEffect } from 'react';
import { UploadCloud, File, AlertCircle, CheckCircle2 } from 'lucide-react';
import FingerprintJS from '@fingerprintjs/fingerprintjs';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { apiUpload } from '../../api';

export function AuthorUpload() {
  const { email } = useAuth();
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [journal, setJournal] = useState('Medical Ethics Review');
  const [authorName, setAuthorName] = useState('');
  const [fingerprint, setFingerprint] = useState('');
  const [documentType, setDocumentType] = useState('Paper');
  const [documentKind, setDocumentKind] = useState('Science');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    const initFingerprint = async () => {
      const fp = await FingerprintJS.load();
      const fpResult = await fp.get();
      setFingerprint(fpResult.visitorId);
    };
    initFingerprint();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !email || !title) return;

    setLoading(true);
    setResult(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('email', email);
    formData.append('title', title);
    formData.append('journal', journal);
    formData.append('author_name', authorName);
    formData.append('document_type', documentType);
    formData.append('document_kind', documentKind);
    formData.append('fingerprint', fingerprint);

    try {
      const data = await apiUpload('/api/upload', formData);
      setResult(data);
      if (data.success) {
         setTimeout(() => {
           navigate('/author/reports');
         }, 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-6 w-full">
      <div className="mb-8 animate-slide-up">
        <h1 className="text-4xl font-extrabold tracking-tight gradient-text">Submit Manuscript</h1>
        <p className="mt-2 text-gray-500 text-sm font-medium">Upload your document for integrity analysis and review.</p>
      </div>

      <div className="card overflow-hidden animate-slide-up" style={{ animationDelay: '0.1s' }}>
        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Author Name *</label>
              <input
                type="text"
                required
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                className="block w-full rounded-md border border-gray-300 px-4 py-2 text-sm focus:border-[#005A9C] focus:ring-1 focus:ring-[#005A9C] outline-none"
                placeholder="Dr. John Smith"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Manuscript Title *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="block w-full rounded-md border border-gray-300 px-4 py-2 text-sm focus:border-[#005A9C] focus:ring-1 focus:ring-[#005A9C] outline-none"
                placeholder="The Impact of..."
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Target Journal *</label>
              <select
                required
                value={journal}
                onChange={(e) => setJournal(e.target.value)}
                className="block w-full rounded-md border border-gray-300 px-4 py-2 text-sm focus:border-[#005A9C] focus:ring-1 focus:ring-[#005A9C] outline-none bg-white"
              >
                <option>Medical Ethics Review</option>
                <option>Journal of Applied AI</option>
                <option>Global Social Sciences</option>
                <option>Advanced Quantum Studies</option>
              </select>
            </div>
            
            <div className="md:col-span-1">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Upload Type *</label>
              <select
                required
                value={documentType}
                onChange={(e) => setDocumentType(e.target.value)}
                className="block w-full rounded-md border border-gray-300 px-4 py-2 text-sm focus:border-[#005A9C] focus:ring-1 focus:ring-[#005A9C] outline-none bg-white"
              >
                <option>Paper</option>
                <option>Book</option>
                <option>Journal</option>
              </select>
            </div>

            <div className="md:col-span-1">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Category / Section *</label>
              <select
                required
                value={documentKind}
                onChange={(e) => setDocumentKind(e.target.value)}
                className="block w-full rounded-md border border-gray-300 px-4 py-2 text-sm focus:border-[#005A9C] focus:ring-1 focus:ring-[#005A9C] outline-none bg-white"
              >
                <option>Science</option>
                <option>Medical</option>
                <option>Engineering</option>
                <option>AI</option>
                <option>Arts</option>
                <option>Other</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Document (PDF/DOCX) *</label>
              
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                <div className="space-y-1 text-center">
                  {file ? (
                    <div className="flex flex-col items-center">
                      <File className="mx-auto h-12 w-12 text-[#005A9C]" />
                      <span className="mt-2 text-sm text-gray-900 font-medium">{file.name}</span>
                      <button type="button" onClick={() => setFile(null)} className="text-xs font-semibold text-red-600 mt-2 hover:underline">Remove file</button>
                    </div>
                  ) : (
                    <>
                      <UploadCloud className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                      <div className="flex text-sm text-gray-600 justify-center">
                        <label
                          htmlFor="file-upload"
                          className="relative cursor-pointer rounded font-bold text-[#005A9C] hover:text-[#003B6F] focus-within:outline-none"
                        >
                          <span>Click to upload</span>
                          <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept=".pdf,.doc,.docx" />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">PDF or DOCX up to 10MB</p>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={!file || loading}
              className="px-6 py-2.5 text-sm font-semibold rounded-lg bg-gradient-to-r from-[#005A9C] to-[#003B6F] text-white hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#005A9C] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? 'Analyzing & Uploading...' : 'Submit Manuscript'}
            </button>
          </div>
        </form>

        {result && result.success && (
          <div className="m-8 p-6 bg-green-50 border border-green-200 rounded-xl animate-slide-up flex items-center gap-4">
            <CheckCircle2 className="text-green-600 w-8 h-8" />
            <div>
              <h3 className="text-green-800 font-bold">Upload Successful</h3>
              <p className="text-green-700 text-sm">Your manuscript has been submitted and is undergoing review. Redirecting...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
