"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type MotionPermissionState = "unknown" | "granted" | "denied" | "unsupported";

type UseShakeAndSwipeOptions = {
  onTrigger: () => void;
  disabled?: boolean;
};

type TouchHandlers = {
  onTouchStart: (event: React.TouchEvent<HTMLElement>) => void;
  onTouchMove: (event: React.TouchEvent<HTMLElement>) => void;
  onTouchEnd: (event: React.TouchEvent<HTMLElement>) => void;
};

type UseShakeAndSwipeResult = {
  touchHandlers: TouchHandlers;
  motionPermission: MotionPermissionState;
  shakeSupported: boolean;
  requestMotionPermission: () => Promise<void>;
};

const SHAKE_THRESHOLD = 22;
const SHAKE_COOLDOWN_MS = 1200;
const SWIPE_UP_DISTANCE = 70;

export function useShakeAndSwipe({ onTrigger, disabled = false }: UseShakeAndSwipeOptions): UseShakeAndSwipeResult {
  const [explicitPermission, setExplicitPermission] = useState<"granted" | "denied" | null>(null);

  const touchStartY = useRef<number | null>(null);
  const lastShakeTime = useRef(0);

  const shakeSupported = typeof window !== "undefined" && "DeviceMotionEvent" in window;
  const needsExplicitPermission =
    shakeSupported &&
    typeof (DeviceMotionEvent as typeof DeviceMotionEvent & { requestPermission?: unknown }).requestPermission === "function";

  const motionPermission = useMemo<MotionPermissionState>(() => {
    if (!shakeSupported) {
      return "unsupported";
    }

    if (explicitPermission) {
      return explicitPermission;
    }

    return needsExplicitPermission ? "unknown" : "granted";
  }, [explicitPermission, needsExplicitPermission, shakeSupported]);

  const maybeTrigger = useCallback(() => {
    if (!disabled) {
      onTrigger();
    }
  }, [disabled, onTrigger]);

  const requestMotionPermission = useCallback(async () => {
    if (typeof window === "undefined" || !("DeviceMotionEvent" in window)) {
      return;
    }

    const motionEvent = DeviceMotionEvent as typeof DeviceMotionEvent & {
      requestPermission?: () => Promise<"granted" | "denied">;
    };

    if (typeof motionEvent.requestPermission === "function") {
      try {
        const permission = await motionEvent.requestPermission();
        setExplicitPermission(permission);
      } catch {
        setExplicitPermission("denied");
      }
      return;
    }

    setExplicitPermission("granted");
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || motionPermission !== "granted") {
      return;
    }

    const handleMotion = (event: DeviceMotionEvent) => {
      if (disabled) {
        return;
      }

      const now = Date.now();
      if (now - lastShakeTime.current < SHAKE_COOLDOWN_MS) {
        return;
      }

      const x = event.accelerationIncludingGravity?.x ?? 0;
      const y = event.accelerationIncludingGravity?.y ?? 0;
      const z = event.accelerationIncludingGravity?.z ?? 0;

      const force = Math.sqrt(x * x + y * y + z * z);
      if (force > SHAKE_THRESHOLD) {
        lastShakeTime.current = now;
        maybeTrigger();
      }
    };

    window.addEventListener("devicemotion", handleMotion, { passive: true });
    return () => {
      window.removeEventListener("devicemotion", handleMotion);
    };
  }, [disabled, maybeTrigger, motionPermission]);

  const touchHandlers: TouchHandlers = {
    onTouchStart: (event) => {
      touchStartY.current = event.changedTouches[0]?.clientY ?? null;
    },
    onTouchMove: (event) => {
      // Keep swipe gesture from triggering browser/page scroll.
      event.preventDefault();
    },
    onTouchEnd: (event) => {
      const startY = touchStartY.current;
      const endY = event.changedTouches[0]?.clientY;

      if (startY === null || typeof endY !== "number") {
        return;
      }

      const distance = startY - endY;
      if (distance > SWIPE_UP_DISTANCE) {
        maybeTrigger();
      }
    },
  };

  return {
    touchHandlers,
    motionPermission,
    shakeSupported,
    requestMotionPermission,
  };
}
