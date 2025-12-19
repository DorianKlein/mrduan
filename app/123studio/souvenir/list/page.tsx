'use client';

import { badgesConfig } from '../badges-config';
import Link from 'next/link';

export default function BadgeListPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a0933] via-[#05010c] to-[#0a1229] px-6 py-12 text-white">
      <div className="mx-auto max-w-5xl">
        <h1 className="mb-2 text-5xl font-black tracking-tight">123 STUDIO</h1>
        <p className="mb-12 text-purple-300">2025年终纪念勋章 · 全部成员</p>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {badgesConfig.map((badge, index) => (
            <Link
              key={badge.id}
              href={`/123studio/souvenir?id=${badge.id}`}
              className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur transition-all hover:border-purple-500/50 hover:bg-white/10 hover:shadow-xl hover:shadow-purple-500/20"
            >
              <div className="mb-4 flex items-center justify-between">
                <span className="text-3xl font-black text-purple-400/40">#{String(index + 1).padStart(2, '0')}</span>
                <span className="rounded-full bg-purple-500/20 px-3 py-1 text-xs font-mono uppercase tracking-wider text-purple-300">
                  View
                </span>
              </div>

              <div className="mb-2">
                <h3 className="text-2xl font-bold tracking-tight">{badge.name}</h3>
                <p className="text-sm text-purple-300">{badge.nickname}</p>
              </div>

              <div className="space-y-1 text-xs text-purple-200/60">
                <p>加入时间：{new Date(badge.joinDate).toLocaleDateString('zh-CN')}</p>
                <p className="font-mono">ID: {badge.id}</p>
              </div>

              {/* 悬停效果 */}
              <div className="absolute inset-0 -z-10 bg-gradient-to-br from-purple-600/0 via-purple-500/0 to-indigo-500/0 opacity-0 transition-opacity group-hover:opacity-20" />
            </Link>
          ))}
        </div>

        <div className="mt-12 rounded-2xl border border-yellow-500/30 bg-yellow-500/10 p-6 backdrop-blur">
          <h2 className="mb-3 text-lg font-bold text-yellow-200">📖 使用说明</h2>
          <ul className="space-y-2 text-sm text-yellow-100/80">
            <li>• 点击任意卡片查看该成员的纪念勋章</li>
            <li>• 每个勋章都有独立的访问密码</li>
            <li>• URL格式：<code className="rounded bg-black/30 px-2 py-0.5 font-mono text-xs">/123studio/souvenir?id=成员ID</code></li>
            <li>• 你可以分享单独的勋章链接给对应的成员</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
