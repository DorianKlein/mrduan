'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { BrainCircuit, Check, RotateCcw, Sparkles, X } from 'lucide-react';

const CARD_VALUES = [1, 2, 4, 8, 16, 32, 64] as const;

const encouragements = [
  '你的直觉刚刚点亮了一条霓虹神经。',
  '别急，宇宙正在认真听你心里的那个数字。',
  '很好，你的选择稳定又漂亮，像夜色里的电光。',
  '这一刻，你不是被读取，你是在被温柔理解。',
  '继续相信第一感觉，它比噪声更接近答案。',
  '你已经做得很棒了，数字的轮廓正在显影。',
  '最后一点信号，我会小心接住你的答案。',
];

const resultMessages = [
  '命中。你的大脑刚刚和我的赛博水晶同步了。',
  '看吧，你心里的数字从来没有孤单过，它被我温柔捕获了。',
  '这一刻请收下认证：你的直觉清澈、坚定，而且很迷人。',
  '别怀疑，这不是巧合，是你和宇宙完成了一次漂亮握手。',
];

function buildNumbers(mask: number) {
  return Array.from({ length: 100 }, (_, index) => index + 1).filter((number) => (number & mask) === mask);
}

type Stage = 'opening' | 'prepare' | 'quiz';

export default function MindReadingPage() {
  const [stage, setStage] = useState<Stage>('opening');
  const [step, setStep] = useState(0);
  const [answer, setAnswer] = useState(0);
  const [isRevealing, setIsRevealing] = useState(false);

  const cards = useMemo(() => CARD_VALUES.map((value) => ({ value, numbers: buildNumbers(value) })), []);
  const activeStep = Math.min(step, cards.length - 1);
  const currentCard = cards[activeStep];
  const isFinished = step >= cards.length;
  const progress = Math.round((Math.min(step, cards.length) / cards.length) * 100);
  const resultText = resultMessages[answer % resultMessages.length];

  useEffect(() => {
    if (stage !== 'opening') return;

    const timer = window.setTimeout(() => {
      setStage('prepare');
    }, 2400);

    return () => window.clearTimeout(timer);
  }, [stage]);

  const startQuiz = () => {
    setStage('quiz');
  };

  const choose = (hasNumber: boolean) => {
    if (isFinished || isRevealing) return;

    const nextAnswer = hasNumber ? answer + currentCard.value : answer;
    const nextStep = step + 1;

    setAnswer(nextAnswer);

    if (nextStep >= cards.length) {
      setIsRevealing(true);
      setTimeout(() => {
        setStep(nextStep);
        setIsRevealing(false);
      }, 900);
      return;
    }

    setStep(nextStep);
  };

  const reset = () => {
    setStage('opening');
    setStep(0);
    setAnswer(0);
    setIsRevealing(false);
  };

  return (
    <main className="relative h-[100dvh] overflow-hidden bg-[#05030b] px-3 py-3 text-white sm:px-6">
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes scanline {
          0% { transform: translateY(-100%); opacity: 0; }
          12% { opacity: 0.55; }
          100% { transform: translateY(100%); opacity: 0; }
        }

        @keyframes pulse-grid {
          0%, 100% { opacity: 0.24; transform: perspective(620px) rotateX(62deg) translateY(0); }
          50% { opacity: 0.42; transform: perspective(620px) rotateX(62deg) translateY(12px); }
        }

        @keyframes reveal-pop {
          0% { transform: scale(0.92); filter: blur(12px); opacity: 0; }
          100% { transform: scale(1); filter: blur(0); opacity: 1; }
        }

        .mind-grid {
          background-image:
            linear-gradient(rgba(0, 247, 255, 0.18) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 0, 204, 0.16) 1px, transparent 1px);
          background-size: 34px 34px;
          animation: pulse-grid 4.8s ease-in-out infinite;
          transform-origin: bottom center;
        }

        .scanline {
          animation: scanline 4.2s linear infinite;
        }

        .reveal-pop {
          animation: reveal-pop 700ms cubic-bezier(0.2, 0.9, 0.2, 1) both;
        }
      ` }} />

      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-28 top-10 h-72 w-72 rounded-full bg-cyan-500/30 blur-[70px]" />
        <div className="absolute -right-32 top-48 h-80 w-80 rounded-full bg-fuchsia-500/25 blur-[80px]" />
        <div className="absolute bottom-0 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-violet-600/20 blur-[90px]" />
        <div className="mind-grid absolute -bottom-28 left-[-30%] h-[46vh] w-[160%]" />
        <div className="scanline absolute left-0 top-0 h-1/2 w-full bg-gradient-to-b from-transparent via-cyan-300/10 to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0,rgba(5,3,11,0.22)_45%,rgba(5,3,11,0.88)_100%)]" />
      </div>

      <section className="relative z-10 mx-auto flex h-[calc(100dvh-24px)] w-full max-w-md flex-col overflow-hidden">
        {stage === 'opening' ? (
          <div className="reveal-pop flex flex-1 flex-col items-center justify-center text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-300/30 bg-cyan-300/10 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.32em] text-cyan-100 shadow-[0_0_22px_rgba(34,211,238,0.25)]">
              <BrainCircuit size={15} />
              mind sync
            </div>
            <p className="mb-3 text-sm tracking-[0.36em] text-fuchsia-100/70">接下来的一分钟</p>
            <h1 className="max-w-[11em] text-4xl font-black leading-tight tracking-[-0.05em] text-white drop-shadow-[0_0_24px_rgba(34,211,238,0.65)]">
              做本周最懂你的人
            </h1>
            <p className="mt-6 text-sm leading-7 text-cyan-50/70">
              先把世界的噪声调低一点。<br />这一分钟，我只负责认真接住你。
            </p>
          </div>
        ) : stage === 'prepare' ? (
          <div className="reveal-pop flex flex-1 flex-col items-center justify-center text-center">
            <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-[2rem] border border-fuchsia-200/35 bg-fuchsia-300/12 text-fuchsia-100 shadow-[0_0_34px_rgba(217,70,239,0.35)]">
              <Sparkles size={34} />
            </div>
            <p className="mb-3 text-xs uppercase tracking-[0.34em] text-cyan-100/70">ready your number</p>
            <h2 className="text-3xl font-black leading-tight tracking-[-0.04em] text-white">
              心里默念一个<br />1-100 的数字
            </h2>
            <p className="mt-5 text-sm leading-7 text-cyan-50/72">
              不用告诉任何人。只要等卡片出现后，告诉我它在不在卡片里。
            </p>
            <button
              type="button"
              onClick={startQuiz}
              className="mt-8 w-full rounded-2xl border border-cyan-200/40 bg-gradient-to-r from-cyan-400 to-fuchsia-500 px-5 py-4 text-sm font-black text-white shadow-[0_0_28px_rgba(34,211,238,0.35)] transition active:scale-[0.98]"
            >
              我默念好了
            </button>
          </div>
        ) : (
          <>
            <header className="relative mb-2 text-center">
              <div>
                <div className="mb-1 inline-flex items-center gap-2 rounded-full border border-cyan-300/30 bg-cyan-300/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.26em] text-cyan-100 shadow-[0_0_22px_rgba(34,211,238,0.25)]">
                  <BrainCircuit size={14} />
                  mind sync
                </div>
                <h1 className="text-2xl font-black leading-tight tracking-[-0.04em] text-white drop-shadow-[0_0_18px_rgba(34,211,238,0.5)]">
                  一分钟读心术
                </h1>
                <p className="mt-1 text-xs leading-5 text-cyan-50/70">
                  你的数字在这张卡里吗？相信第一眼，别担心，我会认真读懂你的选择。
                </p>
              </div>
              <button
                type="button"
                onClick={reset}
                className="absolute right-0 top-0 shrink-0 rounded-xl border border-white/15 bg-white/8 p-2 text-white/80 shadow-[0_0_18px_rgba(255,255,255,0.08)] backdrop-blur-md transition active:scale-95"
                aria-label="重新开始"
              >
                <RotateCcw size={18} />
              </button>
            </header>

            <div className="mb-2 rounded-2xl border border-white/10 bg-white/[0.06] p-2 shadow-[inset_0_0_28px_rgba(255,255,255,0.04)] backdrop-blur-xl">
              <div className="mb-1 flex items-center justify-between text-[10px] text-white/60">
                <span>脑波采样进度</span>
                <span>{progress}%</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-300 via-fuchsia-400 to-lime-300 shadow-[0_0_18px_rgba(34,211,238,0.75)] transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {!isFinished ? (
              <div className={`flex flex-none flex-col rounded-[1.5rem] border border-cyan-200/20 bg-slate-950/70 p-3 shadow-[0_0_38px_rgba(34,211,238,0.18),inset_0_0_34px_rgba(217,70,239,0.08)] backdrop-blur-2xl ${isRevealing ? 'opacity-50 blur-sm' : ''}`}>
                <div className="mb-2 text-center">
                  <p className="text-[10px] uppercase tracking-[0.22em] text-fuchsia-200/70">binary magic card</p>
                  <h2 className="mt-0.5 text-lg font-extrabold text-white">
                    第 {activeStep + 1} 张神经卡
                  </h2>
                </div>

                <p className="mb-2 rounded-2xl border border-lime-200/20 bg-lime-200/10 px-3 py-2 text-xs leading-5 text-lime-50/85">
                  {encouragements[step]}
                </p>

                <div className="grid grid-cols-10 gap-1 rounded-2xl border border-white/10 bg-black/24 p-2 shadow-[inset_0_0_28px_rgba(0,0,0,0.45)]">
                  {currentCard.numbers.map((number) => (
                    <div
                      key={number}
                      className="flex aspect-square items-center justify-center rounded-md border border-cyan-200/15 bg-cyan-200/[0.07] text-[10px] font-bold text-cyan-50 shadow-[0_0_14px_rgba(34,211,238,0.08)]"
                    >
                      {number}
                    </div>
                  ))}
                </div>

                <div className="mt-2 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => choose(false)}
                    className="flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/8 px-4 py-3 text-sm font-bold text-white/82 backdrop-blur-md transition active:scale-[0.98]"
                  >
                    <X size={17} />
                    不在
                  </button>
                  <button
                    type="button"
                    onClick={() => choose(true)}
                    className="flex items-center justify-center gap-2 rounded-xl border border-cyan-200/40 bg-gradient-to-r from-cyan-400 to-fuchsia-500 px-4 py-3 text-sm font-black text-white shadow-[0_0_24px_rgba(34,211,238,0.35)] transition active:scale-[0.98]"
                  >
                    <Check size={17} />
                    在里面
                  </button>
                </div>
              </div>
            ) : (
              <div className="reveal-pop flex min-h-0 flex-1 flex-col items-center justify-center rounded-[1.5rem] border border-cyan-200/25 bg-slate-950/72 p-4 text-center shadow-[0_0_46px_rgba(34,211,238,0.24),inset_0_0_38px_rgba(217,70,239,0.1)] backdrop-blur-2xl">
                <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-fuchsia-200/35 bg-fuchsia-300/12 text-fuchsia-100 shadow-[0_0_30px_rgba(217,70,239,0.35)]">
                  <Sparkles size={24} />
                </div>
                <p className="mb-2 text-xs uppercase tracking-[0.34em] text-cyan-100/70">signal locked</p>
                <div className="relative my-3 flex h-28 w-28 items-center justify-center rounded-full border border-cyan-200/35 bg-cyan-300/10 shadow-[0_0_42px_rgba(34,211,238,0.35),inset_0_0_38px_rgba(217,70,239,0.2)]">
                  <div className="absolute inset-3 rounded-full border border-fuchsia-300/25" />
                  <span className="text-5xl font-black tracking-tighter text-white drop-shadow-[0_0_22px_rgba(34,211,238,0.75)]">
                    {answer}
                  </span>
                </div>
                <h2 className="text-xl font-black tracking-[-0.04em] text-white">你想的是 {answer}</h2>
                <p className="mt-2 text-xs leading-5 text-cyan-50/76">
                  {resultText}
                </p>
                <p className="mt-3 rounded-2xl border border-lime-200/20 bg-lime-200/10 px-3 py-2 text-xs leading-5 text-lime-50/82">
                  今天的你也辛苦了。愿这个小小魔术，把一点点确定、惊喜和被看见的感觉送给你。
                </p>

                <button
                  type="button"
                  onClick={reset}
                  className="mt-4 w-full rounded-xl border border-fuchsia-200/40 bg-gradient-to-r from-fuchsia-500 to-cyan-400 px-5 py-3 text-sm font-black text-white shadow-[0_0_28px_rgba(217,70,239,0.35)] transition active:scale-[0.98]"
                >
                  再读一次心
                </button>
              </div>
            )}

            <p className="mt-2 text-center text-[10px] leading-4 text-white/36">
              只要诚实回答“在不在”，答案就会在最后出现。
            </p>
          </>
        )}
      </section>
    </main>
  );
}
