"use client";

import { useCallback, useRef, useState } from "react";

type UsePullDownOptions = {
	threshold?: number;
	enabled?: boolean;
	onTrigger?: (distance: number) => void;
};

export function usePullDown({ threshold = 100, enabled = true, onTrigger }: UsePullDownOptions = {}) {
	const startYRef = useRef<number | null>(null);
	const pullDistanceRef = useRef(0);
	const triggeredRef = useRef(false);
	const [pullDistance, setPullDistance] = useState(0);
	const [isDragging, setIsDragging] = useState(false);

	const resetPullState = useCallback(() => {
		startYRef.current = null;
		pullDistanceRef.current = 0;
		triggeredRef.current = false;
		setPullDistance(0);
		setIsDragging(false);
	}, []);

	const handleTouchStart = useCallback(
		(event: React.TouchEvent<HTMLDivElement>) => {
			if (!enabled || event.touches.length !== 1) {
				return;
			}

			startYRef.current = event.touches[0].clientY;
			pullDistanceRef.current = 0;
			triggeredRef.current = false;
			setPullDistance(0);
			setIsDragging(true);
		},
		[enabled],
	);

	const handleTouchMove = useCallback(
		(event: React.TouchEvent<HTMLDivElement>) => {
			if (!enabled || startYRef.current === null || event.touches.length !== 1) {
				return;
			}

			const distance = Math.max(0, event.touches[0].clientY - startYRef.current);
			pullDistanceRef.current = distance;
			setPullDistance(distance);

			if (!triggeredRef.current && distance >= threshold) {
				triggeredRef.current = true;
				onTrigger?.(distance);
			}
		},
		[enabled, onTrigger, threshold],
	);

	const handleTouchEnd = useCallback(() => {
		if (!enabled) {
			return;
		}

		startYRef.current = null;
		setIsDragging(false);

		if (!triggeredRef.current) {
			pullDistanceRef.current = 0;
			setPullDistance(0);
		}
	}, [enabled]);

	const handleTouchCancel = useCallback(() => {
		if (!enabled) {
			return;
		}

		resetPullState();
	}, [enabled, resetPullState]);

	return {
		pullDistance,
		isDragging,
		handleTouchStart,
		handleTouchMove,
		handleTouchEnd,
		handleTouchCancel,
		resetPullState,
	};
}