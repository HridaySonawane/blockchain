"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Activity, Archive, ArrowDownToLine, ArrowRight, BadgeCheck, Bell, Check,
  CheckCircle2, ChevronDown, ChevronLeft, ChevronRight, Clock3, Copy, Download,
  File, FileImage, FileText, Fingerprint, FolderOpen, HardDrive, Hash, Image,
  LockKeyhole, MoreHorizontal, Plus, Search, Shield, ShieldCheck, SlidersHorizontal,
  Upload, X,
} from "lucide-react";

type Evidence = {
  id: string; name: string; kind: string; category: string; size: number; hash: string;
  added: string; owner: string; status: "Verified" | "Pending"; caseId: string;
  custody: { action: string; actor: string; date: string; detail: string; previousHash?: string; blockHash?: string }[];
};

const seed: Evidence[] = [
  { id: "EV-2024-0891", name: "server_access_logs_q3.csv", kind: "CSV", category: "Log file", size: 2481200, hash: "a3f5c91d8b2e7a4c6f1d9e0b3a8c5f72d4e9b1c6a7f0d3e8b2c5a9f1d6e4b7c0", added: "Oct 24, 2024 · 2:41 PM", owner: "Alex Morgan", status: "Verified", caseId: "CASE-2024-0142", custody: [{ action: "Evidence ingested", actor: "Alex Morgan", date: "Oct 24, 2024 · 2:41 PM", detail: "Uploaded from local device" }, { action: "Hash verified", actor: "System", date: "Oct 24, 2024 · 2:41 PM", detail: "SHA-256 fingerprint created" }, { action: "Evidence sealed", actor: "System", date: "Oct 24, 2024 · 2:42 PM", detail: "Record added to vault" }] },
  { id: "EV-2024-0890", name: "interview_transcript_04.pdf", kind: "PDF", category: "Document", size: 1843200, hash: "b7c2e4f8a1d5c9e3f6b0a4d8c2e7f1a5b9d3c6e0f4a8b2d7c1e5f9a3b6d0c4e8", added: "Oct 24, 2024 · 11:18 AM", owner: "Jordan Lee", status: "Verified", caseId: "CASE-2024-0142", custody: [{ action: "Evidence ingested", actor: "Jordan Lee", date: "Oct 24, 2024 · 11:18 AM", detail: "Uploaded from local device" }, { action: "Hash verified", actor: "System", date: "Oct 24, 2024 · 11:18 AM", detail: "SHA-256 fingerprint created" }] },
  { id: "EV-2024-0889", name: "device_image_phone01.png", kind: "PNG", category: "Image", size: 8740000, hash: "c9d4f7a2e5b8c1d6f0a3e7b4c9d2f5a8e1b6c0d3f7a4e9b2c5d8f1a6e0b3c7d4", added: "Oct 23, 2024 · 4:52 PM", owner: "Alex Morgan", status: "Verified", caseId: "CASE-2024-0142", custody: [{ action: "Evidence ingested", actor: "Alex Morgan", date: "Oct 23, 2024 · 4:52 PM", detail: "Uploaded from local device" }, { action: "Hash verified", actor: "System", date: "Oct 23, 2024 · 4:53 PM", detail: "SHA-256 fingerprint created" }] },
  { id: "EV-2024-0888", name: "network_capture_10-23.pcap", kind: "PCAP", category: "Network capture", size: 15600000, hash: "d1e6a9c3f7b2e5a8c0d4f1b6e9a3c7d2f5b8e1a4c0d6f9b3e7a2c5d8f1b4e0a6", added: "Oct 23, 2024 · 1:07 PM", owner: "Sam Rivera", status: "Pending", caseId: "CASE-2024-0142", custody: [{ action: "Evidence ingested", actor: "Sam Rivera", date: "Oct 23, 2024 · 1:07 PM", detail: "Uploaded from local device" }] },
  { id: "EV-2024-0887", name: "email_thread_finance.eml", kind: "EML", category: "Email", size: 452000, hash: "e2b7c0d4a9f3e6b1c5d8a2f7e0b4c9d3a6f1e5b8c2d7a0f4e9b3c6d1a5f8e2b7", added: "Oct 22, 2024 · 9:32 AM", owner: "Jordan Lee", status: "Verified", caseId: "CASE-2024-0142", custody: [{ action: "Evidence ingested", actor: "Jordan Lee", date: "Oct 22, 2024 · 9:32 AM", detail: "Uploaded from local device" }, { action: "Hash verified", actor: "System", date: "Oct 22, 2024 · 9:33 AM", detail: "SHA-256 fingerprint created" }] },
  { id: "EV-2024-0886", name: "cctv_lobby_2024-10-21.mp4", kind: "MP4", category: "Video", size: 284000000, hash: "f3a8d1c6b9e4f7a2c5d0e3b8a1f6c9d4e7b2a5c0d3f8e1b6a9c4d7e0f3b8a2c5", added: "Oct 21, 2024 · 5:16 PM", owner: "Alex Morgan", status: "Verified", caseId: "CASE-2024-0142", custody: [{ action: "Evidence ingested", actor: "Alex Morgan", date: "Oct 21, 2024 · 5:16 PM", detail: "Uploaded from local device" }, { action: "Hash verified", actor: "System", date: "Oct 21, 2024 · 5:17 PM", detail: "SHA-256 fingerprint created" }] },
];

