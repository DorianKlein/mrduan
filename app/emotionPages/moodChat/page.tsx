"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./moodChat.module.css";

type Mood = "happy" | "sad" | "anxious" | "calm" | "tired" | "neutral";

type ChatMessage = {
  id: number;
  type: "bot" | "user";
  content: string;
  mood?: Mood;
  timestamp: Date;
};

const MOOD_OPTIONS: { value: Mood; emoji: string; label: string; color: string }[] = [
  { value: "happy", emoji: "😊", label: "开心", color: "#FFD93D" },
  { value: "sad", emoji: "😢", label: "难过", color: "#6BCB77" },
  { value: "anxious", emoji: "😰", label: "焦虑", color: "#FF6B9D" },
  { value: "calm", emoji: "😌", label: "平静", color: "#95E1D3" },
  { value: "tired", emoji: "😫", label: "疲惫", color: "#A78BFA" },
  { value: "neutral", emoji: "😐", label: "一般", color: "#94A3B8" },
];

const MOOD_RESPONSES: Record<Mood, string[]> = {
  happy: [
    "太好了！看到你开心我也很开心 ✨",
    "继续保持这份好心情吧！",
    "开心的时候记得多拍照哦 📸",
    "愿这份快乐能持续更久 🌈",
  ],
  sad: [
    "抱抱你 🫂 难过的时候让自己哭出来也没关系",
    "一切都会过去的，给自己一些时间",
    "你已经很勇敢了，不要太苛责自己",
    "要不要听听音乐或者出去走走？",
  ],
  anxious: [
    "深呼吸，慢慢来 🌬️",
    "焦虑是正常的情绪，不要害怕它",
    "试着把担心的事情写下来，也许会轻松一些",
    "记住：你比想象中更有能力应对困难",
  ],
  calm: [
    "平静是一种珍贵的状态 🍃",
    "享受这份宁静的时刻吧",
    "这种感觉真好，好好珍惜",
    "平静的心更能看清事物的本质",
  ],
  tired: [
    "辛苦了！要不要休息一下？ ☁️",
    "累了就停下来吧，休息不是浪费时间",
    "给自己放个假，你值得好好休息",
    "疲惫是身体在提醒你：该照顾自己了",
  ],
  neutral: [
    "平平淡淡也是生活的一部分",
    "有时候不需要特别的情绪，只是存在就好",
    "今天做了什么小事情吗？",
    "平凡的日子也值得被记录 📝",
  ],
};

const FOLLOW_UP_QUESTIONS = [
  "今天发生了什么好事吗？",
  "想聊聊最近的烦恼吗？",
  "有什么想要分享的吗？",
  "需要一些鼓励的话吗？",
  "要不要听个小故事？",
  "想要一句温暖的话吗？",
];

const WARM_MESSAGES = [
  "你已经做得很好了 💫",
  "每一天都是新的开始",
  "小确幸也是幸福",
  "允许自己不完美",
  "你比想象中更坚强",
  "慢慢来，比较快 🌱",
  "给自己一个拥抱",
  "明天会更好的",
  "你值得被温柔以待",
  "休息一下也没关系",
];

