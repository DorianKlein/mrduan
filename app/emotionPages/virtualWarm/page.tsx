"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";

const HOLD_MS = 3000;
const lines = Array.from({ length: 32 }, (_, i) => i);
const bursts = Array.from({ length: 36 }, (_, i) => i);
const copies = [
  "你看见了吧，温暖一直在底色里。",
  "黑白只是暂时遮住了你，不是你本来的颜色。",
  "辛苦了，现在让心里亮起来一点点。",
];

type Phase = "idle" | "pressing" | "revealed";

export default function VirtualWarmPage() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [progress, setProgress] = useState(0);
  const [showText, setShowText] = useState(false);
  const [copy, setCopy] = useState(0);
  const startedAt = useRef(0);
  const raf = useRef<number | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const textTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pressing = useRef(false);
  const revealed = useRef(false);

  const cleanup = useCallback(() => {
    if (raf.current) cancelAnimationFrame(raf.current);
    if (timer.current) clearTimeout(timer.current);
    if (textTimer.current) clearTimeout(textTimer.current);
    raf.current = null;
    timer.current = null;
    textTimer.current = null;
  }, []);

  const buzz = useCallback((p: number | number[]) => {
    if (typeof window !== "undefined" && "vibrate" in navigator) navigator.vibrate(p);
  }, []);

  const reveal = useCallback(() => {
    if (revealed.current) return;
    revealed.current = true;
    pressing.current = false;
    cleanup();
    setProgress(1);
    setPhase("revealed");
    setShowText(false);
    buzz([16, 36, 28]);
    textTimer.current = setTimeout(() => setShowText(true), 900);
  }, [buzz, cleanup]);

  const tick = useCallback(() => {
    const p = Math.min((Date.now() - startedAt.current) / HOLD_MS, 1);
    setProgress(p);
    if (p < 1 && pressing.current) raf.current = requestAnimationFrame(tick);
  }, []);

  const start = useCallback((e: React.PointerEvent<HTMLElement>) => {
    e.preventDefault();
    if (phase === "revealed") return;
    e.currentTarget.setPointerCapture?.(e.pointerId);
    cleanup();
    revealed.current = false;
    pressing.current = true;
    startedAt.current = Date.now();
    setPhase("pressing");
    setProgress(0);
    setShowText(false);
    buzz(8);
    raf.current = requestAnimationFrame(tick);
    timer.current = setTimeout(reveal, HOLD_MS);
  }, [buzz, cleanup, phase, reveal, tick]);

  const end = useCallback((e?: React.PointerEvent<HTMLElement>) => {
    e?.preventDefault();
    if (phase === "pressing" && pressing.current) reveal();
  }, [phase, reveal]);

  const reset = useCallback((e: React.PointerEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    cleanup();
    revealed.current = false;
    pressing.current = false;
    setCopy((v) => (v + 1) % copies.length);
    setProgress(0);
    setShowText(false);
    setPhase("idle");
  }, [cleanup]);

  useEffect(() => {
    document.title = "视觉余温 | Virtual Warm";
    const meta = document.querySelector<HTMLMetaElement>('meta[name="viewport"]');
    const old = meta?.content;
    if (meta) meta.content = "width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no,viewport-fit=cover";
    return () => {
      cleanup();
      if (meta && old) meta.content = old;
    };
  }, [cleanup]);

  return (
    <main
      className="fixed inset-0 h-[100dvh] w-screen overflow-hidden bg-[#fff0da] text-white select-none overscroll-none [touch-action:none]"
      onPointerDown={start}
      onPointerUp={end}
      onPointerCancel={end}
      onPointerLeave={end}
      onContextMenu={(e) => e.preventDefault()}
      suppressHydrationWarning
    >
      <style jsx global>{`
        html,body{overscroll-behavior:none;touch-action:manipulation;-webkit-text-size-adjust:100%}
        @keyframes drift{0%,100%{transform:scale(1.08) translate(-2%,-1%) rotate(0)}50%{transform:scale(1.16) translate(2%,1%) rotate(1.6deg)}}
        @keyframes flow{0%,100%{transform:translateX(-12%) skewX(-8deg);opacity:.35}50%{transform:translateX(12%) skewX(7deg);opacity:.76}}
        @keyframes noise{0%{transform:translate(0) scale(1.02)}25%{transform:translate(-2%,1%) scale(1.03)}50%{transform:translate(2%,-2%) scale(1.02)}75%{transform:translate(-1%,-1%) scale(1.04)}100%{transform:translate(0) scale(1.02)}}
        @keyframes dot{0%,100%{transform:scale(1);box-shadow:0 0 0 0 #ffffff90,0 0 30px #fff}50%{transform:scale(1.18);box-shadow:0 0 0 22px #fff0,0 0 46px #fff}}
        @keyframes bloom{0%{transform:scale(.5);opacity:0;filter:blur(18px)}45%{transform:scale(1.14);opacity:1;filter:blur(2px)}100%{transform:scale(1);opacity:.86;filter:blur(0)}}
        @keyframes copy{from{transform:translateY(18px);opacity:0;filter:blur(12px)}to{transform:translateY(0);opacity:1;filter:blur(0)}}
      `}</style>

      <svg className="absolute inset-0 z-0 h-full w-full animate-[drift_16s_ease-in-out_infinite]" viewBox="0 0 390 844" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <defs>
          <radialGradient id="warm" cx="50%" cy="42%" r="70%"><stop stopColor="#fff7bd"/><stop offset=".24" stopColor="#ffd194"/><stop offset=".48" stopColor="#ff83b0"/><stop offset=".72" stopColor="#80e9ff"/><stop offset="1" stopColor="#543094"/></radialGradient>
          <linearGradient id="river" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#fff0a6"/><stop offset=".38" stopColor="#ff76aa"/><stop offset=".7" stopColor="#76f2ff"/><stop offset="1" stopColor="#b79cff"/></linearGradient>
          <filter id="blur"><feGaussianBlur stdDeviation="16"/></filter><filter id="liquid"><feTurbulence baseFrequency=".01 .018" numOctaves="3" seed="9"/><feDisplacementMap in="SourceGraphic" scale="28"/></filter>
        </defs>
        <rect width="390" height="844" fill="url(#warm)"/>
        <g filter="url(#liquid)" opacity=".92"><path d="M-80 184C54 62 132 260 236 142S438 96 478 232C526 386 338 354 286 496C218 682 22 638-54 774Z" fill="url(#river)" filter="url(#blur)"/><path d="M-34 520C76 392 160 520 230 444C314 352 410 438 456 532C512 646 368 702 260 668C124 624 72 764-46 704Z" fill="#fff2aa" opacity=".42" filter="url(#blur)"/></g>
        <g className="animate-[flow_8s_ease-in-out_infinite]" opacity=".52"><path d="M-120 330C20 220 140 282 268 190C364 122 474 146 540 216" fill="none" stroke="#fff" strokeWidth="34" strokeLinecap="round" opacity=".28"/><path d="M-90 648C40 548 132 638 270 516C362 434 448 496 506 606" fill="none" stroke="#fff7c9" strokeWidth="26" strokeLinecap="round" opacity=".3"/></g>
      </svg>

      <section className={`absolute inset-0 z-10 transition-all duration-[920ms] ease-[cubic-bezier(.16,1,.3,1)] ${phase === "revealed" ? "opacity-0 blur-md scale-[1.04]" : "opacity-100"}`} aria-hidden="true">
        <svg className="h-full w-full animate-[noise_1.15s_steps(2,end)_infinite] [mix-blend-mode:difference] contrast-[1.65]" viewBox="0 0 390 844" preserveAspectRatio="none">
          <defs>
            <pattern id="grid" width="18" height="18" patternUnits="userSpaceOnUse"><rect width="18" height="18" fill="#fff"/><path d="M0 0H18M0 9H18M0 18H18M0 0V18M9 0V18M18 0V18M0 18L18 0" stroke="#000" strokeWidth="2"/><rect x="2" y="2" width="5" height="5" fill="#000"/><rect x="11" y="10" width="5" height="6" fill="#000"/></pattern>
            <pattern id="bars" width="36" height="36" patternUnits="userSpaceOnUse" patternTransform="rotate(17)"><path d="M1 0V36M5 0V36M12 0V36M15 0V36M23 0V36M30 0V36M34 0V36" stroke="#fff" strokeWidth="2"/><path d="M8 0V36M18 0V36M26 0V36" stroke="#000" strokeWidth="4"/></pattern>
            <filter id="rough"><feTurbulence baseFrequency=".72" numOctaves="2" seed="23"/><feColorMatrix type="saturate" values="0"/><feComponentTransfer><feFuncR type="discrete" tableValues="0 1 0 1 1 0"/><feFuncG type="discrete" tableValues="0 1 0 1 1 0"/><feFuncB type="discrete" tableValues="0 1 0 1 1 0"/></feComponentTransfer></filter>
          </defs>
          <rect width="390" height="844" fill="url(#grid)"/><rect width="390" height="844" fill="url(#bars)" opacity=".52"/><rect width="390" height="844" filter="url(#rough)" opacity=".18"/>
          {lines.map((i) => <text key={i} x={(i * 47) % 390} y={34 + i * 27} fill={i % 2 ? "#fff" : "#000"} fontSize={i % 3 ? 12 : 18} fontFamily="monospace" fontWeight="900" opacity=".72" transform={`rotate(${i % 2 ? -7 : 9} ${(i * 47) % 390} ${34 + i * 27})`}>{i % 2 ? "010110///" : "▒▓░//101"}</text>)}
        </svg>
      </section>

      {phase === "revealed" && <svg className="pointer-events-none absolute inset-0 z-20 h-full w-full animate-[bloom_1100ms_ease-out_both] mix-blend-screen" viewBox="0 0 390 844" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <defs><radialGradient id="core" cx="50%" cy="50%" r="52%"><stop stopColor="#fff"/><stop offset=".2" stopColor="#fff1a9"/><stop offset=".45" stopColor="#ff8bb8" stopOpacity=".82"/><stop offset=".74" stopColor="#75eeff" stopOpacity=".5"/><stop offset="1" stopColor="#fff" stopOpacity="0"/></radialGradient></defs>
        <circle cx="195" cy="422" r="310" fill="url(#core)"/>{bursts.map((i) => { const a = i / 36 * Math.PI * 2, r = 136 + i % 5 * 24; return <line key={i} x1={195 + Math.cos(a) * 44} y1={422 + Math.sin(a) * 44} x2={195 + Math.cos(a) * r} y2={422 + Math.sin(a) * r} stroke={i % 3 === 0 ? "#fff8b8" : i % 3 === 1 ? "#ff7fb2" : "#8cf5ff"} strokeWidth={i % 4 === 0 ? 5 : 2.5} strokeLinecap="round" opacity=".62"/>; })}
      </svg>}

      <section className="pointer-events-none absolute inset-0 z-30 flex flex-col items-center justify-center px-8 text-center">
        <div className={`transition-all duration-700 ${phase === "revealed" ? "-translate-y-20 scale-75 opacity-0 blur-sm" : "opacity-100"}`}>
          <div className="relative mx-auto mb-8 grid h-28 w-28 place-items-center">
            <div className="absolute inset-0 rounded-full border border-white/45 bg-white/5 backdrop-blur-[1px]" style={{ background: `conic-gradient(from -90deg,rgba(255,255,255,.9) ${progress * 360}deg,rgba(255,255,255,.13) ${progress * 360}deg)` }}/>
            <div className="absolute h-16 w-16 rounded-full bg-black/35 blur-2xl [mix-blend-mode:difference]"/><div className="relative h-5 w-5 animate-[dot_1.35s_ease-in-out_infinite] rounded-full bg-white"/>
          </div>
          <p className="text-[13px] font-light tracking-[.38em] text-white/85 drop-shadow-[0_1px_10px_rgba(0,0,0,.7)]">长按白点 3 秒</p>
          <p className="mt-4 text-sm leading-7 tracking-[.18em] text-white/62 drop-shadow-[0_1px_10px_rgba(0,0,0,.7)]">盯住中心，不要眨眼<br/>松开时，让颜色替你绽放</p>
        </div>
        <div className={`absolute inset-x-0 top-1/2 mx-auto max-w-[320px] -translate-y-1/2 px-7 transition-opacity duration-1000 ${showText ? "opacity-100" : "opacity-0"}`}>
          <div className="animate-[copy_1100ms_ease-out_both] rounded-[2rem] border border-white/45 bg-white/18 px-6 py-8 shadow-[0_20px_90px_rgba(255,132,166,.38)] backdrop-blur-xl">
            <p className="text-[15px] font-light leading-8 tracking-[.18em] text-white drop-shadow-[0_2px_18px_rgba(104,37,73,.45)]">{copies[copy]}</p><p className="mt-5 text-xs tracking-[.28em] text-white/72">AFTERIMAGE WARMTH</p>
          </div>
        </div>
      </section>

      {phase === "revealed" && <button type="button" className="absolute bottom-[calc(env(safe-area-inset-bottom)+34px)] left-1/2 z-40 -translate-x-1/2 rounded-full border border-white/45 bg-white/18 px-6 py-3 text-xs tracking-[.32em] text-white/90 shadow-[0_12px_40px_rgba(120,55,95,.24)] backdrop-blur-xl transition active:scale-95" onPointerDown={reset}>再看一次</button>}
      <div className="pointer-events-none absolute inset-x-0 top-[calc(env(safe-area-inset-top)+18px)] z-40 text-center text-[10px] tracking-[.38em] text-white/45">VIRTUAL WARM</div>
    </main>
  );
}
