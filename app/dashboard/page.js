"use client";
import { useEffect, useState, useRef } from "react";
import { auth, db } from "../../lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc, setDoc, collection, query, where, onSnapshot, updateDoc, deleteDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";
import QRCode from "qrcode";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [shopId, setShopId] = useState(null);
  const [qrUrl, setQrUrl] = useState("");
  const [jobs, setJobs] = useState([]);
  const [printing, setPrinting] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) { router.push("/auth"); return; }
      setUser(u);

      const shopRef = doc(db, "shops", u.uid);
      const shopSnap = await getDoc(shopRef);

      let id;
      if (shopSnap.exists()) {
        id = shopSnap.data().shopId;
      } else {
        id = u.uid.slice(0, 12);
        await setDoc(shopRef, {
          shopId: id,
          email: u.email,
          createdAt: new Date().toISOString(),
        });
      }

      setShopId(id);

      const uploadUrl = `${window.location.origin}/s/${id}`;
      const qr = await QRCode.toDataURL(uploadUrl, {
        width: 300,
        margin: 2,
        color: { dark: "#1a1a1a", light: "#ffffff" },
      });
      setQrUrl(qr);

      // Real-time listener for print jobs
      const q = query(
        collection(db, "printJobs"),
        where("shopId", "==", id),
        where("status", "==", "pending")
      );
      const unsubJobs = onSnapshot(q, (snap) => {
        const jobList = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        // Sort by createdAt
        jobList.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        setJobs(jobList);
      });

      return () => unsubJobs();
    });
    return () => unsub();
  }, []);
