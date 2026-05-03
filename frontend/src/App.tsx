/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Navbar } from './components/Navbar';
import { Login } from './components/Login';
import { AuthorUpload } from './components/author/Upload';
import { AuthorReports } from './components/author/Reports';
import { EditorDashboard } from './components/editor/Dashboard';
import { EditorReports } from './components/editor/Reports';
import { Landing } from './components/Landing';

function ProtectedRoute({ children, role }: { children: React.ReactNode; role: 'author' | 'editor' }) {
  const { isAuthenticated, role: userRole } = useAuth();
  
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (userRole !== role) {
    return <Navigate to={userRole === 'editor' ? '/editor/dashboard' : '/author/upload'} replace />;
  }
  return <>{children}</>;
}

function AppContent() {
  const { isAuthenticated } = useAuth();
  return (
    <div className="flex flex-col min-h-[100dvh] font-sans">
      <Navbar />
      <main className="flex-1 overflow-x-hidden flex w-full justify-center">
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route path="/author/upload" element={
            <ProtectedRoute role="author">
              <AuthorUpload />
            </ProtectedRoute>
          } />
          
          <Route path="/author/reports" element={
            <ProtectedRoute role="author">
              <AuthorReports />
            </ProtectedRoute>
          } />

          <Route path="/editor/dashboard" element={
            <ProtectedRoute role="editor">
              <EditorDashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/editor/reports" element={
            <ProtectedRoute role="editor">
              <EditorReports />
            </ProtectedRoute>
          } />

          <Route path="/" element={<Landing />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </AuthProvider>
  );
}
