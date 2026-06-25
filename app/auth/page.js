"use client";
import { useState, useEffect, useRef } from "react";
import { auth } from "../../lib/firebase";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "next/navigation";

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const canvasRef = useRef(null);

  useEffect(() => {
    const dc = canvasRef.current;
    const dctx = dc.getContext("2d");
    const SPACING = 28;
    let dW, dH, dots = [], waveT = 0;
    const WAVE_SPEED = 2.5, WAVE_WIDTH = 180;
    const BASE_R = 1.1, PEAK_R = 2.6, BASE_A = 0.13, PEAK_A = 0.55;
    let animId;

    function buildDots() {
      dW = dc.width = window.innerWidth;
      dH = dc.height = window.innerHeight;
      dots = [];
      const cols = Math.ceil(dW / SPACING) + 1;
      const rows = Math.ceil(dH / SPACING) + 1;
      for (let r = 0; r < rows; r++)
        for (let c = 0; c < cols; c++)
          dots.push({ x: c * SPACING, y: r * SPACING });
    }

    function drawDots() {
      dctx.clearRect(0, 0, dW, dH);
      const diag = dW + dH;
      const wavePos = waveT % diag;
      for (let i = 0; i < dots.length; i++) {
        const d = dots[i];
        const proj = (dW - d.x) + d.y;
        const ahead = wavePos - proj;
        const influence = ahead > 0
          ? Math.max(0, 1 - ahead / (WAVE_WIDTH * 0.4))
          : Math.max(0, 1 - Math.abs(ahead) / (WAVE_WIDTH * 1.8));
        const ease = influence * influence * (3 - 2 * influence);
        const r = BASE_R + (PEAK_R - BASE_R) * ease;
        const a = BASE_A + (PEAK_A - BASE_A) * ease;
        dctx.beginPath();
        dctx.arc(d.x, d.y, r, 0, Math.PI * 2);
        dctx.fillStyle = `rgba(255,255,255,${a})`;
        dctx.fill();
      }
      waveT += WAVE_SPEED;
      animId = requestAnimationFrame(drawDots);
    }

    buildDots();
    drawDots();
    window.addEventListener("resize", buildDots);
    window.addEventListener("orientationchange", () => setTimeout(buildDots, 300));
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", buildDots);
    };
  }, []);

  async function handleSubmit() {
    setError("");
    setLoading(true);
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
      router.push("/dashboard");
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Google+Sans:wght@400;500;700&family=Google+Sans+Text:wght@400;500&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { background: #0a0a0a; }
        .auth-input {
          width: 100%;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 10px;
          padding: 13px 16px;
          color: #f0f0f0;
          font-size: 15px;
          outline: none;
          font-family: 'Google Sans Text', sans-serif;
          transition: border-color 0.2s, background 0.2s;
          -webkit-appearance: none;
        }
        .auth-input:focus {
          border-color: #8ab4f8;
          background: rgba(138,180,248,0.04);
        }
        .auth-input::placeholder { color: #444; }
        .btn-login {
          width: 100%;
          background: #fff;
          color: #0a0a0a;
          border: none;
          border-radius: 100px;
          padding: 14px;
          font-size: 15px;
          font-weight: 500;
          cursor: pointer;
          font-family: 'Google Sans', sans-serif;
          transition: background 0.2s, transform 0.15s;
          letter-spacing: 0.01em;
        }
        .btn-login:hover { background: #e8e8e8; transform: translateY(-1px); }
        .btn-login:active { transform: translateY(0); }
        .btn-login:disabled { opacity: 0.6; cursor: not-allowed; }
      `}</style>

      <canvas ref={canvasRef} style={{position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none", opacity: 0.4}}/>

      <nav style={{position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, display: "flex", alignItems: "center", padding: "0 48px", height: "64px", background: "rgba(10,10,10,0.9)", backdropFilter: "blur(12px)"}}>
        <a href="/" style={{fontFamily: "'Google Sans', sans-serif", fontWeight: 500, fontSize: "18px", color: "#f0f0f0", textDecoration: "none", letterSpacing: "-0.2px"}}>PrivyPrint</a>
      </nav>

      <main style={{minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "100px 24px 60px", position: "relative", zIndex: 1}}>
        <div style={{width: "100%", maxWidth: "400px", background: "#111", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "24px", padding: "44px 40px", boxShadow: "0 24px 64px rgba(0,0,0,0.5)"}}>
          <h1 style={{fontFamily: "'Google Sans Display', sans-serif", fontWeight: 700, fontSize: "28px", color: "#fff", letterSpacing: "-0.02em", marginBottom: "8px"}}>
            {isLogin ? "Shop Login" : "Create Account"}
          </h1>
          <p style={{fontSize: "14px", color: "#666", marginBottom: "36px", fontFamily: "'Google Sans Text', sans-serif"}}>
            {isLogin ? "Sign in to manage print sessions." : "Create your shop account."}
          </p>

          <div style={{display: "flex", flexDirection: "column", gap: "14px", marginBottom: "28px"}}>
            <div>
              <label style={{display: "block", fontSize: "12px", fontWeight: 500, color: "#666", letterSpacing: "0.04em", textTransform: "uppercase", marginBottom: "8px", fontFamily: "'Google Sans Text', sans-serif"}}>Email</label>
              <input className="auth-input" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} autoComplete="email"/>
            </div>
            <div>
              <label style={{display: "block", fontSize: "12px", fontWeight: 500, color: "#666", letterSpacing: "0.04em", textTransform: "uppercase", marginBottom: "8px", fontFamily: "'Google Sans Text', sans-serif"}}>Password</label>
              <input className="auth-input" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} autoComplete="current-password"/>
            </div>
          </div>

          {error && <p style={{color: "#ff6b6b", fontSize: "13px", marginBottom: "16px", fontFamily: "'Google Sans Text', sans-serif"}}>{error}</p>}

          <button className="btn-login" onClick={handleSubmit} disabled={loading}>
            {loading ? "Please wait..." : isLogin ? "Login" : "Create Account"}
          </button>

          <div style={{height: "1px", background: "rgba(255,255,255,0.08)", margin: "24px 0"}}/>

          <p style={{textAlign: "center", fontSize: "13px", color: "#666", fontFamily: "'Google Sans Text', sans-serif"}}>
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <span onClick={() => { setIsLogin(!isLogin); setError(""); }} style={{color: "#8ab4f8", cursor: "pointer", fontWeight: 500}}>
              {isLogin ? "Create one" : "Sign in"}
            </span>
          </p>
        </div>
      </main>

      <footer style={{position: "relative", zIndex: 1, padding: "32px 48px", borderTop: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "space-between"}}>
        <span style={{fontFamily: "'Google Sans', sans-serif", fontSize: "14px", fontWeight: 500, color: "#333"}}>PrivyPrint</span>
        <span style={{fontSize: "13px", color: "#2a2a2a", fontFamily: "'Google Sans Text', sans-serif"}}>Privacy-first document printing.</span>
      </footer>
    </>
  );
}