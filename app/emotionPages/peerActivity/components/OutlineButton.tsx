    "use client";

import React from "react";

export interface OutlineButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label?: React.ReactNode;
  children?: React.ReactNode;
}

export const OutlineButton: React.FC<OutlineButtonProps> = ({ 
  label, 
  children, 
  className = "", 
  ...props 
}) => {
  // 完全取消边框
  return (
    <button
      className={`relative inline-flex flex-col items-center justify-end p-2 transition-transform hover:scale-105 active:scale-95 rounded-lg border-0 outline-none ring-0 bg-transparent ${className}`}
      {...props}
    >
      {/* 按钮主体内容（如图标等） */}
      {children && (
        <div className="flex flex-col items-center justify-end h-full w-full">
          {children}
        </div>
      )}
      
      {/* 按钮底部的文字 */}
      {label && (
        <span className="mt-1 text-sm font-medium text-black">
          {label}
        </span>
      )}
    </button>
  );
};
