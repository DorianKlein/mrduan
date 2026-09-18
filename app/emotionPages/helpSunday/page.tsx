"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { Gavel, FileWarning, Stamp, X } from "lucide-react";
import styles from "./helpSunday.module.css";

type CaseFile = {
  id: string;
  title: string;
  reason: string;
  verdict: string;
};

type FloatText = {
  id: number;
  x: number;
  y: number;
  text: string;
};

const CASE_FILES: CaseFile[] = [
  {
    id: "01",
    title: "案卷 01 · 闹钟袭警案",
    reason: "案由：受害者清晨被闹钟殴打，精神当场离职。",
    verdict: "判决：准许今日带薪发呆 45 分钟，用以抵扣精神损耗。",
  },
  {
    id: "02",
    title: "案卷 02 · 日历提前入职案",
    reason: "案由：经查，是下周一蓄谋已久，串通日历提前入职。",
    verdict: "判决：今日所有工作汇报一律使用“收到”回复，严禁加感叹号。",
  },
  {
    id: "03",
    title: "案卷 03 · 咖啡因失效案",
    reason: "案由：咖啡因在周日失效，脑干进入省电模式。",
    verdict: "判决：立即前往茶水间带薪静止 10 分钟，严禁伪装忙碌。",
  },
  {
    id: "04",
    title: "案卷 04 · 周末被调休绑架案",
    reason: "案由：本该赖床的灵魂，被通知强行安装进工位。",
    verdict: "判决：允许每小时合法摸鱼一次，时长不少于摸鱼说明书规定。",
  },
  {
    id: "05",
    title: "案卷 05 · 群消息连环轰炸案",
    reason: "案由：工作群于非社交时间连续 @ 全员，构成情绪噪音污染。",
    verdict: "判决：今日免读长语音，免写周报，免假装已读未回心虚。",
  },
];

const TAG_OPTIONS = [
  { id: "blank", label: "眼神涣散属正常现象" },
  { id: "body", label: "今日仅提供肉体展示服务" },
  { id: "soul", label: "灵魂已回卧室补觉" },
] as const;

const GAVEL_TEXTS = ["工伤+1", "怨气-1", "周末夺回0.1%", "准许发呆", "灵魂下班", "收到。", "心理抚恤金到账"];

const buzz = (pattern: number | number[] = 12) => {
  if (typeof window !== "undefined" && "vibrate" in navigator) {
    try {
      navigator.vibrate(pattern);
    } catch {
      /* ignore */
    }
  }
};

