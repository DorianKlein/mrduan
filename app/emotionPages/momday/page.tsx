"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, useInView } from "framer-motion";

import pic1 from "./components/pic/1.webp";
import pic2 from "./components/pic/2.webp";
import pic3 from "./components/pic/3.webp";
import pic4 from "./components/pic/4.webp";
import pic5 from "./components/pic/5.webp";

const backgrounds = [
  pic1.src,
  pic2.src,
  pic3.src,
  pic4.src,
  pic5.src,
];


const TodoItem = ({ text, index, isVisible }: { text: string; index: number; isVisible: boolean }) => {
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (isVisible) {
      // Delay before the auto-check sequence starts
      const initialDelay = 1000 + 3 * 300; // Let text fade in first
      const checkTimeout = setTimeout(() => {
        setChecked(true);
      }, initialDelay + index * 800);

      return () => clearTimeout(checkTimeout);
    } else {
      setChecked(false);
    }
  }, [isVisible, index]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ delay: index * 0.3, duration: 0.8 }}
      className="flex items-center gap-4 text-base md:text-xl text-white drop-shadow-md bg-black/20 p-4 rounded-xl mb-3 backdrop-blur-sm"
    >
      <div className="w-8 h-8 rounded-full border-2 border-white/60 flex items-center justify-center shrink-0">
        {checked && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="w-5 h-5 rounded-full bg-green-400 flex items-center justify-center"
          >
            <svg
              className="w-3 h-3 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </motion.div>
        )}
      </div>
      <span className={checked ? "line-through text-white/70 transition-all duration-500" : "transition-all duration-500"}>
        {text}
      </span>
    </motion.div>
  );
};

const Section = ({ bgIndex, children }: { bgIndex: number; children: React.ReactNode }) => {
  return (
    <section
      className="h-[100vh] w-full snap-start snap-always relative flex flex-col items-center justify-center px-6 text-center bg-cover bg-center overflow-hidden"
      style={{ backgroundImage: `url('${backgrounds[bgIndex]}')` }}
    >
      <div className="absolute inset-0 bg-black/30 z-0 pointer-events-none" />
      <div className="relative z-10 w-full h-full max-w-2xl flex flex-col items-center justify-center">
        {children}
      </div>
    </section>
  );
};

export default function MomDayPage() {
  const section4Ref = useRef(null);
  const isSection4InView = useInView(section4Ref, { amount: 0.5 });

  useEffect(() => {
    document.title = "母亲节快乐！";
  }, []);

  const todos = [
    "听她聊聊过去的八卦",
    "陪她去散散步、买买菜",
    "为她做一顿简单的饭",
  ];

  return (
    <main className="h-[100vh] w-full overflow-y-scroll snap-y snap-mandatory bg-black">
      {/* Section 1 */}
      <Section bgIndex={0}>
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          viewport={{ once: false, amount: 0.8 }}
          className="text-3xl md:text-6xl font-serif text-white mb-6 drop-shadow-xl"
        >
          还记得吗？
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
          viewport={{ once: false, amount: 0.8 }}
          className="text-base md:text-2xl text-white/90 font-light drop-shadow-lg leading-relaxed"
        >
          在成为妈妈之前，<br className="md:hidden" />她也曾是谁家被宠爱的小女孩。
        </motion.p>
        
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          className="absolute bottom-12 flex flex-col items-center opacity-70"
        >
          <svg className="w-6 h-6 text-white drop-shadow-md mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
          <span className="text-sm text-white font-light tracking-widest drop-shadow-md">向下滑动，翻开时光</span>
        </motion.div>
      </Section>

      {/* Section 2 */}
      <Section bgIndex={1}>
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          viewport={{ once: false, amount: 0.8 }}
          className="text-2xl md:text-5xl font-serif text-white mb-6 drop-shadow-xl leading-tight"
        >
          后来，她收起了漂亮的裙子，<br />学着做一个无所不能的超人。
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
          viewport={{ once: false, amount: 0.8 }}
          className="text-base md:text-2xl text-white/90 font-light drop-shadow-lg leading-relaxed"
        >
          岁月偷走了她的少女感，<br className="md:hidden" />却把最温柔的底色留给了你。
        </motion.p>
      </Section>

      {/* Section 3 */}
      <Section bgIndex={2}>
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          viewport={{ once: false, amount: 0.8 }}
          className="text-2xl md:text-5xl font-serif text-white mb-6 drop-shadow-xl leading-tight"
        >
          现在，她的爱变成了<br className="md:hidden" />那些你耳熟能详的唠叨……
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
          viewport={{ once: false, amount: 0.8 }}
          className="text-base md:text-2xl text-white/90 font-light drop-shadow-lg leading-relaxed mb-10"
        >
          以前总觉得好烦，现在听着却有点想哭。
        </motion.p>
      </Section>

      {/* Section 4 */}
      <Section bgIndex={3}>
        <div ref={section4Ref} className="w-full h-full flex flex-col items-center justify-center">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={isSection4InView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 1 }}
            className="text-2xl md:text-5xl font-serif text-white mb-4 drop-shadow-xl leading-tight"
          >
            爱不仅是回忆，<br className="md:hidden" />更是此刻的陪伴。
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={isSection4InView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="text-base md:text-2xl text-white/90 font-light drop-shadow-lg leading-relaxed mb-12"
          >
            放下手机，去陪她做这些小事吧。
          </motion.p>

          <div className="w-full max-w-sm text-left flex flex-col">
            {todos.map((text, index) => (
              <TodoItem key={index} text={text} index={index} isVisible={isSection4InView} />
            ))}
          </div>
        </div>
      </Section>

      {/* Section 5 */}
      <Section bgIndex={4}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          viewport={{ once: false, amount: 0.8 }}
          className="flex flex-col items-center mt-[15vh]"
        >
          <p className="text-xl md:text-3xl text-white/90 font-light mb-6 tracking-wide drop-shadow-xl">
            去见她，或者打个电话吧。
          </p>
          <h1 className="text-3xl md:text-6xl lg:text-7xl font-serif text-white drop-shadow-2xl leading-tight">
            祝妈妈，<br className="md:hidden" />也祝那个曾经<br className="md:hidden" />热爱自由的小女孩——<br className="md:hidden" />母亲节快乐
          </h1>
        </motion.div>
      </Section>
    </main>
  );
}
