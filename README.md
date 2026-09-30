# Forensics & Integrity Platform (FIP Vault)

A high-integrity forensic evidence vault platform built with React 19, Vite, Express, TypeScript, Tailwind CSS v4, and MongoDB.

---

## 🛠️ Local Setup Instructions (VS Code / Localhost)

### Prerequisites

- **Node.js**: v18.x or v20.x+ installed ([nodejs.org](https://nodejs.org/))
- **npm**: v9.x+ (comes bundled with Node.js)
- **Git**: Installed on your system

---

### Step 1: Open in VS Code

1. Open **Visual Studio Code**.
2. Select **File > Open Folder...** and choose this project's root directory.
3. Open an integrated terminal in VS Code:
   - Shortcut: `Ctrl + ~` (Windows/Linux) or `Cmd + ~` (Mac).

---

### Step 2: Install Dependencies

In your VS Code terminal, run:

```bash
npm install
```

---

### Step 3: Configure Environment Variables

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
2. Edit `.env` in VS Code to supply your credentials (if using live MongoDB/Gmail credentials):

```env
MONGODB_URI=mongodb+srv://kaig05463_db_user:YOUR_PASSWORD@database.lffgwdo.mongodb.net/?appName=Database
GMAIL_USER=bluesapphiiire777@gmail.com
GMAIL_APP_PASSWORD=your_gmail_app_password
GEMINI_API_KEY=your_optional_gemini_key
```

*Note: If `MONGODB_URI` is left unconfigured, the system automatically falls back to reactive local Zustand state storage so you can test immediately without setup.*

---

### Step 4: Run Development Server

To launch the full-stack server (Express backend + Vite HMR frontend on port `3000`):

```bash
npm run dev
```

Open your browser and navigate to:
**[http://localhost:3000](http://localhost:3000)**

---

### Step 5: Verify & Build for Production

To test production build compilation locally:

```bash
# Type check & linting
npm run lint

# Production build bundle
npm run build

# Start production server
npm run start
```

---

## 🌟 Key System Capabilities

1. **Dual Storage Architecture**:
   - **Place 1 (MongoDB Backend)**: Stores 100% unfiltered raw files, images, PDFs, audio/video, and code payloads.
   - **Place 2 (Google Drive WORM Enclave)**: Stores immutable, read-only `.sha256-seal.txt` cryptographic seals.

2. **In-App MongoDB Inspector**:
   - Click **"MONGODB RAW STORAGE"** or **"INSPECT BACKEND MONGODB RAW STORAGE"** in the UI to query BSON/JSON records, copy code snippets (Node.js, PyMongo, `mongosh`, Compass), and export raw JSON.

3. **Interactive Media & Document Engine**:
   - Direct high-resolution image viewer, interactive PDF viewer, video/audio players, and Word/Excel/ZIP container viewers.
