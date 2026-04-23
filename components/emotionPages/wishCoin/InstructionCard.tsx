"use client";

import styles from "./wishCoin.module.css";

type MotionPermissionState = "unknown" | "granted" | "denied" | "unsupported";

type InstructionCardProps = {
  shakeSupported: boolean;
  motionPermission: MotionPermissionState;
  onEnableShake: () => void;
};

export function InstructionCard({ shakeSupported, motionPermission, onEnableShake }: InstructionCardProps) {
  return (
    <section className={styles.panel}>
      <h2>抛出幸运币</h2>
      <p>向上滑动或摇一摇手机，把硬币抛出去。</p>

      <ul className={styles.hints}>
        <li>上滑触发：任意位置向上滑动屏幕</li>
        <li>摇一摇触发：快速晃动手机</li>
      </ul>

      {shakeSupported && motionPermission !== "granted" && (
        <button className={styles.enableBtn} onClick={onEnableShake} type="button">
          {motionPermission === "denied" ? "重新开启重力感应" : "开启重力感应"}
        </button>
      )}

      {!shakeSupported && <p className={styles.muted}>当前设备不支持重力感应，将使用上滑触发。</p>}
      {shakeSupported && motionPermission === "denied" && <p className={styles.muted}>浏览器拒绝了权限，请在系统设置中允许运动与方向访问。</p>}
    </section>
  );
}
