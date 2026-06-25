"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { db } from "../../../lib/firebase";
import { doc, getDoc, collection, addDoc } from "firebase/firestore";
import { supabase } from "../../../lib/supabase";

export default function UploadPage() {
  const { shopId } = useParams();
  const [shopExists, setShopExists] = useState(null);
  const [file, setFile] = useState(null);
  const [copies, setCopies] = useState(1);
  const [color, setColor] = useState("bw");
  const [status, setStatus] = useState("idle"); // idle | uploading | done | error
  const [error, setError] = useState("");

  useEffect(() => {
    async function verifyShop() {
      // Find shop by shopId field
      const { collection: col, query, where, getDocs } = await import("firebase/firestore");
      const q = query(col(db, "shops"), where("shopId", "==", shopId));
      const snap = await getDocs(q);
      setShopExists(!snap.empty);
    }
    verifyShop();
  }, [shopId]);

  async function handleUpload() {
    if (!file) { setError("Please select a file."); return; }
    setError("");
    setStatus("uploading");

    try {
      const ext = file.name.split(".").pop();
      const fileName = `${shopId}/${Date.now()}.${ext}`;

      // Upload to Supabase Storage
      const { data, error: uploadError } = await supabase.storage
      .from("print-docs")
      .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

// Small wait to ensure upload is committed
await new Promise(r => setTimeout(r, 500));

      // Get signed URL (valid 15 min)
      const { data: urlData, error: urlError } = await supabase.storage
     .from("print-docs")
     .createSignedUrl(fileName, 900);

     if (urlError || !urlData) throw new Error("Could not generate file URL");

      const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

      // Save print job to Firestore
      await addDoc(collection(db, "printJobs"), {
        shopId,
        fileName,
        signedUrl: urlData.signedUrl,
        copies,
        color,
        status: "pending",
        createdAt: new Date().toISOString(),
        expiresAt,
      });

      setStatus("done");
    } catch (err) {
      console.error(err);
      setError("Upload failed. Please try again.");
      setStatus("error");
    }
  }

  if (shopExists === null) return (
    <main style={{background:"#0a0a0a",minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center"}}>
      <p style={{color:"#666",fontFamily:"sans-serif"}}>Verifying shop...</p>
    </main>
  );

  if (!shopExists) return (
    <main style={{background:"#0a0a0a",minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center"}}>
      <p style={{color:"#ff6b6b",fontFamily:"sans-serif"}}>Invalid QR code.</p>
    </main>
  );

  if (status === "done") return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Google+Sans:wght@400;500;700&family=Google+Sans+Text:wght@400;500&display=swap');
        * { margin:0;padding:0;box-sizing:border-box; }
        body { background:#0a0a0a; }
      `}</style>
      <main style={{background:"#0a0a0a",minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"24px",textAlign:"center"}}>
        <div style={{width:"56px",height:"56px",background:"rgba(34,197,94,0.1)",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",marginBottom:"24px",fontSize:"24px"}}>✓</div>
        <h1 style={{fontFamily:"'Google Sans',sans-serif",fontSize:"24px",fontWeight:"700",color:"#fff",marginBottom:"12px"}}>Sent to shop</h1>
        <p style={{fontFamily:"'Google Sans Text',sans-serif",fontSize:"15px",color:"#666",maxWidth:"300px",lineHeight:"1.6"}}>Your document has been uploaded. The shop will print it now. File deletes automatically after printing.</p>
      </main>
    </>
  );

  return (
    <>
    <div className="bg-grid"></div>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Google+Sans:wght@400;500;700&family=Google+Sans+Text:wght@400;500&display=swap');
        *, *::before, *::after { margin:0;padding:0;box-sizing:border-box; }
        body { background:#0a0a0a; }
        .upload-input { display:none; }
        .file-label { display:flex; flex-direction:column; align-items:center; justify-content:center; gap:10px; width:100%; padding:36px 24px; background:rgba(255,255,255,0.03); border:1px dashed rgba(255,255,255,0.15); border-radius:16px; cursor:pointer; transition:background 0.2s, border-color 0.2s; text-align:center; }
        .file-label:hover { background:rgba(255,255,255,0.06); border-color:rgba(138,180,248,0.4); }
        .file-label.has-file { border-color:rgba(147, 150, 153, 0.4); background:rgba(34,197,94,0.04); }
        .select-wrap { display:flex; gap:8px; }
        .select-btn { flex:1; padding:12px; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.1); border-radius:10px; color:#888; font-family:'Google Sans Text',sans-serif; font-size:14px; cursor:pointer; transition:all 0.2s; text-align:center; }
        .select-btn.active { background:rgba(138,180,248,0.1); border-color:#8ab4f8; color:#8ab4f8; }
        .counter { display:flex; align-items:center; gap:16px; }
        .counter-btn { width:36px; height:36px; background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.1); border-radius:50%; color:#f0f0f0; font-size:18px; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:background 0.2s; font-family:sans-serif; }
        .counter-btn:hover { background:rgba(255,255,255,0.12); }
        .counter-val { font-family:'Google Sans',sans-serif; font-size:20px; font-weight:600; color:#fff; min-width:24px; text-align:center; }
        .btn-upload { width:100%; background:#fff; color:#0a0a0a; border:none; border-radius:100px; padding:15px; font-size:15px; font-weight:500; cursor:pointer; font-family:'Google Sans',sans-serif; transition:background 0.2s, transform 0.15s; letter-spacing:0.01em; }
        .btn-upload:hover { background:#e8e8e8; transform:translateY(-1px); }
        .btn-upload:disabled { opacity:0.5; cursor:not-allowed; transform:none; }
        .label-text { font-family:'Google Sans',sans-serif; font-size:11px; font-weight:500; color:#555; letter-spacing:0.08em; text-transform:uppercase; margin-bottom:10px; }

        nav,
        main {
         position: relative;
         z-index: 1;
            }
        .bg-grid {
         position: fixed;
         inset: 0;
         pointer-events: none;
         z-index: 0;
        overflow: hidden;
        }

.bg-grid::before {
    content: "";
  position: absolute;
  inset: 0;

  background-image:
    radial-gradient(
      rgba(255,255,255,0.18) 1px,
      transparent 1px
    );

  background-size: 42px 42px;

  animation: gridPulse 8s ease-in-out infinite;
}
  @keyframes gridPulse {
  0% {
    opacity: 0.4;
    transform: scale(1);
  }

  50% {
    opacity: 0.8;
    transform: scale(1.01);
  }

  100% {
    opacity: 0.4;
    transform: scale(1);
  }
}

  background: linear-gradient(
    135deg,
    transparent 0%,
    rgba(255,255,255,0.02) 40%,
    rgba(255,255,255,0.25) 50%,
    rgba(255,255,255,0.02) 60%,
    transparent 100%
  );

  filter: blur(40px);

  animation: waveSweep 10s linear infinite;
}

@keyframes waveSweep {
  from {
    transform: translate(0, 0);
  }

  to {
    transform: translate(-150vw, 150vh);
  }
}   
      `}</style>

      <nav style={{position:"fixed",top:0,left:0,right:0,zIndex:100,display:"flex",alignItems:"center",padding:"0 24px",height:"64px",background:"rgba(10,10,10,0.9)",backdropFilter:"blur(12px)"}}>
        <span style={{fontFamily:"'Google Sans',sans-serif",fontWeight:500,fontSize:"18px",color:"#f0f0f0"}}>PrivyPrint</span>
      </nav>

      <main style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",padding:"80px 24px 40px"}}>
        <div style={{width:"100%",maxWidth:"400px"}}>
          <h1 style={{fontFamily:"'Google Sans Text',sans-serif",fontSize:"26px",fontWeight:"700",color:"#fff",letterSpacing:"-0.02em",marginBottom:"8px"}}>Upload document</h1>
          <p style={{fontFamily:"'Google Sans Text',sans-serif",fontSize:"14px",color:"#666",marginBottom:"36px"}}>Your file will be deleted automatically after printing.</p>

          <div style={{display:"flex",flexDirection:"column",gap:"24px"}}>

            {/* File picker */}
            <div>
              <p className="label-text">Document</p>
              <label className={`file-label${file ? " has-file" : ""}`}>
                <input className="upload-input" type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={e => { setFile(e.target.files[0]); setError(""); }}/>
                <span style={{fontSize:"28px"}}>{file ? "📄" : "+"}</span>
                <span style={{fontFamily:"'Google Sans Text',sans-serif",fontSize:"14px",color: file ? "#22c55e" : "#555"}}>
                  {file ? file.name : "Tap to select PDF or image"}
                </span>
              </label>
            </div>

            {/* Color */}
            <div>
              <p className="label-text">Print type</p>
              <div className="select-wrap">
                <div className={`select-btn${color==="bw"?" active":""}`} onClick={() => setColor("bw")}>Black & White</div>
                <div className={`select-btn${color==="color"?" active":""}`} onClick={() => setColor("color")}>Color</div>
              </div>
            </div>

            {/* Copies */}
            <div>
              <p className="label-text">Copies</p>
              <div className="counter">
                <button className="counter-btn" onClick={() => setCopies(c => Math.max(1,c-1))}>−</button>
                <span className="counter-val">{copies}</span>
                <button className="counter-btn" onClick={() => setCopies(c => Math.min(20,c+1))}>+</button>
              </div>
            </div>

            {error && <p style={{color:"#ff6b6b",fontSize:"13px",fontFamily:"'Google Sans Text',sans-serif"}}>{error}</p>}

            <button className="btn-upload" onClick={handleUpload} disabled={status==="uploading"}>
              {status === "uploading" ? "Uploading..." : "Send to shop"}
            </button>

          </div>
        </div>
      </main>
    </>
  );
}