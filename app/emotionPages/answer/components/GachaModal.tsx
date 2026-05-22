import React from 'react';

interface GachaModalProps {
  isOpen: boolean;
  onClose: () => void;
  capsuleColor: string;
  text: string;
}

export default function GachaModal({ isOpen, onClose, capsuleColor, text }: GachaModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
      <div 
        className="relative flex flex-col items-center animate-pop-in"
        style={{ animation: 'popIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)' }}
      >
        {/* 扭蛋上半部分 */}
        <div 
          className="w-40 h-20 rounded-t-full opacity-90 shadow-xl z-20 relative"
          style={{ 
            backgroundColor: capsuleColor, 
            transform: 'translateY(15px) rotate(-10deg)', 
            borderBottom: '4px solid rgba(255,255,255,0.3)' 
          }}
        >
          {/* 高光 */}
          <div className="absolute top-3 left-6 w-16 h-6 rounded-full bg-white/30 transform -rotate-12"></div>
        </div>

        {/* 纸条 (配置文件文本的容器) */}
        <div className="bg-[#fdfbf7] w-64 min-h-[160px] p-6 rounded-md shadow-2xl z-10 flex flex-col items-center justify-center transform scale-110 -rotate-2 border border-[#fef08a] relative">
          <p className="text-gray-800 text-lg font-medium leading-relaxed whitespace-pre-wrap text-center">
            {text}
          </p>
        </div>

        {/* 扭蛋下半部分 */}
        <div 
          className="w-40 h-20 rounded-b-full shadow-xl z-20"
          style={{ 
            backgroundColor: capsuleColor, 
            transform: 'translateY(-15px) rotate(10deg)',
            borderTop: '4px solid rgba(0,0,0,0.15)'
          }}
        ></div>

        {/* 确认关闭按钮 */}
        <button 
          onClick={onClose}
          className="mt-8 px-8 py-3 bg-white text-gray-800 rounded-full font-bold shadow-lg hover:bg-gray-100 active:scale-95 transition-all"
        >
          再扭一次
        </button>
        
        <style>{`
          @keyframes fade-in {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          .animate-fade-in {
            animation: fade-in 0.3s ease-out;
          }
          @keyframes popIn {
            from { transform: scale(0.8) translateY(20px); opacity: 0; }
            to { transform: scale(1) translateY(0); opacity: 1; }
          }
        `}</style>
      </div>
    </div>
  );
}