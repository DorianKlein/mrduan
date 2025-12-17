'use client';

import { useEffect, useRef, useState } from 'react';
import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';

export function useHandTracking() {
  // 状态：包含爆炸程度、旋转角度
  const [controls, setControls] = useState({ explosion: 0, rotation: 0 });
  // 状态：视频流 (用于 UI 预览)
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const handLandmarkerRef = useRef<HandLandmarker | null>(null);
  
  // 用于计算滑动的临时变量
  const lastXRef = useRef<number | null>(null);
  const currentRotationRef = useRef(0); 

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
        
        // 保存流供外部使用
        setCameraStream(stream);

        video.addEventListener("loadeddata", predictWebcam);
      });
    };

    const predictWebcam = () => {
      if (videoRef.current && handLandmarkerRef.current) {
        // 确保视频尺寸可用
        if(videoRef.current.videoWidth > 0 && videoRef.current.videoHeight > 0) {
            const startTimeMs = performance.now();
            const results = handLandmarkerRef.current.detectForVideo(videoRef.current, startTimeMs);
    
            let newExplosion = 0;

            if (results.landmarks && results.landmarks.length > 0) {
              const landmarks = results.landmarks[0];
              
              // --- 1. 计算捏合 (爆炸) ---
              // 拇指(4) 和 食指(8)
              const thumb = landmarks[4];
              const index = landmarks[8];
              const distance = Math.hypot(thumb.x - index.x, thumb.y - index.y);
              newExplosion = Math.min(Math.max((distance - 0.05) * 5, 0), 1);

              // --- 2. 计算食指滑动 (旋转) ---
              const currentX = index.x;

              if (lastXRef.current !== null) {
                // 计算这一帧移动了多少 (Delta)
                const deltaX = currentX - lastXRef.current;
                
                // 设置死区防止抖动
                if (Math.abs(deltaX) > 0.002) {
                    const sensitivity = 5.0; 
                    // 负号是因为镜像翻转
                    currentRotationRef.current -= deltaX * sensitivity;
                }
              }
              // 更新上一帧坐标
              lastXRef.current = currentX;

            } else {
              // 没有检测到手，重置滑动坐标
              lastXRef.current = null;
            }

            // 更新 React 状态
            setControls({
                explosion: newExplosion,
                rotation: currentRotationRef.current
            });
        }
        
        // 循环调用
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

  // 重要：把 controls 和 cameraStream 一起返回
  return { ...controls, cameraStream };
}