'use client';

import { useEffect, useRef, useState, type CSSProperties } from 'react';
import styles from './clock.module.css';

const quotes = [
  '刚才那 5 秒，猫什么都没做，你也是。',
  '恭喜，你已在地球自转中免费搭乘了 5 秒。',
  '刚刚过去的 5 秒，有 3 亿个细胞为你努力活了下来，而你成功保护了它们不受工作侵害。',
  '刚刚过去的 5 秒，世界没有任何改变，这很棒。',
  '摸鱼 10 秒，四舍五入就是没上班。',
  '你刚才呼吸了两次，很棒，继续保持这个节奏。',
  '别紧张，这 5 秒里没有写进任何 KPI。',
  '刚刚有颗流星划过，你没看到，但你摸到了鱼，不亏。',
  '刚才那 5 秒，我们成功阻止了自己去创造任何剩余价值。',
  '很好，你刚才成功发呆了 5 秒，宇宙为你感到骄傲。',
  '你的椅子刚刚承托了一个完全不想工作的灵魂。',
  '这 5 秒没有产出，但有非常扎实地经过。',
  '恭喜，刚才的时间已经永久属于你，无法报销。',
  '此刻有一朵云路过，你也可以什么都不做。',
  '你与待办清单保持了 5 秒的礼貌距离。',
  '人生不是冲刺，现在是合法的躺平区间。',
  '刚才没有人因为你休息而失去什么，除了一个 KPI。',
  '又攒下 5 秒无用但很自由的人生。',
  '这不是拖延，这是给灵魂一点加载时间。',
  '恭喜，你刚刚完成了一次高质量的什么也没做。',
];

function formatTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
  const seconds = (totalSeconds % 60).toString().padStart(2, '0');
  return `${minutes}:${seconds}`;
}

