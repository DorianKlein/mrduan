'use client';

import { useState } from 'react';

// 箭头图标
function ChevronIcon({ isOpen }: { isOpen: boolean }) {
  return (
    <svg 
      width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      className={`text-white/50 transition-transform duration-500 ${isOpen ? 'rotate-180' : 'rotate-0'}`}
    >
      <polyline points="18 15 12 9 6 15" />
    </svg>
  );
}

// ❌ 删除了 role 属性
interface InfoCardProps {
  name: string;
  nickname: string;
  joinDate?: string;
  letterContent: string;
  children?: React.ReactNode; // 这里的 children 用来放计时器
}

export default function InfoCard({ name, nickname, letterContent, children }: InfoCardProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div 
      className={`
        pointer-events-auto 
        fixed bottom-0 left-0 w-full z-50
        md:absolute md:bottom-8 md:w-[800px] md:left-1/2 md:-translate-x-1/2 md:rounded-2xl
        
        bg-black/60 backdrop-blur-xl border-t md:border border-white/10
        transition-all duration-500 ease-in-out
        
        ${isOpen ? 'bg-black/80' : 'bg-black/60'}
      `}
    >
      
      {/* --- Header --- */}
      <div 
        className="flex justify-between items-center p-6 cursor-pointer group"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight group-hover:text-purple-300 transition-colors">
            {name} <span className="text-base font-normal text-white/40 ml-1">/ {nickname}</span>
          </h2>
          <p className={`text-xs text-purple-400 font-mono mt-1 transition-opacity duration-300 ${isOpen ? 'opacity-0' : 'opacity-100'}`}>
          </p>
          <p className="text-xs text-white/40 uppercase tracking-widest font-mono mb-1">你已经加入工作室</p>
              {children}
        </div>
        <ChevronIcon isOpen={isOpen} />
      </div>

      {/* --- Body --- */}
      <div 
        className={`
          overflow-hidden transition-all duration-500 ease-in-out
          ${isOpen ? 'max-h-[80vh] opacity-100' : 'max-h-0 opacity-0'}
        `}
      >
        <div className="px-6 pb-8 max-h-[70vh] overflow-y-auto">
          
          {/* 分割线 */}
          <div className="h-px w-full bg-white/10 my-6" />

          {/* 信件区域 */}
          <div className="relative pb-4">
             <p className="text-xs text-purple-400 font-mono mb-3">A MESSAGE FROM DIRECTOR</p>
             <article className="text-gray-300 leading-relaxed font-serif text-lg whitespace-pre-line">
                {letterContent}
             </article>
          </div>

        </div>
      </div>
    </div>
  );
}