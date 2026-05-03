import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, ShieldCheck, Zap, Lock, ChevronRight, CheckCircle2, FileSearch, Fingerprint, BarChart2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export function Landing() {
  const { isAuthenticated, role } = useAuth();

  const dashboardLink = role === 'editor' ? '/editor/dashboard' : '/author/upload';

  return (
    <div className="w-full min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative pt-20 pb-24 lg:pt-32 lg:pb-40 overflow-hidden w-full">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        <div className="absolute left-1/2 -translate-x-1/2 top-0 -z-10 h-[500px] w-[500px] rounded-full bg-[#005A9C] opacity-10 blur-[120px]"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-sm font-bold mb-8">
            <ShieldCheck size={15} />
            <span>The New Standard in Academic Integrity</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 tracking-tight leading-[1.1] mb-6">
            Protect the Future of <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#005A9C] to-[#00A3E0]">
              Academic Publishing
            </span>
          </h1>
          <p className="max-w-2xl mx-auto text-xl text-gray-500 mb-10 leading-relaxed font-medium">
            Advanced fraud detection, real-time PDF analysis, cross-document similarity scoring, and comprehensive identity intelligence for modern academic journals.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            {isAuthenticated ? (
              <Link
                to={dashboardLink}
                className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-[#005A9C] to-[#003B6F] text-white rounded-full font-bold text-lg hover:shadow-2xl transition-all flex items-center justify-center gap-2 transform hover:-translate-y-1"
              >
                Go to Dashboard <ChevronRight size={20} />
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-[#005A9C] to-[#003B6F] text-white rounded-full font-bold text-lg hover:shadow-2xl transition-all flex items-center justify-center gap-2 transform hover:-translate-y-1"
                >
                  Start Screening Now <ChevronRight size={20} />
                </Link>
                <Link
                  to="/login"
                  className="w-full sm:w-auto px-8 py-4 bg-white text-gray-700 border border-gray-200 rounded-full font-bold text-lg hover:bg-gray-50 transition-all flex items-center justify-center shadow-sm hover:shadow-md"
                >
                  Author Portal
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* How it works */}
      <div className="bg-gray-50 py-24 border-t border-b border-gray-100 w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl font-extrabold text-gray-900 mb-4">How It Works</h2>
            <p className="text-gray-500 text-lg">From upload to decision in seconds. Every manuscript is thoroughly verified before it reaches an editor's desk.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                icon: <Upload size={24} className="text-[#005A9C]" />,
                title: 'Upload Your Manuscript',
                desc: 'Authors submit their PDF. The system automatically categorizes it by type and academic field.'
              },
              {
                step: '02',
                icon: <FileSearch size={24} className="text-amber-500" />,
                title: 'Deep PDF Analysis',
                desc: 'Our engine extracts text, metadata, and authorship signals, then computes a similarity score against every prior submission in the database.'
              },
              {
                step: '03',
                icon: <BarChart2 size={24} className="text-green-500" />,
                title: 'Editor Review',
                desc: "Editors receive a full risk intelligence report with Accept or Reject controls. Authors are notified instantly of the decision."
              }
            ].map((item, i) => (
              <div key={i} className="relative bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <span className="absolute top-6 right-6 text-5xl font-black text-gray-50">{item.step}</span>
                <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center mb-6">
                  {item.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
                <p className="text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="py-24 bg-white w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl font-extrabold text-gray-900 mb-4">Enterprise-Grade Integrity Intelligence</h2>
            <p className="text-gray-500 text-lg">Stop paper mills, duplicate submissions, and academic fraud before peer review begins.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <Zap size={24} className="text-amber-500" />,
                title: 'Real-time Detection',
                desc: 'Instantaneous PDF text analysis, metadata fingerprinting, and behavioral velocity checks to flag suspicious bulk uploads.'
              },
              {
                icon: <FileSearch size={24} className="text-blue-500" />,
                title: 'Content Similarity Scoring',
                desc: 'Jaccard word-overlap scoring compares every new submission against existing manuscripts to detect paraphrased duplicates.'
              },
              {
                icon: <Fingerprint size={24} className="text-purple-500" />,
                title: 'Device Identity Tracking',
                desc: 'Browser fingerprinting links multiple accounts to a single device, exposing paper mill networks and coordinated fraud rings.'
              },
              {
                icon: <ShieldCheck size={24} className="text-green-500" />,
                title: 'Cross-Journal Matching',
                desc: 'Identify previously rejected manuscripts or duplicate submissions across the entire academic ecosystem.'
              },
              {
                icon: <Lock size={24} className="text-red-500" />,
                title: 'Forensic Metadata',
                desc: 'Extract hidden PDF authorship tags, creation toolchains, and modification dates to verify manuscript authenticity.'
              },
              {
                icon: <BarChart2 size={24} className="text-indigo-500" />,
                title: 'Risk Scoring Dashboard',
                desc: 'Every submission receives a 0–100 risk score with human-readable signal breakdowns for rapid editorial decisions.'
              }
            ].map((feature, i) => (
              <div key={i} className="bg-gray-50 p-8 rounded-2xl border border-gray-100 hover:shadow-lg hover:border-blue-100 transition-all duration-300 transform hover:-translate-y-1">
                <div className="w-12 h-12 rounded-xl bg-white border border-gray-100 flex items-center justify-center mb-6 shadow-sm">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-500 leading-relaxed text-sm">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Banner */}
      <div className="py-20 bg-white w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-[#005A9C] via-[#003B6F] to-[#001d36] rounded-3xl p-12 text-center text-white relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-white opacity-5 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-96 h-96 bg-blue-400 opacity-10 rounded-full blur-3xl"></div>
            <h2 className="text-3xl md:text-4xl font-extrabold mb-12 relative z-10">Trusted by Leading Academic Publishers</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-10 relative z-10">
              {[
                { label: 'Manuscripts Scanned', value: '2M+' },
                { label: 'Fraud Rings Detected', value: '4,500+' },
                { label: 'Processing Time', value: '< 2s' },
                { label: 'Uptime', value: '99.99%' }
              ].map((stat, i) => (
                <div key={i} className="flex flex-col items-center">
                  <span className="text-5xl font-black mb-2">{stat.value}</span>
                  <span className="text-blue-200 font-semibold text-sm">{stat.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      {!isAuthenticated && (
        <div className="py-20 bg-gray-50 border-t border-gray-100 w-full">
          <div className="max-w-2xl mx-auto px-4 text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-4">Ready to protect your journal?</h2>
            <p className="text-gray-500 mb-8 text-lg">Join Taylor &amp; Francis journals using Scholar Risk Detector to maintain the highest standards of editorial integrity.</p>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#005A9C] to-[#003B6F] text-white rounded-full font-bold text-lg hover:shadow-2xl transition-all transform hover:-translate-y-1"
            >
              Get Started Free <ChevronRight size={20} />
            </Link>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-gray-50 py-10 border-t border-gray-200 w-full">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex justify-center items-center gap-2 mb-3">
            <BookOpen size={20} className="text-[#005A9C]" />
            <span className="font-extrabold text-gray-900 text-lg tracking-tight">Scholar Risk Detector</span>
          </div>
          <p className="text-gray-400 text-sm">© 2026 Scholar Risk Detector — Taylor &amp; Francis Group. All rights reserved.</p>
          <p className="text-gray-400 text-xs mt-2">Built by Deepak for Taylor &amp; Francis editors.</p>
        </div>
      </footer>
    </div>
  );
}

function Upload({ size, className }: { size: number; className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
    </svg>
  );
}
