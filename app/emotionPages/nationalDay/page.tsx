"use client";

import { useEffect } from "react";
import bgImage from "./assets/bg.png";
import chinaMap from "./assets/china.svg";
import titleImage from "./assets/title-gq.png";
import styles from "./nationalDay.module.css";

const balloons = [
  [6, 0, 7.2, 0.82, -15], [18, 0.75, 6.8, 1.06, 18], [31, 1.45, 7.5, 0.7, -12],
  [44, 0.35, 6.9, 0.94, 16], [57, 2.1, 7.4, 0.78, -20], [70, 1.1, 6.7, 1.12, 14],
  [84, 2.65, 7.1, 0.88, -16], [95, 1.8, 7.7, 0.68, 12], [11, 3.2, 6.6, 1, -18],
  [25, 3.7, 7.3, 0.76, 20], [39, 4.25, 6.9, 1.08, -14], [53, 3.55, 7.6, 0.86, 17],
  [67, 4.8, 7, 0.72, -19], [80, 4.45, 7.4, 1.04, 15], [91, 5.2, 6.8, 0.8, -11],
  [47, 5.65, 7.2, 0.92, 18],
] as const;

export default function NationalDayPage() {
  useEffect(() => {
    document.title = "月满人和，国俗民安";
  }, []);

  return (
    <main className={styles.page}>
      <section className={styles.scene} aria-label="红色气球升起，月满人和，国俗民安">
        <div className={styles.backdrop} aria-hidden="true">
          <img src={bgImage.src} alt="" />
        </div>
        <div className={styles.balloonLayer} aria-hidden="true">
          {balloons.map(([left, delay, duration, size, sway]) => (
            <span
              className={styles.balloon}
              key={`${left}-${delay}`}
              style={
                {
                  "--left": `${left}%`,
                  "--delay": `${delay}s`,
                  "--duration": `${duration}s`,
                  "--size": size,
                  "--sway": `${sway}px`,
                } as React.CSSProperties
              }
            >
              <i />
              <b />
            </span>
          ))}
        </div>
        <div className={styles.redCircle} aria-hidden="true" />
        <div className={styles.mapReveal} aria-hidden="true">
          <img src={chinaMap.src} alt="" />
        </div>
        <div className={styles.titleReveal}>
          <img src={titleImage.src} alt="国庆" />
        </div>
        <div className={styles.bottomMessage} aria-label="月满人和 国泰民安">
          <span>月满人和</span>
          <span>国泰民安</span>
        </div>
      </section>
    </main>
  );
}
