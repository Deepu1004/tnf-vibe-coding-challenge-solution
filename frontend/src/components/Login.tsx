import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { BookOpen, ShieldCheck } from 'lucide-react';

export function Login() {
  const [role, setRole] = useState<'author' | 'editor'>('author');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const success = await login(role, email, password);
    if (success) {
      if (role === 'editor') {
        navigate('/editor/dashboard');
      } else {
        navigate('/author/upload');
      }
    } else {
      setError('Invalid credentials.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F4F7F9] px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg border border-gray-100">
        <div className="animate-slide-up">
          <div className="flex justify-center text-[#005A9C]">
            <BookOpen size={48} className="drop-shadow-md" />
          </div>
          <h2 className="mt-6 text-center text-4xl font-extrabold text-gray-900 tracking-tight gradient-text">
            Scholar Risk Detector Portal
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 font-medium">
            Editorial integrity tools for Taylor &amp; Francis editors — built by Deepak
          </p>
        </div>

        <div className="flex rounded-md shadow-sm">
          <button
            type="button"
            className={`w-1/2 flex justify-center py-2 px-4 border text-sm font-medium rounded-l-md ${
              role === 'author'
                ? 'bg-[#005A9C] text-white border-[#005A9C] z-10'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
            onClick={() => setRole('author')}
          >
            Author Login
          </button>
          <button
            type="button"
            className={`w-1/2 flex justify-center py-2 px-4 border-t border-b border-r text-sm font-medium rounded-r-md ${
              role === 'editor'
                ? 'bg-[#005A9C] text-white border-[#005A9C] z-10'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
            onClick={() => setRole('editor')}
          >
            Editor Login
          </button>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-md">
              {error}
            </div>
          )}
          
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
              <input
                type="email"
                required
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-[#005A9C] focus:border-[#005A9C] sm:text-sm"
                placeholder={role === 'editor' ? "editor@tnf.com" : "author@university.edu"}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            {role === 'editor' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  required
                  className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-[#005A9C] focus:border-[#005A9C] sm:text-sm"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            )}
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-lg shadow-md text-white bg-gradient-to-r from-[#005A9C] to-[#009EDB] hover:from-[#003B6F] hover:to-[#005A9C] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#005A9C] transition-all disabled:opacity-70 transform hover:-translate-y-0.5"
            >
              <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                <ShieldCheck className="h-5 w-5 text-blue-100 group-hover:text-white transition-colors" />
              </span>
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </div>
          
          {role === 'editor' && (
            <div className="text-xs text-center text-gray-500 mt-4">
              Demo Editor: editor@tnf.com / editor@123
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