const initialActivity = [
  { initials: "AM", color: "plum", title: "Alex Morgan", action: "uploaded", file: "server_access_logs_q3.csv", time: "2h ago" },
  { initials: "JL", color: "blue", title: "Jordan Lee", action: "verified hash for", file: "interview_transcript_04.pdf", time: "5h ago" },
  { initials: "SY", color: "green", title: "System", action: "sealed", file: "device_image_phone01.png", time: "Yesterday" },
];

const dbName = "proofcase-evidence";
function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName, 1);
    request.onupgradeneeded = () => request.result.createObjectStore("files");
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}
async function saveBlob(id: string, blob: Blob) {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => { const tx = db.transaction("files", "readwrite"); tx.objectStore("files").put(blob, id); tx.oncomplete = () => resolve(); tx.onerror = () => reject(tx.error); });
  db.close();
}
async function readBlob(id: string): Promise<Blob | undefined> {
  const db = await openDb();
  const blob = await new Promise<Blob | undefined>((resolve, reject) => { const request = db.transaction("files").objectStore("files").get(id); request.onsuccess = () => resolve(request.result); request.onerror = () => reject(request.error); });
  db.close(); return blob;
}
async function digest(blob: Blob) {
  const bytes = await blob.arrayBuffer();
  const hash = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(hash), (b) => b.toString(16).padStart(2, "0")).join("");
}
async function ledgerHash(previousHash: string, action: string, actor: string, timestamp: string, evidenceHash: string) {
  const payload = new TextEncoder().encode(`${previousHash}|${action}|${actor}|${timestamp}|${evidenceHash}`);
  const result = await crypto.subtle.digest("SHA-256", payload);
  return Array.from(new Uint8Array(result), (b) => b.toString(16).padStart(2, "0")).join("");
}
const formatSize = (bytes: number) => bytes > 1e9 ? `${(bytes / 1e9).toFixed(1)} GB` : bytes > 1e6 ? `${(bytes / 1e6).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1000))} KB`;
const fileIcon = (kind: string) => kind === "PDF" ? FileText : ["PNG", "JPG", "JPEG"].includes(kind) ? FileImage : kind === "MP4" ? Image : File;

