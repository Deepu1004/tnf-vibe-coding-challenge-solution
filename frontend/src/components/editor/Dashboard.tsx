import React, { useEffect, useState } from 'react';
import { ShieldAlert, FileText, CheckCircle, XCircle, Clock, Eye, AlertCircle, X, Filter, Fingerprint, Hash, Info, ChevronDown, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { DocumentModal } from '../DocumentModal';
import { api, normalizeFileUrl } from '../../api';

type RiskFilter = 'all' | 'safe' | 'considerable' | 'risky';
type Tab = 'pending' | 'accepted' | 'rejected';

// Clean a signal string: remove emoji, dots, bullets
function cleanSignal(sig: string): string {
  return sig
    .replace(/[🔴⚠✓•]/g, '')
    .replace(/^\s*[\.\-]\s*/, '')
    .trim();
}

function riskLabel(score: number) {
  if (score < 25) return { label: 'Safe', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
  if (score < 65) return { label: 'Considerable', color: 'bg-amber-50 text-amber-700 border-amber-200' };
  return { label: 'Risky', color: 'bg-red-50 text-red-700 border-red-200' };
}

function riskBadgeInline(score: number) {
  if (score < 25) return 'bg-emerald-100 text-emerald-800';
  if (score < 65) return 'bg-amber-100 text-amber-800';
  return 'bg-red-100 text-red-800';
}

function signalColor(sig: string) {
  if (sig.includes('🔴') || sig.toUpperCase().includes('DUPLICATE') || sig.toUpperCase().includes('BULK') || sig.toUpperCase().includes('HIGH SIMILARITY') || sig.toUpperCase().includes('EXACT')) {
    return 'bg-red-50 text-red-700 border-red-200';
  }
  if (sig.includes('⚠') || sig.toUpperCase().includes('MODERATE') || sig.toUpperCase().includes('MULTIPLE')) {
    return 'bg-amber-50 text-amber-700 border-amber-200';
  }
  return 'bg-gray-50 text-gray-600 border-gray-200';
}

export function EditorDashboard() {
  const [allSubmissions, setAllSubmissions] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [viewDoc, setViewDoc] = useState<{ url: string; name: string; fingerprint?: string | null } | null>(null);
  const [detailsDoc, setDetailsDoc] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<Tab>('pending');
  const [riskFilter, setRiskFilter] = useState<RiskFilter>('all');

  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  const fetchData = async () => {
    try {
      const [subsData, statsData] = await Promise.all([
        api.get('/api/submissions'),
        api.get('/api/stats')
      ]);
      console.log('Submissions data:', subsData.submissions?.[0]); // Debug log to check what fields are returned
      setAllSubmissions(subsData.submissions || []);
      setStats(statsData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleDecision = async (id: string, decision: 'accept' | 'reject') => {
    try {
      await api.post(`/api/submissions/${id}/decision`, { decision, reviewer_name: 'Editor' });
      fetchData();
      showNotification(
        decision === 'accept'
          ? 'Document accepted successfully. Author has been notified.'
          : 'Document rejected and moved to reports.',
        decision === 'accept' ? 'success' : 'error'
      );
    } catch (err: any) {
      showNotification('Failed to update decision: ' + err.message, 'error');
    }
  };

  const handleDeleteRecord = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this record? This action cannot be undone.')) {
      return;
    }
    try {
      await api.delete(`/api/submissions/${id}`);
      setDetailsDoc(null);
      fetchData();
      showNotification('Record deleted successfully.', 'success');
    } catch (err: any) {
      showNotification('Failed to delete record: ' + err.message, 'error');
    }
  };

  const pending = allSubmissions.filter(s => s.workflow_status === 'pending');
  const accepted = allSubmissions.filter(s => s.workflow_status === 'accepted');
  const rejected = allSubmissions.filter(s => s.workflow_status === 'rejected');

  const tabSubmissions = activeTab === 'pending' ? pending : activeTab === 'accepted' ? accepted : rejected;

  const filteredSubmissions = tabSubmissions.filter(s => {
    if (riskFilter === 'safe') return s.score < 25;
    if (riskFilter === 'considerable') return s.score >= 25 && s.score < 65;
    if (riskFilter === 'risky') return s.score >= 65;
    return true;
  });

  const tabs: { key: Tab; label: string; count: number; color: string }[] = [
    { key: 'pending', label: 'Pending Review', count: pending.length, color: 'text-amber-600 border-amber-500' },
    { key: 'accepted', label: 'Accepted', count: accepted.length, color: 'text-emerald-600 border-emerald-500' },
    { key: 'rejected', label: 'Rejected', count: rejected.length, color: 'text-red-600 border-red-500' },
  ];

  return (
    <div className="max-w-7xl mx-auto py-10 px-6 w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 animate-slide-up">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight gradient-text">Pending Reviews</h1>
          <p className="mt-2 text-gray-500 text-sm font-medium">Review submissions and monitor integrity alerts.</p>
        </div>
      </div>

      <div className="mb-6 rounded-2xl border border-blue-100 bg-blue-50/70 px-5 py-4 text-sm text-blue-900 shadow-sm animate-slide-up">
        <div className="flex items-start gap-3">
          <Info size={18} className="mt-0.5 shrink-0 text-blue-700" />
          <div className="space-y-1">
            <p className="font-semibold">How the risk score is calculated</p>
            <p className="text-blue-800/90">
              The score combines device fingerprint history, author metadata matches, upload burst activity, repeated email use, and document similarity.
              Scores under 25 are marked safe, 25 to 64 are considerable, and 65+ are risky.
            </p>
          </div>
        </div>
      </div>

      {notification && (
        <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 shadow-md animate-slide-up ${notification.type === 'success' ? 'bg-green-50 border border-green-200 text-green-800' : 'bg-red-50 border border-red-200 text-red-800'}`}>
          <Info size={20} className={notification.type === 'success' ? 'text-green-600' : 'text-red-600'} />
          <p className="font-semibold text-sm">{notification.message}</p>
        </div>
      )}

      {/* Stats Row */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Pending', value: pending.length, color: 'text-amber-600' },
            { label: 'Accepted', value: accepted.length, color: 'text-emerald-600' },
            { label: 'Rejected', value: rejected.length, color: 'text-red-600' },
            { label: 'Avg Risk Score', value: stats.average_risk_score, color: 'text-gray-900' },
          ].map((s, i) => (
            <div key={i} className="card p-5">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">{s.label}</p>
              <p className={`text-3xl font-black ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-1 mb-4 border-b border-gray-200">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2.5 text-sm font-bold border-b-2 transition-all -mb-px ${activeTab === tab.key ? tab.color : 'border-transparent text-gray-400 hover:text-gray-700'}`}
          >
            {tab.label}
            <span className={`ml-2 px-1.5 py-0.5 rounded-full text-xs font-black ${activeTab === tab.key ? 'bg-gray-100' : 'bg-gray-50 text-gray-400'}`}>
              {tab.count}
            </span>
          </button>
        ))}

        {/* Risk Filter */}
        <div className="ml-auto flex items-center gap-2 pb-1">
          <Filter size={14} className="text-gray-400" />
          <select
            value={riskFilter}
            onChange={e => setRiskFilter(e.target.value as RiskFilter)}
            className="text-xs font-semibold border border-gray-200 rounded-md px-2 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#005A9C]"
          >
            <option value="all">All Risk Levels</option>
            <option value="safe">Safe (0–24)</option>
            <option value="considerable">Considerable (25–64)</option>
            <option value="risky">Risky (65+)</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden animate-slide-up">
        {loading ? (
          <div className="p-10 text-center text-gray-400">Loading submissions...</div>
        ) : filteredSubmissions.length === 0 ? (
          <div className="p-14 text-center text-gray-400">
            <CheckCircle size={44} className="mx-auto text-gray-200 mb-4" />
            <p className="text-base font-semibold text-gray-600">No submissions here.</p>
            <p className="text-sm mt-1">Try changing the filter or tab.</p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-xs font-bold text-gray-400 uppercase tracking-wider">
                <th className="p-4 pl-6">Manuscript</th>
                <th className="p-4">Integrity Signals</th>
                <th className="p-4 text-center">Risk Score</th>
                <th className="p-4 text-right pr-6">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredSubmissions.map((sub: any) => {
                const risk = riskLabel(sub.score);
                return (
                  <tr key={sub.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 pl-6 align-top">
                      <p className="font-bold text-gray-900 max-w-[220px] truncate" title={sub.title || sub.file_name}>{sub.title || sub.file_name}</p>
                      <p className="text-sm text-[#005A9C] mt-0.5">{sub.author_name}</p>
                      <p className="text-xs text-gray-400">{sub.journal}</p>
                      <p className="text-xs text-gray-300 mt-1">{formatDistanceToNow(sub.timestamp, { addSuffix: true })}</p>
                    </td>

                    <td className="p-4 align-top max-w-[280px]">
                      {sub.signals?.length === 0 ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700">
                          <CheckCircle size={11} /> No signals
                        </span>
                      ) : (
                        <div className="space-y-1.5">
                          {sub.signals?.slice(0, 2).map((sig: string, idx: number) => (
                            <div key={idx} className={`text-xs px-2.5 py-1.5 rounded-md border font-medium ${signalColor(sig)}`}>
                              {cleanSignal(sig)}
                            </div>
                          ))}
                          {(sub.signals?.length > 2) && (
                            <button
                              onClick={() => setDetailsDoc(sub)}
                              className="text-xs text-[#005A9C] font-semibold hover:underline flex items-center gap-1 mt-1"
                            >
                              <Eye size={12} /> +{sub.signals.length - 2} more — view details
                            </button>
                          )}
                          {sub.signals?.length <= 2 && (
                            <button
                              onClick={() => setDetailsDoc(sub)}
                              className="text-xs text-gray-400 hover:text-[#005A9C] font-semibold flex items-center gap-1 mt-1"
                            >
                              <Eye size={12} /> View full report
                            </button>
                          )}
                        </div>
                      )}
                    </td>

                    <td className="p-4 align-top text-center">
                      <div className={`inline-flex flex-col items-center px-3 py-2 rounded-xl border ${risk.color}`}>
                        <span className="text-2xl font-black leading-none">{sub.score}</span>
                        <span className="text-[10px] font-bold uppercase tracking-wider mt-0.5 opacity-80">{risk.label}</span>
                      </div>
                    </td>

                    <td className="p-4 pr-6 align-middle">
                      <div className="flex flex-col items-end gap-2">
                        <button
                          onClick={() => setViewDoc({ url: normalizeFileUrl(sub.file_url), name: sub.file_name || sub.title, fingerprint: sub.fingerprint })}
                          className="w-28 py-1.5 px-3 bg-white border border-blue-200 text-blue-700 hover:bg-blue-50 text-xs font-semibold rounded-lg shadow-sm transition-colors flex justify-center items-center gap-1.5"
                        >
                          <FileText size={13} /> View
                        </button>
                        {activeTab === 'pending' && (
                          <>
                            <button
                              onClick={() => handleDecision(sub.id, 'accept')}
                              className="w-28 py-1.5 px-3 bg-emerald-600 text-white hover:bg-emerald-700 text-xs font-semibold rounded-lg shadow-sm transition-colors flex justify-center items-center gap-1.5"
                            >
                              <CheckCircle size={13} /> Accept
                            </button>
                            <button
                              onClick={() => handleDecision(sub.id, 'reject')}
                              className="w-28 py-1.5 px-3 bg-red-600 text-white hover:bg-red-700 text-xs font-semibold rounded-lg shadow-sm transition-colors flex justify-center items-center gap-1.5"
                            >
                              <XCircle size={13} /> Reject
                            </button>
                          </>
                        )}
                        {activeTab !== 'pending' && (
                          <span className={`w-28 text-center py-1.5 px-3 text-xs font-bold rounded-lg border ${activeTab === 'accepted' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                            {activeTab === 'accepted' ? 'Accepted' : 'Rejected'}
                          </span>
                        )}
                        <button
                          onClick={() => handleDeleteRecord(sub.id)}
                          className="w-28 py-1.5 px-3 bg-red-50 border border-red-200 text-red-600 hover:bg-red-100 text-xs font-semibold rounded-lg shadow-sm transition-colors flex justify-center items-center gap-1.5"
                        >
                          <Trash2 size={13} /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <DocumentModal isOpen={!!viewDoc} onClose={() => setViewDoc(null)} fileUrl={viewDoc?.url || null} fileName={viewDoc?.name || ''} />

      {/* Risk Intelligence Modal */}
      {detailsDoc && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden border border-gray-100">
            {/* Modal Header */}
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
              <button onClick={() => setDetailsDoc(null)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-white">
              {/* Identity & Metadata */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-1"><Hash size={10} /> Submission ID</p>
                  <p className="text-xs font-mono text-gray-700 break-all">{detailsDoc.id}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-1"><Fingerprint size={10} /> Device Fingerprint</p>
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
                  <p className={`text-[11px] font-bold ${detailsDoc.score >= 65 ? 'text-red-500' : detailsDoc.score >= 25 ? 'text-amber-500' : 'text-emerald-500'}`}>{riskLabel(detailsDoc.score).label}</p>
                </div>
              </div>

              {/* Risk Signals */}
              <div>
                <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                  <AlertCircle size={15} className="text-red-500" /> Risk Signals
                </h4>
                {detailsDoc.signals?.length === 0 ? (
                  <p className="text-sm text-gray-400 italic bg-gray-50 p-3 rounded-lg">No risk signals detected. Document appears clean.</p>
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
                  <CheckCircle size={15} className="text-emerald-500" /> Points to Consider for Acceptance
                </h4>
                <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 space-y-2 text-sm text-gray-700">
                  <p>{detailsDoc.score < 25 ? '✓ Low risk profile — no significant fraud indicators detected.' : detailsDoc.score < 65 ? '⚠ Moderate risk — review the signals carefully before accepting.' : '✗ High risk — strong indicators of fraud or duplicate submission.'}</p>
                  {detailsDoc.linked_accounts?.length <= 1 && <p>✓ Only one account linked to this device fingerprint.</p>}
                  {detailsDoc.linked_accounts?.length > 1 && <p>✗ Multiple accounts share this device — possible coordinated submission.</p>}
                  {!detailsDoc.similar_document && <p>✓ No similar documents detected in the database.</p>}
                  {detailsDoc.similar_document && <p>✗ Similar content detected — verify this is not a duplicate or previously rejected paper.</p>}
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
                        <span>Content Similarity</span>
                        <span>{detailsDoc.similar_document.similarity_score}%</span>
                      </div>
                      <div className="w-full bg-red-100 rounded-full h-1.5">
                        <div className="bg-red-500 h-1.5 rounded-full" style={{ width: `${detailsDoc.similar_document.similarity_score}%` }} />
                      </div>
                    </div>
                  )}
                  <div className="bg-white rounded-lg border border-red-100 p-3 text-sm text-gray-800 space-y-1">
                    <p><strong>Matching File:</strong> {detailsDoc.similar_document.file_name}</p>
                    <p><strong>Type:</strong> {detailsDoc.similar_document.type} — <strong>Kind:</strong> {detailsDoc.similar_document.kind}</p>
                  </div>
                  {detailsDoc.similar_document.content_preview && detailsDoc.similar_document.content_preview !== 'No preview available.' && (
                    <div className="mt-3 bg-white rounded-lg border border-red-100 p-3">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Content Preview of Matched Document</p>
                      <p className="text-xs text-gray-600 italic leading-relaxed">{detailsDoc.similar_document.content_preview}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Linked Accounts */}
              {detailsDoc.linked_accounts?.length > 1 && (
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
              <div className="flex justify-end gap-3">
                {detailsDoc.workflow_status === 'pending' && (
                  <>
                    <button
                      onClick={() => { handleDecision(detailsDoc.id, 'accept'); setDetailsDoc(null); }}
                      className="px-5 py-2 bg-emerald-600 text-white text-sm font-bold rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-2"
                    >
                      <CheckCircle size={15} /> Accept
                    </button>
                    <button
                      onClick={() => { handleDecision(detailsDoc.id, 'reject'); setDetailsDoc(null); }}
                      className="px-5 py-2 bg-red-600 text-white text-sm font-bold rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                    >
                      <XCircle size={15} /> Reject
                    </button>
                  </>
                )}
                <button onClick={() => setDetailsDoc(null)} className="px-5 py-2 bg-gray-100 text-gray-700 text-sm font-bold rounded-lg hover:bg-gray-200 transition-colors">
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
