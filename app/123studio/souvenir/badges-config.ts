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
    id: 'long0617',
    name: '工作室MVP',
    nickname: '龙哥',
    joinDate: '2024-08-08 00:00:00',
    frontImg: '/badges/yilong.png',
    backImg: '/badges/yilong-back.png',
    svgPath: '/badges/yilong-shape.svg',
    themeColor: '#241229',
    letterContent: `
      
    `,
  },
  {
    id: 'wangzai7777',
    name: '赵心旺',
    nickname: '旺仔',
    joinDate: '2024-08-08 00:00:00',
    frontImg: '/badges/wangzai.png',
    backImg: '/badges/wangzai-back.png',
    svgPath: '/badges/wangzai-shape.svg',
    themeColor: '#241229',
    letterContent: `
      
    `,
  },
  {
    id: 'xiongbao123',
    name: '熊芮琪',
    nickname: '熊宝',
    joinDate: '2024-11-13 00:00:00',
    frontImg: '/badges/xiongbao.png',
    backImg: '/badges/xiongbao-back.png',
    svgPath: '/badges/xiongbao-shape.svg',
    themeColor: '#241229',
    letterContent: `
      
    `,
  },
  {
    id: 'shanze123',
    name: '崔芳泽',
    nickname: '山泽',
    joinDate: '2024-11-15 00:00:00',
    frontImg: '/badges/shanze.png',
    backImg: '/badges/shanze-back.png',
    svgPath: '/badges/shanze-shape.svg',
    themeColor: '#241229',
    letterContent: `
      
    `,
  },
  {
    id: 'yaozi123',
    name: '关璐瑶',
    nickname: '瑶子',
    joinDate: '2024-11-15 00:00:00',
    frontImg: '/badges/yaozi.png',
    backImg: '/badges/yaozi-back.png',
    svgPath: '/badges/yaozi-shape.svg',
    themeColor: '#241229',
    letterContent: `
      
    `,
  },
  {
    id: 'dabing123',
    name: '夏颖悦',
    nickname: '大饼',
    joinDate: '2024-11-15 00:00:00',
    frontImg: '/badges/dabing.png',
    backImg: '/badges/dabing-back.png',
    svgPath: '/badges/dabing-shape.svg',
    themeColor: '#241229',
    letterContent: `
      
    `,
  },
  {
    id: 'iah0921',
    name: '程紫月',
    nickname: '紫悦',
    joinDate: '2024-12-01 00:00:00',
    frontImg: '/badges/ziyue-black.png',
    backImg: '/badges/ziyue-back.png',
    svgPath: '/badges/ziyue-shape.svg',
    themeColor: '#241229',
    letterContent: `
      
    `,
  },
  {
    id: 'erchen123',
    name: '梁晨',
    nickname: '二晨',
    joinDate: '2025-02-16 00:00:00',
    frontImg: '/badges/erchen.png',
    backImg: '/badges/erchen-back.png',
    svgPath: '/badges/erchen-shape.svg',
    themeColor: '#241229',
    letterContent: `
      
    `,
  },
  {
    id: 'xiaojiu123',
    name: '郭雨彤',
    nickname: '小玖',
    joinDate: '2025-03-23 00:00:00',
    frontImg: '/badges/xiaojiu.png',
    backImg: '/badges/xiaojiu-back.png',
    svgPath: '/badges/xiaojiu-shape.svg',
    themeColor: '#241229',
    letterContent: `
      
    `,
  },
  {
    id: 'kevin123',
    name: '英凯歌',
    nickname: 'Kevin',
    joinDate: '2025-09-01 00:00:00',
    frontImg: '/badges/Kevin.png',
    backImg: '/badges/Kevin-back.png',
    svgPath: '/badges/Kevin-shape.svg',
    themeColor: '#241229',
    letterContent: `
      
    `,
  },
  {
    id: 'goubao0908',
    name: '赵圆圆',
    nickname: '老狗',
    joinDate: '2025-11-01 00:00:00',
    frontImg: '/badges/laogou.png',
    backImg: '/badges/laogou-back.png',
    svgPath: '/badges/laogou-shape.svg',
    themeColor: '#241229',
    letterContent: `
      
    `,
  },
  {
    id: 'bread123',
    name: '陈可欣',
    nickname: '面包',
    joinDate: '2025-11-05 00:00:00',
    frontImg: '/badges/mianbao.png',
    backImg: '/badges/mianbao-back.png',
    svgPath: '/badges/mianbao-shape.svg',
    themeColor: '#241229',
    letterContent: `
      
    `,
  },
  {
    id: 'guobaorou123',
    name: '陈思洁',
    nickname: '锅包肉',
    joinDate: '2025-11-05 00:00:00',
    frontImg: '/badges/guobaorou.png',
    backImg: '/badges/guobaorou-back.png',
    svgPath: '/badges/guobaorou-shape.svg',
    themeColor: '#241229',
    letterContent: `
      
    `,
  },
  {
    id: 'shiliu123',
    name: '李宇涵',
    nickname: '石榴',
    joinDate: '2025-11-05 00:00:00',
    frontImg: '/badges/shiliu.png',
    backImg: '/badges/shiliu-back.png',
    svgPath: '/badges/shiliu-shape.svg',
    themeColor: '#241229',
    letterContent: `
      
    `,
  },
  {
    id: 'xiaomie123',
    name: '刘瑞馨',
    nickname: '小咩',
    joinDate: '2025-11-05 00:00:00',
    frontImg: '/badges/xiaomie.png',
    backImg: '/badges/xiaomie-back.png',
    svgPath: '/badges/xiaomie-shape.svg',
    themeColor: '#241229',
    letterContent: `
      
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
