// 统一管理站点可配置内容(后面页面直接从这里取)
export const BRAND = {
  nameCN: "福乐音乐工作室",
  nameEN: "Fuel Music Studio",
  slogan: "混得干净 响得高级——Fuel Music,Fuel your sound",
};

export const BUSINESS = [
  { title: "单曲混音", desc: "人声处理、节奏校准、空间与动态控制，交付 stems 与母带预览。" },
  { title: "编曲定制", desc: "旋律/和声/鼓组编配，音色设计与结构优化；风格拟合(流行/Hip-Hop/电子/民谣等)。可交付 stems、MIDI 与项目工程。" },
  { title: "母带处理", desc: "响度、宽度与平台一致性校验(流媒体/广播)。" },
  { title: "封面制作", desc: "单曲/专辑封面设计与品牌视觉统一；平台尺寸适配(网易云/QQ/Apple Music/抖音等)，导出高清素材。" },
];

export type CaseItem = {
  slug: string;            // 用于路由
  artist: string;          // 艺人/品牌
  title: string;           // 作品名(含单曲/EP/专辑)
  year?: number;           // 年份(可选)
  role?: string;           // 参与角色(如 混音/母带)
  credits?: string;        // 署名/制作人等(可选)
  description?: string;    // 简介(可选)
  cover?: string;          // 封面图 /covers/xxx.jpg
  audio?: string;          // 试听音频 /demos/xxx.mp3
  playCount?: number;      // 播放量，可选
  playCountLabel?: string; // 新增：优先显示该文案
};

export const CASES: CaseItem[] = [
  {
    slug: "song-2148786274",
    artist: "KKLUV & 那奇沃夫",
    title: "KASABLANKA",
    credits: "Fuel Music Studio",
    description: "来自 NetEase ID 2148786274 的项目。",
    cover: "/covers/KASABLANKA.webp",
    audio: "/demos/KASABLANKA.mp3",
    playCountLabel: "全平台累计播放量100W+"
  },
  {
    slug: "song-2736432331",
    artist: "AThree",
    title: "WagWan",
    credits: "Fuel Music Studio",
    description: "来自 NetEase ID 2736432331 的项目。",
    cover: "/covers/WagWan.webp",
    audio: "/demos/WagWan.mp3",
    playCountLabel: "全平台累计播放量100W+"
  },
  {
    slug: "song-2638790383",
    artist: "SAM",
    title: "三环路",
    credits: "Fuel Music Studio",
    description: "来自 NetEase ID 2638790383 的项目。",
    cover: "/covers/三环路.webp",
    audio: "/demos/三环路.mp3",
    playCountLabel: "全平台累计播放量100W+"
  },
];

export interface PriceItem {
  name?: string;
  slug?: string;
  title?: string;
  price: string;
  note?: string;
  badge?: string;
  features: string[];
  cta?: { label: string; href: string };
}
export const PRICING: PriceItem[] = [
  {
    slug: "vocal-mix",
    title: "Vocal 贴唱混音(带伴奏 ≤5 轨)",
    price: "¥699 / 首",
    badge: "热门",
    features: [
      "交付内容：成品混音 + 母带",
      "修改规则：交付后三天内不限次数修改，直至满意",
      "额外收费：",
      "每增加 1 轨：+¥50",
      "每增加 1 位合作歌手：+¥300",
    ],
    cta: { label: "联系下单", href: "#contact" },
  },
  {
    slug: "stems-mix",
    title: "分轨混音(音轨数≤ 30 轨)",
    price: "¥1,199 起 / 首",
    badge: "工程定价",
    features: [
      "交付内容：分轨混音 + 高质量母带",
      "修改规则：交付后一周内不限次数修改，直至满意",
      "具体价格按轨道数量商议",
    ],
    cta: { label: "发工程评估", href: "#contact" },
  },
  {
    slug: "commercial-release",
    title: "商业 / 发行版(公司 / 唱片用)",
    price: "价格：面议",
    badge: "定制",
    features: [
      "交付内容：",
      "分轨混音 + 母带",
      "多版本导出(Clean / Explicit / Instrumental / TV Mix)",
      "多采样率格式(WAV 16bit / 24bit, MP3 等)",
      "修改规则：交付后可长期配合修改，直至满意",
      "备注：可额外提供制作人角色的深度参与",
    ],
    cta: { label: "咨询详情", href: "#contact" },
  },
  {
    slug: "producer-role",
    title: "制作人参与(Producer Role)",
    price: "收费：根据项目深度另行协商",
    features: [
      "服务内容：",
      "提供创意意见 & 编曲建议",
      "指导歌手演唱表现",
      "协助选择 take、调整歌词结构",
      "把控整体氛围与作品方向",
    ],
    cta: { label: "咨询制作人服务", href: "#contact" },
  },
];

export const CONTACT = {
  email: "1779916397@qq.com",
  wechat: "fuelmusic",
  phone: "13565685912",
};

export const APP_LINKS = {
  // TODO: 等下载页时会用到(TestFlight / APK / 商店链接)
  ios: "https://example.com/ios",
  android: "https://example.com/android",
};
