import React, { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { BookOpen, Upload, LayoutDashboard, FileText, LogOut, LogIn, Home, Menu, X } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { useAuth } from '../contexts/AuthContext';

export function Navbar() {
  const { role, email, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navClasses = ({ isActive }: { isActive: boolean }) =>
    twMerge(
      "inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition-all",
      isActive
        ? "bg-blue-50 text-[#005A9C]"
        : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
    );

  return (
    <header className="bg-white/90 backdrop-blur-md border-b border-gray-200 shrink-0 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="text-[#005A9C] group-hover:scale-110 transition-transform">
              <BookOpen size={28} />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="font-extrabold text-lg tracking-tight text-gray-900">Scholar Risk Detector</span>
              <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Taylor &amp; Francis Group</span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden sm:flex items-center gap-1">
            <NavLink to="/" end className={navClasses}>
              <Home size={15} /> Home
            </NavLink>

            {isAuthenticated && role === 'author' && (
              <>
                <NavLink to="/author/upload" className={navClasses}>
                  <Upload size={15} /> Submit Paper
                </NavLink>
                <NavLink to="/author/reports" className={navClasses}>
                  <FileText size={15} /> My Submissions
                </NavLink>
              </>
            )}

            {isAuthenticated && role === 'editor' && (
              <>
                <NavLink to="/editor/dashboard" className={navClasses}>
                  <LayoutDashboard size={15} /> Pending Reviews
                </NavLink>
                <NavLink to="/editor/reports" className={navClasses}>
                  <FileText size={15} /> All Reports
                </NavLink>
              </>
            )}
          </nav>

          {/* Right side: user info or login */}
          <div className="hidden sm:flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <div className="flex flex-col items-end">
                  <span className="text-sm font-bold text-gray-900">{role === 'editor' ? 'Editorial Team' : 'Author'}</span>
                  <span className="text-xs text-gray-400">{email}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                  title="Sign Out"
                >
                  <LogOut size={18} />
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-2 px-4 py-2 bg-[#005A9C] text-white rounded-full text-sm font-bold hover:bg-[#003B6F] transition-all shadow-md hover:shadow-lg"
              >
                <LogIn size={15} /> Sign In
              </Link>
            )}
          </div>

          {/* Mobile hamburger */}
          <button className="sm:hidden p-2 text-gray-500" onClick={() => setMobileOpen(o => !o)}>
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="sm:hidden bg-white border-t border-gray-100 px-4 py-4 space-y-2">
          <Link to="/" className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-100" onClick={() => setMobileOpen(false)}>
            <Home size={15} /> Home
          </Link>
          {isAuthenticated && role === 'author' && (
            <>
              <Link to="/author/upload" className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-100" onClick={() => setMobileOpen(false)}>
                <Upload size={15} /> Submit Paper
              </Link>
              <Link to="/author/reports" className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-100" onClick={() => setMobileOpen(false)}>
                <FileText size={15} /> My Submissions
              </Link>
            </>
          )}
          {isAuthenticated && role === 'editor' && (
            <>
              <Link to="/editor/dashboard" className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-100" onClick={() => setMobileOpen(false)}>
                <LayoutDashboard size={15} /> Pending Reviews
              </Link>
              <Link to="/editor/reports" className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-100" onClick={() => setMobileOpen(false)}>
                <FileText size={15} /> All Reports
              </Link>
            </>
          )}
          {isAuthenticated ? (
            <button onClick={handleLogout} className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm font-semibold text-red-500 hover:bg-red-50">
              <LogOut size={15} /> Sign Out
            </button>
          ) : (
            <Link to="/login" className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold text-[#005A9C] hover:bg-blue-50" onClick={() => setMobileOpen(false)}>
              <LogIn size={15} /> Sign In
            </Link>
          )}
        </div>
      )}
    </header>
  );
}