export default function Home() {
  const [records, setRecords] = useState<Evidence[]>(seed);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All evidence");
  const [activeTab, setActiveTab] = useState("Overview");
  const [selected, setSelected] = useState<Evidence | null>(null);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [caseId, setCaseId] = useState("CASE-2024-0142");
  const [category, setCategory] = useState("Document");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("proofcase-records");
    if (saved) { try { setRecords(JSON.parse(saved)); } catch { /* use starter records */ } }
  }, []);
  useEffect(() => { localStorage.setItem("proofcase-records", JSON.stringify(records)); }, [records]);

  const visible = useMemo(() => records.filter((r) => {
    const q = query.toLowerCase();
    const matches = `${r.name} ${r.id} ${r.category} ${r.owner} ${r.caseId}`.toLowerCase().includes(q);
    return matches && (filter === "All evidence" || (filter === "Verified" ? r.status === "Verified" : r.status === "Pending"));
  }), [records, query, filter]);
  const verified = records.filter((r) => r.status === "Verified").length;
  const pending = records.filter((r) => r.status === "Pending").length;
  const totalBytes = records.reduce((sum, item) => sum + item.size, 0);

  const addEvidence = async () => {
    if (!file) return;
    setBusy(true);
    try {
      const hash = await digest(file);
      const id = `EV-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`;
      const now = new Date();
      const added = now.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }) + " · " + now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
      const actions = [{ action: "Evidence ingested", actor: "You", detail: "Uploaded from local device" }, { action: "Hash verified", actor: "System", detail: "SHA-256 fingerprint created" }, { action: "Evidence sealed", actor: "System", detail: "Linked to the previous custody event" }];
      let previousHash = "GENESIS";
      const custody = [];
      for (const event of actions) {
        const blockHash = await ledgerHash(previousHash, event.action, event.actor, added, hash);
        custody.push({ ...event, date: "Just now", previousHash, blockHash });
        previousHash = blockHash;
      }
      const record: Evidence = { id, name: file.name, kind: (file.name.split(".").pop() || "FILE").toUpperCase(), category, size: file.size, hash, added, owner: "You", status: "Verified", caseId, custody };
      await saveBlob(id, file);
      setRecords((current) => [record, ...current]); setSelected(record); setUploadOpen(false); setFile(null); setNotice("Evidence added and SHA-256 fingerprint created.");
      window.setTimeout(() => setNotice(""), 3500);
    } catch { setNotice("Could not store this file in your browser. Try a smaller file."); }
    setBusy(false);
  };

  const verify = async (item: Evidence) => {
    setBusy(true);
    let previousHash = "GENESIS";
    for (const event of item.custody) {
      if (!event.blockHash) continue;
      const expected = await ledgerHash(previousHash, event.action, event.actor, item.added, item.hash);
      if (event.previousHash !== previousHash || event.blockHash !== expected) {
        setRecords((current) => current.map((r) => r.id === item.id ? { ...r, status: "Pending" } : r));
        setNotice("Custody ledger check failed. An event link does not match its recorded hash.");
        window.setTimeout(() => setNotice(""), 4000); setBusy(false); return;
      }
      previousHash = event.blockHash;
    }
    const blob = await readBlob(item.id);
    if (blob) {
      const actual = await digest(blob);
      if (actual !== item.hash) { setRecords((current) => current.map((r) => r.id === item.id ? { ...r, status: "Pending" } : r)); setNotice("Integrity check failed. The stored file hash has changed."); }
      else setNotice("Integrity confirmed. The file matches its SHA-256 fingerprint.");
    } else setNotice("Original file is unavailable in this browser. This record was added as sample data.");
    window.setTimeout(() => setNotice(""), 4000); setBusy(false);
  };

  const downloadFile = async (item: Evidence) => {
    const blob = await readBlob(item.id);
    if (!blob) { setNotice("Original file is unavailable in this browser."); window.setTimeout(() => setNotice(""), 3000); return; }
    const url = URL.createObjectURL(blob); const anchor = document.createElement("a"); anchor.href = url; anchor.download = item.name; anchor.click(); URL.revokeObjectURL(url);
  };

  const copyHash = async (hash: string) => { await navigator.clipboard.writeText(hash); setCopied(true); window.setTimeout(() => setCopied(false), 1500); };

  return <main className="shell">
    <aside className="sidebar">
      <div className="brand"><div className="brand-mark"><Fingerprint size={21} strokeWidth={1.8} /></div><div><span className="brand-name">proofcase</span><span className="brand-caption">EVIDENCE VAULT</span></div></div>
      <button className="workspace-switch"><span className="workspace-dot">N</span><span className="workspace-copy"><b>Northstar Legal</b><small>Workspace</small></span><ChevronDown size={15} /></button>
      <div className="nav-label">WORKSPACE</div>
      <nav className="nav">
        {[{ label: "Overview", icon: Activity }, { label: "Evidence", icon: Archive }, { label: "Chain of custody", icon: ShieldCheck }].map(({ label, icon: Icon }) => <button key={label} className={`nav-item ${activeTab === label ? "selected" : ""}`} onClick={() => setActiveTab(label)}><Icon size={17} /><span>{label}</span>{label === "Evidence" && <span className="nav-badge">{records.length}</span>}</button>)}
      </nav>
      <div className="nav-label collections-label">COLLECTIONS <button aria-label="Add collection"><Plus size={14} /></button></div>
      <button className="collection"><span className="collection-dot amber" />Active cases<span className="collection-count">04</span></button>
      <button className="collection"><span className="collection-dot violet" />Archived<span className="collection-count">12</span></button>
      <div className="sidebar-spacer" />
      <div className="storage-card"><div className="storage-heading"><HardDrive size={15} /><span>Vault storage</span><span className="storage-value">{formatSize(totalBytes)}</span></div><div className="storage-track"><span style={{ width: `${Math.min(92, Math.max(12, totalBytes / 5_000_000_000 * 100))}%` }} /></div><small>of 5 GB used</small></div>
      <button className="profile"><div className="avatar me">AM</div><div className="profile-copy"><b>Alex Morgan</b><small>Investigator</small></div><MoreHorizontal size={17} /></button>
    </aside>

    <section className="main-area">
      <header className="topbar"><div className="breadcrumbs"><span>Workspace</span><ChevronRight size={14} /><b>{activeTab}</b></div><div className="top-actions"><div className="secure"><span /> All systems secure</div><button className="icon-button" aria-label="Notifications"><Bell size={18} /><i /></button><div className="top-avatar">AM</div></div></header>
      <div className="content">
        <div className="page-heading"><div><div className="eyebrow"><span className="case-dot" /> CASE-2024-0142 <span className="eyebrow-divider">/</span> ACTIVE INVESTIGATION</div><h1>Evidence overview</h1><p className="subtitle">Manage and verify digital evidence across your investigation.</p></div><div className="heading-buttons"><button className="button secondary" onClick={() => { setFilter(filter === "All evidence" ? "Pending" : "All evidence"); document.getElementById("evidence-table")?.scrollIntoView({ behavior: "smooth" }); }}><SlidersHorizontal size={16} /> Filters</button><button className="button primary" onClick={() => setUploadOpen(true)}><Plus size={17} /> Add evidence</button></div></div>

        <div className="metric-grid">
          <div className="metric-card"><div className="metric-top"><span>Total evidence</span><div className="metric-icon lavender"><Archive size={17} /></div></div><div className="metric-number">{String(records.length).padStart(2, "0")}<span className="metric-unit">files</span></div><div className="metric-foot"><span className="trend">+3</span> added this week</div></div>
          <div className="metric-card"><div className="metric-top"><span>Integrity verified</span><div className="metric-icon mint"><ShieldCheck size={17} /></div></div><div className="metric-number">{records.length ? Math.round(verified / records.length * 100) : 0}<span className="metric-unit">%</span></div><div className="metric-foot"><span className="good-dot" />{verified} of {records.length} files verified</div></div>
          <div className="metric-card"><div className="metric-top"><span>Pending review</span><div className="metric-icon peach"><Clock3 size={17} /></div></div><div className="metric-number">{String(pending).padStart(2, "0")}<span className="metric-unit">files</span></div><div className="metric-foot">Needs integrity check</div></div>
          <div className="metric-card"><div className="metric-top"><span>Chain of custody</span><div className="metric-icon sky"><Fingerprint size={17} /></div></div><div className="metric-number">{records.reduce((n, r) => n + r.custody.length, 0)}<span className="metric-unit">events</span></div><div className="metric-foot"><span className="good-dot" />Complete audit trail</div></div>
        </div>

        <div className="overview-grid">
          <section className="panel evidence-panel" id="evidence-table">
            <div className="panel-heading"><div><h2>Evidence files</h2><p>All files associated with this investigation</p></div><button className="text-button" onClick={() => setActiveTab("Evidence")}>View all <ArrowRight size={15} /></button></div>
            <div className="table-tools"><div className="search-box"><Search size={16} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search evidence..." /><kbd>⌘ K</kbd></div><button className="table-filter" onClick={() => setFilter(filter === "All evidence" ? "Verified" : filter === "Verified" ? "Pending" : "All evidence")}>{filter}<ChevronDown size={14} /></button></div>
            <div className="table-wrap"><table><thead><tr><th>FILE NAME</th><th>CASE ID</th><th>ADDED BY</th><th>DATE ADDED</th><th>INTEGRITY</th><th></th></tr></thead><tbody>{visible.slice(0, 6).map((item) => { const Icon = fileIcon(item.kind); return <tr key={item.id} onClick={() => setSelected(item)}><td><div className={`file-type ${item.kind === "PDF" ? "pdf" : item.kind === "PNG" ? "image-type" : "generic"}`}><Icon size={17} /></div><div className="file-name"><b>{item.name}</b><small>{item.kind} · {formatSize(item.size)}</small></div></td><td><span className="case-pill">{item.caseId}</span></td><td><div className="person-cell"><span className="mini-avatar">{item.owner.split(" ").map((x) => x[0]).join("")}</span>{item.owner}</div></td><td className="date-cell">{item.added}</td><td><span className={`status ${item.status === "Verified" ? "verified" : "pending"}`}><span />{item.status}</span></td><td><button className="row-more" onClick={(e) => { e.stopPropagation(); setSelected(item); }} aria-label="Open evidence details"><MoreHorizontal size={18} /></button></td></tr>; })}{visible.length === 0 && <tr><td colSpan={6} className="empty-state">No evidence matches this search.</td></tr>}</tbody></table></div>
            <div className="table-footer"><span>Showing <b>{Math.min(visible.length, 6)}</b> of <b>{visible.length}</b> evidence files</span><div><button aria-label="Previous page" disabled><ChevronLeft size={16} /></button><button className="page-number">1</button><button aria-label="Next page" disabled><ChevronRight size={16} /></button></div></div>
          </section>

          <section className="panel activity-panel"><div className="panel-heading"><div><h2>Recent activity</h2><p>Latest actions in this case</p></div><button className="icon-button small"><MoreHorizontal size={17} /></button></div><div className="activity-list">{initialActivity.map((event, index) => <div className="activity-item" key={event.file}><div className={`activity-avatar ${event.color}`}>{event.initials}</div><div className="activity-content"><p><b>{event.title}</b> {event.action}<br /><button onClick={() => setSelected(records.find((r) => r.name === event.file) || records[0])}>{event.file}</button></p><span>{event.time}</span></div>{index !== 2 && <div className="activity-line" />}</div>)}</div><button className="activity-all" onClick={() => setActiveTab("Chain of custody")}>View activity log <ArrowRight size={15} /></button></section>
        </div>

        <div className="bottom-grid"><section className="integrity-banner"><div className="integrity-mark"><ShieldCheck size={22} /></div><div><h3>Your evidence is protected</h3><p>SHA-256 fingerprints are linked into a local, tamper-evident custody ledger.</p></div><button onClick={() => { const target = records.find((r) => r.status === "Pending") || records[0]; if (target) verify(target); }}>Run integrity check <ArrowRight size={15} /></button></section><div className="audit-mini"><div className="audit-icon"><LockKeyhole size={16} /></div><div><b>Linked custody ledger</b><span>Local prototype · no chain network</span></div><BadgeCheck size={17} className="audit-check" /></div></div>
        <footer className="footer"><span>Proofcase <span className="footer-dot">·</span> Secure evidence management</span><span><span className="footer-live" /> Vault operational <span className="footer-dot">·</span> Last synced just now</span></footer>
      </div>
    </section>

    {uploadOpen && <div className="modal-backdrop" onClick={() => !busy && setUploadOpen(false)}><div className="modal" onClick={(e) => e.stopPropagation()}><div className="modal-heading"><div><div className="modal-icon"><Upload size={19} /></div><h2>Add evidence</h2><p>Upload a file to fingerprint and seal it in your vault.</p></div><button className="close-button" onClick={() => setUploadOpen(false)}><X size={19} /></button></div><label className={`drop-zone ${file ? "has-file" : ""}`}><input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />{file ? <><div className="upload-file-icon"><File size={20} /></div><b>{file.name}</b><span>{formatSize(file.size)} · Ready to add</span><button type="button" className="remove-file" onClick={(e) => { e.preventDefault(); setFile(null); }}>Remove</button></> : <><div className="upload-icon"><Upload size={20} /></div><b>Choose a file or drag it here</b><span>Any file type · Stored locally in this browser</span><em>Browse files</em></>}</label><div className="form-row"><label>Case ID<input value={caseId} onChange={(e) => setCaseId(e.target.value)} /></label><label>Evidence type<select value={category} onChange={(e) => setCategory(e.target.value)}><option>Document</option><option>Image</option><option>Video</option><option>Log file</option><option>Network capture</option><option>Email</option><option>Other</option></select></label></div><div className="hash-note"><Hash size={15} /><span>A SHA-256 fingerprint and linked custody events will be generated. The original file stays in this browser.</span></div><div className="modal-actions"><button className="button secondary" onClick={() => setUploadOpen(false)}>Cancel</button><button className="button primary" disabled={!file || busy} onClick={addEvidence}>{busy ? "Fingerprinting…" : <><Plus size={16} /> Add to vault</>}</button></div></div></div>}

    {selected && <div className="drawer-backdrop" onClick={() => setSelected(null)}><aside className="detail-drawer" onClick={(e) => e.stopPropagation()}><div className="drawer-top"><span>Evidence details</span><button className="close-button" onClick={() => setSelected(null)}><X size={19} /></button></div><div className="detail-file-icon"><FileText size={24} /></div><h2 className="detail-name">{selected.name}</h2><div className="detail-meta"><span>{selected.kind}</span><i />{formatSize(selected.size)}<i />{selected.id}</div><div className="detail-status"><span className={`status ${selected.status === "Verified" ? "verified" : "pending"}`}><span />{selected.status === "Verified" ? "Integrity verified" : "Pending verification"}</span><button className="verify-button" disabled={busy} onClick={() => verify(selected)}><ShieldCheck size={15} /> Verify now</button></div><div className="detail-section"><div className="detail-label">SHA-256 FINGERPRINT</div><div className="hash-value">{selected.hash}</div><button className="copy-button" onClick={() => copyHash(selected.hash)}>{copied ? <Check size={14} /> : <Copy size={14} />}{copied ? "Copied" : "Copy fingerprint"}</button></div><div className="detail-section detail-properties"><div className="detail-label">FILE INFORMATION</div><div><span>Case ID</span><b>{selected.caseId}</b></div><div><span>Category</span><b>{selected.category}</b></div><div><span>Added by</span><b>{selected.owner}</b></div><div><span>Date added</span><b>{selected.added}</b></div></div><div className="detail-section custody-section"><div className="detail-label">CHAIN OF CUSTODY <span>{selected.custody.length} events</span></div>{selected.custody.map((event, i) => <div className="custody-event" key={`${event.action}-${i}`}><div className="custody-rail"><span className={i === 0 ? "rail-first" : ""}><Check size={11} /></span>{i !== selected.custody.length - 1 && <i />}</div><div><b>{event.action}</b><p>{event.detail}</p><small>{event.actor} <i>·</i> {event.date}</small>{event.blockHash && <code className="block-hash">BLOCK {event.blockHash.slice(0, 16)}…</code>}</div></div>)}</div><div className="drawer-actions"><button className="button secondary" onClick={() => copyHash(selected.hash)}><Copy size={15} /> Copy hash</button><button className="button primary" onClick={() => downloadFile(selected)}><Download size={15} /> Download file</button></div></aside></div>}
    {notice && <div className="toast"><CheckCircle2 size={17} />{notice}<button onClick={() => setNotice("")}><X size={15} /></button></div>}
  </main>;
}