///////////////
  async function handlePrint(job) {
  setPrinting(job.id);
  try {
    // Open file in new tab first
    window.open(job.signedUrl, "_blank");

    // Wait 3 seconds to make sure it loads before deleting
    await new Promise(r => setTimeout(r, 3000));

    // Mark as printed
    await updateDoc(doc(db, "printJobs", job.id), { status: "printed" });

    // Delete file from Supabase
    await supabase.storage.from("print-docs").remove([job.fileName]);

    // Delete job from Firestore
    await deleteDoc(doc(db, "printJobs", job.id));

  } catch (err) {
    console.error(err);
  }
  setPrinting(null);
}
//////////////////////
  async function handleSignOut() {
    await signOut(auth);
    router.push("/auth");
  }

  if (!user) return null;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Google+Sans:wght@400;500;700&family=Google+Sans+Text:wght@400;500&display=swap');
        *, *::before, *::after { margin:0;padding:0;box-sizing:border-box; }
        body { background:#0a0a0a; color:#f0f0f0; font-family:'Google Sans Text','Google Sans',sans-serif; -webkit-font-smoothing:antialiased; }
        nav { position:fixed;top:0;left:0;right:0;z-index:100;display:flex;align-items:center;justify-content:space-between;padding:0 48px;height:64px;background:rgba(10,10,10,0.9);backdrop-filter:blur(12px);border-bottom:1px solid rgba(255,255,255,0.08); }
        .nav-logo { font-family:'Google Sans',sans-serif;font-weight:500;font-size:18px;color:#f0f0f0;letter-spacing:-0.2px; }
        .btn-signout { font-size:13px;color:#666;background:none;border:none;cursor:pointer;font-family:'Google Sans Text',sans-serif;padding:8px 16px;border-radius:100px;transition:background 0.2s,color 0.2s; }
        .btn-signout:hover { background:rgba(255,255,255,0.06);color:#f0f0f0; }
        .page { min-height:100vh;padding:100px 24px 60px;max-width:800px;margin:0 auto; }
        .greeting { font-family:'Google Sans',sans-serif;font-size:28px;font-weight:700;color:#fff;letter-spacing:-0.02em;margin-bottom:8px; }
        .greeting-sub { font-size:14px;color:#666;margin-bottom:56px;font-family:'Google Sans Text',sans-serif; }
        .section-label { font-size:11px;font-weight:500;color:#555;letter-spacing:0.08em;text-transform:uppercase;margin-bottom:20px;font-family:'Google Sans',sans-serif; }
        .qr-card { background:#111;border:1px solid rgba(255,255,255,0.08);border-radius:24px;padding:40px;display:flex;align-items:center;gap:48px;margin-bottom:40px; }
        .qr-img-wrap { flex-shrink:0;width:160px;height:160px;background:#fff;border-radius:16px;display:flex;align-items:center;justify-content:center;overflow:hidden;box-shadow:0 8px 32px rgba(0,0,0,0.4); }
        .qr-img-wrap img { width:100%;height:100%; }
        .qr-info { flex:1; }
        .qr-title { font-family:'Google Sans',sans-serif;font-size:18px;font-weight:600;color:#fff;margin-bottom:8px;letter-spacing:-0.01em; }
        .qr-desc { font-size:14px;color:#666;line-height:1.6;margin-bottom:24px;font-family:'Google Sans Text',sans-serif; }
        .qr-id { font-size:12px;color:#444;font-family:monospace;background:rgba(255,255,255,0.04);padding:8px 12px;border-radius:8px;border:1px solid rgba(255,255,255,0.06);display:inline-block; }
        .btn-download { display:inline-flex;align-items:center;gap:8px;font-family:'Google Sans',sans-serif;font-size:13px;font-weight:500;color:#0a0a0a;background:#fff;border:none;border-radius:100px;padding:10px 20px;cursor:pointer;transition:background 0.2s,transform 0.15s;text-decoration:none;margin-top:16px; }
        .btn-download:hover { background:#e8e8e8;transform:translateY(-1px); }
        .empty-card { background:#111;border:1px solid rgba(255,255,255,0.08);border-radius:24px;padding:40px;display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:160px;text-align:center; }
        .status-dot { width:8px;height:8px;background:#22c55e;border-radius:50%;margin:0 auto 16px;box-shadow:0 0 12px #22c55e;animation:pulse 2s ease-in-out infinite; }
        .status-text { font-size:15px;color:#666;font-family:'Google Sans Text',sans-serif; }
        .status-text strong { color:#f0f0f0;font-weight:500; }
        .job-card { background:#111;border:1px solid rgba(255,255,255,0.08);border-radius:20px;padding:24px 28px;display:flex;align-items:center;justify-content:space-between;gap:20px;margin-bottom:12px;animation:fadeUp 0.4s cubic-bezier(0.22,1,0.36,1) forwards; }
        .job-info { display:flex;flex-direction:column;gap:6px; }
        .job-name { font-family:'Google Sans',sans-serif;font-size:15px;font-weight:500;color:#fff; }
        .job-meta { font-size:13px;color:#666;font-family:'Google Sans Text',sans-serif; }
        .btn-print { font-family:'Google Sans',sans-serif;font-size:14px;font-weight:500;color:#0a0a0a;background:#fff;border:none;border-radius:100px;padding:10px 24px;cursor:pointer;transition:background 0.2s,transform 0.15s;white-space:nowrap;flex-shrink:0; }
        .btn-print:hover { background:#e8e8e8;transform:translateY(-1px); }
        .btn-print:disabled { opacity:0.5;cursor:not-allowed;transform:none; }
        footer { padding:40px 24px;border-top:1px solid rgba(255,255,255,0.08);display:flex;justify-content:space-between;max-width:800px;margin:0 auto; }
        .footer-name { font-family:'Google Sans',sans-serif;font-size:14px;color:#333; }
        .footer-tag { font-size:13px;color:#2a2a2a;font-family:'Google Sans Text',sans-serif; }
        @keyframes pulse { 0%,100%{opacity:1;}50%{opacity:0.4;} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(12px);}to{opacity:1;transform:translateY(0);} }
        @media (max-width:600px) { nav{padding:0 20px;} .qr-card{flex-direction:column;align-items:flex-start;gap:28px;padding:28px;} .page{padding:90px 20px 48px;} .job-card{flex-direction:column;align-items:flex-start;} .btn-print{width:100%;text-align:center;} footer{padding:32px 20px;} .footer-tag{display:none;} }
      `}</style>

      <nav>
        <span className="nav-logo">PrivyPrint</span>
        <button className="btn-signout" onClick={handleSignOut}>Sign out</button>
      </nav>

      <main className="page">
        <h1 className="greeting">Your Shop Dashboard</h1>
        <p className="greeting-sub">{user.email}</p>

        <p className="section-label">Your permanent QR code</p>
        <div className="qr-card">
          <div className="qr-img-wrap">
            {qrUrl ? <img src={qrUrl} alt="Shop QR Code"/> : <span style={{color:"#444",fontSize:"12px"}}>Generating...</span>}
          </div>
          <div className="qr-info">
            <h2 className="qr-title">Stick this on your counter</h2>
            <p className="qr-desc">Customers scan this QR from their phone, upload their document, and you get a print button instantly. The file deletes itself after printing.</p>
            <div className="qr-id">privyprint.app/s/{shopId}</div>
            {qrUrl && (
              <a className="btn-download" href={qrUrl} download={`privyprint-qr-${shopId}.png`}>
                Download QR
              </a>
            )}
          </div>
        </div>

        <p className="section-label">Print jobs</p>
        {jobs.length === 0 ? (
          <div className="empty-card">
            <div className="status-dot"></div>
            <p className="status-text">Waiting for customers to scan your QR.<br/><strong>Print jobs will appear here in real time.</strong></p>
          </div>
        ) : (
          <div>
            {jobs.map(job => (
              <div key={job.id} className="job-card">
                <div className="job-info">
                  <span className="job-name">📄 Document ready</span>
                  <span className="job-meta">
                    {job.copies} {job.copies === 1 ? "copy" : "copies"} · {job.color === "bw" ? "Black & White" : "Color"} · {new Date(job.createdAt).toLocaleTimeString()}
                  </span>
                </div>
                <button
                  className="btn-print"
                  onClick={() => handlePrint(job)}
                  disabled={printing === job.id}
                >
                  {printing === job.id ? "Opening..." : "Print"}
                </button>
              </div>
            ))}
          </div>
        )}
      </main>

      <footer>
        <span className="footer-name">PrivyPrint</span>
        <span className="footer-tag">Privacy-first document printing.</span>
      </footer>
    </>
  );
}