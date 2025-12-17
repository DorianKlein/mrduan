import SceneLoader from './SceneLoader';

// 你依然可以在这里定义元数据，这是保留 page.tsx 为服务端组件的最大好处
export const metadata = {
  title: 'Jade Explosion - Hand Gesture Control',
  description: 'Interactive 3D particle explosion controlled by MediaPipe hand tracking.',
};

export default function JadePage() {
  return (
    <main>
      <SceneLoader />
    </main>
  );
}