export default function Home() {
  return (
    // <main> 相当于最外层的父物体 (GameObject)
    // className="..." 就是我们在用 Tailwind 设置材质和布局
    // min-h-screen: 高度至少占满屏幕
    // bg-black: 背景纯黑 (Dark Mode)
    // text-white: 文字纯白
    // p-10: Padding (内边距) 为 10 个单位
    <main className="min-h-screen bg-black text-white p-10">
      
      {/* 标题区域 */}
      <h1 className="text-4xl font-bold mb-8">
        Hello, I&apos;m a Unity Developer
      </h1>

      {/* Bento Grid 容器：这里就是我们将要填格子的地方 */}
      {/* grid: 开启网格布局 */}
      {/* grid-cols-1: 手机上默认 1 列 */}
      {/* md:grid-cols-4: (md=PC端) 电脑上变 4 列 */}
      {/* gap-4: 格子之间有 4 个单位的缝隙 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 h-[80vh]">
        
        {/* 格子 1：左上角的大格子 (放自我介绍) */}
        {/* col-span-2: 占据 2 列宽 */}
        {/* row-span-2: 占据 2 行高 */}
        <div className="bg-neutral-900 rounded-2xl p-6 md:col-span-2 md:row-span-2 border border-neutral-800">
          <h2 className="text-2xl font-bold text-blue-500">About Me</h2>
          <p className="mt-4 text-gray-400">
            我是半路出家的程序员，目标是成为技术总监。
            <br />
            擅长 Unity, C#, XR 开发。
          </p>
        </div>

        {/* 格子 2：右上角的格子 (放 GitHub) */}
        <div className="bg-neutral-900 rounded-2xl p-6 border border-neutral-800 flex items-center justify-center">
          <span className="text-xl">GitHub 📦</span>
        </div>

        {/* 格子 3：下面的格子 (放 3D 作品) */}
        <div className="bg-neutral-900 rounded-2xl p-6 border border-neutral-800 bg-gradient-to-br from-purple-900 to-black">
          <span className="text-xl text-purple-300">VR Works 🕶️</span>
        </div>

        {/* 格子 4：更多的格子... */}
        <div className="bg-neutral-900 rounded-2xl p-6 md:col-span-2 border border-neutral-800">
           <span className="text-xl">My Tech Stack 🛠️</span>
        </div>

      </div>
    </main>
  );
}