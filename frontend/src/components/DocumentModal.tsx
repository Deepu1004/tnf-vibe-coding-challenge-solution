import React from 'react';
import { X, ExternalLink } from 'lucide-react';

interface DocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  fileUrl: string | null;
  fileName: string;
  fingerprint?: string | null;
}

export function DocumentModal({ isOpen, onClose, fileUrl, fileName, fingerprint }: DocumentModalProps) {
  if (!isOpen || !fileUrl) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-slide-up">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col overflow-hidden border border-gray-200">
        <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center gap-3">
              <div className="min-w-0">
                <h3 className="text-lg font-bold text-gray-900 truncate max-w-xl">{fileName}</h3>
                {fingerprint && (
                  <p className="text-xs font-mono text-gray-500 mt-0.5">Fingerprint: {fingerprint}</p>
                )}
              </div>
            <a 
              href={fileUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs font-semibold text-[#005A9C] bg-blue-50 px-2 py-1 rounded hover:bg-blue-100 transition-colors"
            >
              <ExternalLink size={14} /> Open in new tab
            </a>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        <div className="flex-1 w-full bg-gray-100 p-2">
          <iframe 
            src={fileUrl} 
            className="w-full h-full rounded-lg bg-white border border-gray-300 shadow-inner"
            title="Document Viewer"
          />
        </div>
      </div>
    </div>
  );
}
