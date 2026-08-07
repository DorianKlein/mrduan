"use client";

import React, { useState, useRef, useEffect } from "react";
import styles from "./washingMachine.module.css";

const COMFORT_MESSAGES = [
  "你的情绪不是负担，它只是在告诉你，你很认真地在生活。现在，它已经被温柔地洗净了，剩下的只有对你的疼惜和爱意。你值得被好好对待，值得拥有每一个轻松的呼吸。",
  "那些让你疲惫的、让你难过的、让你焦虑的东西，在这台洗衣机里已经被一点点溶解了。出来的不是沉重，而是一颗又一颗爱你的心。记住，坏情绪会走，而你会留下来，变得更温柔更强大。",
  "每一件写满委屈的衣服，经过温暖的水流之后，都变成了拥抱。你看，你的难过并没有被忽视，它只是被转化成了爱。从现在起，请允许自己轻松一点，你已经很棒了。",
  "情绪就像衣服上的污渍，看起来很顽固，但只要你愿意放手交给时间和温暖，它终究会干净如初。而那些曾经的不开心，最终都会变成让你成长的勋章。你辛苦了，给自己一个拥抱吧。",
  "你不需要假装坚强，不需要一个人扛着所有。把那些让你喘不过气的情绪写下来，交给这台洗衣机，让它帮你把沉重变成轻盈。出来的每一颗心，都是这个世界想对你说的：我爱你，你很重要。",
  "生活有时候会让人觉得好累好累，但请相信，没有一种情绪是不会过去的。就像这台洗衣机，转啊转，那些不开心最终都被洗成了爱和希望。你的明天会更好的，因为今天的你已经选择了面对。",
  "把焦虑放下，把自我怀疑放下，把对未来的恐惧也放下。这些都不属于你，它们只是路过你心里的乌云。而你，本身就是太阳。现在，云已经散了，让阳光洒满你的心房吧。",
  "亲爱的，你的每一种情绪都是真实的，都值得被认真对待。但你不必被它们困住。看，经过这一轮清洗，那些压在心头的重量已经变成了爱心飘向你。请收下这份温柔，你值得拥有世间所有美好。",
];

export default function WashingMachinePage() {
  const [step, setStep] = useState<"write" | "washing" | "done">("write");
  const [emotion, setEmotion] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [comfortMessage, setComfortMessage] = useState("");
  const [washProgress, setWashProgress] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const washTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    document.title = "情绪洗衣机";
  }, []);

  useEffect(() => {
    if (step === "washing") {
      setWashProgress(0);
      const duration = 4000;
      const interval = 50;
      const increment = 100 / (duration / interval);
      washTimerRef.current = setInterval(() => {
        setWashProgress((prev) => {
          const next = prev + increment;
          if (next >= 100) {
            if (washTimerRef.current) clearInterval(washTimerRef.current);
            setTimeout(() => {
              setStep("done");
              setComfortMessage(COMFORT_MESSAGES[Math.floor(Math.random() * COMFORT_MESSAGES.length)]);
            }, 300);
            return 100;
          }
          return next;
        });
      }, interval);
    }
    return () => {
      if (washTimerRef.current) clearInterval(washTimerRef.current);
    };
  }, [step]);

  const handleStartWash = () => {
    if (!emotion.trim()) return;
    setStep("washing");
  };

  const handleReset = () => {
    setShowModal(false);
    setEmotion("");
    setStep("write");
    setWashProgress(0);
  };

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <h1 className={styles.title}>情绪洗衣机</h1>
        <p className={styles.subtitle}>把不开心写在衣服上，让洗衣机帮你洗掉</p>

        {step === "write" && (
          <div className={styles.writeSection}>
            <div className={styles.clothesCard}>
              <div className={styles.clothesSvg}>
                <svg viewBox="0 0 120 140" className={styles.tshirt}>
                  <path
                    d="M30 0 L0 30 L15 35 L20 20 L20 140 L100 140 L100 20 L105 35 L120 30 L90 0 L75 15 C70 20 50 20 45 15 Z"
                    fill="#fff"
                    stroke="#e0e0e0"
                    strokeWidth="2"
                  />
                </svg>
              </div>
              <textarea
                ref={textareaRef}
                className={styles.emotionInput}
                placeholder="在这里写下你的坏情绪..."
                value={emotion}
                onChange={(e) => setEmotion(e.target.value)}
                maxLength={200}
              />
            </div>
            <button
              className={styles.washButton}
              onClick={handleStartWash}
              disabled={!emotion.trim()}
            >
              放入洗衣机
            </button>
          </div>
        )}

        {step === "washing" && (
          <div className={styles.washingSection}>
            <div className={styles.machine}>
              <div className={styles.machineBody}>
                <div className={styles.machineDoor}>
                  <div className={styles.drumWindow}>
                    <div className={styles.drum}>
                      <div className={styles.clothesInDrum} />
                      <div className={styles.water} />
                      <div className={styles.bubble} />
                      <div className={styles.bubble2} />
                      <div className={styles.bubble3} />
                    </div>
                  </div>
                </div>
                <div className={styles.machinePanel}>
                  <div className={styles.machineLight} />
                  <div className={styles.machineKnob} />
                </div>
              </div>
            </div>
            <div className={styles.progressBar}>
              <div className={styles.progressFill} style={{ width: `${washProgress}%` }} />
            </div>
            <p className={styles.washingText}>正在清洗你的情绪...</p>
          </div>
        )}

        {step === "done" && (
          <div className={styles.doneSection}>
            <div className={styles.clothesResult}>
              <div className={styles.clothesSvg}>
                <svg viewBox="0 0 120 140" className={styles.tshirt}>
                  <path
                    d="M30 0 L0 30 L15 35 L20 20 L20 140 L100 140 L100 20 L105 35 L120 30 L90 0 L75 15 C70 20 50 20 45 15 Z"
                    fill="#fff"
                    stroke="#e0e0e0"
                    strokeWidth="2"
                  />
                </svg>
              </div>
              <div className={styles.heartsText}>
                <span className={styles.bigHeart}>❤</span>
              </div>
            </div>
            <p className={styles.doneText}>你的衣服洗好啦！坏情绪已经变成了满满的爱</p>
            <button className={styles.washButton} onClick={() => setShowModal(true)}>
              点这里
            </button>
            <button className={styles.resetButton} onClick={handleReset}>
              再洗一次
            </button>
          </div>
        )}

        {showModal && (
          <div className={styles.modalOverlay} onClick={handleReset}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
              <div className={styles.modalHearts}>💗✨💗</div>
              <h2 className={styles.modalTitle}>洗好啦！</h2>
              <p className={styles.modalMessage}>{comfortMessage}</p>
              <button className={styles.modalButton} onClick={handleReset}>
                收下这份温柔 💕
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
