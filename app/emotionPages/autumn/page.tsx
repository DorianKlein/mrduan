"use client";

import React, { useState, useEffect, useRef } from "react";

const MILK_TEAS = [
  { name: "珍珠奶茶", color: "#D4A574", toppingColor: "#3D2B1F", accent: "#8B6914", straw: "#E85D75" },
  { name: "芋泥啵啵", color: "#C9A0DC", toppingColor: "#6B4D8A", accent: "#9B7CB8", straw: "#FF69B4" },
  { name: "杨枝甘露", color: "#FFD180", toppingColor: "#E88B00", accent: "#F5A623", straw: "#4CAF50" },
  { name: "草莓摇摇", color: "#FFB2C1", toppingColor: "#C94058", accent: "#E85D75", straw: "#FF1744" },
  { name: "抹茶拿铁", color: "#A5D6A7", toppingColor: "#558B2F", accent: "#7CB342", straw: "#33691E" },
];

function MilkTeaSVG({ tea }: { tea: typeof MILK_TEAS[number] }) {
  return (
    <svg viewBox="0 0 80 120" width="80" height="120" style={{ filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.2))" }}>
      <defs>
        <linearGradient id={`cup-${tea.name}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.3)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </linearGradient>
        <linearGradient id={`tea-${tea.name}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={tea.color} />
          <stop offset="100%" stopColor={tea.accent} />
        </linearGradient>
      </defs>
      <path d="M20 30 L18 105 Q18 112 25 112 L55 112 Q62 112 62 105 L60 30 Z" fill="rgba(255,255,255,0.9)" stroke="#E0E0E0" strokeWidth="1" />
      <path d="M22 45 L20 103 Q20 108 26 108 L54 108 Q60 108 60 103 L58 45 Z" fill={`url(#tea-${tea.name})`} />
      <path d="M24 45 L23 100 Q23 104 27 104 L35 104 L36 45 Z" fill={`url(#cup-${tea.name})`} />
      <circle cx="32" cy="98" r="4" fill={tea.toppingColor} opacity="0.8" />
      <circle cx="42" cy="100" r="3.5" fill={tea.toppingColor} opacity="0.9" />
      <circle cx="50" cy="97" r="4" fill={tea.toppingColor} opacity="0.7" />
      <circle cx="37" cy="93" r="3" fill={tea.toppingColor} opacity="0.6" />
      <circle cx="47" cy="92" r="3.5" fill={tea.toppingColor} opacity="0.8" />
      <circle cx="29" cy="91" r="3" fill={tea.toppingColor} opacity="0.5" />
      <rect x="16" y="26" width="48" height="8" rx="4" fill="#fff" stroke="#ccc" strokeWidth="0.8" />
      <path d="M25 26 Q40 18 55 26" fill="#fff" stroke="#ccc" strokeWidth="0.8" />
      <rect x="43" y="8" width="4" height="32" rx="2" fill={tea.straw} />
      <ellipse cx="45" cy="8" rx="3" ry="1.5" fill={tea.straw} />
      <ellipse cx="56" cy="60" rx="2" ry="3" fill="rgba(255,255,255,0.5)" />
      <ellipse cx="54" cy="75" rx="1.5" ry="2.5" fill="rgba(255,255,255,0.4)" />
      <ellipse cx="25" cy="68" rx="1.5" ry="2" fill="rgba(255,255,255,0.3)" />
    </svg>
  );
}

type Phase = "idle" | "inserting" | "dispensing" | "done";

export default function AutumnVendingPage() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [selectedTea, setSelectedTea] = useState(MILK_TEAS[0]);
  const [showModal, setShowModal] = useState(false);
  const [coinY, setCoinY] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    document.title = "立秋快乐";
    setSelectedTea(MILK_TEAS[Math.floor(Math.random() * MILK_TEAS.length)]);
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleInsertCoin = () => {
    if (phase !== "idle") return;
    setSelectedTea(MILK_TEAS[Math.floor(Math.random() * MILK_TEAS.length)]);
    setPhase("inserting");
    setCoinY(0);

    const coinDuration = 800;
    const start = Date.now();
    const animateCoin = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / coinDuration, 1);
      setCoinY(progress * 100);
      if (progress < 1) {
        requestAnimationFrame(animateCoin);
      } else {
        setPhase("dispensing");
        timerRef.current = setTimeout(() => {
          setPhase("done");
          timerRef.current = setTimeout(() => {
            setShowModal(true);
          }, 1000);
        }, 1200);
      }
    };
    requestAnimationFrame(animateCoin);
  };

  const handleReset = () => {
    setShowModal(false);
    setPhase("idle");
    setCoinY(0);
  };

  return (
    <main style={mainStyle}>
      <div style={containerStyle}>
        <div style={machineStyle}>
          {/* Machine top */}
          <div style={machineTopStyle}>
            <span style={machineTitleStyle}>立秋贩卖机</span>
          </div>

          {/* Display window - mystery style */}
          <div style={displayWindowStyle}>
            <div style={mysteryDisplayStyle}>
              <span style={questionMarkStyle}>?</span>
              <p style={mysteryTextStyle}>投个硬币看看</p>
            </div>
          </div>

          {/* Coin slot area */}
          <div style={coinAreaStyle}>
            <div style={coinSlotStyle}>
              <div style={coinSlotInnerStyle} />
              {phase === "inserting" && (
                <div
                  style={{
                    ...coinStyle,
                    transform: `translateY(${coinY}%)`,
                    opacity: 1 - coinY / 100,
                  }}
                />
              )}
            </div>
            <span style={coinLabelStyle}>投币口</span>
          </div>

          {/* Pickup area */}
          <div style={pickupAreaStyle}>
            <div style={pickupSlotStyle}>
              {(phase === "dispensing" || phase === "done") && (
                <div
                  style={{
                    ...dispensedCupWrapStyle,
                    animation: phase === "dispensing" ? "dropDown 0.8s ease-out forwards" : "none",
                    transform: phase === "done" ? "translateY(0)" : undefined,
                    opacity: phase === "done" ? 1 : undefined,
                  }}
                >
                  <MilkTeaSVG tea={selectedTea} />
                  <span style={cupNameStyle}>{selectedTea.name}</span>
                </div>
              )}
            </div>
            <span style={pickupLabelStyle}>取货口</span>
          </div>
        </div>

        {/* Insert coin button */}
        {phase === "idle" && (
          <button style={insertButtonStyle} onClick={handleInsertCoin}>
            <span style={coinIconStyle}>🪙</span> 投入硬币
          </button>
        )}

        {phase === "inserting" && (
          <p style={statusTextStyle}>硬币投入中...</p>
        )}

        {phase === "dispensing" && (
          <p style={statusTextStyle}>正在出货...</p>
        )}

        {phase === "done" && !showModal && (
          <p style={statusTextStyle}>叮！你的{selectedTea.name}来啦</p>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div style={modalOverlayStyle} onClick={handleReset}>
          <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
            <div style={modalEmojiStyle}>🍂🧋🍁</div>
            <h2 style={modalTitleStyle}>立秋快乐</h2>
            <div style={modalTeaStyle}>
              <MilkTeaSVG tea={selectedTea} />
            </div>
            <p style={modalMessageStyle}>
              秋天的第一杯奶茶来啦！<br />
              今日份的温暖是一杯「{selectedTea.name}」<br />
              <br />
              愿这个秋天，<br />
              所有的美好都如期而至。
            </p>
            <button style={modalButtonStyle} onClick={handleReset}>
              再来一杯 🧋
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes dropDown {
          0% { transform: translateY(-120%); opacity: 0; }
          60% { transform: translateY(10%); opacity: 1; }
          80% { transform: translateY(-5%); }
          100% { transform: translateY(0); opacity: 1; }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 0.6; }
          50% { transform: scale(1.1); opacity: 1; }
        }
      `}</style>
    </main>
  );
}

// --- Styles ---

const mainStyle: React.CSSProperties = {
  minHeight: "100dvh",
  background: "linear-gradient(180deg, #FFF3E0 0%, #FFE0B2 50%, #FFCC80 100%)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "24px 16px",
  fontFamily: "'PingFang SC', 'Hiragino Sans GB', sans-serif",
};

const containerStyle: React.CSSProperties = {
  width: "100%",
  maxWidth: "360px",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "24px",
};

const machineStyle: React.CSSProperties = {
  width: "100%",
  background: "linear-gradient(135deg, #D84315 0%, #BF360C 100%)",
  borderRadius: "24px",
  padding: "20px",
  boxShadow: "0 20px 60px rgba(0,0,0,0.3), inset 0 2px 0 rgba(255,255,255,0.1)",
  display: "flex",
  flexDirection: "column",
  gap: "16px",
  position: "relative",
  overflow: "hidden",
};

const machineTopStyle: React.CSSProperties = {
  textAlign: "center",
  padding: "8px 0",
};

const machineTitleStyle: React.CSSProperties = {
  fontSize: "20px",
  fontWeight: 700,
  color: "#FFF8E1",
  letterSpacing: "4px",
  textShadow: "0 2px 4px rgba(0,0,0,0.3)",
};

const displayWindowStyle: React.CSSProperties = {
  background: "linear-gradient(180deg, #263238 0%, #37474F 100%)",
  borderRadius: "16px",
  padding: "24px 16px",
  border: "3px solid #455A64",
  boxShadow: "inset 0 4px 12px rgba(0,0,0,0.4)",
};

const mysteryDisplayStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "12px",
};

const questionMarkStyle: React.CSSProperties = {
  fontSize: "48px",
  color: "#FFD54F",
  fontWeight: 700,
  animation: "pulse 2s ease-in-out infinite",
  textShadow: "0 0 20px rgba(255,213,79,0.5)",
};

const mysteryTextStyle: React.CSSProperties = {
  fontSize: "14px",
  color: "#B0BEC5",
  textAlign: "center",
  margin: 0,
  lineHeight: 1.6,
};

const coinAreaStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "12px",
  padding: "0 8px",
};

const coinSlotStyle: React.CSSProperties = {
  width: "40px",
  height: "56px",
  background: "#212121",
  borderRadius: "8px",
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "center",
  paddingTop: "8px",
  position: "relative",
  overflow: "hidden",
  boxShadow: "inset 0 2px 8px rgba(0,0,0,0.5)",
};

const coinSlotInnerStyle: React.CSSProperties = {
  width: "24px",
  height: "4px",
  background: "#424242",
  borderRadius: "2px",
  boxShadow: "inset 0 1px 2px rgba(0,0,0,0.5)",
};

const coinStyle: React.CSSProperties = {
  position: "absolute",
  top: "8px",
  width: "20px",
  height: "20px",
  borderRadius: "50%",
  background: "linear-gradient(135deg, #FFD700, #FFA000)",
  boxShadow: "0 2px 4px rgba(0,0,0,0.3)",
};

const coinLabelStyle: React.CSSProperties = {
  fontSize: "13px",
  color: "#FFCCBC",
  fontWeight: 500,
};

const pickupAreaStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "8px",
};

const pickupSlotStyle: React.CSSProperties = {
  width: "100%",
  height: "140px",
  background: "#1B1B1B",
  borderRadius: "12px",
  display: "flex",
  alignItems: "flex-end",
  justifyContent: "center",
  padding: "8px 12px",
  boxShadow: "inset 0 4px 12px rgba(0,0,0,0.6)",
  overflow: "hidden",
  position: "relative",
};

const pickupLabelStyle: React.CSSProperties = {
  fontSize: "12px",
  color: "#FFCCBC",
};

const dispensedCupWrapStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "4px",
};

const cupNameStyle: React.CSSProperties = {
  fontSize: "12px",
  color: "#fff",
  whiteSpace: "nowrap",
  fontWeight: 500,
};

const insertButtonStyle: React.CSSProperties = {
  padding: "16px 40px",
  fontSize: "18px",
  fontWeight: 600,
  color: "#fff",
  background: "linear-gradient(135deg, #FF8F00, #F57C00)",
  border: "none",
  borderRadius: "50px",
  cursor: "pointer",
  boxShadow: "0 8px 24px rgba(245,124,0,0.4)",
  transition: "transform 0.2s, box-shadow 0.2s",
  display: "flex",
  alignItems: "center",
  gap: "8px",
};

const coinIconStyle: React.CSSProperties = {
  fontSize: "22px",
};

const statusTextStyle: React.CSSProperties = {
  fontSize: "16px",
  color: "#BF360C",
  fontWeight: 500,
  textAlign: "center",
};

const modalOverlayStyle: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.6)",
  backdropFilter: "blur(4px)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "24px",
  zIndex: 1000,
};

const modalStyle: React.CSSProperties = {
  background: "linear-gradient(135deg, #FFF8E1, #FFFFFF)",
  borderRadius: "24px",
  padding: "32px 24px",
  maxWidth: "320px",
  width: "100%",
  textAlign: "center",
  boxShadow: "0 24px 80px rgba(0,0,0,0.3)",
  animation: "fadeInUp 0.4s ease-out",
};

const modalEmojiStyle: React.CSSProperties = {
  fontSize: "36px",
  marginBottom: "12px",
};

const modalTitleStyle: React.CSSProperties = {
  fontSize: "28px",
  fontWeight: 700,
  color: "#E65100",
  marginBottom: "12px",
};

const modalTeaStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "center",
  marginBottom: "12px",
};

const modalMessageStyle: React.CSSProperties = {
  fontSize: "15px",
  color: "#5D4037",
  lineHeight: 1.8,
  marginBottom: "24px",
};

const modalButtonStyle: React.CSSProperties = {
  padding: "12px 32px",
  fontSize: "16px",
  fontWeight: 600,
  color: "#fff",
  background: "linear-gradient(135deg, #FF8F00, #F57C00)",
  border: "none",
  borderRadius: "50px",
  cursor: "pointer",
  boxShadow: "0 4px 16px rgba(245,124,0,0.3)",
};
