// 勋章配置文件
export interface BadgeConfig {
  id: string;              // 唯一标识符，用于 URL 参数
  name: string;            // 成员姓名
  nickname: string;        // 昵称
  joinDate: string;        // 加入日期（格式：YYYY-MM-DD HH:mm:ss）
  frontImg: string;        // 正面图片路径
  backImg: string;         // 背面图片路径
  svgPath: string;         // SVG 形状路径
  themeColor: string;      // 主题色
  letterContent: string;   // 信件内容
}

// 15个勋章配置
export const badgesConfig: BadgeConfig[] = [
  {
    id: 'MVP',
    name: '工作室MVP',
    nickname: '龙哥',
    joinDate: '2024-08-08 00:00:00',
    frontImg: '/badges/yilong.png',
    backImg: '/badges/yilong-back.png',
    svgPath: '/badges/yilong-shape.svg',
    themeColor: '#241229',
    letterContent: `
      汉末建安年间，孙策势单力薄，为了闯出一片天地，\
      选择暂时离开故地，去前线冲杀、向袁术借兵起家；\
      而周瑜则留在后方，修缮军备，囤积粮草。两人为了同一个目标，\
      暂时兵分两路，各自在不同的战场上修炼。直到孙策打回江东，\
      行至历阳渡口，周瑜带着完善的船队和物资前来赴约，两军汇合那一刻，\
      孙策大喜过望，对周瑜说道：“吾得卿，谐也！”双剑合璧之时，便是东吴基业奠定之始。
      我的意思是，我终于要来了，也不想说太多煽情的话，不如就用这个故事祝我们未来势如破竹，也正如里面的一句话，吾得师，谐也！
    `,
  },
  {
    id: '639841',
    name: '赵心旺',
    nickname: '旺仔',
    joinDate: '2024-08-08 00:00:00',
    frontImg: '/badges/wangzai.png',
    backImg: '/badges/wangzai-back.png',
    svgPath: '/badges/wangzai-shape.svg',
    themeColor: '#241229',
    letterContent: `
      To 旺仔：
      作为工作室的元老，你的稳重和踏实一直是闪闪发光的。\
      但工作和大学生活可能不太一样，有时候需要多一些主动和积极，\
      也需要一些灵活变化的处理。
      希望你能继续保持你的优点，同时也能在新的环境中不断成长和突破自己。加油！
    `,
  },
  {
    id: '512784',
    name: '熊芮琪',
    nickname: '熊宝',
    joinDate: '2024-11-13 00:00:00',
    frontImg: '/badges/xiongbao.png',
    backImg: '/badges/xiongbao-back.png',
    svgPath: '/badges/xiongbao-shape.svg',
    themeColor: '#241229',
    letterContent: `
      To 熊宝：
      给你写点儿啥呢？恭喜你圆满完成了本学期负责人的工作？\
      还是感谢你这段时间对工作室的付出和努力？\
      算了，祝你天天开心吧！
      喝酒不吊水，熬夜不生病。
    `,
  },
  {
    id: '924356',
    name: '崔芳泽',
    nickname: '山泽',
    joinDate: '2024-11-15 00:00:00',
    frontImg: '/badges/shanze.png',
    backImg: '/badges/shanze-back.png',
    svgPath: '/badges/shanze-shape.svg',
    themeColor: '#241229',
    letterContent: `
      To 山泽：
      山泽同学，作为工作室第一批成员，\
      你有着明确的目标和对AI的探索热情，\
      这让我对你的未来充满期待。\
      期待你能成为心目中的自己，加油！
    `,
  },
  {
    id: '768231',
    name: '关璐瑶',
    nickname: '瑶子',
    joinDate: '2024-11-15 00:00:00',
    frontImg: '/badges/yaozi.png',
    backImg: '/badges/yaozi-back.png',
    svgPath: '/badges/yaozi-shape.svg',
    themeColor: '#241229',
    letterContent: `
      To 瑶子：
      一个非常具有创造力的同学，\
      脑袋里总有一些新奇的想法和点子。\
      希望你能继续保持这种创新精神，\
      在工作室里发挥你的特长，\
      带来更多有趣的作品。
      期待看到你不断成长和进步！
    `,
  },
  {
    id: '453897',
    name: '夏颖悦',
    nickname: '大饼',
    joinDate: '2024-11-15 00:00:00',
    frontImg: '/badges/dabing.png',
    backImg: '/badges/dabing-back.png',
    svgPath: '/badges/dabing-shape.svg',
    themeColor: '#241229',
    letterContent: `
      To 大饼：
      作为工作室的特效担当，\
      本学期看到了你在特效制作方面的成长和进步。\
      希望你能继续保持这种热情和动力，\
      在特效的学习路上不断前进。\
      加油！
    `,
  },
  {
    id: '291564',
    name: '程紫月',
    nickname: '紫悦',
    joinDate: '2024-12-01 00:00:00',
    frontImg: '/badges/ziyue-black.png',
    backImg: '/badges/ziyue-back.png',
    svgPath: '/badges/ziyue-shape.svg',
    themeColor: '#241229',
    letterContent: `
      To 小紫悦：
      这是独属于你的20%。
      我理解你疑惑，为什么加入工作室一年，邵老师和我一下都这么关注你？\
      其实每次组会之后，他和我都会再开个小会，你周总结的内容和质量我们每次都会提及，\
      虽然跟你没有太多的交流，但你的态度和进步我们都看在眼里。\
      如果不是因为我不在学校，咱俩可能早就很熟了。\
      也很感谢邵老师能把这个工作交给你，让我能早些熟悉你。
      本学期接近尾声，但我没有对你明年更多的要求，\
      早在一次组会的时候我就说过，你是一个目标明确的人，\
      前进的路上保持这种状态就好，我会站在你身后。
      每天都要开心是我对你最大的祝愿！
    `,
  },
  {
    id: '837621',
    name: '梁晨',
    nickname: '二晨',
    joinDate: '2025-02-16 00:00:00',
    frontImg: '/badges/erchen.png',
    backImg: '/badges/erchen-back.png',
    svgPath: '/badges/erchen-shape.svg',
    themeColor: '#241229',
    letterContent: `
      To 二晨：
      刚来工作室的那会儿，\
      你跟我说会一点儿建模，\
      实习之前突飞猛进，现在更是在实习单位参与了完整的项目制作。\
      你真的已经很厉害了，不要低估自己的能力，\
      我会尽我所能给你提供帮助。
    `,
  },
  {
    id: '674529',
    name: '郭雨彤',
    nickname: '小玖',
    joinDate: '2025-03-23 00:00:00',
    frontImg: '/badges/xiaojiu.png',
    backImg: '/badges/xiaojiu-back.png',
    svgPath: '/badges/xiaojiu-shape.svg',
    themeColor: '#241229',
    letterContent: `
      To 小玖：
      师姐！我们很快就有机会一起工作了，本学期辛苦了！
      期待我们在未来的合作能碰撞出更多花火！
    `,
  },
  {
    id: '528937',
    name: '英凯歌',
    nickname: 'Kevin',
    joinDate: '2025-09-01 00:00:00',
    frontImg: '/badges/Kevin.png',
    backImg: '/badges/Kevin-back.png',
    svgPath: '/badges/Kevin-shape.svg',
    themeColor: '#241229',
    letterContent: `
      To Kevin：
      再次欢迎你加入123工作室，今年看到了你的成长，\
      也感受到了你无限的可能，下学期也要继续加油哦！
    `,
  },
  {
    id: '419276',
    name: '赵圆圆',
    nickname: '老狗',
    joinDate: '2025-11-01 00:00:00',
    frontImg: '/badges/laogou.png',
    backImg: '/badges/laogou-back.png',
    svgPath: '/badges/laogou-shape.svg',
    themeColor: '#241229',
    letterContent: `
      To 狗宝：
      你是我们能量非常非常非常高的小课代表！\
      积极认真负责是你对工作的完美态度。\
      即使有一些小拖延但也能理解，因为我大学的时候比你还严重哈哈哈。\
      但这学期相信你的进步是大家可见的，\
      大家见不到我看见了，我说你进步了你就是进步了，别怀疑！
      接下来的生活、学习、工作都有我在你后面，安心往前走吧。
    `,
  },
  {
    id: '786354',
    name: '陈可欣',
    nickname: '面包',
    joinDate: '2025-11-05 00:00:00',
    frontImg: '/badges/mianbao.png',
    backImg: '/badges/mianbao-back.png',
    svgPath: '/badges/mianbao-shape.svg',
    themeColor: '#241229',
    letterContent: `
      To 面包：
      再次欢迎你加入123工作室，下学期也要继续加油哦！
    `,
  },
  {
    id: '345798',
    name: '陈思洁',
    nickname: '锅包肉',
    joinDate: '2025-11-05 00:00:00',
    frontImg: '/badges/guobaorou.png',
    backImg: '/badges/guobaorou-back.png',
    svgPath: '/badges/guobaorou-shape.svg',
    themeColor: '#241229',
    letterContent: `
      To 锅包肉：
      再次欢迎你加入123工作室，下学期也要继续加油哦！
    `,
  },
  {
    id: '912485',
    name: '李宇涵',
    nickname: '石榴',
    joinDate: '2025-11-05 00:00:00',
    frontImg: '/badges/shiliu.png',
    backImg: '/badges/shiliu-back.png',
    svgPath: '/badges/shiliu-shape.svg',
    themeColor: '#241229',
    letterContent: `
      To 石榴：
      再次欢迎你加入123工作室，下学期也要继续加油哦！
    `,
  },
  {
    id: '563147',
    name: '刘瑞馨',
    nickname: '小咩',
    joinDate: '2025-11-05 00:00:00',
    frontImg: '/badges/xiaomie.png',
    backImg: '/badges/xiaomie-back.png',
    svgPath: '/badges/xiaomie-shape.svg',
    themeColor: '#241229',
    letterContent: `
      To 小咩：
      再次欢迎你加入123工作室，下学期也要继续加油哦！
    `,
  },
  
];

// 根据 ID 获取勋章配置
export function getBadgeById(id: string): BadgeConfig | undefined {
  return badgesConfig.find(badge => badge.id === id);
}

// 获取所有勋章 ID 列表
export function getAllBadgeIds(): string[] {
  return badgesConfig.map(badge => badge.id);
}
