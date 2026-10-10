'use client';

import { useEffect, useRef, useState, type CSSProperties } from 'react';
import styles from './clock.module.css';

const quotes = [
  '刚才那 5 秒，猫什么都没做，你也是。',
  '恭喜，你已在地球自转中免费搭乘了 5 秒。',
  '刚刚过去的 5 秒，有 3 亿个细胞为你努力活了下来，而你成功保护了它们不受工作侵害。',
  '刚刚过去的 5 秒，世界没有任何改变，这很棒。',
  '摸鱼 10 秒，四舍五入就是没上班。',
  '你刚才呼吸了两次，很棒，继续保持这个节奏。',
  '别紧张，这 5 秒里没有写进任何 KPI。',
  '刚刚有颗流星划过，你没看到，但你摸到了鱼，不亏。',
  '刚才那 5 秒，我们成功阻止了自己去创造任何剩余价值。',
  '很好，你刚才成功发呆了 5 秒，宇宙为你感到骄傲。',
  '你的椅子刚刚承托了一个完全不想工作的灵魂。',
  '这 5 秒没有产出，但有非常扎实地经过。',
  '恭喜，刚才的时间已经永久属于你，无法报销。',
  '此刻有一朵云路过，你也可以什么都不做。',
  '你与待办清单保持了 5 秒的礼貌距离。',
  '人生不是冲刺，现在是合法的躺平区间。',
  '刚才没有人因为你休息而失去什么，除了一个 KPI。',
  '又攒下 5 秒无用但很自由的人生。',
  '这不是拖延，这是给灵魂一点加载时间。',
  '恭喜，你刚刚完成了一次高质量的什么也没做。',
  '刚才那 5 秒，宇宙向外膨胀了约 365 公里，而你纹丝未动',
  '恭喜，你体内的碳原子刚刚完全静止了 5 秒的社会责任感',
  '太阳刚才释放了数万亿吨能量，而你成功消耗了 0.002 卡路里',
  '刚过去的 5 秒，重力把你稳稳按在椅子上，你很配合重力',
  '地球以每秒 30 公里的速度绕日公转，你刚才坐了 150 公里的免费飞车',
  '植物在光合作用，真菌在分解落叶，你在呼吸，大家都有光明的未来',
  '刚才这 5 秒，你没向外界辐射任何多余的焦虑电磁波',
  '经过精密计算，你刚才的发呆效率超过了 99.8% 的无机物',
  '树木长出年轮用了整整一年，你虚度 5 秒简直微不足道',
  '一只蜂鸟刚才振翅了 400 次，你连眼皮都没眨一下，完胜',
  '刚才过去的 5 秒，甚至不够光从太阳跑到地球的零头，慌什么',
  '你的细胞刚刚更新了几个，新的细胞对你的摸鱼行为表示满意',
  '刚才那 5 秒里，没有任何一块岩石产生心理压力',
  '刚刚吹过的一阵微风，替你完成了今天的户外运动指标',
  '大气压强正以每平方厘米 1 公斤的力拥抱你，接受这份重托吧',
  '刚过去的 5 秒，你和一盆多肉植物的行动轨迹高度重合',
  '刚才你体内的水分保持了绝对平静，没有溅起一滴内卷的水花',
  '恭喜你，在刚刚的 5 秒里完美融入了背景辐射',
  '蜗牛刚才往前爬了 0.6 厘米，而你非常有耐心，一步没动',
  '此时此刻，几万公里外的某颗卫星正无声滑过，它不知道你在摸鱼，知道了也不管',
  '刚过去的 5 秒，没有产生任何 PPT，世界依然在运转',
  '刚才这 5 秒，你的剩余价值被成功锁死在体内',
  '恭喜，你刚刚为资本主义的齿轮抹了一点点阻尼润滑油',
  '没有消息就是好消息，尤其在这无所事事的 5 秒里',
  '刚过去的 5 秒，未检测到任何正在形成的闭环或抓手',
  '你的生产力刚才休克了 5 秒，但你的精神状态复苏了',
  '刚才这 5 秒，你的时薪正在无声地向纯利润转化',
  '很好，刚才那 5 秒里，没有任何一个需求被推进',
  '恭喜避开了一个不存在的突发线上故障',
  '刚才这 5 秒，未触发任何协同效应，堪称完美隔离',
  '刚才这 5 秒属于纯粹的个人领地，任何钉钉与飞书都无法渗透',
  '刚才过去的 5 秒，你在脑海中驳回了 0 个方案，采纳了 0 个建议',
  '哪怕什么都不做，这 5 秒的工伤风险也降到了历史最低点',
  '刚才这 5 秒，未输出任何沉淀，但沉淀了心情',
  '没有任何 KPI 敢在刚才这 5 秒里打扰一个正在放空的人',
  '刚才这 5 秒的产出为零，能耗为零，碳足迹近乎于零',
  '你刚刚完成了长达 5 秒的“战略性不作为”',
  '刚过去的 5 秒，没有任何人能对你的摸鱼指手画脚',
  '刚才这 5 秒没有开会，为你节省了无法估量的精神内耗',
  '恭喜你，又合法虚度了一个哪怕写进周报都会被当成空白符的片段',
  '一只猫刚才伸了个懒腰，并暗中点赞了你的静止状态',
  '树懒在树枝上翻了个身，用时两分钟，你才 5 秒，急什么',
  '刚才这 5 秒，路边的小草什么都没考虑，你学得很像',
  '隔壁的小狗刚才叹了口气，把下巴搁在前爪上，建议模仿',
  '一只水母在深海漂浮了 5 秒，它没有大脑，也没有周一',
  '刚才这 5 秒，你像一只趴在阳台瓷砖上的晒太阳橘猫',

  '麻雀刚才在树枝上歪了歪头，确认你毫无威胁',

  '考拉每天睡 20 个小时，你才发呆 5 秒，差距还很大',

  '刚才这 5 秒，地里的土豆在安静生长，你也在安静存在',

  '一只海獭刚才把石头揣进了怀里，你也可以把手机揣进兜里',

  '熊猫吃竹子用了 5 秒，你看着屏幕用了 5 秒，各有各的可爱',

  '刚才过去的时间里，没有一只鸽子在为咕咕叫而感到愧疚',

  '苔藓在石缝里蔓延了一点点，你连头发都没掉一根',

  '刚过去的 5 秒，云朵飘出了三米远，它也没买门票',

  '一条深海鱼刚刚游过黑暗，它不在乎白天还是黑夜，休息日就该这样',

  '刚才这 5 秒，企鹅在雪地上滑倒了又站起来，而你甚至没倒下',

  '金鱼的记忆重新刷新了一次，你可以假装刚才的琐事全忘了',

  '刚过去的 5 秒，你像一尊昂贵的石雕，充满了松弛的艺术感',

  '睡莲在水面上漂着，它不负责让水流变快，你也不负责推动世界',

  '刚才那 5 秒，你和一根晒干的木头达到了同样的冥想境界',

  '刚才那 5 秒，你眨了眼，证明机体运行良好，其余功能已休眠',

  '恭喜，你成功抵抗了“找点事情干”的危险念头整整 5 秒',

  '刚才这 5 秒，大脑皮层温度下降了 0.01 度，散热正常',

  '你刚才发呆的样子很有深度，像在思考哲学，其实什么都没想',

  '刚才那 5 秒，没有花掉一分钱，属于典型的低成本快乐',

  '如果发呆是一门语言，你刚才流畅地说了两个从句',

  '刚才这 5 秒，你的颈椎终于得到了一次不被低头折磨的喘息',

  '刚才什么事都没发生，真是值得庆祝的 5 秒',

  '很好，你的注意力成功散开，像一滴墨水掉进了西湖',

  '刚过去的 5 秒，你连“待会儿吃什么”都没想，纯度极高',

  '刚才这 5 秒，你是一台待机功耗极低的超级计算机',

  '刚才你的表情非常松弛，连法令纹都休假了 5 秒',

  '恭喜，你已经成功学会了如何像植物人一样理直气壮地躺着',

  '刚才那 5 秒，没有一个坏消息能够追上你的放空速度',

  '刚才这 5 秒里，你的床（或椅子）对你的黏附力增加了 10%',

  '恭喜你，顺利度过了“原本以为会很无聊”的 5 秒',

  '刚才这 5 秒，你没有被任何算法精准推荐任何东西',

  '你刚才的发呆姿势非常标准，发呆协会发来贺电',

  '刚才那 5 秒，你的待办清单在角落里落了一层微小的灰尘',

  '很好，刚才这 5 秒你没有任何产出，但这本身就是一种产出',

  '刚才这 5 秒，时间只是路过，没有向你收取过路费',

  '呼吸，呼气。刚过去的 5 秒，你好好活着就够了',

  '刚才这 5 秒，你允许自己只是一个普通的人类',

  '没有目标，没有方向，这 5 秒你是绝对自由的',

  '刚过去的 5 秒，整个世界都同意你暂时掉线一会儿',

  '阳光刚才照到了地板上的一角，你刚好看到了',

  '刚才这 5 秒没有任何意义，而没有意义本身就很浪漫',

  '停下来不代表落后，刚过去的 5 秒只是你在看路边的风景',

  '刚才这 5 秒，你原谅了所有未完成的事情',

  '时间本来就是用来流逝的，你刚才只是安静地看着它流',

  '刚才这 5 秒没有写进日历，它属于你私人的空白页',

  '哪怕只是发呆，你刚才也实实在在地陪伴了自己 5 秒',

  '刚才这 5 秒，世界在忙它的，你在过你的',

  '允许自己什么都不做，是这 5 秒里你对自己最大的慈悲',

  ' 刚才这 5 秒，没有任何 deadline 能够穿透这面平静的墙',

  '即使是一张白纸，也有它空白的权利，你刚才就是那张纸',

  '刚才那 5 秒里，你不需要向任何人证明自己的价值',

  '影子在墙上慢慢挪动，刚过去的 5 秒很慢，慢得很安心',

  '刚才这 5 秒，你只是存在着，这已经是一件很了不起的事',

  '滴答。5 秒过去了，下一组 5 秒，你依然可以心安理得地浪费',
];

function formatTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
  const seconds = (totalSeconds % 60).toString().padStart(2, '0');
  return `${minutes}:${seconds}`;
}

export default function ClockPage() {
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const [finished, setFinished] = useState(false);
  const [quoteIndex, setQuoteIndex] = useState(-1);
  const [quoteKey, setQuoteKey] = useState(0);
  const startedAt = useRef<number | null>(null);
  const elapsedAtStart = useRef(0);
  const lastTick = useRef(0);

  useEffect(() => {
    document.title = 'mrduan情绪网页 - 摸鱼计时器';
  }, []);

  useEffect(() => {
    if (!running) return;
    const update = () => {
      if (startedAt.current === null) return;
      const nextElapsed = elapsedAtStart.current + Math.floor((Date.now() - startedAt.current) / 1000);
      setElapsed(nextElapsed);
      const tick = Math.floor(nextElapsed / 5);
      if (tick > lastTick.current) {
        lastTick.current = tick;
        setQuoteIndex((previous) => (previous + 1) % quotes.length);
        setQuoteKey((previous) => previous + 1);
      }
    };
    update();
    const timer = window.setInterval(update, 100);
    return () => window.clearInterval(timer);
  }, [running]);

  const begin = () => {
    elapsedAtStart.current = elapsed;
    startedAt.current = Date.now();
    setRunning(true);
  };

  const pause = () => {
    if (startedAt.current !== null) {
      elapsedAtStart.current = elapsedAtStart.current + Math.floor((Date.now() - startedAt.current) / 1000);
      startedAt.current = null;
    }
    setRunning(false);
  };

  const endSession = () => {
    if (startedAt.current !== null) {
      const finalElapsed = elapsedAtStart.current + Math.floor((Date.now() - startedAt.current) / 1000);
      elapsedAtStart.current = finalElapsed;
      setElapsed(finalElapsed);
      startedAt.current = null;
    }
    setRunning(false);
    setFinished(true);
  };

  const reset = () => {
    setElapsed(0);
    elapsedAtStart.current = 0;
    startedAt.current = null;
    lastTick.current = 0;
    setQuoteIndex(-1);
    setRunning(false);
    setFinished(false);
  };

  return (
    <main className={styles.page}>
      <div className={styles.ambient} aria-hidden="true" />
      <header className={styles.header}>
        <div className={styles.online}><i />在线充能中</div>
      </header>

      <section className={styles.experience}>
        <div className={styles.intro}>
          <span className={styles.eyebrow}>A MOMENT FOR YOURSELF</span>
          <h1>此刻，不必有用。</h1>
          <p>把时间还给自己，别的事情等一会儿再说。</p>
        </div>

        <div className={styles.watch}>
          <div className={styles.rim}>
            <div className={styles.face}>
              <div className={styles.hourMarks} aria-hidden="true" style={{ '--mark-origin': '47.5%' } as CSSProperties}>
                {Array.from({ length: 60 }, (_, index) => (
                  <i key={index} className={index % 5 === 0 ? styles.majorMark : ''} style={{ transform: `rotate(${index * 6}deg)` }} />
                ))}
              </div>
              <div className={styles.innerRing} />
              <span className={`${styles.dialLabel} ${styles.twelve}`}>XII</span>
              <span className={`${styles.dialLabel} ${styles.three}`}>III</span>
              <span className={`${styles.dialLabel} ${styles.six}`}>VI</span>
              <span className={`${styles.dialLabel} ${styles.nine}`}>IX</span>
              <div className={styles.readout}>
                <span className={styles.readoutCaption}>TIME WELL WASTED</span>
                <strong>{formatTime(elapsed)}</strong>
                <span className={styles.readoutSub}>分钟 <b>·</b> 秒钟</span>
              </div>
              <div
                className={`${styles.handPivot} ${running ? styles.handPivotActive : ''}`}
                style={{ transform: `rotate(${elapsed * 6}deg)` }}
                aria-hidden="true"
              >
                <div className={styles.hand}><span /></div>
              </div>
              <div className={styles.pin} />
              {quoteIndex >= 0 && (
                <div key={quoteKey} className={styles.clockQuote} aria-live="polite">
                  <span>✳</span>{quotes[quoteIndex]}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className={styles.controls}>
          {!running ? (
            <button className={styles.primaryButton} onClick={begin}>
              <span className={styles.playIcon} />{elapsed > 0 ? '继续摸鱼' : '开始虚度'}
            </button>
          ) : (
            <button className={`${styles.primaryButton} ${styles.runningButton}`} onClick={pause}>
              <span className={styles.pauseIcon}><i /><i /></span>正在虚度…
            </button>
          )}
          {elapsed > 0 && <button className={styles.endButton} onClick={endSession}>结束这一段</button>}
        </div>

        <div className={styles.ticker}>
          <span className={styles.tickerMark}>✳</span>
          <p className={styles.tickerIdle}>{running ? '安心虚度，每一秒都属于你。' : '一会儿见，时间会替你慢下来。'}</p>
        </div>
      </section>

      <footer className={styles.footer}>
        <p>休息，是为了更好的……不工作吗？不，休息就是休息，不需要为了任何事情做准备。</p>
        <p>摸鱼万岁，毫无生产力的一天也是伟大的一天。</p>
      </footer>

      {finished && (
        <div className={styles.overlay} role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setFinished(false); }}>
          <section className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="rest-title">
            <button className={styles.closeButton} onClick={() => setFinished(false)} aria-label="关闭">×</button>
            <div className={styles.medal}><span>✳</span><small>WELL<br />RESTED</small></div>
            <span className={styles.eyebrow}>A WELL-EARNED PAUSE</span>
            <h2 id="rest-title">心安理得休息勋章</h2>
            <p className={styles.sessionTime}>今天你成功虚度了 <strong>{Math.floor(elapsed / 60)} 分 {elapsed % 60} 秒</strong>。</p>
            <p className={styles.modalMessage}>你没有在为「更好地工作」而充电，你只是在过属于你自己的、没有任何目的的一天。去吧，明天不上班，去享受更多美好的时间。</p>
            <button className={styles.modalButton} onClick={reset}>收下勋章</button>
          </section>
        </div>
      )}
    </main>
  );
}
