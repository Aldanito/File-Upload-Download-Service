# File Upload / Download Service – Frontend

Next.js app for the **share** flow: create a share (upload + download links and passwords), upload files via the upload link, and download files via the download link. All access is password-protected.

## What this app does

- **Home** – “Create Share” (go to share creation) and “Enter a link” (paste a share URL and go to upload or download).
- **Create Share** (`/share/new`) – Form: upload password, download password, optional name. On success: two cards (upload link + password, download link + password) with show/hide toggles and copy buttons with “Copied!” feedback.
- **Upload** (`/share/[id]`) – Password gate, then drag-and-drop or browse to upload; **percentage progress** per file and **parallel (async) uploads**; list of files with download and delete.
- **Download** (`/share/[id]/download`) – Password gate, then list of files with download and refresh.
- **Access** (`/access`) – Paste a share URL (or legacy file-request URL); redirects to the correct share page.

## Tech

- **Next.js 15** (App Router), **React 19**, **Tailwind CSS 4**
- API client in `src/helpers/api`: `createAuth`, `uploadApi`, `uploadWithProgress` (putWithProgress for upload progress), `filesApi` (create/auth, upload/multipart, list/download/delete), `parseResponse` (parseJsonResponse, throwIfNotOk), plus `fetchWithAuth`, `getApiUrl`
- **Helpers** in `src/helpers`: `formatting/formatSize` for byte display; `api/parseResponse` for consistent API error handling
- **Types** in `src/types/api`: API response types (CreateFileRequestResponse, AuthResponse, FileItem, ListFilesResponse, etc.) and error/part types
- Shared UI in `src/shared/ui`: Button, Input, PasswordInput, **ErrorBoundary** (catches runtime errors and shows fallback + “Back to home”)
- Widgets: `PasswordForm`, `UploadZone`, `FileList`, Header, Footer
- **Hooks**: `useFileList` for list/download/delete; `useShareAuth` for share-page password gate and token state
- Password forms on share upload/download pages show loading state (“Checking…”) while authenticating

## Getting started

1. **Install**

   ```bash
   npm install
   ```

2. **Environment** (optional)  
   Create `.env.local` for local dev:

   ```env
   NEXT_PUBLIC_API_URL=http://localhost:3001
   ```

   **Production (Railway / Vercel):** On the **frontend** service, set both:
   - `API_URL` = your backend URL (e.g. `https://backend-fuds.up.railway.app`) — used at **runtime** by the server to inject the API URL into the page.
   - `NEXT_PUBLIC_API_URL` = same URL — used as fallback at build time and by the client.  
   The root layout is dynamic so the server reads these at request time; without them, the app falls back to `http://localhost:3001`.

3. **Run**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000). Ensure the backend is running (see root `README.md` or `Backend/README.md`).

## Scripts

| Command       | Description              |
|---------------|--------------------------|
| `npm run dev` | Development (Turbopack)  |
| `npm run build` | Production build       |
| `npm run start` | Run production build   |
| `npm run lint`  | Lint                    |

## Project structure

```
src/
├── app/                    # Routes
│   ├── layout.tsx          # Root layout (Header, Footer, ErrorBoundary)
│   ├── page.tsx            # Home
│   ├── access/page.tsx     # Paste link
│   └── share/
│       ├── new/page.tsx    # Create share
│       └── [id]/
│           ├── page.tsx    # Upload
│           └── download/page.tsx  # Download
├── helpers/
│   ├── api/                # createAuth, uploadApi, uploadWithProgress, filesApi, parseResponse, fetchWithAuth, getApiUrl
│   └── formatting/         # formatSize
├── hooks/                  # useFileList, useShareAuth
├── types/                  # API types (api.ts, index)
├── shared/ui/              # Button, Input, PasswordInput, ErrorBoundary
└── widgets/               # PasswordForm, UploadZone, FileList, Header, Footer
```

## Deploy

- **Vercel** – Connect the repo, set root to `Frontend`, add `NEXT_PUBLIC_API_URL` to your backend URL.
- **Railway** – Deploy as a separate service; use a Next.js Dockerfile or the Node buildpack and set `NEXT_PUBLIC_API_URL` to your backend URL.

Backend is deployed separately (e.g. Railway; see `Backend/README.md`).

## Version

1.4.0

## Last updated

January 29, 2025
