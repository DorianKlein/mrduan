"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";

import { Modal } from "./components/Modal";
import {
	AppleIcon,
	BananaIcon,
	OrangeIcon,
	PersimmonIcon,
	StrawberryIcon,
	TreeIcon,
} from "./components/Icon";
import { usePullDown } from "./hooks/usePullDown";
import styles from "./mayday.module.css";

const fruitsData = [
	{ id: "apple", name: "苹果", blessing: "平平安安，岁月静好", icon: "AppleIcon" },
	{ id: "persimmon", name: "柿子", blessing: '好“柿”发生，事事如意', icon: "PersimmonIcon" },
	{ id: "strawberry", name: "草莓", blessing: '今天也要“莓”有烦恼', icon: "StrawberryIcon" },
	{ id: "orange", name: "橙子", blessing: "心想事‘成’，所有的努力都有回音", icon: "OrangeIcon" },
	{ id: "banana", name: "香蕉", blessing: '“蕉”好运，今天会有意外之喜', icon: "BananaIcon" },
] as const;

const fruitIcons = {
	AppleIcon,
	PersimmonIcon,
	StrawberryIcon,
	OrangeIcon,
	BananaIcon,
} as const;

type FruitItem = (typeof fruitsData)[number];
type FruitIconName = keyof typeof fruitIcons;
type Phase = "idle" | "dropping" | "settled";

function pickFruit() {
	return fruitsData[Math.floor(Math.random() * fruitsData.length)];
}

const fruitPositions = [
	{ left: "45%", top: "38%" },
	{ left: "60%", top: "33%" },
	{ left: "40%", top: "46%" },
	{ left: "60%", top: "45%" },
	{ left: "50%", top: "28%" },
];

