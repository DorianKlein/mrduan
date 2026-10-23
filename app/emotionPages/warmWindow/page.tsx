'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import styles from './page.module.css';

interface BreathSpot {
  id: number;
  x: number;
  y: number;
}

interface ExtraCoat {
  id: string;
  label: string;
  icon: string;
  toast: string;
}

const EXTRA_COATS: ExtraCoat[] = [
  { id: 'scarf', label: '围上羊绒围巾', icon: '🧣', toast: '脖子暖暖的，寒风钻不进来了' },
  { id: 'cocoa', label: '捧一杯热可可', icon: '☕', toast: '手心有温度，连呼吸都是甜的' },
  { id: 'coat', label: '穿好厚羽绒服', icon: '🧥', toast: '把自己裹严实，今天谁也冻不着你' },
];

export default function MrDuanWarmWindowPage() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const windowAreaRef = useRef<HTMLDivElement | null>(null);

  const [hasBreathed, setHasBreathed] = useState(false);
  const [wipePercent, setWipePercent] = useState(0);
  const [isCleared, setIsCleared] = useState(false);
  const [breathSpots, setBreathSpots] = useState<BreathSpot[]>([]);
  const [selectedCoats, setSelectedCoats] = useState<string[]>([]);
  const [activeToast, setActiveToast] = useState<string>('轻轻哈一口气，擦开窗上的白雾吧');

  const isDrawingRef = useRef(false);
  const lastPosRef = useRef<{ x: number; y: number } | null>(null);
  const strokeCountRef = useRef(0);

  // 绘制手绘感冰霜雾气层
  const initFrostCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const container = windowAreaRef.current;
    if (!canvas || !container) return;

    const rect = container.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.scale(dpr, dpr);
    ctx.globalCompositeOperation = 'source-over';

    // 1. 奶油雾蓝底色（手绘厚涂感）
    const grad = ctx.createLinearGradient(0, 0, 0, rect.height);
    grad.addColorStop(0, 'rgba(232, 240, 248, 0.94)');
    grad.addColorStop(0.55, 'rgba(222, 233, 245, 0.92)');
    grad.addColorStop(1, 'rgba(238, 232, 226, 0.93)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, rect.width, rect.height);

    // 2. 水彩斑驳肌理斑点
    for (let i = 0; i < 65; i++) {
      const x = Math.random() * rect.width;
      const y = Math.random() * rect.height;
      const r = 16 + Math.random() * 42;
      const radial = ctx.createRadialGradient(x, y, 2, x, y, r);
      radial.addColorStop(0, 'rgba(255, 255, 255, 0.42)');
      radial.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = radial;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }

    // 3. 窗角手绘冰晶小雪花与雾气笔画
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.65)';
    ctx.lineWidth = 1.5;
    ctx.lineCap = 'round';
    const corners = [
      { cx: 28, cy: 28 },
      { cx: rect.width - 28, cy: 28 },
      { cx: 28, cy: rect.height - 28 },
      { cx: rect.width - 28, cy: rect.height - 28 },
    ];
    corners.forEach(({ cx, cy }) => {
      for (let a = 0; a < 6; a++) {
        const angle = (Math.PI / 3) * a;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + Math.cos(angle) * 14, cy + Math.sin(angle) * 14);
        ctx.stroke();
      }
    });

    // 4. 雾面上的引导轻声细语
    ctx.fillStyle = 'rgba(104, 122, 143, 0.68)';
    ctx.font = '600 15px "Hiragino Maru Gothic ProN", "YouYuan", "PingFang SC", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('✦ 窗上结了厚厚的霜 ✦', rect.width / 2, rect.height / 2 - 12);
    ctx.font = '500 13px "Hiragino Maru Gothic ProN", "YouYuan", "PingFang SC", sans-serif';
    ctx.fillStyle = 'rgba(120, 136, 155, 0.62)';
    ctx.fillText('用手指抹开白雾，看看窗内藏着什么', rect.width / 2, rect.height / 2 + 14);
  }, []);

  useEffect(() => {
    initFrostCanvas();
    window.addEventListener('resize', initFrostCanvas);
    return () => window.removeEventListener('resize', initFrostCanvas);
  }, [initFrostCanvas]);

  // 计算擦除百分比
  const checkClearedRatio = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || isCleared) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width, height } = canvas;
    const imageData = ctx.getImageData(0, 0, width, height).data;
    let transparentPixels = 0;
    const step = 16; // 抽样步长提升手机端流畅度
    const totalSampled = Math.floor(imageData.length / (4 * step));

    for (let i = 3; i < imageData.length; i += 4 * step) {
      if (imageData[i] < 110) {
        transparentPixels++;
      }
    }

    const ratio = Math.min(100, Math.round((transparentPixels / totalSampled) * 100));
    setWipePercent(ratio);

    if (ratio >= 30 && ratio < 52 && !isCleared) {
      setActiveToast('暖黄的灯光透出来了，再擦几下～');
    }

    if (ratio >= 52 && !isCleared) {
      setIsCleared(true);
      setWipePercent(100);
      setActiveToast('白雾散开啦，把这份暖意收好吧');
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([30, 50, 40]);
      }
    }
  }, [isCleared]);

  // 擦拭动作
  const scratchAt = useCallback(
    (clientX: number, clientY: number) => {
      const canvas = canvasRef.current;
      if (!canvas || isCleared) return;

      const rect = canvas.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;

      if (!hasBreathed) {
        setHasBreathed(true);
        setActiveToast('沙沙沙… 窗外的暖光渐渐清晰了');
      }

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.globalCompositeOperation = 'destination-out';
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      // 柔和边缘擦除画笔
      const brushRadius = 32;
      const radial = ctx.createRadialGradient(x, y, 6, x, y, brushRadius);
      radial.addColorStop(0, 'rgba(0, 0, 0, 1)');
      radial.addColorStop(0.75, 'rgba(0, 0, 0, 0.85)');
      radial.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = radial;
      ctx.beginPath();
      ctx.arc(x, y, brushRadius, 0, Math.PI * 2);
      ctx.fill();

      if (lastPosRef.current) {
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.9)';
        ctx.lineWidth = brushRadius * 1.55;
        ctx.beginPath();
        ctx.moveTo(lastPosRef.current.x, lastPosRef.current.y);
        ctx.lineTo(x, y);
        ctx.stroke();
      }

      lastPosRef.current = { x, y };
      strokeCountRef.current += 1;

      if (strokeCountRef.current % 6 === 0) {
        checkClearedRatio();
      }
    },
    [hasBreathed, isCleared, checkClearedRatio]
  );

  // 点击“哈一口暖气”按钮或轻点玻璃
  const triggerBreathMist = (clientX?: number, clientY?: number) => {
    const container = windowAreaRef.current;
    if (!container || isCleared) return;
    const rect = container.getBoundingClientRect();
    const x = clientX ? clientX - rect.left : rect.width / 2;
    const y = clientY ? clientY - rect.top : rect.height / 2;

    setHasBreathed(true);
    const spotId = Date.now() + Math.random();
    setBreathSpots((prev) => [...prev.slice(-3), { id: spotId, x, y }]);
    setActiveToast('呼—— 玻璃上多了一团热乎乎的白雾，快用手指画一画');

    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(20);
    }

    // 在哈气中心自动融化一小圈霜
    scratchAt(x + rect.left, y + rect.top);
    lastPosRef.current = null;
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (isCleared) return;
    isDrawingRef.current = true;
    lastPosRef.current = null;
    scratchAt(e.clientX, e.clientY);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current || isCleared) return;
    scratchAt(e.clientX, e.clientY);
  };

  const handlePointerUp = () => {
    if (!isDrawingRef.current) return;
    isDrawingRef.current = false;
    lastPosRef.current = null;
    checkClearedRatio();
  };

  const toggleCoatItem = (coat: ExtraCoat) => {
    setSelectedCoats((prev) => {
      const exists = prev.includes(coat.id);
      const next = exists ? prev.filter((item) => item !== coat.id) : [...prev, coat.id];
      return next;
    });
    setActiveToast(coat.toast);
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(15);
    }
  };

  const handleReset = () => {
    setIsCleared(false);
    setHasBreathed(false);
    setWipePercent(0);
    setSelectedCoats([]);
    setBreathSpots([]);
    setActiveToast('窗户又结上新霜啦，再哈口气擦擦看');
    setTimeout(() => {
      initFrostCanvas();
    }, 50);
  };

  // 计算室内实时体感温度（随擦窗进度与加衣数量升高）
  const currentTemp = Math.min(
    26,
    Math.round(3 + (wipePercent / 100) * 14 + selectedCoats.length * 3)
  );

  return (
    <main className={`${styles.viewport} ${isCleared ? styles.viewportWarm : ''}`}>
      {/* 飘雪背景装饰 */}
      <div className={styles.snowLayer} aria-hidden="true">
        <span className={`${styles.snowflake} ${styles.s1}`}>❅</span>
        <span className={`${styles.snowflake} ${styles.s2}`}>✦</span>
        <span className={`${styles.snowflake} ${styles.s3}`}>❆</span>
        <span className={`${styles.snowflake} ${styles.s4}`}>•</span>
        <span className={`${styles.snowflake} ${styles.s5}`}>❅</span>
        <span className={`${styles.snowflake} ${styles.s6}`}>✦</span>
      </div>

      {/* 顶部手绘胶囊状态栏 */}
      <header className={styles.topHeader}>
        <div className={styles.brandTag}>
          <span className={styles.brandDot} />
          <span>mrduan 的冬日小窗</span>
        </div>
        <div className={`${styles.tempPill} ${currentTemp >= 20 ? styles.tempPillWarm : ''}`}>
          <span className={styles.tempIcon}>{currentTemp >= 20 ? '🔆' : '🌡️'}</span>
          <span>暖意值 {currentTemp}°C</span>
        </div>
      </header>

      {/* 手绘风木质窗框主体 */}
      <section className={styles.windowFrameOuter}>
        {/* 顶部积雪窗楣 */}
        <div className={styles.snowCap} aria-hidden="true" />

        <div ref={windowAreaRef} className={styles.windowGlassPane}>
          {/* 窗内治愈手绘场景（底层） */}
          <div className={`${styles.indoorScene} ${isCleared ? styles.indoorSceneActive : ''}`}>
            {/* 暖光光晕 */}
            <div className={styles.warmGlowOrb} />

            {/* 窗格木条背景衬托 */}
            <div className={styles.windowMullionH} aria-hidden="true" />
            <div className={styles.windowMullionV} aria-hidden="true" />

            {/* 手绘治愈插画：围着红围巾捧热可可的小熊与壁炉暖光 */}
            <svg
              className={styles.illustrationSvg}
              viewBox="0 0 260 210"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-label="围着红围巾捧着热可可的治愈小熊"
            >
              {/* 暖色吊灯与光束 */}
              <line x1="130" y1="0" x2="130" y2="26" stroke="#8C5A3C" strokeWidth="2.5" strokeLinecap="round" />
              <path
                d="M112 26C112 18 148 18 148 26L154 34H106L112 26Z"
                fill="#F4A261"
                stroke="#6D452B"
                strokeWidth="2.2"
                strokeLinejoin="round"
              />
              <circle cx="130" cy="36" r="7" fill="#FFF3B0" />
              <circle cx="130" cy="36" r="24" fill="#FFD166" fillOpacity="0.28" />

              {/* 软乎乎的小熊耳朵 */}
              <circle cx="98" cy="84" r="16" fill="#D49B6A" stroke="#5C3D28" strokeWidth="2.5" />
              <circle cx="98" cy="84" r="8" fill="#F2C6A0" />
              <circle cx="162" cy="84" r="16" fill="#D49B6A" stroke="#5C3D28" strokeWidth="2.5" />
              <circle cx="162" cy="84" r="8" fill="#F2C6A0" />

              {/* 小熊圆脑袋 */}
              <ellipse cx="130" cy="104" rx="40" ry="34" fill="#DDA676" stroke="#5C3D28" strokeWidth="2.5" />

              {/* 治愈腮红 */}
              <ellipse cx="104" cy="110" rx="7.5" ry="4.5" fill="#F28482" fillOpacity="0.65" />
              <ellipse cx="156" cy="110" rx="7.5" ry="4.5" fill="#F28482" fillOpacity="0.65" />

              {/* 弯弯的笑眼 */}
              <path d="M111 99C113.5 95.5 118.5 95.5 121 99" stroke="#4A3020" strokeWidth="2.6" strokeLinecap="round" />
              <path d="M139 99C141.5 95.5 146.5 95.5 149 99" stroke="#4A3020" strokeWidth="2.6" strokeLinecap="round" />

              {/* 鼻子与嘴巴 */}
              <ellipse cx="130" cy="108" rx="11" ry="8.5" fill="#FFF5EB" />
              <ellipse cx="130" cy="105.5" rx="4.5" ry="3.2" fill="#5C3D28" />
              <path d="M126 111C128 113.5 132 113.5 134 111" stroke="#5C3D28" strokeWidth="2" strokeLinecap="round" />

              {/* 小熊身体（穿厚毛衣） */}
              <path
                d="M84 185C84 150 102 132 130 132C158 132 176 150 176 185"
                fill="#F6BD60"
                stroke="#5C3D28"
                strokeWidth="2.5"
              />

              {/* 蓬松红围巾 */}
              <path
                d="M92 128C105 136 155 136 168 128C172 134 170 145 162 147C142 152 118 152 98 147C90 145 88 134 92 128Z"
                fill="#E76F51"
                stroke="#5C3D28"
                strokeWidth="2.4"
                strokeLinejoin="round"
              />
              <path
                d="M142 144L150 176L166 173L157 142"
                fill="#E76F51"
                stroke="#5C3D28"
                strokeWidth="2.4"
                strokeLinejoin="round"
              />
              {/* 围巾织纹 */}
              <line x1="149" y1="168" x2="163" y2="165" stroke="#F4A261" strokeWidth="2.5" strokeLinecap="round" />

              {/* 手里捧着的热可可马克杯 */}
              <rect
                x="114"
                y="152"
                width="32"
                height="28"
                rx="6"
                fill="#FFF8F0"
                stroke="#5C3D28"
                strokeWidth="2.4"
              />
              <path
                d="M146 158H152C155.5 158 155.5 172 152 172H146"
                stroke="#5C3D28"
                strokeWidth="2.4"
                strokeLinecap="round"
              />
              {/* 杯上小红心 */}
              <path
                d="M130 169C130 169 124 165 124 161.5C124 159.5 126 158.5 127.5 159.5C128.8 160.3 130 162 130 162C130 162 131.2 160.3 132.5 159.5C134 158.5 136 159.5 136 161.5C136 165 130 169 130 169Z"
                fill="#E76F51"
              />

              {/* 袅袅热气 */}
              <path
                className={styles.steamPath1}
                d="M124 146C122 141 126 137 124 132"
                stroke="#FFF8F0"
                strokeWidth="2.2"
                strokeLinecap="round"
              />
              <path
                className={styles.steamPath2}
                d="M136 144C134 139 138 135 136 130"
                stroke="#FFF8F0"
                strokeWidth="2.2"
                strokeLinecap="round"
              />
            </svg>

            {/* 窗户擦亮前隐约透出的手写关心字迹 */}
            <div className={`${styles.windowNotePreview} ${isCleared ? styles.windowNoteHidden : ''}`}>
              <p className={styles.handwrittenHint}>“天冷了，记得多穿一件…”</p>
            </div>

            {/* 窗户擦亮后展开的 mrduan 手绘便签卡 */}
            <div className={`${styles.letterCard} ${isCleared ? styles.letterCardVisible : ''}`}>
              <div className={styles.letterPin} aria-hidden="true" />
              <p className={styles.letterGreeting}>致 正在看屏幕的你：</p>
              <h1 className={styles.letterMainText}>
                替你挡住窗外的寒风了，
                <br />
                今天降温，出门记得
                <span className={styles.highlightWarm}>多穿一件</span>，
                <br />
                别冻着自己。
              </h1>
              <div className={styles.letterFooter}>
                <span className={styles.weatherSub}>🧣 外面风大 · 把自己裹严实点</span>
                <span className={styles.signature}>— mrduan</span>
              </div>
            </div>
          </div>

          {/* 哈气白雾扩散动画层 */}
          {breathSpots.map((spot) => (
            <span
              key={spot.id}
              className={styles.breathCloud}
              style={{ left: `${spot.x}px`, top: `${spot.y}px` }}
            />
          ))}

          {/* 顶层可擦拭冰霜 Canvas */}
          <canvas
            ref={canvasRef}
            className={`${styles.frostCanvas} ${isCleared ? styles.frostCanvasCleared : ''}`}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
          />
        </div>

        {/* 木质窗台与角落盆栽装饰 */}
        <div className={styles.windowSill}>
          <div className={styles.sillShadow} />
          <span className={styles.sillPlant}>🪴 暖冬常青</span>
          <span className={styles.sillProgress}>
            {isCleared ? '✨ 窗面已擦亮' : `已擦开 ${wipePercent}%`}
          </span>
        </div>
      </section>

      {/* 底部互动区（单屏固定切换：擦窗前是“哈气互动”，擦亮后是“加衣小贴士”） */}
      <footer className={styles.bottomDock}>
        <div className={styles.toastBubble} role="status" aria-live="polite">
          <span>{activeToast}</span>
        </div>

        {!isCleared ? (
          <div className={styles.actionRow}>
            <button
              type="button"
              className={styles.breathButton}
              onClick={() => triggerBreathMist()}
            >
              <span className={styles.breathBtnIcon}>💨</span>
              <span>朝窗户哈一口暖气</span>
            </button>
          </div>
        ) : (
          <div className={styles.warmChecklistArea}>
            <div className={styles.coatChipsRow}>
              {EXTRA_COATS.map((coat) => {
                const isSelected = selectedCoats.includes(coat.id);
                return (
                  <button
                    key={coat.id}
                    type="button"
                    onClick={() => toggleCoatItem(coat)}
                    className={`${styles.coatChip} ${isSelected ? styles.coatChipActive : ''}`}
                  >
                    <span className={styles.coatChipIcon}>{coat.icon}</span>
                    <span>{coat.label}</span>
                    {isSelected && <span className={styles.checkBadge}>✓</span>}
                  </button>
                );
              })}
            </div>

            <div className={styles.secondaryActions}>
              <span className={styles.coatsSummary}>
                {selectedCoats.length === 3
                  ? '🌟 全副武装啦！今天一定暖洋洋的'
                  : `点一点上方小物件，给自己加满暖意 (${selectedCoats.length}/3)`}
              </span>
              <button type="button" className={styles.replayBtn} onClick={handleReset}>
                再擦一次窗 ↻
              </button>
            </div>
          </div>
        )}
      </footer>
    </main>
  );
}