export default function ClockPage() {
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const [finished, setFinished] = useState(false);
  const [quoteIndex, setQuoteIndex] = useState(-1);
  const [quoteKey, setQuoteKey] = useState(0);
  const startedAt = useRef<number | null>(null);
  const elapsedAtStart = useRef(0);
  const lastTick = useRef(0);

  useEffect(() => {
    document.title = 'mrduan情绪网页 - 摸鱼计时器';
  }, []);

  useEffect(() => {
    if (!running) return;
    const update = () => {
      if (startedAt.current === null) return;
      const nextElapsed = elapsedAtStart.current + Math.floor((Date.now() - startedAt.current) / 1000);
      setElapsed(nextElapsed);
      const tick = Math.floor(nextElapsed / 5);
      if (tick > lastTick.current) {
        lastTick.current = tick;
        setQuoteIndex((previous) => (previous + 1) % quotes.length);
        setQuoteKey((previous) => previous + 1);
      }
    };
    update();
    const timer = window.setInterval(update, 100);
    return () => window.clearInterval(timer);
  }, [running]);

  const begin = () => {
    elapsedAtStart.current = elapsed;
    startedAt.current = Date.now();
    setRunning(true);
  };

  const pause = () => {
    if (startedAt.current !== null) {
      elapsedAtStart.current = elapsedAtStart.current + Math.floor((Date.now() - startedAt.current) / 1000);
      startedAt.current = null;
    }
    setRunning(false);
  };

  const endSession = () => {
    if (startedAt.current !== null) {
      const finalElapsed = elapsedAtStart.current + Math.floor((Date.now() - startedAt.current) / 1000);
      elapsedAtStart.current = finalElapsed;
      setElapsed(finalElapsed);
      startedAt.current = null;
    }
    setRunning(false);
    setFinished(true);
  };

  const reset = () => {
    setElapsed(0);
    elapsedAtStart.current = 0;
    startedAt.current = null;
    lastTick.current = 0;
    setQuoteIndex(-1);
    setRunning(false);
    setFinished(false);
  };

  return (
    <main className={styles.page}>
      <div className={styles.ambient} aria-hidden="true" />
      <header className={styles.header}>
        <div className={styles.online}><i />在线充能中</div>
      </header>

      <section className={styles.experience}>
        <div className={styles.intro}>
          <span className={styles.eyebrow}>A MOMENT FOR YOURSELF</span>
          <h1>此刻，不必有用。</h1>
          <p>把时间还给自己，别的事情等一会儿再说。</p>
        </div>

        <div className={styles.watch}>
          <div className={styles.rim}>
            <div className={styles.face}>
              <div className={styles.hourMarks} aria-hidden="true" style={{ '--mark-origin': '47.5%' } as CSSProperties}>
                {Array.from({ length: 60 }, (_, index) => (
                  <i key={index} className={index % 5 === 0 ? styles.majorMark : ''} style={{ transform: `rotate(${index * 6}deg)` }} />
                ))}
              </div>
              <div className={styles.innerRing} />
              <span className={`${styles.dialLabel} ${styles.twelve}`}>XII</span>
              <span className={`${styles.dialLabel} ${styles.three}`}>III</span>
              <span className={`${styles.dialLabel} ${styles.six}`}>VI</span>
              <span className={`${styles.dialLabel} ${styles.nine}`}>IX</span>
              <div className={styles.readout}>
                <span className={styles.readoutCaption}>TIME WELL WASTED</span>
                <strong>{formatTime(elapsed)}</strong>
                <span className={styles.readoutSub}>分钟 <b>·</b> 秒钟</span>
              </div>
              <div
                className={`${styles.handPivot} ${running ? styles.handPivotActive : ''}`}
                style={{ transform: `rotate(${elapsed * 6}deg)` }}
                aria-hidden="true"
              >
                <div className={styles.hand}><span /></div>
              </div>
              <div className={styles.pin} />
              {quoteIndex >= 0 && (
                <div key={quoteKey} className={styles.clockQuote} aria-live="polite">
                  <span>✳</span>{quotes[quoteIndex]}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className={styles.controls}>
          {!running ? (
            <button className={styles.primaryButton} onClick={begin}>
              <span className={styles.playIcon} />{elapsed > 0 ? '继续摸鱼' : '开始虚度'}
            </button>
          ) : (
            <button className={`${styles.primaryButton} ${styles.runningButton}`} onClick={pause}>
              <span className={styles.pauseIcon}><i /><i /></span>正在虚度…
            </button>
          )}
          {elapsed > 0 && <button className={styles.endButton} onClick={endSession}>结束这一段</button>}
        </div>

        <div className={styles.ticker}>
          <span className={styles.tickerMark}>✳</span>
          <p className={styles.tickerIdle}>{running ? '安心虚度，每一秒都属于你。' : '一会儿见，时间会替你慢下来。'}</p>
        </div>
      </section>

      <footer className={styles.footer}>
        <p>休息，是为了更好的……不工作吗？不，休息就是休息，不需要为了任何事情做准备。</p>
        <p>摸鱼万岁，毫无生产力的一天也是伟大的一天。</p>
      </footer>

      {finished && (
        <div className={styles.overlay} role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setFinished(false); }}>
          <section className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="rest-title">
            <button className={styles.closeButton} onClick={() => setFinished(false)} aria-label="关闭">×</button>
            <div className={styles.medal}><span>✳</span><small>WELL<br />RESTED</small></div>
            <span className={styles.eyebrow}>A WELL-EARNED PAUSE</span>
            <h2 id="rest-title">心安理得休息勋章</h2>
            <p className={styles.sessionTime}>今天你成功虚度了 <strong>{Math.floor(elapsed / 60)} 分 {elapsed % 60} 秒</strong>。</p>
            <p className={styles.modalMessage}>你没有在为「更好地工作」而充电，你只是在过属于你自己的、没有任何目的的一天。去吧，明天不上班，去享受更多美好的时间。</p>
            <button className={styles.modalButton} onClick={reset}>收下勋章</button>
          </section>
        </div>
      )}
    </main>
  );
}
