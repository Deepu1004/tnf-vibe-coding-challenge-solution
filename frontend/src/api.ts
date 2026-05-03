/**
 * API utility for making requests to the backend
 * Uses environment variable VITE_BACKEND_URL for the backend base URL
 * 
 * ✅ File Handling Flow:
 * 1. Frontend uploads file → Backend via /api/upload endpoint (POST with FormData)
 * 2. Backend stores file to Firebase Storage and saves metadata to Firestore
 * 3. Backend returns response with file_url (Firebase Storage URL or fallback path)
 * 4. Frontend receives file_url in submissions/analytics responses
 * 5. Frontend displays file using normalizeFileUrl() to ensure proper URL handling
 * 
 * The frontend NEVER accesses Firebase Storage directly - all operations go through the backend API.
 */

// @ts-ignore - Vite env type
export const BACKEND_URL = (import.meta.env.VITE_BACKEND_URL as string) || 'https://tnf-risk-detector-backend.onrender.com';

interface FetchOptions extends RequestInit {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
}

/**
 * Make an API request to the backend
 */
export async function apiCall(endpoint: string, options: FetchOptions = {}) {
  const url = `${BACKEND_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`API call failed: ${url}`, error);
    throw error;
  }
}

/**
 * Make a file upload request
 */
export async function apiUpload(endpoint: string, formData: FormData) {
  const url = `${BACKEND_URL}${endpoint}`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      body: formData,
      // Don't set Content-Type header - browser will set it with boundary
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Upload failed: ${url}`, error);
    throw error;
  }
}

// Convenience methods for common operations
export const api = {
  get: (endpoint: string) => apiCall(endpoint, { method: 'GET' }),
  post: (endpoint: string, data?: any) =>
    apiCall(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    }),
  put: (endpoint: string, data?: any) =>
    apiCall(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    }),
  delete: (endpoint: string) => apiCall(endpoint, { method: 'DELETE' }),
};

export default api;

/**
 * Normalize file URLs returned by the backend. If a URL points to localhost (from local server
 * records) or is a relative path, rewrite it to use the configured BACKEND_URL.
 */
export function normalizeFileUrl(fileUrl: string | null | undefined) {
  if (!fileUrl) return fileUrl || '';
  try {
    // If absolute URL
    const u = new URL(fileUrl);
    if (u.hostname === 'localhost' || u.hostname === '127.0.0.1') {
      return BACKEND_URL.replace(/\/$/, '') + u.pathname + u.search;
    }
    return fileUrl;
  } catch (e) {
    // Not a full URL, treat as relative path
    if (fileUrl.startsWith('/')) return BACKEND_URL.replace(/\/$/, '') + fileUrl;
    return BACKEND_URL.replace(/\/$/, '') + '/' + fileUrl;
  }
}
