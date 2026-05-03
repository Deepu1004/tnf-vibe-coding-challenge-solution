import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { FileText, Clock, CheckCircle, XCircle, Info, Upload, BarChart2, AlertCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { DocumentModal } from '../DocumentModal';
import { Link } from 'react-router-dom';
import { api } from '../../api';
import { normalizeFileUrl } from '../../api';

export function AuthorReports() {
  const { email } = useAuth();
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewDoc, setViewDoc] = useState<{ url: string; name: string; fingerprint?: string | null } | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [prevStatuses, setPrevStatuses] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchMySubmissions = async () => {
      try {
        const data = await api.get('/api/submissions');
        const mySubs = (data.submissions || []).filter((s: any) => s.email === email);

        setPrevStatuses(prev => {
          const newStatuses = { ...prev };
          mySubs.forEach((sub: any) => {
            if (prev[sub.id] && prev[sub.id] === 'pending' && sub.workflow_status !== 'pending') {
              if (sub.workflow_status === 'accepted') {
                setNotification({ message: `Your manuscript "${sub.title || sub.file_name}" has been ACCEPTED!`, type: 'success' });
                setTimeout(() => setNotification(null), 8000);
              } else if (sub.workflow_status === 'rejected') {
                setNotification({ message: `Your manuscript "${sub.title || sub.file_name}" was not accepted at this time.`, type: 'error' });
                setTimeout(() => setNotification(null), 8000);
              }
            }
            newStatuses[sub.id] = sub.workflow_status;
          });
          return newStatuses;
        });

        setSubmissions(mySubs);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchMySubmissions();
    const interval = setInterval(fetchMySubmissions, 5000);
    return () => clearInterval(interval);
  }, [email]);

  const pending = submissions.filter(s => s.workflow_status === 'pending');
  const accepted = submissions.filter(s => s.workflow_status === 'accepted');
  const rejected = submissions.filter(s => s.workflow_status === 'rejected');

  const statusConfig: Record<string, { label: string; icon: React.ReactNode; badge: string; bar: string }> = {
    pending: {
      label: 'Under Review',
      icon: <Clock size={13} />,
      badge: 'bg-amber-100 text-amber-800 border-amber-200',
      bar: 'bg-amber-400',
    },
    accepted: {
      label: 'Accepted',
      icon: <CheckCircle size={13} />,
      badge: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      bar: 'bg-emerald-500',
    },
    rejected: {
      label: 'Not Accepted',
      icon: <XCircle size={13} />,
      badge: 'bg-red-100 text-red-800 border-red-200',
      bar: 'bg-red-400',
    },
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-6 w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 animate-slide-up">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight gradient-text">My Submissions</h1>
          <p className="mt-2 text-gray-500 text-sm font-medium">Track the status of your submitted manuscripts in real time.</p>
        </div>
        <Link
          to="/author/upload"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#005A9C] text-white rounded-full font-bold text-sm hover:bg-[#003B6F] transition-all shadow-md hover:shadow-lg"
        >
          <Upload size={15} /> New Submission
        </Link>
      </div>

      {/* Status notification */}
      {notification && (
        <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 shadow-md animate-slide-up border ${
          notification.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          <Info size={20} className={notification.type === 'success' ? 'text-emerald-600' : 'text-red-600'} />
          <p className="font-semibold text-sm">{notification.message}</p>
        </div>
      )}

      {/* Stats summary */}
      {submissions.length > 0 && (
        <div className="grid grid-cols-3 gap-4 mb-8 animate-slide-up">
          {[
            { label: 'Total Submitted', value: submissions.length, color: 'text-[#005A9C]', bg: 'bg-blue-50', icon: <FileText size={20} className="text-[#005A9C]" /> },
            { label: 'Under Review', value: pending.length, color: 'text-amber-600', bg: 'bg-amber-50', icon: <Clock size={20} className="text-amber-500" /> },
            { label: 'Accepted', value: accepted.length, color: 'text-emerald-600', bg: 'bg-emerald-50', icon: <CheckCircle size={20} className="text-emerald-500" /> },
          ].map((stat, i) => (
            <div key={i} className={`card p-5 flex items-center gap-4`}>
              <div className={`w-12 h-12 ${stat.bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                {stat.icon}
              </div>
              <div>
                <p className="text-xs text-gray-400 font-semibold">{stat.label}</p>
                <p className={`text-2xl font-black ${stat.color}`}>{stat.value}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Submissions list */}
      {loading ? (
        <div className="card p-14 text-center text-gray-400">
          <BarChart2 size={36} className="mx-auto mb-3 text-gray-200 animate-pulse" />
          <p>Loading your submissions...</p>
        </div>
      ) : submissions.length === 0 ? (
        <div className="card p-16 text-center animate-slide-up">
          <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Upload size={28} className="text-[#005A9C]" />
          </div>
          <h3 className="text-lg font-bold text-gray-700 mb-2">No submissions yet</h3>
          <p className="text-gray-400 text-sm mb-6">Submit your first manuscript to get started.</p>
          <Link to="/author/upload" className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#005A9C] text-white rounded-full font-bold text-sm hover:bg-[#003B6F] transition-all shadow-md">
            <Upload size={15} /> Submit a Manuscript
          </Link>
        </div>
      ) : (
        <div className="space-y-4 animate-slide-up">
          {submissions.map(sub => {
            const cfg = statusConfig[sub.workflow_status] || statusConfig.pending;
            const progressPercent = sub.workflow_status === 'accepted' ? 100 : sub.workflow_status === 'rejected' ? 100 : 50;
            return (
              <div key={sub.id} className="card p-6 hover:shadow-lg transition-all duration-200">
                <div className="flex items-start justify-between gap-4">
                  {/* Icon + info */}
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      sub.workflow_status === 'accepted' ? 'bg-emerald-50' :
                      sub.workflow_status === 'rejected' ? 'bg-red-50' : 'bg-blue-50'
                    }`}>
                      <FileText size={22} className={
                        sub.workflow_status === 'accepted' ? 'text-emerald-500' :
                        sub.workflow_status === 'rejected' ? 'text-red-400' : 'text-[#005A9C]'
                      } />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-base font-bold text-gray-900 truncate">{sub.title || sub.file_name}</h4>
                      <p className="text-sm text-gray-400 mt-0.5">{sub.journal}</p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-gray-300">
                        <span className="flex items-center gap-1"><Clock size={11} /> {formatDistanceToNow(sub.timestamp, { addSuffix: true })}</span>
                        <span className="font-mono">ID: {sub.id?.split('_')[1] || sub.id?.substring(0, 10)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Status + actions */}
                  <div className="flex flex-col items-end gap-3 flex-shrink-0">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${cfg.badge}`}>
                      {cfg.icon} {cfg.label}
                    </span>
                    <button
                      onClick={() => setViewDoc({ url: normalizeFileUrl(sub.file_url), name: sub.file_name || sub.title, fingerprint: sub.fingerprint })}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors border border-blue-100"
                    >
                      <FileText size={12} /> View Document
                    </button>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mt-5">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-gray-400 mb-1.5">
                    <span>Submission</span>
                    <span>Under Review</span>
                    <span>Decision</span>
                  </div>
                  <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-700 ${cfg.bar}`} style={{ width: `${progressPercent}%` }} />
                  </div>
                </div>

                {/* Accepted / Rejected message */}
                {sub.workflow_status === 'accepted' && (
                  <div className="mt-4 bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3 flex items-center gap-3">
                    <CheckCircle size={16} className="text-emerald-500 flex-shrink-0" />
                    <p className="text-sm text-emerald-700 font-medium">
                      Congratulations! Your manuscript has been accepted for publication.
                    </p>
                  </div>
                )}
                {sub.workflow_status === 'rejected' && (
                  <div className="mt-4 bg-red-50 border border-red-100 rounded-xl px-4 py-3 flex items-center gap-3">
                    <AlertCircle size={16} className="text-red-400 flex-shrink-0" />
                    <p className="text-sm text-red-700 font-medium">
                      Your submission was not accepted at this time. Please review journal guidelines and consider resubmitting.
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <DocumentModal isOpen={!!viewDoc} onClose={() => setViewDoc(null)} fileUrl={viewDoc?.url || null} fileName={viewDoc?.name || ''} />
    </div>
  );
}
