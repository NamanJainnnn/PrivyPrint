"use client";
import { useEffect, useRef } from "react";
import Link from "next/link";

export default function Home() {
  const canvasRef = useRef(null);
  const sectionRef = useRef(null);

  useEffect(() => {
    const dc = canvasRef.current;
    const dctx = dc.getContext("2d");
    const SPACING = 28;
    let dW, dH, dots = [], waveT = 0, animId;
    const WAVE_SPEED = 2.5, WAVE_WIDTH = 180;
    const BASE_R = 1.1, PEAK_R = 2.6, BASE_A = 0.13, PEAK_A = 0.55;

    function buildDots() {
      dW = dc.width = sectionRef.current.offsetWidth;
      dH = dc.height = sectionRef.current.offsetHeight;
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
          ? Math.max(0, 1 - ahead / (WAVE_WIDTH * 1.8))
          : Math.max(0, 1 - Math.abs(ahead) / (WAVE_WIDTH * 0.4));
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

  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const all = entry.target.querySelectorAll(".how-step");
          all.forEach((s, idx) => setTimeout(() => s.classList.add("visible"), idx * 80));
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2 });
    document.querySelectorAll(".how-steps").forEach(el => observer.observe(el));
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Google+Sans:wght@400;500;700&family=Google+Sans+Display:wght@400;700&family=Google+Sans+Text:wght@400;500&display=swap');
        *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
        html { scroll-behavior: smooth; }
        body { background: #0a0a0a; color: #f0f0f0; font-family: 'Google Sans Text','Google Sans',sans-serif; -webkit-font-smoothing: antialiased; overflow-x: hidden; }
        nav { position: fixed; top: 0; left: 0; right: 0; z-index: 100; display: flex; align-items: center; justify-content: space-between; padding: 0 48px; height: 64px; background: rgba(10,10,10,0.9); backdrop-filter: blur(12px); }
        .nav-logo { font-family: 'Google Sans',sans-serif; font-weight: 500; font-size: 18px; color: #f0f0f0; letter-spacing: -0.2px; text-decoration: none; }
        .nav-login { font-family: 'Google Sans Text',sans-serif; font-size: 14px; font-weight: 500; color: #8ab4f8; background: none; border: none; cursor: pointer; padding: 8px 16px; border-radius: 100px; transition: background 0.2s; text-decoration: none; letter-spacing: 0.01em; }
        .nav-login:hover { background: rgba(138,180,248,0.1); }
        .hero { min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 80px 24px 60px; text-align: center; position: relative; }
        #dot-grid { position: absolute; inset: 0; z-index: 0; pointer-events: none; opacity: 0.7; }
        .hero-title { font-family: 'Google Sans Display','Google Sans',sans-serif; font-weight: 700; font-size: clamp(72px,11vw,140px); line-height: 0.95; letter-spacing: -0.04em; color: #fff; margin-bottom: 28px; opacity: 0; animation: fadeUp 0.7s cubic-bezier(0.22,1,0.36,1) 0.1s forwards; position: relative; z-index: 1; }
        .hero-sub { font-family: 'Google Sans Text',sans-serif; font-size: clamp(16px,2vw,20px); font-weight: 400; color: #888; max-width: 420px; line-height: 1.5; margin-bottom: 44px; opacity: 0; animation: fadeUp 0.7s cubic-bezier(0.22,1,0.36,1) 0.22s forwards; position: relative; z-index: 1; }
        .btn-scan { font-family: 'Google Sans',sans-serif; font-size: 16px; font-weight: 500; color: #0a0a0a; background: #fff; border: none; border-radius: 100px; padding: 14px 40px; cursor: pointer; transition: background 0.2s, transform 0.2s; margin-bottom: 20px; letter-spacing: 0.01em; opacity: 0; animation: fadeUp 0.7s cubic-bezier(0.22,1,0.36,1) 0.34s forwards; text-decoration: none; display: inline-block; position: relative; z-index: 1; }
        .btn-scan:hover { background: #e8e8e8; transform: translateY(-1px); }
        .hero-fine { font-size: 12px; color: #666; letter-spacing: 0.03em; opacity: 0; animation: fadeUp 0.7s cubic-bezier(0.22,1,0.36,1) 0.44s forwards; position: relative; z-index: 1; }
        .hero-fine span { margin: 0 6px; opacity: 0.4; }
        .qr-wrap { margin-top: 72px; opacity: 0; animation: fadeUp 0.8s cubic-bezier(0.22,1,0.36,1) 0.55s forwards; position: relative; z-index: 1; }
        .qr-card { width: 220px; height: 220px; background: #fff; border-radius: 24px; padding: 20px; margin: 0 auto; box-shadow: 0 0 0 1px rgba(255,255,255,0.06), 0 24px 64px rgba(0,0,0,0.6), 0 8px 24px rgba(0,0,0,0.4); animation: cardFloat 6s ease-in-out infinite 1.2s; position: relative; }
        .qr-corner { position: absolute; width: 54px; height: 54px; border-radius: 8px; background: #1a1a1a; display: flex; align-items: center; justify-content: center; }
        .qr-corner::after { content: ''; width: 32px; height: 32px; border-radius: 4px; background: #fff; display: flex; align-items: center; justify-content: center; }
        .qr-corner::before { content: ''; position: absolute; width: 16px; height: 16px; border-radius: 2px; background: #1a1a1a; z-index: 1; }
        .qr-corner.tl { top: 20px; left: 20px; }
        .qr-corner.tr { top: 20px; right: 20px; }
        .qr-corner.bl { bottom: 20px; left: 20px; }
        .qr-dots { position: absolute; inset: 84px; display: grid; grid-template-columns: repeat(5,1fr); grid-template-rows: repeat(5,1fr); gap: 4px; }
        .qr-dot { border-radius: 2px; background: #1a1a1a; }
        .qr-dot.e { background: transparent; }
        .qr-scanline { position: absolute; left: 20px; right: 20px; height: 2px; background: linear-gradient(to right, transparent, #8ab4f8, transparent); border-radius: 2px; top: 20px; animation: scanLine 3s ease-in-out infinite 1.5s; opacity: 0.8; }
        .qr-label { margin-top: 20px; font-size: 12px; color: #666; letter-spacing: 0.05em; text-transform: uppercase; font-family: 'Google Sans Text',sans-serif; }
        .how { padding: 120px 24px 100px; max-width: 640px; margin: 0 auto; }
        .how-title { font-family: 'Google Sans',sans-serif; font-size: 14px; font-weight: 500; color: #666; letter-spacing: 0.06em; text-transform: uppercase; margin-bottom: 48px; }
        .how-steps { display: flex; flex-direction: column; gap: 0; }
        .how-step { display: flex; align-items: baseline; gap: 24px; padding: 20px 0; border-top: 1px solid rgba(255,255,255,0.08); opacity: 0; transform: translateY(16px); transition: opacity 0.5s ease, transform 0.5s ease; }
        .how-step:last-child { border-bottom: 1px solid rgba(255,255,255,0.08); }
        .how-step.visible { opacity: 1; transform: translateY(0); }
        .how-step-num { font-family: 'Google Sans Text',sans-serif; font-size: 13px; color: #666; min-width: 20px; flex-shrink: 0; }
        .how-step-text { font-family: 'Google Sans Text',sans-serif; font-size: 18px; font-weight: 400; color: #f0f0f0; line-height: 1.5; letter-spacing: -0.01em; }
        footer { padding: 48px; border-top: 1px solid rgba(255,255,255,0.08); display: flex; align-items: center; justify-content: space-between; }
        .footer-name { font-family: 'Google Sans',sans-serif; font-size: 15px; font-weight: 500; color: #444; }
        .footer-tag { font-size: 13px; color: #333; font-family: 'Google Sans Text',sans-serif; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes cardFloat { 0%,100% { transform: translateY(0px); } 50% { transform: translateY(-10px); } }
        @keyframes scanLine { 0% { top: 20px; opacity: 0; } 5% { opacity: 0.8; } 95% { opacity: 0.8; } 100% { top: calc(100% - 22px); opacity: 0; } }
        @media (max-width: 768px) { nav { padding: 0 20px; } .hero { padding: 80px 20px 60px; } .qr-wrap { margin-top: 40px; } .qr-card { width: 160px; height: 160px; padding: 14px; } .how { padding: 80px 24px 80px; } footer { padding: 32px 24px; } .how-step-text { font-size: 16px; } }
        @media (prefers-reduced-motion: reduce) { *, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; } }
      `}</style>

      <nav>
        <span className="nav-logo">PrivyPrint</span>
        <Link href="/auth" className="nav-login">Shop Login</Link>
      </nav>

      <section className="hero" ref={sectionRef}>
        <canvas id="dot-grid" ref={canvasRef}></canvas>
        <h1 className="hero-title">PrivyPrint</h1>
        <p className="hero-sub">Print sensitive documents without sharing them over WhatsApp.</p>
        <Link href="/auth" className="btn-scan">Get Started → </Link>
        <p className="hero-fine">No WhatsApp<span>·</span>No Email<span>·</span>Auto Delete</p>
        <div className="qr-wrap">
          <div className="qr-card">
            <div className="qr-scanline"></div>
            <div className="qr-corner tl"></div>
            <div className="qr-corner tr"></div>
            <div className="qr-corner bl"></div>
            <div className="qr-dots">
              {[0,1,0,1,0,1,0,1,1,0,0,1,1,1,0,1,0,1,0,1,0,0,1,0,0].map((e, i) => (
                <div key={i} className={`qr-dot${e ? " e" : ""}`}></div>
              ))}
            </div>
          </div>
          <p className="qr-label">Scan to print</p>
        </div>
      </section>

      <section className="how">
        <p className="how-title">How it works</p>
        <div className="how-steps">
          {[
            "Scan the QR code shown by the shop.",
            "Upload your document from your phone.",
            "The shop prints it.",
            "The file disappears automatically."
          ].map((text, i) => (
            <div key={i} className="how-step">
              <span className="how-step-num">{i + 1}</span>
              <span className="how-step-text">{text}</span>
            </div>
          ))}
        </div>
      </section>

      <footer>
        <span className="footer-name">PrivyPrint by Naman Jain</span>
        <span className="footer-tag">Privacy-first document printing.</span>
      </footer>
    </>
  );
}