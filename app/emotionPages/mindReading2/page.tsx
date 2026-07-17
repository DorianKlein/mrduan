"use client";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Heart, KeyRound, Leaf, Moon, Sparkles, Star, Sun, Waves } from "lucide-react";

type P = "ready" | "r1" | "r2" | "hold" | "clear" | "done";
type I = "star" | "clover" | "heart" | "key" | "moon" | "sun" | "spark" | "wave" | "lotus";
type C = { id: I; n: string; xy: [number, number]; a: string; t: string };

const H = 1800, S: I = "star";
const cs: C[] = [
  { id: "star", n: "晨星", xy: [0, 0], a: "from-yellow-200 to-orange-300", t: "你有在黑暗里找到出口的明亮直觉。" },
  { id: "clover", n: "幸运草", xy: [0, 1], a: "from-lime-200 to-emerald-400", t: "好运不喧哗，只轻轻站在你这边。" },
  { id: "heart", n: "暖心", xy: [0, 2], a: "from-rose-200 to-fuchsia-400", t: "柔软不是脆弱，是你珍贵的超能力。" },
  { id: "key", n: "月钥", xy: [1, 0], a: "from-cyan-200 to-blue-400", t: "那扇门正在等你用温柔的方式靠近。" },
  { id: "moon", n: "小月亮", xy: [1, 1], a: "from-violet-200 to-indigo-400", t: "疲惫也值得被拥抱，夜晚会替你收藏答案。" },
  { id: "sun", n: "微光太阳", xy: [1, 2], a: "from-amber-200 to-yellow-400", t: "不必一下子发光，一点点回暖就很好。" },
  { id: "spark", n: "灵感火花", xy: [2, 0], a: "from-fuchsia-200 to-cyan-300", t: "灵感没有消失，它只是在等一个被允许的瞬间。" },
  { id: "wave", n: "心海", xy: [2, 1], a: "from-teal-200 to-cyan-400", t: "情绪像海浪，会起伏，也会把你送回岸边。" },
  { id: "lotus", n: "静莲", xy: [2, 2], a: "from-pink-100 to-sky-300", t: "你正在从混乱里长出清澈，这已经很珍贵。" }
];

const ls = [
  "正在斩断游离思维，已强行抹除首批散落的宿命节点...",
  "正在闭合无限视界，量子候选归一，其余时空波纹温柔显影..."
];

function Icon({ id, cl }: { id: I; cl?: string }) {
  const p = { className: cl, strokeWidth: 1.8 };
  if (id === "heart") return <Heart {...p} />;
  if (id === "key") return <KeyRound {...p} />;
  if (id === "moon") return <Moon {...p} />;
  if (id === "sun") return <Sun {...p} />;
  if (id === "spark") return <Sparkles {...p} />;
  if (id === "wave") return <Waves {...p} />;
  if (id === "clover") return <Leaf {...p} />;
  if (id === "lotus") return <svg viewBox="0 0 64 64" className={cl} fill="none"><path d="M32 55C19 44 13 34 16 22c7 2 12 8 16 20 4-12 9-18 16-20 3 12-3 22-16 33Z" stroke="currentColor" strokeWidth="4" strokeLinejoin="round" /><path d="M32 41c-8-8-8-17 0-29 8 12 8 21 0 29Z" stroke="currentColor" strokeWidth="4" strokeLinejoin="round" opacity=".7" /></svg>;
  return <Star {...p} />;
}

function Panel({ tag, title, text, tip }: { tag: string; title: string; text: string; tip: string }) {
  return <div className="text-left"><p className="mb-1 text-[10px] font-black uppercase tracking-[.26em] text-slate-900/55">{tag}</p><h2 className="text-lg font-black leading-tight tracking-[-.04em] text-slate-950">{title}</h2><p className="mt-2 text-xs font-semibold leading-5 text-slate-900/72">{text}</p><p className="mt-2 rounded-xl bg-white/30 px-3 py-2 text-xs font-bold leading-5 text-slate-900/72">{tip}</p></div>}

