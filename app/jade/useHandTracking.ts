'use client';

import { useEffect, useRef, useState } from 'react';
import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';

export function useHandTracking() {
  // 现在的状态包含两个值：爆炸程度 和 旋转角度
  const [controls, setControls] = useState({ explosion: 0, rotation: 0 });
  
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const handLandmarkerRef = useRef<HandLandmarker | null>(null);
  
  // 用于计算滑动的临时变量
  const lastXRef = useRef<number | null>(null);
  const currentRotationRef = useRef(0); // 使用 ref 累加旋转值，防止闭包问题

  useEffect(() => {
    let animationFrameId: number;

    const setupMediaPipe = async () => {
      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
      );

      handLandmarkerRef.current = await HandLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
          delegate: "GPU"
        },
        runningMode: "VIDEO",
        numHands: 1
      });

      startWebcam();
    };

    const startWebcam = () => {
      const video = document.createElement("video");
      video.setAttribute("autoplay", "");
      video.setAttribute("playsinline", "");
      video.style.display = "none";
      document.body.appendChild(video);

      navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
        video.srcObject = stream;
        videoRef.current = video;
        video.addEventListener("loadeddata", predictWebcam);
      });
    };

    const predictWebcam = () => {
      if (videoRef.current && handLandmarkerRef.current) {
        if(videoRef.current.videoWidth > 0 && videoRef.current.videoHeight > 0) {
            const startTimeMs = performance.now();
            const results = handLandmarkerRef.current.detectForVideo(videoRef.current, startTimeMs);
    
            let newExplosion = 0;

            if (results.landmarks && results.landmarks.length > 0) {
              const landmarks = results.landmarks[0];
              
              // --- 1. 计算捏合 (爆炸) ---
              const thumb = landmarks[4];
              const index = landmarks[8];
              const distance = Math.hypot(thumb.x - index.x, thumb.y - index.y);
              newExplosion = Math.min(Math.max((distance - 0.05) * 5, 0), 1);

              // --- 2. 计算食指滑动 (旋转) ---
              // 食指尖端的 X 坐标 (MediaPipe 的坐标是 0-1，且 1 在右边，但摄像头是镜像的)
              // 我们通常希望手往右滑，模型往右转，所以可能需要反转一下 delta
              const currentX = index.x;

              if (lastXRef.current !== null) {
                // 计算这一帧移动了多少 (Delta)
                const deltaX = currentX - lastXRef.current;
                
                // 设置一个死区 (Deadzone)，防止手抖导致模型微颤
                if (Math.abs(deltaX) > 0.002) {
                    // 灵敏度系数，负号是因为摄像头通常是镜像的，需要反直觉调整
                    const sensitivity = 5.0; 
                    currentRotationRef.current -= deltaX * sensitivity;
                }
              }
              // 更新上一帧坐标
              lastXRef.current = currentX;

            } else {
              // 如果没有检测到手，重置 lastX，防止下次手进来时产生巨大的 delta 跳变
              lastXRef.current = null;
            }

            // 更新 React 状态
            setControls({
                explosion: newExplosion,
                rotation: currentRotationRef.current
            });
        }
        animationFrameId = requestAnimationFrame(predictWebcam);
      }
    };

    setupMediaPipe();

    return () => {
      cancelAnimationFrame(animationFrameId);
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
        videoRef.current.remove();
      }
    };
  }, []);

  return controls;
}