export default function HelpSundayPage() {
  const [caseIndex, setCaseIndex] = useState(0);
  const [drawn, setDrawn] = useState(false);
  const [flipping, setFlipping] = useState(false);
  const [displayCase, setDisplayCase] = useState<CaseFile | null>(null);

  const [name, setName] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>(["soul"]);
  const [showPermit, setShowPermit] = useState(false);
  const [issuedAt, setIssuedAt] = useState("");
  const [permitNo, setPermitNo] = useState("");

  const [gavelHit, setGavelHit] = useState(false);
  const [floatTexts, setFloatTexts] = useState<FloatText[]>([]);
  const nextFloatId = useRef(1);
  const flipTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const spinTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const gavelTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.title = "周末被窃听证会 | 法庭档案局";
    const meta = document.querySelector<HTMLMetaElement>('meta[name="viewport"]');
    const old = meta?.content;
    if (meta) {
      meta.content =
        "width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no,viewport-fit=cover";
    }
    return () => {
      if (meta && old) meta.content = old;
      if (flipTimer.current) clearTimeout(flipTimer.current);
      if (spinTimer.current) clearInterval(spinTimer.current);
      if (gavelTimer.current) clearTimeout(gavelTimer.current);
    };
  }, []);

  const drawCase = useCallback(() => {
    if (flipping) return;
    buzz([10, 30, 16]);
    setFlipping(true);
    setDrawn(true);

    let ticks = 0;
    if (spinTimer.current) clearInterval(spinTimer.current);
    spinTimer.current = setInterval(() => {
      ticks += 1;
      setCaseIndex((prev) => (prev + 1) % CASE_FILES.length);
      if (ticks >= 8) {
        if (spinTimer.current) clearInterval(spinTimer.current);
        const final = Math.floor(Math.random() * CASE_FILES.length);
        setCaseIndex(final);
        setDisplayCase(CASE_FILES[final]);
        flipTimer.current = setTimeout(() => setFlipping(false), 280);
      }
    }, 90);
  }, [flipping]);

  const toggleTag = (id: string) => {
    setSelectedTags((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id],
    );
  };

  const issuePermit = () => {
    buzz([18, 40, 24]);
    const now = new Date();
    const stamp = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, "0")}.${String(now.getDate()).padStart(2, "0")} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
    setIssuedAt(stamp);
    setPermitNo(`HS-${String(now.getTime()).slice(-6)}`);
    setShowPermit(true);
  };

  const hitGavel = (event: React.PointerEvent<HTMLButtonElement>) => {
    buzz(8);
    setGavelHit(true);
    if (gavelTimer.current) clearTimeout(gavelTimer.current);
    gavelTimer.current = setTimeout(() => setGavelHit(false), 320);

    const stage = stageRef.current;
    if (!stage) return;
    const rect = stage.getBoundingClientRect();
    const id = nextFloatId.current++;
    const text = GAVEL_TEXTS[Math.floor(Math.random() * GAVEL_TEXTS.length)];
    const x = Math.min(Math.max(event.clientX - rect.left, 48), rect.width - 48);
    const y = Math.min(Math.max(event.clientY - rect.top - 24, 40), rect.height - 80);

    setFloatTexts((current) => [...current.slice(-4), { id, x, y, text }]);
    window.setTimeout(() => {
      setFloatTexts((current) => current.filter((item) => item.id !== id));
    }, 1200);
  };

  const activeCase =
    flipping || !displayCase ? CASE_FILES[caseIndex] : displayCase;
  const applicant = name.trim() || "摸鱼特派员";
  const tagLabels = TAG_OPTIONS.filter((t) => selectedTags.includes(t.id)).map((t) => t.label);

  return (
    <main className={styles.page} ref={stageRef}>
      <div className={styles.shell}>
        <header className={styles.header}>
          <p className={styles.badge}>档案局 · 特别法庭</p>
          <h1 className={styles.title}>【2026特别法庭 · 周日被窃听证会】</h1>
          <div className={styles.statusRow}>
            <span className={styles.capsule}>
              庭审状态：正在审理「周日变周一」特大盗窃案
            </span>
            <span className={`${styles.capsule} ${styles.capsuleAlert}`}>
              工位怨气指数：99.9% 严重超标
            </span>
          </div>
          <p className={styles.subtitle}>
            肉体出勤属民事不可抗力，本庭准许灵魂即刻下班。
          </p>
        </header>

        <section className={styles.section} aria-label="抽取被窃案卷">
          <div className={styles.sectionHead}>
            <FileWarning size={18} strokeWidth={2.2} />
            <h2> 随机抽取【被窃案卷】</h2>
          </div>

          <div className={`${styles.envelope} ${flipping ? styles.envelopeFlip : ""}`}>
            <div className={styles.envelopeCorner} />
            <div className={styles.envelopeStamp}>密</div>
            <p className={styles.envelopeLabel}>
              {drawn ? activeCase.title : "折角文件袋 · 待提起公诉"}
            </p>
            {drawn ? (
              <div className={styles.caseBody}>
                <p className={styles.caseReason}>{activeCase.reason}</p>
                <p className={styles.caseVerdict}>{activeCase.verdict}</p>
              </div>
            ) : (
              <p className={styles.casePlaceholder}>
                点下方按钮，本庭当场拆封一份荒谬正义。
              </p>
            )}
            <div className={styles.dashedLine} />
            <p className={styles.caseMeta}>NO.{activeCase.id} / 法庭档案局 · 临时特别法庭</p>
          </div>

          <button
            type="button"
            className={styles.primaryBtn}
            onClick={drawCase}
            disabled={flipping}
          >
            提起公诉 / 抽取案卷
          </button>
        </section>

        <section className={styles.section} aria-label="精神离线特批凭证">
          <div className={styles.sectionHead}>
            <Stamp size={18} strokeWidth={2.2} />
            <h2>《精神离线特批凭证》</h2>
          </div>

          <label className={styles.field}>
            <span>申诉人姓名 / 工号</span>
            <input
              className={styles.input}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="摸鱼特派员"
              maxLength={16}
              enterKeyHint="done"
            />
          </label>

          <div className={styles.tags}>
            <p className={styles.tagsHint}>快捷勾选（可多选）</p>
            <div className={styles.tagGrid}>
              {TAG_OPTIONS.map((tag) => {
                const active = selectedTags.includes(tag.id);
                return (
                  <button
                    key={tag.id}
                    type="button"
                    className={`${styles.tag} ${active ? styles.tagActive : ""}`}
                    onClick={() => toggleTag(tag.id)}
                    aria-pressed={active}
                  >
                    {tag.label}
                  </button>
                );
              })}
            </div>
          </div>

          <button type="button" className={styles.primaryBtn} onClick={issuePermit}>
            盖章签发特批条
          </button>
        </section>

        <p className={styles.footerNote}>
          本庭判决仅供情绪消费，不具劳动法效力；但具工位共鸣效力。
        </p>
      </div>

      <button
        type="button"
        className={`${styles.gavelBtn} ${gavelHit ? styles.gavelHit : ""}`}
        onPointerDown={hitGavel}
        aria-label="敲法槌解气"
      >
        <Gavel size={22} strokeWidth={2.25} />
        <span>敲法槌解气</span>
      </button>

      {floatTexts.map((item) => (
        <div
          key={item.id}
          className={styles.floatText}
          style={{ left: item.x, top: item.y }}
        >
          {item.text}
        </div>
      ))}

      {showPermit && (
        <div
          className={styles.modalOverlay}
          onClick={() => setShowPermit(false)}
          role="presentation"
        >
          <div
            className={styles.modal}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="精神离线特批凭证"
          >
            <button
              type="button"
              className={styles.closeBtn}
              onClick={() => setShowPermit(false)}
              aria-label="关闭"
            >
              <X size={18} />
            </button>

            <article className={styles.permitCard}>
              <div className={styles.permitTop}>
                <p>2026特别法庭 · 档案局签发</p>
                <h3>精神离线特批凭证</h3>
              </div>

              <dl className={styles.permitMeta}>
                <div>
                  <dt>申诉人</dt>
                  <dd>{applicant}</dd>
                </div>
                <div>
                  <dt>签发时间</dt>
                  <dd>{issuedAt}</dd>
                </div>
                <div>
                  <dt>案由摘要</dt>
                  <dd>周日被窃，被迫肉体出勤</dd>
                </div>
              </dl>

              <ul className={styles.permitTags}>
                {(tagLabels.length ? tagLabels : ["本庭默认：灵魂已提前下班"]).map((label) => (
                  <li key={label}>{label}</li>
                ))}
              </ul>

              <p className={styles.permitText}>
                经本庭一本正经审查：当事人肉体可继续坐班展示，灵魂即刻获准离线。
                任何催促、无意义 @、虚假紧急，一律视为无效干扰。
              </p>

              <div className={styles.permitFooter}>
                <span>法庭档案局 · 情绪部</span>
                <span>编号 {permitNo || "HS-000000"}</span>
              </div>

              <div className={styles.seal} aria-hidden="true">
                <svg viewBox="0 0 120 120" width="108" height="108">
                  <circle cx="60" cy="60" r="54" fill="none" stroke="#E53E3E" strokeWidth="3.5" />
                  <circle cx="60" cy="60" r="46" fill="none" stroke="#E53E3E" strokeWidth="1.5" />
                  <circle cx="60" cy="60" r="8" fill="#E53E3E" opacity="0.85" />
                  <text
                    x="60"
                    y="42"
                    textAnchor="middle"
                    fill="#E53E3E"
                    fontSize="13"
                    fontWeight="700"
                    letterSpacing="1"
                  >
                    精神准休
                  </text>
                  <text
                    x="60"
                    y="88"
                    textAnchor="middle"
                    fill="#E53E3E"
                    fontSize="11"
                    fontWeight="700"
                    letterSpacing="1"
                  >
                    立即生效
                  </text>
                </svg>
              </div>
            </article>

            <p className={styles.saveHint}>长按截图或保存，转发给周日同样在受苦的工友</p>
          </div>
        </div>
      )}
    </main>
  );
}