export default function MindReading2Page() {
  const [ph, setPh] = useState<P>("ready");
  const [ri, setRi] = useState(-1);
  const [hp, setHp] = useState(0);
  const start = useRef(0);
  const raf = useRef<number|null>(null);
  const tm = useRef<ReturnType<typeof setTimeout>|null>(null);

  // 始终锁定小月亮为唯一的终极宿命
  const targetId: I = "moon";
  
  // 严格依据多轮引导逻辑动态计算应当暗淡的格子
  const hide = useMemo(() => {
    const s = new Set<I>();
    if (ph === "r1") {
      s.add("star"); s.add("lotus");
    }
    if (ph === "r2" || ph === "hold") {
      s.add("star"); s.add("lotus"); s.add("heart"); s.add("spark");
    }
    if (ph === "clear") {
      s.add("star"); s.add("lotus"); s.add("heart"); s.add("spark");
      if (ri >= 0) { s.add("clover"); s.add("key"); }
      if (ri >= 1) { s.add("sun"); s.add("wave"); }
    }
    if (ph === "done") {
      cs.forEach(c => { if (c.id !== "moon") s.add(c.id); });
    }
    return s;
  }, [ph, ri]);

  const tc = cs.find(c => c.id === targetId) ?? cs[0];

  const clean = useCallback(() => {
    if (raf.current) cancelAnimationFrame(raf.current);
    if (tm.current) clearTimeout(tm.current);
    raf.current = null;
    tm.current = null;
  }, []);

  const buzz = useCallback((p: number | number[]) => {
    if ("vibrate" in navigator) navigator.vibrate(p);
  }, []);

  const go = useCallback(() => {
    clean();
    setHp(1);
    setPh("clear");
    setRi(0);
    buzz([18, 40, 18]);
  }, [buzz, clean]);

  const tick = useCallback(function loop() {
    const p = Math.min((Date.now() - start.current) / H, 1);
    setHp(p);
    if (p < 1) raf.current = requestAnimationFrame(loop);
  }, []);

  const press = useCallback((e: React.PointerEvent<HTMLElement>) => {
    if (ph !== "hold") return;
    e.preventDefault();
    e.currentTarget.setPointerCapture?.(e.pointerId);
    clean();
    start.current = Date.now();
    setHp(0);
    buzz(10);
    raf.current = requestAnimationFrame(tick);
    tm.current = setTimeout(go, H);
  }, [buzz, clean, go, ph, tick]);

  const rel = useCallback((e: React.PointerEvent<HTMLElement>) => {
    if (ph === "hold" && hp > 0) {
      e.preventDefault();
      go();
    }
  }, [go, hp, ph]);

  useEffect(() => {
    document.title = "读心术2：命运符号预言";
    const m = document.querySelector<HTMLMetaElement>('meta[name="viewport"]'), o = m?.content;
    if (m) m.content = "width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no,viewport-fit=cover";
    return () => { clean(); if (m && o) m.content = o; };
  }, [clean]);

  useEffect(() => {
    if (ph !== "clear") return;
    if (ri >= 1) tm.current = setTimeout(() => { setPh("done"); buzz([20, 40, 20, 80, 25]); }, 1350);
    else tm.current = setTimeout(() => { setRi(v => v + 1); buzz(12); }, 1450);
    return clean;
  }, [buzz, clean, ph, ri]);

  useEffect(() => {
    if (ph !== "r1" && ph !== "r2" && ph !== "hold" && ph !== "clear" && ph !== "done") return;

    const timer = window.setTimeout(() => {
      window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "smooth" });
    }, 80);

    return () => window.clearTimeout(timer);
  }, [ph, ri]);

  return (
    <main className="relative min-h-[100dvh] w-full overflow-x-hidden bg-[#090513] px-4 pt-[calc(env(safe-area-inset-top)+14px)] pb-[calc(env(safe-area-inset-bottom)+120px)] text-white select-none" onContextMenu={e => e.preventDefault()}>
      <style jsx global>{`
        html, body { overscroll-behavior: none; }
        @keyframes scan { 0% { transform: translateY(-120%); opacity: 0; } 20% { opacity: .55; } 100% { transform: translateY(120%); opacity: 0; } }
        @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-7px); } }
        @keyframes rise { from { transform: translateY(16px) scale(.97); opacity: 0; filter: blur(12px); } to { transform: none; opacity: 1; filter: blur(0); } }
      `}</style>
      
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute -left-28 top-8 h-72 w-72 rounded-full bg-fuchsia-500/30 blur-[80px]" />
        <div className="absolute -right-28 top-40 h-80 w-80 rounded-full bg-cyan-400/24 blur-[90px]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.04)_1px,transparent_1px)] bg-[size:34px_34px] opacity-40" />
        <div className="absolute inset-x-0 top-0 h-1/2 animate-[scan_4.8s_linear_infinite] bg-gradient-to-b from-transparent via-cyan-200/10 to-transparent" />
      </div>

      <section className="relative z-10 mx-auto flex w-full max-w-md flex-col">
        <header className="mb-3 text-center">
          <h1 className="text-2xl font-black leading-tight tracking-[-.05em]">读心术2<br />命运符号预言</h1>
        </header>

        <div className="mb-3 rounded-[1.6rem] border border-white/12 bg-white/[.07] p-3 backdrop-blur-2xl">
          <div className="mb-2 flex justify-between text-[11px] text-white/58"><span>起点：左上角晨星</span><span>量子路径收束中</span></div>
          <div className="grid grid-cols-3 gap-2">
            {cs.map(c => {
              const gone = hide.has(c.id), win = ph === "done" && c.id === targetId;
              return (
                <div key={c.id} className={`relative aspect-square rounded-[1.35rem] border p-2 transition-all duration-700 ${win ? "z-20 scale-110 border-amber-100/80 bg-white/20 shadow-[0_0_48px_rgba(251,191,36,.55)] animate-pulse" : gone ? "scale-75 border-white/0 bg-white/[.03] opacity-5 blur-[2px]" : "border-white/14 bg-white/[.09] opacity-100"}`}>
                  <div className="flex h-full flex-col items-center justify-center text-center">
                    <div className={`mb-1 grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br ${c.a} text-[#13091f] shadow-[0_0_24px_rgba(255,255,255,.18)] animate-[float_5s_ease-in-out_infinite]`}><Icon id={c.id} cl="h-7 w-7" /></div>
                    <p className="text-xs font-black">{c.n}</p>
                    {c.id === S && ph === "ready" && <span className="absolute left-1.5 top-1.5 rounded-full bg-amber-200 px-1.5 py-0.5 text-[8px] font-black text-slate-900">START</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <section className={`${ph === "ready" || ph === "r1" || ph === "r2" ? "hidden" : "min-h-[360px]"} rounded-[1.8rem] border border-white/12 bg-slate-950/55 p-4 shadow-[0_18px_60px_rgba(0,0,0,.28)] backdrop-blur-2xl mb-4`} onPointerDown={press} onPointerUp={rel} onPointerCancel={rel} onPointerLeave={rel}>
          {ph === "hold" && (
            <div className="flex h-full flex-col items-center justify-center text-center animate-[rise_.7s_ease-out_both]">
              <div className="relative mb-6 grid h-28 w-28 place-items-center rounded-full border border-white/20" style={{ background: `conic-gradient(from -90deg,rgba(255,255,255,.92) ${hp * 360}deg,rgba(255,255,255,.1) ${hp * 360}deg)` }}><Sparkles className="h-11 w-11 drop-shadow-[0_0_22px_white]" /></div>
              <h2 className="text-2xl font-black">长按屏幕锁定宿命</h2>
              <p className="mt-3 text-sm leading-7 text-white/66">指尖微动，正在收束最终的量子轨迹...</p>
            </div>
          )}
          {ph === "clear" && ri >= 0 && (
            <div className="flex h-full flex-col justify-between animate-[rise_.55s_ease-out_both]">
              <div>
                <p className="mb-3 text-[11px] font-bold uppercase tracking-[.28em] text-fuchsia-100/60">matrix lock {ri + 1}/2</p>
                <h2 className="text-2xl font-black">终极坐标闭合</h2>
                <p className="mt-4 text-sm leading-7 text-white/72">{ls[ri]}</p>
              </div>
              <div className="rounded-2xl border border-cyan-200/20 bg-cyan-200/10 px-4 py-3 text-sm text-cyan-50/82">其余游离符号正在温柔碎裂...</div>
            </div>
          )}
          {ph === "done" && (
            <div className="flex h-full flex-col items-center justify-center text-center animate-[rise_.8s_ease-out_both]">
              <div className={`mb-4 grid h-24 w-24 place-items-center rounded-[2rem] bg-gradient-to-br ${tc.a} text-[#13091f] shadow-[0_0_54px_rgba(251,191,36,.42)]`}><Icon id={targetId} cl="h-14 w-14"/></div>
              <p className="mb-2 text-[11px] font-black uppercase tracking-[.3em] text-amber-100/70">destiny revealed</p>
              <h2 className="text-3xl font-black tracking-[-.06em]">命运符号是「{tc.n}」</h2>
              <p className="mt-4 text-sm leading-7 text-cyan-50/76">{tc.t}</p>
              <p className="mt-4 rounded-2xl border border-amber-200/20 bg-amber-200/10 px-4 py-3 text-sm leading-7 text-amber-50/86">看，兜兜转转，这就是宇宙在冥冥之中留给你的确定性温柔。</p>
            </div>
          )}
        </section>

        {ph === "ready" && (
          <div className="mb-4 w-full rounded-[1.7rem] border border-cyan-100/35 bg-gradient-to-r from-cyan-300 via-fuchsia-400 to-amber-300 p-3 text-slate-950 shadow-[0_10px_36px_rgba(0,0,0,.28)] animate-[rise_.45s_ease-out_both]">
            <Panel tag="round 01 / setup" title="第一步：脑内移动 5 步" text="请将目光盯在左上角的「晨星」上。接下来在脑海中横向或纵向连续移动 5 步（可折返，严禁走斜线）。" tip="⚠️ 核心限制：必须严格数满 5 步，多一步少一步磁场都会混乱哦！" />
            <button onClick={() => setPh("r1")} className="mt-3 w-full rounded-2xl bg-slate-950/90 px-5 py-3 text-sm font-black tracking-[.16em] text-white active:scale-[.98]">我已经停在新的符号上</button>
          </div>
        )}

        {ph === "r1" && (
          <div className="mb-4 w-full rounded-[1.7rem] border border-cyan-100/35 bg-gradient-to-r from-cyan-300 via-fuchsia-400 to-amber-300 p-3 text-slate-950 shadow-[0_10px_36px_rgba(0,0,0,.28)] animate-[rise_.45s_ease-out_both]">
            <Panel tag="round 02 / filter" title="第二步：再任意移动 2 步" text="通过基础磁场测算，你绝无可能停留在对角边缘。系统已悄然抹除【晨星】与【静莲】。现在从你脚下踩着的符号开始，在剩下的明亮符号中再横向或纵向移动 2 步。" tip="（同样可以来回折返，不要跨越已经变暗死掉的格子。）" />
            <button onClick={() => setPh("r2")} className="mt-3 w-full rounded-2xl bg-slate-950/90 px-5 py-3 text-sm font-black tracking-[.16em] text-white active:scale-[.98]">走好了，继续收束</button>
          </div>
        )}

        {ph === "r2" && (
          <div className="mb-4 w-full rounded-[1.7rem] border border-cyan-100/35 bg-gradient-to-r from-cyan-300 via-fuchsia-400 to-amber-300 p-3 text-slate-950 shadow-[0_10px_36px_rgba(0,0,0,.28)] animate-[rise_.45s_ease-out_both]">
            <Panel tag="round 03 / convergence" title="最后一步：再移动 3 步" text="矩阵进一步收束，已为你驱散【暖心】与【灵感火花】。现在，请从你当前停留的格子上，最后横向或纵向移动 3 步。" tip="锁定你最终的驻留之地，死死盯住它，千万不要移开视线。" />
            <button onClick={() => setPh("hold")} className="mt-3 w-full rounded-2xl bg-slate-950/90 px-5 py-3 text-sm font-black tracking-[.16em] text-white active:scale-[.98]">走完了，开始读心</button>
          </div>
        )}
      </section>
    </main>
  );
}