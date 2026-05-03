# Backend Integration - Summary of Changes

## ✅ Configuration Files Updated

### 1. `.env` (Production)
Added backend URL for production deployment:
```
VITE_BACKEND_URL=https://tnf-risk-detector-backend.onrender.com
```

### 2. `.env.local` (Development)  
Created for local development with local backend:
```
VITE_BACKEND_URL=http://localhost:5000
```

### 3. `vite.config.ts`
Updated to pass backend URL to the React app:
- Defines `VITE_BACKEND_URL` in Vite's define config
- Uses values from `.env` or `.env.local`

## ✅ New API Utility

### `src/api.ts`
Created centralized API client that:
- Reads `VITE_BACKEND_URL` from environment
- Defaults to production backend: `https://tnf-risk-detector-backend.onrender.com`
- Provides methods: `api.get()`, `api.post()`, `api.put()`, `api.delete()`
- Handles file uploads with `apiUpload()`
- Includes error handling and logging

## ✅ Updated Components

### 1. `src/contexts/AuthContext.tsx`
- Updated to use `api.post()` instead of `fetch()`
- Backend endpoint: `POST /api/auth/editor`

### 2. `src/components/editor/Dashboard.tsx`
- Updated to use `api.get()` for submissions and stats
- Backend endpoints:
  - `GET /api/submissions`
  - `GET /api/stats`
  - `POST /api/submissions/{id}/decision`

### 3. `src/components/editor/Reports.tsx`
- Updated to use `api.get()` for submissions
- Backend endpoint: `GET /api/submissions`

### 4. `src/components/author/Upload.tsx`
- Updated to use `apiUpload()` for file uploads
- Backend endpoint: `POST /api/upload`

### 5. `src/components/author/Reports.tsx`
- Updated to use `api.get()` for submissions
- Backend endpoint: `GET /api/submissions`

## ✅ Build Status
```
✓ Production build completes successfully
✓ Production files ready in dist/ folder
✓ No TypeScript errors in src/ files
```

## 🚀 Ready for Deployment

### For Production Deployment:
```bash
npm run build        # Creates dist/ folder
npm start           # Starts Express server serving dist/ + proxying API calls
```

### For Static Hosting (Vercel, Netlify):
```bash
npm run build       # Creates dist/ folder
# Upload dist/ to static hosting
```

The frontend will automatically make all API requests to:
`https://tnf-risk-detector-backend.onrender.com`

## 📋 API Endpoints

All endpoints are now prefixed with the backend URL. Examples:
- `https://tnf-risk-detector-backend.onrender.com/api/submissions`
- `https://tnf-risk-detector-backend.onrender.com/api/upload`
- `https://tnf-risk-detector-backend.onrender.com/api/stats`

## ✅ Verification Checklist

Before deploying:

- [x] Backend URL is set in `.env`
- [x] All components use API utility (`src/api.ts`)
- [x] Production build completes without errors
- [x] No hardcoded localhost URLs in production code
- [x] Environment configuration is correct
- [x] CORS is enabled on backend (if needed)

## 🔧 Testing the Integration

1. Start the frontend:
   ```bash
   npm run start
   ```

2. Open DevTools → Network tab

3. Perform an action (e.g., submit document)

4. Verify API requests go to:
   - `https://tnf-risk-detector-backend.onrender.com/api/*`

5. Check responses are successful (Status 200)

## 📝 Notes

- The old local API endpoints in `server.ts` will no longer be used
- All data comes from the deployed backend
- File uploads work seamlessly with the backend
- Error handling is built into the API utility
- CORS errors indicate backend configuration needed

## 🔥 Firebase Storage Integration

### Backend Storage Migration
The backend now uses **Firebase Firestore** and **Firebase Storage** as the primary data source instead of local JSON files:

#### File Upload Flow:
1. Frontend → `POST /api/upload` with FormData (file + metadata)
2. Backend processes:
   - Stores file to **Firebase Storage**
   - Saves metadata to **Firestore**
   - Returns response with `file_url` (Firebase Storage CDN URL or fallback path)
3. Frontend displays file using the returned `file_url`

#### File Display Flow:
1. Frontend fetches `GET /api/submissions`
2. Backend returns submission list with `file_url` field
3. Frontend uses `normalizeFileUrl()` (from `src/api.ts`) to ensure proper URL
4. Files displayed via iframe or direct link

### Security Model

**Frontend (Safe to expose):**
- ✅ Public Firebase Web Config: `apiKey`, `projectId`, `appId`, etc.
- ✅ Located in `src/firebase.ts`
- ✅ These are public client credentials

**Backend Only (Never in frontend):**
- 🔐 Firebase Service Account Key
- 🔐 Private signing keys
- 🔐 Admin SDK credentials
- 🔐 Firestore Admin access
- 🔐 Storage Admin access

**Important:** The frontend NEVER accesses Firebase Storage or Firestore directly. All operations are routed through backend API endpoints.

### Configuration
Firebase credentials are already configured in `src/firebase.ts`:
- Project ID: `tnf-vibe-coding-challenge`
- Storage Bucket: `tnf-vibe-coding-challenge.firebasestorage.app`
- Auth Domain: `tnf-vibe-coding-challenge.firebaseapp.com`

All secret credentials and SDK operations remain exclusively on the backend.
