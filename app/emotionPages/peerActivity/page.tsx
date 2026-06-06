"use client"; //[cite: 1]

import React, { useState } from "react"; //[cite: 1]
import Image from "next/image"; //[cite: 1]
import bgPic from "./components/pic/BG (1).webp"; //[cite: 1]
// 1. 引入你的标题图片，请根据实际存放位置调整路径
import titlePic from "./components/pic/title-1.png"; 
import { OutlineButton } from "./components/OutlineButton"; //[cite: 1]
import { ImageModal } from "./components/ImageModal"; //[cite: 1]
import { galleryConfig } from "./components/galleryConfig"; //[cite: 1]

export default function PeerActivityPage() {
  const [activeGalleryId, setActiveGalleryId] = useState<number | null>(null); //[cite: 1]

  const openGallery = (id: number) => { //[cite: 1]
    setActiveGalleryId(id); //[cite: 1]
  }; //[cite: 1]

  const closeGallery = () => { //[cite: 1]
    setActiveGalleryId(null); //[cite: 1]
  }; //[cite: 1]

  return (
    <main className="w-full min-h-[100dvh] bg-[#fdfaf4] flex flex-col items-center"> {/*[cite: 1] */}
      {/* 弹窗组件 */}
      <ImageModal 
        isOpen={activeGalleryId !== null} //[cite: 1]
        onClose={closeGallery} //[cite: 1]
        images={activeGalleryId ? galleryConfig[activeGalleryId] : []} //[cite: 1]
      />

      {/* 建立一个宽高与图片完全保持一致的相对定位容器 */}
      <div className="relative w-full max-w-[768px]"> {/*[cite: 1] */}
        
        {/* 图片放弃 fill 模式，改用 w-full h-auto 让它自动撑开父容器高度 */}
        <Image
          src={bgPic} //[cite: 1]
          alt="Activity Background" //[cite: 1]
          className="w-full h-auto block pointer-events-none" //[cite: 1]
          priority //[cite: 1]
          quality={100} //[cite: 1]
        />

        {/* 2. 新增的标题图片容器，绝对定位在顶部居中位置 */}
        <div className="absolute top-[3%] left-1/2 -translate-x-1/2 w-[80%] z-30 pointer-events-none">
          <Image
            src={titlePic}
            alt="第3季 青春同行 花YOUNG大连"
            className="w-full h-auto drop-shadow-lg"
            priority
          />
        </div>

        {/* 所有绝对定位的按钮框设置为百分比宽度 (w-[30%]) 以及自适应高度 (aspect-[4/3]或更高) */}
        <div className="absolute top-[20%] left-[22%] z-20 w-[30%] aspect-[4/3]"> {/*[cite: 1] */}
          <OutlineButton onClick={() => openGallery(1)} className="w-full h-full bg-transparent p-1 sm:p-2 border-0 outline-none hover:scale-105 active:scale-95 cursor-pointer"> {/*[cite: 1] */}
            <span className="text-[11px] sm:text-sm md:text-base font-extrabold text-black leading-tight text-center pb-1 pointer-events-none [text-shadow:_0_1px_4px_rgb(255_255_255_/_100%),_0_0_2px_rgb(255_255_255_/_100%)]"> {/*[cite: 1] */}
              团市委“连青空间” {/*[cite: 1] */}
            </span>
          </OutlineButton>
        </div>

        <div className="absolute top-[28%] left-[52%] z-20 w-[30%] aspect-[4/3]"> {/*[cite: 1] */}
          <OutlineButton onClick={() => openGallery(2)} className="w-full h-full bg-transparent p-1 sm:p-2 border-0 outline-none hover:scale-105 active:scale-95 cursor-pointer"> {/*[cite: 1] */}
            <span className="text-[11px] sm:text-sm md:text-base font-extrabold text-black leading-tight text-center pb-1 pointer-events-none [text-shadow:_0_1px_4px_rgb(255_255_255_/_100%),_0_0_2px_rgb(255_255_255_/_100%)]"> {/*[cite: 1] */}
              大连市西岗文化馆<br/>（核雕） {/*[cite: 1] */}
            </span>
          </OutlineButton>
        </div>

        <div className="absolute top-[36%] left-[24%] z-20 w-[28%] aspect-[4/3]"> {/*[cite: 1] */}
          <OutlineButton onClick={() => openGallery(3)} className="w-full h-full bg-transparent p-1 sm:p-2 border-0 outline-none hover:scale-105 active:scale-95 cursor-pointer"> {/*[cite: 1] */}
            <span className="text-[11px] sm:text-sm md:text-base font-extrabold text-black leading-tight text-center pb-1 pointer-events-none [text-shadow:_0_1px_4px_rgb(255_255_255_/_100%),_0_0_2px_rgb(255_255_255_/_100%)]"> {/*[cite: 1] */}
              金阿山艺术馆 {/*[cite: 1] */}
            </span>
          </OutlineButton>
        </div>

        <div className="absolute top-[43.5%] left-[60%] z-20 w-[30%] aspect-[4/3]"> {/*[cite: 1] */}
          <OutlineButton onClick={() => openGallery(4)} className="w-full h-full bg-transparent p-1 sm:p-2 border-0 outline-none hover:scale-105 active:scale-95 cursor-pointer"> {/*[cite: 1] */}
            <span className="text-[11px] sm:text-sm md:text-base font-extrabold text-black leading-tight text-center pb-1 pointer-events-none [text-shadow:_0_1px_4px_rgb(255_255_255_/_100%),_0_0_2px_rgb(255_255_255_/_100%)]"> {/*[cite: 1] */}
              钟氏面塑工艺品馆 {/*[cite: 1] */}
            </span>
          </OutlineButton>
        </div>

        <div className="absolute top-[52%] left-[22%] z-20 w-[30%] aspect-[4/3]"> {/*[cite: 1] */}
          <OutlineButton onClick={() => openGallery(5)} className="w-full h-full bg-transparent p-1 sm:p-2 border-0 outline-none hover:scale-105 active:scale-95 cursor-pointer"> {/*[cite: 1] */}
            <span className="text-[11px] sm:text-sm md:text-base font-extrabold text-black leading-tight text-center pb-1 pointer-events-none [text-shadow:_0_1px_4px_rgb(255_255_255_/_100%),_0_0_2px_rgb(255_255_255_/_100%)]"> {/*[cite: 1] */}
              金家街非遗文化体验馆 {/*[cite: 1] */}
            </span>
          </OutlineButton>
        </div>

        <div className="absolute top-[65%] left-[60%] z-20 w-[30%] aspect-[4/3]"> {/*[cite: 1] */}
          <OutlineButton onClick={() => openGallery(6)} className="w-full h-full bg-transparent p-1 sm:p-2 border-0 outline-none hover:scale-105 active:scale-95 cursor-pointer"> {/*[cite: 1] */}
            <span className="text-[11px] sm:text-sm md:text-base font-extrabold text-black leading-tight text-center pb-1 pointer-events-none [text-shadow:_0_1px_4px_rgb(255_255_255_/_100%),_0_0_2px_rgb(255_255_255_/_100%)]"> {/*[cite: 1] */}
              东关街<br/>（泽惠园槐花饼） {/*[cite: 1] */}
            </span>
          </OutlineButton>
        </div>

        <div className="absolute top-[76%] left-[29%] z-20 w-[28%] aspect-[4/3]"> {/*[cite: 1] */}
          <OutlineButton onClick={() => openGallery(7)} className="w-full h-full bg-transparent p-1 sm:p-2 border-0 outline-none hover:scale-105 active:scale-95 cursor-pointer"> {/*[cite: 1] */}
            <span className="text-[11px] sm:text-sm md:text-base font-extrabold text-black leading-tight text-center pb-1 pointer-events-none [text-shadow:_0_1px_4px_rgb(255_255_255_/_100%),_0_0_2px_rgb(255_255_255_/_100%)]"> {/*[cite: 1] */}
              东关街<br/>（甲骨刻辞） {/*[cite: 1] */}
            </span>
          </OutlineButton>
        </div>

        <div className="absolute top-[84%] left-[60%] z-20 w-[36%] aspect-[5/4]"> {/*[cite: 1] */}
          <OutlineButton onClick={() => openGallery(8)} className="w-full h-full bg-transparent p-1 sm:p-2 border-0 outline-none hover:scale-105 active:scale-95 cursor-pointer"> {/*[cite: 1] */}
            <span className="text-[10px] sm:text-xs md:text-sm font-extrabold text-black leading-tight text-center pb-1 pointer-events-none [text-shadow:_0_1px_4px_rgb(255_255_255_/_100%),_0_0_2px_rgb(255_255_255_/_100%)]"> {/*[cite: 1] */}
              东关街<br/>（时光印记活字印刷体验馆） {/*[cite: 1] */}
            </span>
          </OutlineButton>
        </div>

      </div>
    </main>
  );
}