export default function MoodChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 0,
      type: "bot",
      content: "你好呀 👋 我是你的情绪小助手\n\n今天的心情怎么样？",
      timestamp: new Date(),
    },
  ]);
  const [selectedMood, setSelectedMood] = useState<Mood | null>(null);
  const [showMoodSelector, setShowMoodSelector] = useState(true);
  const [showQuickReplies, setShowQuickReplies] = useState(false);
  const [quickReplies, setQuickReplies] = useState<string[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const nextMessageId = useRef(1);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    document.title = "心情聊天室 · 情绪陪伴";
  }, []);

  const addMessage = (type: "bot" | "user", content: string, mood?: Mood) => {
    const newMessage: ChatMessage = {
      id: nextMessageId.current++,
      type,
      content,
      mood,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, newMessage]);
  };

  const sendBotMessage = (content: string, delay: number = 800) => {
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      addMessage("bot", content);
    }, delay);
  };

  const handleMoodSelect = (mood: Mood) => {
    setSelectedMood(mood);
    setShowMoodSelector(false);

    const moodOption = MOOD_OPTIONS.find((m) => m.value === mood);
    addMessage("user", `${moodOption?.emoji} ${moodOption?.label}`, mood);

    const responses = MOOD_RESPONSES[mood];
    const response = responses[Math.floor(Math.random() * responses.length)];
    
    sendBotMessage(response);

    setTimeout(() => {
      const shuffled = [...FOLLOW_UP_QUESTIONS].sort(() => Math.random() - 0.5);
      setQuickReplies(shuffled.slice(0, 3));
      setShowQuickReplies(true);
    }, 1500);
  };

  const handleQuickReply = (reply: string) => {
    addMessage("user", reply);
    setShowQuickReplies(false);

    if (reply.includes("鼓励") || reply.includes("温暖")) {
      const warmMsg = WARM_MESSAGES[Math.floor(Math.random() * WARM_MESSAGES.length)];
      sendBotMessage(warmMsg);
    } else if (reply.includes("故事")) {
      sendBotMessage("从前有一只小猫，它每天都会对着镜子说：\n\n「今天的我也很可爱！」🐱\n\n后来它发现，自信真的能让生活变得更美好。");
    } else {
      const responses = [
        "我一直在这里陪着你 💙",
        "无论发生什么，都要记得照顾好自己",
        "你的感受都是valid的，不需要隐藏",
        "每一个情绪都值得被看见和接纳",
        "有我陪着你呢 🌟",
      ];
      const response = responses[Math.floor(Math.random() * responses.length)];
      sendBotMessage(response);
    }

    setTimeout(() => {
      const shuffled = [...FOLLOW_UP_QUESTIONS].sort(() => Math.random() - 0.5);
      setQuickReplies(shuffled.slice(0, 3));
      setShowQuickReplies(true);
    }, 1500);
  };

  const handleReset = () => {
    setMessages([
      {
        id: 0,
        type: "bot",
        content: "你好呀 👋 我是你的情绪小助手\n\n今天的心情怎么样？",
        timestamp: new Date(),
      },
    ]);
    setSelectedMood(null);
    setShowMoodSelector(true);
    setShowQuickReplies(false);
    nextMessageId.current = 1;
  };

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>心情聊天室</h1>
          <p className={styles.subtitle}>MOOD CHAT</p>
        </div>
        <button className={styles.resetBtn} onClick={handleReset} aria-label="重新开始">
          ↻
        </button>
      </header>

      <div className={styles.chatContainer}>
        <div className={styles.messagesWrapper}>
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`${styles.message} ${
                msg.type === "bot" ? styles.botMessage : styles.userMessage
              }`}
            >
              <div className={styles.messageContent}>
                <div className={styles.messageBubble}>
                  {msg.content.split('\n').map((line, i) => (
                    <p key={i}>{line}</p>
                  ))}
                </div>
                <span className={styles.messageTime}>
                  {msg.timestamp.toLocaleTimeString("zh-CN", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className={`${styles.message} ${styles.botMessage}`}>
              <div className={styles.messageContent}>
                <div className={styles.messageBubble}>
                  <div className={styles.typingIndicator}>
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {showMoodSelector && (
          <div className={styles.moodSelector}>
            <p className={styles.moodPrompt}>选择你的心情：</p>
            <div className={styles.moodGrid}>
              {MOOD_OPTIONS.map((mood) => (
                <button
                  key={mood.value}
                  className={styles.moodButton}
                  onClick={() => handleMoodSelect(mood.value)}
                  style={{ "--mood-color": mood.color } as React.CSSProperties}
                >
                  <span className={styles.moodEmoji}>{mood.emoji}</span>
                  <span className={styles.moodLabel}>{mood.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {showQuickReplies && (
          <div className={styles.quickReplies}>
            {quickReplies.map((reply, index) => (
              <button
                key={index}
                className={styles.quickReplyBtn}
                onClick={() => handleQuickReply(reply)}
              >
                {reply}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className={styles.floatingHeart}>💝</div>
    </main>
  );
}
