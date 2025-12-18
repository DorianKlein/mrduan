'use client';

import { useEffect, useRef, useState } from 'react';
import { FilesetResolver, HandLandmarker, NormalizedLandmark } from '@mediapipe/tasks-vision';

export type GestureType = 'FIST' | 'OPEN' | 'POINT' | 'NONE';

export function useHandTracking() {
  const [handData, setHandData] = useState({
    // --- 旧模式兼容 ---
    explosion: 0,
    rotation: 0,
    
    // --- 新模式核心数据 ---
    velocity: 0,           // 移动速度
    gesture: 'NONE' as GestureType, // 当前手势形状
    fingertip: { x: 0, y: 0 }, // 食指尖坐标 (雕刻用)
  });

  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const handLandmarkerRef = useRef<HandLandmarker | null>(null);
  
  // 临时变量
  const lastXRef = useRef<number | null>(null);
  const currentRotationRef = useRef(0); 
  const lastTipPosRef = useRef<{ x: number, y: number, time: number } | null>(null);

  // --- 手势识别算法 (核心) ---
  const detectHandGesture = (landmarks: NormalizedLandmark[]): GestureType => {
    // 关键点索引: 
    // 拇指: 4, 食指: 8, 中指: 12, 无名指: 16, 小指: 20
    // 腕部: 0
    
    // 简单的判断逻辑：比较 指尖(Tip)到手腕(0)的距离 vs 指关节(MCP)到手腕的距离
    // 如果 Tip 距离 < MCP 距离，说明手指是弯曲的
    
    const wrist = landmarks[0];
    
    // 辅助函数：计算两点距离
    const dist = (p1: NormalizedLandmark, p2: NormalizedLandmark) => 
      Math.hypot(p1.x - p2.x, p1.y - p2.y);

    // 检查四根手指是否伸直 (不包括拇指，拇指太灵活容易误判)
    const isIndexExtended = dist(landmarks[8], wrist) > dist(landmarks[5], wrist);
    const isMiddleExtended = dist(landmarks[12], wrist) > dist(landmarks[9], wrist);
    const isRingExtended = dist(landmarks[16], wrist) > dist(landmarks[13], wrist);
    const isPinkyExtended = dist(landmarks[20], wrist) > dist(landmarks[17], wrist);

    // 1. 拳头 (FIST): 四指全部弯曲
    if (!isIndexExtended && !isMiddleExtended && !isRingExtended && !isPinkyExtended) {
      return 'FIST';
    }

    // 2. 五指张开 (OPEN): 四指全部伸直
    if (isIndexExtended && isMiddleExtended && isRingExtended && isPinkyExtended) {
      return 'OPEN';
    }

    // 3. 食指雕刻 (POINT): 只有食指伸直，其他弯曲
    if (isIndexExtended && !isMiddleExtended && !isRingExtended && !isPinkyExtended) {
      return 'POINT';
    }

    return 'NONE';
  };

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
        setCameraStream(stream);
        video.addEventListener("loadeddata", predictWebcam);
      });
    };

    const predictWebcam = () => {
      if (videoRef.current && handLandmarkerRef.current) {
        if(videoRef.current.videoWidth > 0 && videoRef.current.videoHeight > 0) {
            const now = performance.now();
            const results = handLandmarkerRef.current.detectForVideo(videoRef.current, now);
    
            let newExplosion = 0;
            let currentVelocity = 0;
            let currentFingertip = { x: 0, y: 0 };
            let currentGesture: GestureType = 'NONE';

            if (results.landmarks && results.landmarks.length > 0) {
              const landmarks = results.landmarks[0];
              const thumb = landmarks[4];
              const index = landmarks[8];

              // --- 1. 基础数据计算 ---
              // 捏合 (旧模式)
              const pinchDist = Math.hypot(thumb.x - index.x, thumb.y - index.y);
              newExplosion = Math.min(Math.max((pinchDist - 0.05) * 5, 0), 1);

              // 旋转 (旧模式)
              if (lastXRef.current !== null) {
                const deltaX = index.x - lastXRef.current;
                if (Math.abs(deltaX) > 0.002) currentRotationRef.current -= deltaX * 5.0;
              }
              lastXRef.current = index.x;

              // 速度 (通用)
              if (lastTipPosRef.current) {
                const dx = index.x - lastTipPosRef.current.x;
                const dy = index.y - lastTipPosRef.current.y;
                const dt = now - lastTipPosRef.current.time;
                if (dt > 0) currentVelocity = Math.hypot(dx, dy) / dt;
              }
              lastTipPosRef.current = { x: index.x, y: index.y, time: now };
              currentFingertip = { x: index.x, y: index.y };

              // --- 2. 识别新动作 ---
              currentGesture = detectHandGesture(landmarks);

            } else {
              lastXRef.current = null;
              lastTipPosRef.current = null;
            }

            setHandData({
                explosion: newExplosion,
                rotation: currentRotationRef.current,
                velocity: currentVelocity,
                gesture: currentGesture,
                fingertip: currentFingertip
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

  return { ...handData, cameraStream };
}