export default function MaydayPage() {
	const [fruit, setFruit] = useState<FruitItem>(fruitsData[0]);
	const [fruitsLayout, setFruitsLayout] = useState(() => {
		return [...fruitsData].map((f, i) => ({
			...f,
			pos: fruitPositions[i]
		}));
	});

	useEffect(() => {
		setFruitsLayout([...fruitsData].sort(() => Math.random() - 0.5).map((f, i) => ({
			...f,
			pos: fruitPositions[i]
		})));
		setFruit(pickFruit());
	}, []);
	const [phase, setPhase] = useState<Phase>("idle");
	const [dropStart, setDropStart] = useState(0);
	const [showModal, setShowModal] = useState(false);
	const [fruitIsReady, setFruitIsReady] = useState(false);
	const timersRef = useRef<number[]>([]);
	const treeWrapRef = useRef<HTMLDivElement>(null);
	const [dropDistanceY, setDropDistanceY] = useState(124);

	const clearTimers = useCallback(() => {
		timersRef.current.forEach((timerId) => window.clearTimeout(timerId));
		timersRef.current = [];
	}, []);

	const {
		pullDistance,
		isDragging,
		handleTouchStart,
		handleTouchMove,
		handleTouchEnd,
		handleTouchCancel,
		resetPullState,
	} = usePullDown({
		threshold: 100,
		enabled: phase === "idle" && !showModal,
		onTrigger: useCallback(
			(distance: number) => {
				setDropStart(distance);
				setPhase("dropping");
				setFruitIsReady(false);
				clearTimers();

				// Calculate distance to ground
				if (treeWrapRef.current) {
					const wrapElem = treeWrapRef.current;
					const treeElem = wrapElem.querySelector("svg") || wrapElem;
					const wrapRect = wrapElem.getBoundingClientRect();
					const treeRect = treeElem.getBoundingClientRect();
					
					// 地平线：树的实际底部往上 25% 的绝对位置（相对于树的真实显示包围盒）
					const groundY = (treeRect.bottom - wrapRect.top) - (treeRect.height * 0.25);

					const targetFruit = fruitsLayout.find(f => f.id === fruit.id);
					const topStr = targetFruit?.pos.top || "25%";
					// 起点也是根据外部 wrapper 计算的，因为 absolute 元素挂在 wrapper 内
					const startY = wrapRect.height * (parseFloat(topStr) / 100);
					
					// 目标纵向坐标：保证水果的底部（46px的高度）压在地平线上
					const targetY = groundY - 46;
					setDropDistanceY(targetY - startY);
				}

				timersRef.current.push(
					window.setTimeout(() => {
						setPhase("settled");
						setFruitIsReady(true);
					}, 800),
				);

				timersRef.current.push(
					window.setTimeout(() => {
						setShowModal(true);
					}, 1800),
				);
			},
			[clearTimers, fruit.id, fruitsLayout],
		),
	});

	const resetRound = useCallback(() => {
		clearTimers();
		setFruit(pickFruit());
		setPhase("idle");
		setDropStart(0);
		setShowModal(false);
		setFruitIsReady(false);
		resetPullState();
		setFruitsLayout([...fruitsData].sort(() => Math.random() - 0.5).map((f, i) => ({
			...f,
			pos: fruitPositions[i]
		})));
	}, [clearTimers, resetPullState]);

	useEffect(() => clearTimers, [clearTimers]);

	const FruitIcon = fruitIcons[fruit.icon as FruitIconName] ?? AppleIcon;
	const fruitClassName =
		phase === "dropping"
			? `${styles.fruitBase} ${styles.fruitDropping}`
			: phase === "settled"
				? `${styles.fruitBase} ${styles.fruitSettled}`
				: isDragging
					? `${styles.fruitBase} ${styles.fruitDragging}`
					: `${styles.fruitBase} ${styles.fruitIdle}`;

	const fruitStyle: CSSProperties & { "--drop-start-y": string, "--drop-distance-y": string } = {
		"--drop-start-y": `${dropStart}px`,
		"--drop-distance-y": `${dropDistanceY}px`,
		...(phase === "idle" && isDragging
			? {
				transform: `translate3d(0, ${pullDistance}px, 0) rotate(${Math.min(pullDistance / 18, 10)}deg) scale(${1 + Math.min(pullDistance / 700, 0.05)})`,
			}
			: {}),
	};

	const modalFruit = {
		name: fruit.name,
		blessing: fruit.blessing,
		icon: FruitIcon,
	};

	return (
		<main className={styles.page}>
			<div className={styles.stage}>
				<div className={`${styles.ornament} ${styles.ornamentA}`} />
				<div className={`${styles.ornament} ${styles.ornamentB}`} />
				<div className={`${styles.ornament} ${styles.ornamentC}`} />

				<div
					ref={treeWrapRef}
					className={styles.treeWrap}
					onTouchStart={handleTouchStart}
					onTouchMove={handleTouchMove}
					onTouchEnd={handleTouchEnd}
					onTouchCancel={handleTouchCancel}
				>
					<div className={styles.treeGlow} />
					<TreeIcon className={styles.treeSvg} aria-hidden="true" />

					{fruitsLayout.map((fItem) => {
						const isTarget = fItem.id === fruit.id;
						const FIcon = fruitIcons[fItem.icon as FruitIconName] ?? AppleIcon;
						
						const currClassName = isTarget 
							? fruitClassName 
							: `${styles.fruitBase} ${styles.fruitIdle}`;
							
						const anchorStyle: CSSProperties = {
							position: "absolute",
							left: fItem.pos.left,
							top: fItem.pos.top,
							zIndex: isTarget ? 3 : 2,
							transform: "translateX(-50%)",
						};

						return (
							<div key={fItem.id} style={anchorStyle}>
								<div className={currClassName} style={isTarget ? fruitStyle : {}}>
									<FIcon className="h-full w-full drop-shadow-[0_16px_24px_rgba(0,0,0,0.18)]" aria-hidden="true" />
								</div>
							</div>
						);
					})}
				</div>
			</div>

			<p className={styles.hint}>{fruitIsReady ? "水果已经落地" : "向下拉一下，摘走一份今天的情绪价值"}</p>

			<Modal open={showModal} fruit={modalFruit} onReset={resetRound} />
		</main>
	);
}