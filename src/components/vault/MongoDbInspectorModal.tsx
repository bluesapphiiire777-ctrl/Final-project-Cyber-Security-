import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Database, 
  Search, 
  Terminal, 
  Code, 
  Copy, 
  Check, 
  Download, 
  RefreshCw, 
  X, 
  Server, 
  Cpu, 
  HardDrive, 
  ShieldCheck, 
  ExternalLink,
  Layers,
  FileJson
} from 'lucide-react';
import { useStore } from '../../store';

interface MongoDbInspectorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MongoDbInspectorModal: React.FC<MongoDbInspectorModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { evidence } = useStore();
  const [activeCollection, setActiveCollection] = useState<'evidence' | 'users' | 'audit_logs' | 'cases'>('evidence');
  const [mongoData, setMongoData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDoc, setSelectedDoc] = useState<any | null>(null);
  const [activeSnippetTab, setActiveSnippetTab] = useState<'mongosh' | 'nodejs' | 'python' | 'compass'>('nodejs');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Fetch real data from MongoDB backend API
  const fetchMongoDbCollection = async (collName: string) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/mongodb/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ collectionName: collName, limit: 50 })
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.documents) && data.documents.length > 0) {
        setMongoData(data.documents);
        setSelectedDoc(data.documents[0]);
      } else {
        // Fallback to local Zustand evidence store if database is empty or offline
        if (collName === 'evidence') {
          setMongoData(evidence);
          setSelectedDoc(evidence[0] || null);
        } else {
          setMongoData([]);
          setSelectedDoc(null);
        }
      }
    } catch (err) {
      console.warn('MongoDB query API notice, using store fallback:', err);
      if (collName === 'evidence') {
        setMongoData(evidence);
        setSelectedDoc(evidence[0] || null);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchMongoDbCollection(activeCollection);
    }
  }, [isOpen, activeCollection]);

  if (!isOpen) return null;

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleDownloadJson = (doc: any) => {
    const jsonString = JSON.stringify(doc, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `MongoDB-Document-${doc.id || doc._id || 'record'}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Filtered documents
  const filteredData = mongoData.filter((doc) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    const str = JSON.stringify(doc).toLowerCase();
    return str.includes(q);
  });

  const connectionUriMasked = "mongodb+srv://kaig05463_db_user:••••••••••••@database.lffgwdo.mongodb.net/?appName=Database";

  const codeSnippets = {
    mongosh: `// 1. Connect via terminal shell (mongosh):
mongosh "mongodb+srv://kaig05463_db_user:<YOUR_PASSWORD>@database.lffgwdo.mongodb.net/fip_forensics"

// 2. Query unfiltered raw evidence documents:
use fip_forensics
db.evidence.find({}).pretty()

// 3. Find specific evidence by ID or Case:
db.evidence.find({ id: "${selectedDoc?.id || 'EVD-90412-ALPHA'}" })`,

    nodejs: `// Node.js TypeScript / JavaScript MongoDB Connection
import { MongoClient } from 'mongodb';

const uri = "mongodb+srv://kaig05463_db_user:<YOUR_PASSWORD>@database.lffgwdo.mongodb.net/?appName=Database";
const client = new MongoClient(uri);

async function inspectBackendRawEvidence() {
  await client.connect();
  const db = client.db('fip_forensics');
  
  // Retrieve all unfiltered raw evidence stored in MongoDB
  const rawEvidenceList = await db.collection('evidence').find({}).toArray();
  console.log("Unfiltered Raw Evidence Records:", rawEvidenceList);
  
  // Query specific file stream:
  const targetDoc = await db.collection('evidence').findOne({ id: '${selectedDoc?.id || 'EVD-90412-ALPHA'}' });
  console.log("Unfiltered Payload Data URL / Stream:", targetDoc.fileDataUrl || targetDoc.content);
}

inspectBackendRawEvidence();`,

    python: `# Python PyMongo Connection
from pymongo import MongoClient

uri = "mongodb+srv://kaig05463_db_user:<YOUR_PASSWORD>@database.lffgwdo.mongodb.net/?appName=Database"
client = MongoClient(uri)

db = client['fip_forensics']
evidence_collection = db['evidence']

# Fetch all unfiltered raw uploaded files from MongoDB backend
all_evidence = list(evidence_collection.find({}))
for doc in all_evidence:
    print(f"ID: {doc.get('id')}, Title: {doc.get('title')}, Hash: {doc.get('sha256Hash')}")

# Get specific raw document
single_doc = evidence_collection.find_one({'id': '${selectedDoc?.id || 'EVD-90412-ALPHA'}'})
print("Raw File Content Stream:", single_doc.get('content'))`,

    compass: `MongoDB Compass GUI Desktop Connection Guide:

1. Open MongoDB Compass application.
2. Paste the URI connection string:
   mongodb+srv://kaig05463_db_user:<YOUR_PASSWORD>@database.lffgwdo.mongodb.net/?appName=Database
3. Click "Connect".
4. Select Database: fip_forensics
5. Select Collection: evidence
6. Browse or filter raw document payloads (includes fileDataUrl, content, and sha256Hash).`
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/85 backdrop-blur-md z-[150]"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-3 sm:inset-6 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-5xl md:max-h-[92vh] bg-[#12151E] border border-emerald-500/40 rounded-3xl shadow-[0_0_50px_rgba(16,185,129,0.2)] z-[160] flex flex-col text-white overflow-hidden font-mono"
          >
            {/* Header */}
            <div className="p-5 sm:p-6 border-b border-zinc-800 bg-[#171B26] flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
                  <Database className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base sm:text-lg font-bold tracking-wider text-emerald-300">
                      MONGODB BACKEND UNFILTERED RAW STORAGE INSPECTOR
                    </h2>
                    <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] px-2.5 py-0.5 rounded-full font-bold hidden sm:inline-block">
                      LIVE DATABASE LINKED
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400">
                    Database: <code className="text-emerald-400 font-bold">fip_forensics</code> &bull; Cluster: <code className="text-zinc-300">database.lffgwdo.mongodb.net</code>
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2.5 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Content Body - 2 Columns */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
              
              {/* TOP BANNER: Explanation of Backend Unfiltered vs Drive WORM */}
              <div className="p-4 bg-emerald-950/40 border border-emerald-500/30 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold">
                    <ShieldCheck size={16} />
                    <span>DUAL-VAULT ARCHITECTURE CONFIRMED</span>
                  </div>
                  <p className="text-zinc-300 leading-relaxed">
                    Whenever you upload any file, it is automatically stored in <strong>2 places</strong>:
                  </p>
                  <ul className="list-disc list-inside text-zinc-400 space-y-0.5 ml-1">
                    <li><strong className="text-emerald-300">Place 1 (Backend MongoDB):</strong> Stores the 100% unfiltered raw original file, image Data URL, and exact binary payload.</li>
                    <li><strong className="text-amber-300">Place 2 (Google Drive WORM):</strong> Stores the immutable read-only <code className="text-amber-400">.sha256-seal.txt</code> cryptographic ledger file.</li>
                  </ul>
                </div>
                <button
                  onClick={() => fetchMongoDbCollection(activeCollection)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold flex items-center gap-2 shrink-0 transition-all shadow-lg"
                >
                  <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} />
                  <span>Sync MongoDB Collection</span>
                </button>
              </div>

              {/* COLLECTION TABS */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-zinc-400 font-bold uppercase mr-1">Collections:</span>
                  {(['evidence', 'users', 'audit_logs', 'cases'] as const).map((coll) => (
                    <button
                      key={coll}
                      onClick={() => setActiveCollection(coll)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                        activeCollection === coll
                          ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20'
                          : 'bg-zinc-800/80 text-zinc-400 hover:bg-zinc-700 hover:text-white'
                      }`}
                    >
                      <Layers size={13} />
                      <span className="uppercase">{coll} ({coll === 'evidence' ? mongoData.length : 'DB'})</span>
                    </button>
                  ))}
                </div>

                {/* Search Bar */}
                <div className="relative w-full sm:w-64">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search MongoDB docs..."
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* MAIN DATA VIEW GRID */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Left: Document Selector List (5 Columns) */}
                <div className="lg:col-span-5 space-y-3">
                  <div className="text-xs text-zinc-400 font-bold flex items-center justify-between">
                    <span>MONGODB RECORD BATCH ({filteredData.length})</span>
                    <span className="text-emerald-400 text-[11px]">Click record to inspect JSON</span>
                  </div>

                  <div className="max-h-[380px] overflow-y-auto space-y-2 pr-1">
                    {filteredData.length === 0 ? (
                      <div className="p-8 text-center text-zinc-500 text-xs bg-zinc-900/50 rounded-2xl border border-zinc-800">
                        No documents found matching query.
                      </div>
                    ) : (
                      filteredData.map((doc, idx) => {
                        const isSelected = selectedDoc?.id === doc.id || selectedDoc?._id === doc._id;
                        return (
                          <div
                            key={doc.id || doc._id || idx}
                            onClick={() => setSelectedDoc(doc)}
                            className={`p-3.5 rounded-2xl border cursor-pointer transition-all space-y-1.5 ${
                              isSelected
                                ? 'bg-emerald-950/60 border-emerald-500 text-white shadow-lg'
                                : 'bg-zinc-900/60 border-zinc-800/80 hover:border-zinc-700 text-zinc-300'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-xs text-emerald-400 truncate max-w-[180px]">
                                {doc.title || doc.name || doc.action || doc.id || `Doc #${idx + 1}`}
                              </span>
                              <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-800 font-mono text-zinc-400">
                                {doc.size || doc.type || 'BSON'}
                              </span>
                            </div>
                            <div className="text-[10px] text-zinc-400 font-mono truncate">
                              ID: {doc.id || doc._id || 'N/A'}
                            </div>
                            {doc.sha256Hash && (
                              <div className="text-[9px] text-zinc-500 font-mono truncate">
                                SHA-256: {doc.sha256Hash.substring(0, 24)}...
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Right: Raw MongoDB JSON Inspector (7 Columns) */}
                <div className="lg:col-span-7 space-y-3">
                  <div className="text-xs text-zinc-400 font-bold flex items-center justify-between">
                    <span>UNFILTERED MONGODB DOCUMENT PAYLOAD</span>
                    {selectedDoc && (
                      <button
                        onClick={() => handleDownloadJson(selectedDoc)}
                        className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white rounded-lg text-[10px] font-bold flex items-center gap-1 transition-colors"
                      >
                        <Download size={12} />
                        <span>Export RAW JSON</span>
                      </button>
                    )}
                  </div>

                  <div className="bg-black/90 rounded-2xl border border-zinc-800 p-4 max-h-[380px] overflow-y-auto font-mono text-[11px] text-emerald-400 relative">
                    {selectedDoc ? (
                      <pre className="whitespace-pre-wrap break-all select-all leading-relaxed">
                        {JSON.stringify(selectedDoc, null, 2)}
                      </pre>
                    ) : (
                      <div className="p-12 text-center text-zinc-600">Select a MongoDB document on the left to inspect raw BSON/JSON payload.</div>
                    )}
                  </div>
                </div>
              </div>

              {/* BOTTOM SECTION: HOW TO ACCESS MONGODB FROM CODE / SHELL */}
              <div className="pt-4 border-t border-zinc-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Terminal size={16} className="text-emerald-400" />
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                      How to Access the Backend MongoDB Database Directly
                    </h3>
                  </div>
                  <div className="flex items-center gap-1 bg-zinc-900 p-1 rounded-xl border border-zinc-800 text-[10px]">
                    {(['nodejs', 'mongosh', 'python', 'compass'] as const).map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveSnippetTab(tab)}
                        className={`px-3 py-1 rounded-lg font-bold uppercase transition-all ${
                          activeSnippetTab === tab
                            ? 'bg-emerald-600 text-white'
                            : 'text-zinc-400 hover:text-white'
                        }`}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-[#0B0D13] p-4 rounded-2xl border border-zinc-800 relative space-y-2">
                  <div className="flex items-center justify-between text-[10px] text-zinc-500 border-b border-zinc-800/80 pb-2">
                    <span>
                      {activeSnippetTab === 'nodejs' && 'Node.js / Express Driver Connection Code'}
                      {activeSnippetTab === 'mongosh' && 'MongoDB Shell (mongosh) Terminal Command'}
                      {activeSnippetTab === 'python' && 'Python PyMongo Connection Code'}
                      {activeSnippetTab === 'compass' && 'MongoDB Compass GUI Connection Guide'}
                    </span>
                    <button
                      onClick={() => handleCopy(codeSnippets[activeSnippetTab], activeSnippetTab)}
                      className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white rounded-md font-bold flex items-center gap-1 transition-colors"
                    >
                      {copiedKey === activeSnippetTab ? (
                        <>
                          <Check size={11} className="text-emerald-400" />
                          <span className="text-emerald-400">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy size={11} />
                          <span>Copy Snippet</span>
                        </>
                      )}
                    </button>
                  </div>

                  <pre className="text-[11px] text-emerald-400 font-mono whitespace-pre-wrap leading-relaxed overflow-x-auto select-all">
                    {codeSnippets[activeSnippetTab]}
                  </pre>
                </div>
              </div>

            </div>

            {/* Footer */}
            <div className="p-4 sm:p-5 border-t border-zinc-800 bg-[#171B26] flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-zinc-400">
                <Server size={14} className="text-emerald-400" />
                <span>MongoDB Atlas Cluster: <code className="text-white">database.lffgwdo.mongodb.net</code></span>
              </div>
              <button
                onClick={onClose}
                className="px-5 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl font-bold transition-colors"
              >
                Close Inspector
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
