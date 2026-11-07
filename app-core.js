'use strict';

/* =========================================================
   老人言 · 公司管理台 — core data, formatting, routing, search
   ========================================================= */

const STORAGE_KEY = 'laorenjian.console.v1';
const DATA_VERSION = 1;
const AS_OF = '2026-11-06';
const FX_DATE = '2026-11-06';
const PAGE_SIZE = 8;

const CURRENCIES = {
  CNY: { code: 'CNY', symbol: '¥', label: '人民币' },
  USD: { code: 'USD', symbol: 'US$', label: '美元' },
  EUR: { code: 'EUR', symbol: '€', label: '欧元' },
  HKD: { code: 'HKD', symbol: 'HK$', label: '港元' },
  JPY: { code: 'JPY', symbol: 'JP¥', label: '日元' }
};
const CURRENCY_ORDER = ['CNY', 'USD', 'EUR', 'HKD', 'JPY'];
const RATES = { CNY: 1, USD: 0.1406, EUR: 0.1294, HKD: 1.0943, JPY: 21.36 };
const ACCOUNT_NAMES = { CNY: '人民币基本户', USD: '美元结算户', HKD: '港币结算户' };

function accountLabel(code) {
  return ACCOUNT_NAMES[code] || `${code} 账户`;
}

const CHART_MONTHS = [
  { key: '2025-12', label: '12月', full: '2025年12月', revenue: 512, expense: 338 },
  { key: '2026-01', label: '1月', full: '2026年1月', revenue: 548, expense: 352 },
  { key: '2026-02', label: '2月', full: '2026年2月', revenue: 536, expense: 341 },
  { key: '2026-03', label: '3月', full: '2026年3月', revenue: 612, expense: 388 },
  { key: '2026-04', label: '4月', full: '2026年4月', revenue: 588, expense: 372 },
  { key: '2026-05', label: '5月', full: '2026年5月', revenue: 641, expense: 401 },
  { key: '2026-06', label: '6月', full: '2026年6月', revenue: 672, expense: 428 },
  { key: '2026-07', label: '7月', full: '2026年7月', revenue: 658, expense: 416 },
  { key: '2026-08', label: '8月', full: '2026年8月', revenue: 704, expense: 439 },
  { key: '2026-09', label: '9月', full: '2026年9月', revenue: 742, expense: 462 },
  { key: '2026-10', label: '10月', full: '2026年10月', revenue: 768, expense: 471 },
  { key: '2026-11', label: '11月', full: '2026年11月', revenue: 811, expense: 498 }
];

const EXPENSE_BREAKDOWN = [
  { name: '人力成本', pct: 42, color: '#1f5a48' },
  { name: '研发投入', pct: 24, color: '#6f8f7f' },
  { name: '运营开支', pct: 18, color: '#a3b9ac' },
  { name: '市场与销售', pct: 11, color: '#c9b58c' },
  { name: '其他', pct: 5, color: '#d8ddd8' }
];

const BUSINESS_LINES = [
  { name: '品牌与官网', value: 2380 },
  { name: '业务系统', value: 1960 },
  { name: '数据服务', value: 1540 },
  { name: '数字展陈', value: 1120 },
  { name: '运维与顾问', value: 792 }
];

const GROUP_ENTITIES = [
  { id: 'g1', name: '老人言（杭州）数字科技有限公司', short: '杭州数字科技', share: 100, revenue: 4280, employees: 18, since: '2018', lead: '吕金德', role: '产品研发与交付', status: '运营中' },
  { id: 'g2', name: '言序软件（深圳）有限公司', short: '深圳言序软件', share: 100, revenue: 3160, employees: 14, since: '2019', lead: '王震', role: '企业软件与系统集成', status: '运营中' },
  { id: 'g3', name: '老人言文化传播（杭州）有限公司', short: '文化传播', share: 100, revenue: 2040, employees: 9, since: '2020', lead: '张景明', role: '品牌内容与数字展陈', status: '运营中' },
  { id: 'g4', name: '青简数据服务（成都）有限公司', short: '青简数据', share: 80, revenue: 1860, employees: 12, since: '2021', lead: '陈海军', role: '数据中台与分析服务', status: '运营中' },
  { id: 'g5', name: '炎合投资管理（杭州）有限公司', short: '炎合投资', share: 100, revenue: 1420, employees: 6, since: '2021', lead: '张玉琴', role: '产业投资与财务管理', status: '运营中' },
  { id: 'g6', name: '老人言（上海）网络科技有限公司', short: '上海网络科技', share: 65, revenue: 1380, employees: 8, since: '2023', lead: '顾清', role: '华东区域业务', status: '运营中' }
];

const STOCKS = [
  { code: '600519', name: '贵州茅台', price: 1526.80, changePct: 0.86, open: 1518.20, high: 1532.50, low: 1512.10, volume: 31800, turnover: 4852000000, pe: 23.8, turnoverRate: 0.25, market: '沪市', volatility: 0.012, trend: 0.06 },
  { code: '300750', name: '宁德时代', price: 268.42, changePct: 1.24, open: 265.10, high: 271.36, low: 263.82, volume: 886000, turnover: 23760000000, pe: 21.4, turnoverRate: 0.72, market: '深市', volatility: 0.021, trend: 0.14 },
  { code: '600036', name: '招商银行', price: 39.86, changePct: -0.35, open: 40.12, high: 40.28, low: 39.72, volume: 1240000, turnover: 4950000000, pe: 6.9, turnoverRate: 0.48, market: '沪市', volatility: 0.011, trend: 0.03 },
  { code: '688981', name: '中芯国际', price: 92.35, changePct: 2.17, open: 90.62, high: 93.18, low: 90.20, volume: 2210000, turnover: 20380000000, pe: 64.2, turnoverRate: 1.13, market: '科创板', volatility: 0.027, trend: 0.21 },
  { code: '002594', name: '比亚迪', price: 312.10, changePct: -0.62, open: 314.80, high: 315.20, low: 310.44, volume: 932000, turnover: 29120000000, pe: 26.1, turnoverRate: 0.86, market: '深市', volatility: 0.019, trend: 0.09 }
];

const MARKET_INDICES = [
  { name: '上证指数', value: '3,486.72', change: 0.68, high: 3491.20, low: 3452.10, points: [30, 34, 31, 36, 38, 35, 41, 44, 42, 47, 49, 53] },
  { name: '深证成指', value: '11,245.10', change: -0.32, high: 11290.40, low: 11198.70, points: [45, 42, 44, 39, 41, 38, 40, 36, 38, 35, 34, 32] },
  { name: '创业板指', value: '2,312.45', change: 1.14, high: 2325.66, low: 2284.30, points: [24, 27, 25, 30, 29, 33, 32, 37, 36, 40, 43, 46] }
];

const SECTORS = [
  { name: '软件服务', pct: 2.41 },
  { name: '半导体', pct: 1.82 },
  { name: '新能源', pct: 0.64 },
  { name: '消费电子', pct: -0.28 },
  { name: '银行', pct: -0.53 }
];

const NOTIFICATIONS_SEED = [
  { id: 'n1', title: '10 月财务月报已生成', desc: '营收与支出完成合并对账，可前往数据看板查看。', time: '今天 09:20', read: false, target: { page: 'dashboard' } },
  { id: 'n2', title: '云栖数字的协议待确认', desc: '年度运维服务协议已发送至对接人，等待双方盖章。', time: '今天 08:46', read: false, target: { page: 'partners', kind: 'partner', id: 'p1' } },
  { id: 'n3', title: '客户回款已到账', desc: '杭州云栖数字科技年度运维尾款 ¥1,280,000 已入账。', time: '昨天 16:12', read: false, target: { page: 'funds', kind: 'transaction', id: 't1' } }
];

/* ---------- Seed data ---------- */

function seedPartners() {
  return [
    { id: 'p1', name: '杭州云栖数字科技有限公司', short: '云栖数字', type: '战略伙伴', contact: '周启明', phone: '138 0571 2634', since: '2021-03', amount: 2860000, status: '合作中', note: '年度运维与数据服务合作方，主要覆盖集团官网与客户数据平台。' },
    { id: 'p2', name: '上海知行网络科技有限公司', short: '知行网络', type: '渠道合作', contact: '陈一苇', phone: '139 1862 7401', since: '2022-07', amount: 1420000, status: '合作中', note: '华东区域渠道合作，重点协同品牌官网与小程序项目。' },
    { id: 'p3', name: '深圳一页智能有限公司', short: '一页智能', type: '供应商', contact: '梁思远', phone: '136 7742 1189', since: '2020-11', amount: 3150000, status: '合作中', note: '云资源与智能客服组件供应商，按季度结算。' },
    { id: 'p4', name: '北京简牍文化传播有限公司', short: '简牍文化', type: '战略伙伴', contact: '赵知白', phone: '137 0118 6652', since: '2023-04', amount: 980000, status: '洽谈中', note: '文化内容与出版资源合作，首个联合项目正在评估。' },
    { id: 'p5', name: '苏州闻道信息技术有限公司', short: '闻道信息', type: '供应商', contact: '程若谷', phone: '158 6254 9930', since: '2019-09', amount: 2240000, status: '合作中', note: '长期测试与实施外包伙伴，交付质量稳定。' },
    { id: 'p6', name: '广州见山品牌策划有限公司', short: '见山品牌', type: '渠道合作', contact: '罗清和', phone: '186 2088 4371', since: '2024-01', amount: 760000, status: '合作中', note: '品牌策略与视觉顾问，参与消费类客户项目。' },
    { id: 'p7', name: '南京格物软件有限公司', short: '格物软件', type: '供应商', contact: '徐行', phone: '133 8206 5127', since: '2020-05', amount: 1860000, status: '合作中', note: '后端组件与数据库技术服务供应商。' },
    { id: 'p8', name: '成都青禾互动科技有限公司', short: '青禾互动', type: '渠道合作', contact: '何棠', phone: '189 8062 7713', since: '2023-08', amount: 640000, status: '已暂停', note: '西南区域活动运营合作，因项目排期暂停。' },
    { id: 'p9', name: '武汉九章数据服务有限公司', short: '九章数据', type: '战略伙伴', contact: '余声', phone: '135 0718 3304', since: '2022-02', amount: 2080000, status: '合作中', note: '数据治理与经营分析联合交付伙伴。' },
    { id: 'p10', name: '宁波观澜企业管理咨询有限公司', short: '观澜咨询', type: '渠道合作', contact: '林岑', phone: '137 5741 8896', since: '2021-10', amount: 520000, status: '合作中', note: '组织咨询与管理培训渠道。' },
    { id: 'p11', name: '厦门白鹭数字科技有限公司', short: '白鹭数字', type: '供应商', contact: '庄言', phone: '187 5923 4102', since: '2024-03', amount: 880000, status: '洽谈中', note: '短视频与三维内容供应商，正在比稿。' },
    { id: 'p12', name: '合肥启明教育科技有限公司', short: '启明教育', type: '渠道合作', contact: '陶然', phone: '139 5512 6638', since: '2023-06', amount: 1120000, status: '合作中', note: '教育行业渠道，协同校园数字化项目。' },
    { id: 'p13', name: '杭州纸间文化创意有限公司', short: '纸间文创', type: '供应商', contact: '沈青', phone: '136 4681 2094', since: '2022-09', amount: 460000, status: '合作中', note: '展陈物料与印刷制作供应商。' },
    { id: 'p14', name: '上海声叙科技有限公司', short: '声叙科技', type: '战略伙伴', contact: '陆遥', phone: '138 1726 9450', since: '2021-06', amount: 1980000, status: '合作中', note: '语音交互与无障碍体验联合研发。' },
    { id: 'p15', name: '北京正则数据有限公司', short: '正则数据', type: '供应商', contact: '韩序', phone: '185 0134 7728', since: '2020-08', amount: 1260000, status: '合作中', note: '数据标注与质量校验服务。' },
    { id: 'p16', name: '深圳南屿云计算有限公司', short: '南屿云', type: '供应商', contact: '许望', phone: '137 2348 6611', since: '2023-11', amount: 1540000, status: '合作中', note: '混合云资源与灾备服务供应商。' },
    { id: 'p17', name: '杭州栖迟设计有限公司', short: '栖迟设计', type: '渠道合作', contact: '顾青', phone: '158 5812 7046', since: '2024-06', amount: 320000, status: '洽谈中', note: '空间与导视设计合作，正在沟通框架协议。' },
    { id: 'p18', name: '广州长川信息科技有限公司', short: '长川信息', type: '战略伙伴', contact: '沈括', phone: '186 2081 3352', since: '2021-12', amount: 2420000, status: '合作中', note: '华南区域政企项目联合交付伙伴。' }
  ];
}

function seedClients() {
  return [
    { id: 'c1', name: '杭州市文化馆', contact: '沈老师', phone: '0571-8702 3148', amount: 1860000, since: '2021-04', last: '2026-11-02', status: '活跃', deals: 7, note: '公共文化数字服务长期客户，年度框架协议续签中。' },
    { id: 'c2', name: '浙江青禾教育科技有限公司', contact: '方宁', phone: '137 5821 6690', amount: 980000, since: '2022-08', last: '2026-10-28', status: '活跃', deals: 4, note: '校园管理平台与数据看板项目，交付中。' },
    { id: 'c3', name: '苏州工业园区展览中心', contact: '陆晨', phone: '0512-6288 1173', amount: 760000, since: '2023-03', last: '2026-10-20', status: '活跃', deals: 3, note: '数字展陈与票务小程序合作。' },
    { id: 'c4', name: '上海远山品牌咨询有限公司', contact: '许知微', phone: '139 1780 4426', amount: 1240000, since: '2020-11', last: '2026-10-18', status: '活跃', deals: 6, note: '品牌官网共建伙伴，项目按季度滚动。' },
    { id: 'c5', name: '南京云上书局有限公司', contact: '周屿', phone: '138 5162 9037', amount: 430000, since: '2024-02', last: '2026-09-30', status: '跟进中', deals: 2, note: '线上书店与会员系统升级需求评估中。' },
    { id: 'c6', name: '成都见微文化传播有限公司', contact: '唐可', phone: '186 2810 5574', amount: 680000, since: '2022-12', last: '2026-10-12', status: '活跃', deals: 4, note: '文化内容小程序二期已上线。' },
    { id: 'c7', name: '武汉光谷人才服务中心', contact: '何主任', phone: '027-6788 2045', amount: 1560000, since: '2021-09', last: '2026-10-24', status: '活跃', deals: 5, note: '人才服务平台年度运维与功能迭代。' },
    { id: 'c8', name: '宁波海曙文旅集团有限公司', contact: '林岚', phone: '137 5744 8120', amount: 2230000, since: '2020-06', last: '2026-09-22', status: '活跃', deals: 8, note: '文旅小程序与数字导览核心客户。' },
    { id: 'c9', name: '厦门鹭岛数字传媒有限公司', contact: '庄晓', phone: '136 0603 7812', amount: 540000, since: '2023-10', last: '2026-08-30', status: '跟进中', deals: 2, note: '正在沟通内容中台与素材管理升级。' },
    { id: 'c10', name: '合肥新知教育科技有限公司', contact: '陶老师', phone: '139 5516 2284', amount: 820000, since: '2022-05', last: '2026-09-16', status: '活跃', deals: 3, note: '课程平台与教务系统维护中。' },
    { id: 'c11', name: '北京简言文化有限公司', contact: '宋简', phone: '185 0112 6693', amount: 390000, since: '2024-07', last: '2026-07-21', status: '已归档', deals: 1, note: '单次品牌站项目已结项，暂无续约计划。' },
    { id: 'c12', name: '深圳前海智合科技有限公司', contact: '罗嘉', phone: '137 2377 9021', amount: 1160000, since: '2021-12', last: '2026-10-26', status: '活跃', deals: 5, note: '企业官网与数据报表长期服务。' }
  ];
}

function seedTransactions() {
  return [
    { id: 't1', date: '2026-11-05', type: '存入', amount: 1280000, currency: 'CNY', account: 'CNY', counterparty: '杭州云栖数字科技有限公司', summary: '年度运维服务尾款', status: '已入账' },
    { id: 't2', date: '2026-11-04', type: '转出', amount: 386500, currency: 'CNY', account: 'CNY', counterparty: '深圳一页智能有限公司', summary: '云资源采购结算', status: '已转出' },
    { id: 't3', date: '2026-11-01', type: '存入', amount: 42000, currency: 'USD', account: 'USD', counterparty: 'Northwind Studio', summary: '海外项目首期款', status: '已入账' },
    { id: 't4', date: '2026-11-06', type: '转出', amount: 268000, currency: 'CNY', account: 'CNY', counterparty: '苏州闻道信息技术有限公司', summary: '供应商质保金', status: '待确认' },
    { id: 't5', date: '2026-10-28', type: '转出', amount: 248000, currency: 'CNY', account: 'CNY', counterparty: '言序软件（深圳）有限公司', summary: '项目外包结算', status: '已转出' },
    { id: 't6', date: '2026-10-24', type: '存入', amount: 680000, currency: 'CNY', account: 'CNY', counterparty: '武汉光谷人才服务中心', summary: '数字展厅项目回款', status: '已入账' },
    { id: 't7', date: '2026-10-18', type: '转出', amount: 96000, currency: 'HKD', account: 'HKD', counterparty: '香港见闻设计顾问', summary: '品牌顾问费', status: '已转出' },
    { id: 't8', date: '2026-10-12', type: '存入', amount: 420000, currency: 'CNY', account: 'CNY', counterparty: '成都见微文化传播有限公司', summary: '小程序二期款', status: '已入账' },
    { id: 't9', date: '2026-09-29', type: '转出', amount: 512000, currency: 'CNY', account: 'CNY', counterparty: '公司薪酬专户', summary: '员工薪酬与社保', status: '已转出' },
    { id: 't10', date: '2026-09-20', type: '存入', amount: 960000, currency: 'CNY', account: 'CNY', counterparty: '老人言控股（集团）有限公司', summary: '集团内部调拨', status: '已入账' },
    { id: 't11', date: '2026-09-08', type: '转出', amount: 18500, currency: 'USD', account: 'USD', counterparty: 'Cloud Services Inc.', summary: '云服务与设计软件续费', status: '已转出' },
    { id: 't12', date: '2026-08-30', type: '存入', amount: 760000, currency: 'CNY', account: 'CNY', counterparty: '南京云上书局有限公司', summary: '数据中台项目首付款', status: '已入账' },
    { id: 't13', date: '2026-08-16', type: '转出', amount: 318000, currency: 'CNY', account: 'CNY', counterparty: '杭州栖迟设计有限公司', summary: '办公场地与空间改造', status: '已转出' },
    { id: 't14', date: '2026-07-28', type: '存入', amount: 1180000, currency: 'CNY', account: 'CNY', counterparty: '宁波海曙文旅集团有限公司', summary: '文旅小程序年度服务费', status: '已入账' },
    { id: 't15', date: '2026-07-15', type: '转出', amount: 226000, currency: 'CNY', account: 'CNY', counterparty: '广州见山品牌策划有限公司', summary: '市场推广费用', status: '已转出' },
    { id: 't16', date: '2026-06-26', type: '存入', amount: 120000, currency: 'HKD', account: 'HKD', counterparty: '香港见闻设计顾问', summary: '香港项目尾款', status: '已入账' },
    { id: 't17', date: '2026-06-10', type: '转出', amount: 1860000, currency: 'CNY', account: 'CNY', counterparty: '上海声叙科技有限公司', summary: '研发设备与授权采购', status: '已转出' }
  ];
}

function seedEmployees() {
  return [
    { id: 'e1', name: '老人炎', role: '董事长', dept: '管理层', phone: '138 0000 0001', since: '2018-04-12', status: '在职', email: 'laorenyan@laoren.co' },
    { id: 'e2', name: '吕金德', role: '技术总监', dept: '技术部', phone: '139 5710 2208', since: '2019-06-03', status: '在职', email: 'lvjinde@laoren.co' },
    { id: 'e3', name: '王震', role: '产品总监', dept: '产品部', phone: '136 0651 7742', since: '2020-02-17', status: '在职', email: 'wangzhen@laoren.co' },
    { id: 'e4', name: '张景明', role: '设计主管', dept: '设计部', phone: '158 6812 3390', since: '2020-08-24', status: '在职', email: 'zhangjingming@laoren.co' },
    { id: 'e5', name: '张玉琴', role: '财务经理', dept: '财务部', phone: '137 5718 6624', since: '2019-11-05', status: '在职', email: 'zhangyuqin@laoren.co' },
    { id: 'e6', name: '顾清', role: '客户总监', dept: '商务部', phone: '186 0681 9927', since: '2020-05-19', status: '在职', email: 'guqing@laoren.co' },
    { id: 'e7', name: '夏清', role: '前端工程师', dept: '技术部', phone: '135 8824 1063', since: '2022-03-14', status: '在职', email: 'xiaqing@laoren.co' },
    { id: 'e8', name: '陈海军', role: '后端工程师', dept: '技术部', phone: '182 5716 4480', since: '2021-09-27', status: '在职', email: 'chenhaijun@laoren.co' },
    { id: 'e9', name: '唐棠', role: '项目经理', dept: '交付部', phone: '150 6873 2205', since: '2023-01-09', status: '在职', email: 'tangtang@laoren.co' },
    { id: 'e10', name: '叶青', role: '市场专员', dept: '市场部', phone: '188 1502 7736', since: '2024-05-20', status: '试用', email: 'yeqing@laoren.co' }
  ];
}

function seedServices() {
  return [
    { id: 's1', name: '企业官网与品牌站', desc: '面向品牌升级与业务展示的响应式官网，含内容结构、视觉设计与上线部署。', price: 68000, priceUnit: '起', owner: '王震', projects: 8, status: '在售', tags: ['响应式', '品牌内容', 'SEO'] },
    { id: 's2', name: '小程序与移动应用', desc: '微信小程序、轻应用与跨端 App 的从 0 到 1 交付，覆盖体验设计与持续迭代。', price: 120000, priceUnit: '起', owner: '吕金德', projects: 6, status: '在售', tags: ['微信生态', '跨端', '体验设计'] },
    { id: 's3', name: '业务管理系统', desc: '客户、合同、库存与流程的定制化管理系统，按真实业务路径搭建。', price: 180000, priceUnit: '起', owner: '王震', projects: 5, status: '在售', tags: ['流程', '权限', '数据'] },
    { id: 's4', name: '数据中台与报表', desc: '数据接入、指标体系与经营看板的一体化建设，让口径稳定、查询可控。', price: 240000, priceUnit: '起', owner: '陈海军', projects: 3, status: '在售', tags: ['指标体系', '看板', '数据治理'] },
    { id: 's5', name: '数字展陈与互动', desc: '展厅、活动与文旅场景的数字内容与交互装置，兼顾内容叙事与现场体验。', price: 150000, priceUnit: '起', owner: '张景明', projects: 4, status: '暂停接单', tags: ['互动装置', '数字内容', '文旅'] },
    { id: 's6', name: '技术顾问与运维', desc: '架构评审、性能优化与长期技术运维支持，按年度或项目周期提供。', price: 30000, priceUnit: '/年', owner: '吕金德', projects: 9, status: '在售', tags: ['架构评审', '运维', '性能'] }
  ];
}

function createSeedState() {
  return {
    version: DATA_VERSION,
    partners: seedPartners(),
    clients: seedClients(),
    transactions: seedTransactions(),
    employees: seedEmployees(),
    services: seedServices(),
    accounts: { CNY: 31020000, USD: 640000, HKD: 3120000 },
    notifications: NOTIFICATIONS_SEED.map((item) => ({ ...item, target: { ...item.target } }))
  };
}

/* ---------- State ---------- */

let state;
try {
  const raw = localStorage.getItem(STORAGE_KEY);
  const parsed = raw ? JSON.parse(raw) : null;
  state = parsed && parsed.version === DATA_VERSION ? parsed : createSeedState();
} catch (error) {
  state = createSeedState();
}

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    toast('数据保存失败，请检查浏览器存储权限', 'error');
  }
}

const ui = {
  page: 'dashboard',
  currency: 'CNY',
  period: '12m',
  partnerTab: 'partners',
  partnerFilter: 'all',
  partnerSort: 'amount',
  partnerPage: 1,
  clientFilter: 'all',
  clientSort: 'amount',
  clientPage: 1,
  fundFilter: 'all',
  fundPage: 1,
  teamTab: 'services',
  employeeFilter: 'all',
  stockCode: '600519',
  stockRange: '3M',
  animateNext: true,
  animateValues: false,
  searchIndex: -1
};

const charts = {};

/* ---------- Helpers ---------- */

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

function esc(value) {
  return String(value ?? '').replace(/[&<>"']/g, (char) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[char]));
}

function icon(name, className = '') {
  return `<svg class="${className}" viewBox="0 0 24 24" aria-hidden="true"><use href="#i-${name}"></use></svg>`;
}

function uid(prefix) {
  if (window.crypto && typeof window.crypto.randomUUID === 'function') {
    return `${prefix}-${window.crypto.randomUUID().slice(0, 8)}`;
  }
  return `${prefix}-${Date.now().toString(36)}`;
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function nf(value, digits = 0) {
  return new Intl.NumberFormat('zh-CN', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits
  }).format(Number(value) || 0);
}

function compactDigits(value, digits = 1) {
  return new Intl.NumberFormat('zh-CN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: digits
  }).format(Number(value) || 0);
}

function symbolOf(currency = ui.currency) {
  return CURRENCIES[currency].symbol;
}

function fmtMoney(cny, options = {}) {
  const currency = options.currency || ui.currency;
  const value = (Number(cny) || 0) * RATES[currency];
  const abs = Math.abs(value);
  const sign = value < 0 ? '-' : (options.plus ? '+' : '');
  const symbol = symbolOf(currency);
  if (options.compact !== false) {
    if (abs >= 100000000) return `${sign}${symbol}${compactDigits(abs / 100000000, 2)}亿`;
    if (abs >= 10000) return `${sign}${symbol}${compactDigits(abs / 10000, 1)}万`;
    return `${sign}${symbol}${nf(abs, 0)}`;
  }
  const digits = currency === 'JPY' ? 0 : (options.digits ?? 2);
  return `${sign}${symbol}${nf(abs, digits)}`;
}

function fmtAxis(cny, currency = ui.currency) {
  const value = (Number(cny) || 0) * RATES[currency];
  const abs = Math.abs(value);
  if (abs >= 100000000) return `${compactDigits(value / 100000000, 2)}亿`;
  if (abs >= 10000) return `${compactDigits(value / 10000, 0)}万`;
  return nf(value, 0);
}

function fmtNumber(value, digits = 0) {
  return nf(value, digits);
}

function fmtPrice(value) {
  return nf(value, 2);
}

function fmtPct(value, digits = 2, withSign = true) {
  const number = Number(value) || 0;
  const sign = withSign && number > 0 ? '+' : '';
  return `${sign}${number.toFixed(digits)}%`;
}

function convertToCNY(amount, currency) {
  return (Number(amount) || 0) / RATES[currency];
}

function convertFromCNY(cny, currency) {
  return (Number(cny) || 0) * RATES[currency];
}

function totalAccountCNY() {
  return state.accounts.CNY + convertToCNY(state.accounts.USD, 'USD') + convertToCNY(state.accounts.HKD, 'HKD');
}

function formatDate(iso, style = 'short') {
  if (!iso) return '—';
  const date = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(date.getTime())) return esc(iso);
  if (style === 'long') return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function formatMonth(month) {
  if (!month) return '—';
  const [year, value] = month.split('-');
  return `${year}年${Number(value)}月`;
}

function todayISO() {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function topbarDateText() {
  const date = new Date();
  const week = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][date.getDay()];
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日 ${week}`;
}

function initials(name) {
  const clean = String(name || '').trim();
  if (!clean) return '—';
  return esc(clean.replace(/[（(].*?[）)]/g, '').slice(0, 1));
}

function sumBy(items, selector) {
  return items.reduce((sum, item) => sum + (Number(selector(item)) || 0), 0);
}

function sparkPath(values, width = 64, height = 24) {
  if (!values || values.length === 0) return '';
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const step = width / Math.max(values.length - 1, 1);
  return values.map((value, index) => {
    const x = index * step;
    const y = height - ((value - min) / span) * (height - 4) - 2;
    return `${index === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');
}

function niceMax(value) {
  if (!value || value <= 0) return 100;
  const exponent = Math.floor(Math.log10(value));
  const fraction = value / Math.pow(10, exponent);
  let niceFraction;
  if (fraction <= 1) niceFraction = 1;
  else if (fraction <= 2) niceFraction = 2;
  else if (fraction <= 2.5) niceFraction = 2.5;
  else if (fraction <= 5) niceFraction = 5;
  else niceFraction = 10;
  return niceFraction * Math.pow(10, exponent);
}

function statusClass(status) {
  const map = {
    '合作中': 'active', '运营中': 'active', '已入账': 'active', '已转出': 'active',
    '在职': 'active', '活跃': 'active', '在售': 'active',
    '洽谈中': 'pending', '待确认': 'pending', '跟进中': 'pending', '试用': 'pending',
    '已暂停': 'paused', '暂停接单': 'paused', '已归档': 'archived'
  };
  return map[status] || 'paused';
}

function statusHtml(status) {
  return `<span class="status ${statusClass(status)}"><span class="status-dot"></span>${esc(status)}</span>`;
}

function typeTag(type) {
  return `<span class="tag plain">${esc(type)}</span>`;
}

function pageHead({ title, desc, actions = '', revealIndex = 0 }) {
  return `
    <div class="page-head" style="--i:${revealIndex}">
      <div>
        <h1>${esc(title)}</h1>
        <p class="page-desc">${desc}</p>
      </div>
      <div class="page-actions" style="--i:${revealIndex}">${actions}</div>
    </div>
  `;
}

function currencySwitch() {
  return `
    <div class="segmented currency-seg" role="group" aria-label="显示币种">
      ${CURRENCY_ORDER.map((code) => `
        <button type="button" data-action="set-currency" data-value="${code}"
          class="${ui.currency === code ? 'active' : ''}"
          aria-pressed="${ui.currency === code}"
          title="${CURRENCIES[code].label}">${code}</button>
      `).join('')}
    </div>
    <span class="currency-note">中间价 · ${FX_DATE}</span>
  `;
}

function pageOf(items, page) {
  const start = (page - 1) * PAGE_SIZE;
  return items.slice(start, start + PAGE_SIZE);
}

function pageCount(items) {
  return Math.max(1, Math.ceil(items.length / PAGE_SIZE));
}

function pagination(total, current, action) {
  const count = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const pages = [];
  for (let i = 1; i <= count; i += 1) pages.push(i);
  return `
    <div class="pagination">
      <span>共 ${total} 条 · 第 ${current} / ${count} 页</span>
      <div class="pager">
        <button type="button" data-action="${action}" data-page="${current - 1}" ${current <= 1 ? 'disabled' : ''} aria-label="上一页">${icon('chevron')}</button>
        ${pages.slice(Math.max(0, current - 2), Math.min(pages.length, current + 1)).map((page) => `
          <button type="button" data-action="${action}" data-page="${page}" class="${page === current ? 'current' : ''}" aria-current="${page === current ? 'page' : 'false'}">${page}</button>
        `).join('')}
        <button type="button" data-action="${action}" data-page="${current + 1}" ${current >= count ? 'disabled' : ''} aria-label="下一页">${icon('chevron')}</button>
      </div>
    </div>
  `;
}

function emptyState({ title = '没有找到内容', desc = '调整筛选条件后再试一次。', action = '' }) {
  return `
    <div class="empty">
      <div class="empty-icon">${icon('file')}</div>
      <div class="empty-title">${esc(title)}</div>
      <div class="empty-desc">${esc(desc)}</div>
      ${action}
    </div>
  `;
}

function getPeriodMonths() {
  const count = ui.period === '3m' ? 3 : ui.period === '6m' ? 6 : 12;
  return CHART_MONTHS.slice(-count);
}

function thisMonthAmount(type) {
  const prefix = AS_OF.slice(0, 7);
  return state.transactions
    .filter((transaction) => transaction.type === type && transaction.date.startsWith(prefix) && transaction.status !== '待确认')
    .reduce((sum, transaction) => sum + convertToCNY(transaction.amount, transaction.currency), 0);
}

function pendingAmount() {
  return state.transactions
    .filter((transaction) => transaction.status === '待确认')
    .reduce((sum, transaction) => sum + convertToCNY(transaction.amount, transaction.currency), 0);
}

function transactionsByMonth() {
  const months = [];
  const now = new Date(`${AS_OF}T00:00:00`);
  for (let i = 5; i >= 0; i -= 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    months.push({ key, label: `${date.getMonth() + 1}月`, in: 0, out: 0 });
  }
  state.transactions.filter((transaction) => transaction.status !== '待确认').forEach((transaction) => {
    const month = months.find((item) => transaction.date.startsWith(item.key));
    if (!month) return;
    const cny = convertToCNY(transaction.amount, transaction.currency);
    if (transaction.type === '存入') month.in += cny;
    else month.out += cny;
  });
  return months;
}

function partnerRows() {
  let rows = [...state.partners];
  if (ui.partnerFilter === 'strategic') rows = rows.filter((item) => item.type === '战略伙伴');
  if (ui.partnerFilter === 'supplier') rows = rows.filter((item) => item.type === '供应商');
  if (ui.partnerFilter === 'channel') rows = rows.filter((item) => item.type === '渠道合作');
  if (ui.partnerSort === 'recent') rows.sort((a, b) => String(b.since).localeCompare(String(a.since)));
  else rows.sort((a, b) => b.amount - a.amount);
  return rows;
}

function clientRows() {
  let rows = [...state.clients];
  if (ui.clientFilter === 'active') rows = rows.filter((item) => item.status === '活跃');
  if (ui.clientFilter === 'following') rows = rows.filter((item) => item.status === '跟进中');
  if (ui.clientFilter === 'archived') rows = rows.filter((item) => item.status === '已归档');
  if (ui.clientSort === 'recent') rows.sort((a, b) => String(b.since).localeCompare(String(a.since)));
  else rows.sort((a, b) => b.amount - a.amount);
  return rows;
}

function fundRows() {
  let rows = [...state.transactions];
  if (ui.fundFilter === 'in') rows = rows.filter((item) => item.type === '存入');
  if (ui.fundFilter === 'out') rows = rows.filter((item) => item.type === '转出');
  rows.sort((a, b) => String(b.date).localeCompare(String(a.date)));
  return rows;
}

function employeeRows() {
  let rows = [...state.employees];
  if (ui.employeeFilter !== 'all') rows = rows.filter((item) => item.dept === ui.employeeFilter);
  return rows;
}

/* =========================================================
   Routing & rendering
   ========================================================= */

const PAGE_TITLES = {
  dashboard: '公司数据看板', partners: '合作与集团', funds: '存入与转出',
  clients: '客户信息', team: '服务与团队', stocks: '股市数据'
};
const VALID_PAGES = new Set(Object.keys(PAGE_TITLES));
let pendingFocus = null;

function hashPage() {
  const raw = decodeURIComponent(location.hash.replace(/^#\/?/, '')).trim();
  return VALID_PAGES.has(raw) ? raw : 'dashboard';
}

function capturePageFocus() {
  const active = document.activeElement;
  if (!active || !active.closest || !active.closest('#app')) return null;
  if (active.id) return { id: active.id };
  const action = active.dataset ? active.dataset.action : '';
  if (!action) return null;
  if (action.endsWith('-page')) return { action, currentPage: true };
  const data = {};
  ['value', 'code'].forEach((key) => {
    if (active.dataset[key] !== undefined) data[key] = active.dataset[key];
  });
  return { action, data };
}

function restorePageFocus(record) {
  if (!record) return;
  let target = null;
  if (record.id) {
    target = document.getElementById(record.id);
  } else if (record.currentPage) {
    target = $(`[data-action="${record.action}"][aria-current="page"]`);
  } else {
    let selector = `[data-action="${record.action}"]`;
    Object.entries(record.data || {}).forEach(([key, value]) => {
      selector += `[data-${key}="${CSS.escape(value)}"]`;
    });
    target = $(selector);
  }
  if (!target) return;
  try {
    target.focus({ preventScroll: true });
  } catch (error) {
    target.focus();
  }
}

function render() {
  const app = $('#app');
  if (!app) return;
  const previousFocus = capturePageFocus();
  const animate = ui.animateNext;
  app.innerHTML = `<div class="page ${animate ? 'page-enter' : ''}">${PAGE_RENDERERS[ui.page]()}</div>`;
  ui.animateNext = false;
  updateNav();
  bindCharts();
  document.title = `${PAGE_TITLES[ui.page]} · 老人言`;
  if (ui.animateValues) ui.animateValues = false;
  restorePageFocus(previousFocus);
  const focus = pendingFocus;
  pendingFocus = null;
  if (focus) applyFocus(focus);
}

function updateNav() {
  $$('.nav-item').forEach((item) => {
    const active = item.dataset.nav === ui.page;
    item.classList.toggle('active', active);
    if (active) item.setAttribute('aria-current', 'page');
    else item.removeAttribute('aria-current');
  });
}

function handleRoute() {
  const raw = decodeURIComponent(location.hash.replace(/^#\/?/, '')).trim();
  if (raw && !VALID_PAGES.has(raw)) return;
  const next = hashPage();
  const changed = next !== ui.page;
  ui.page = next;
  if (changed) {
    ui.animateNext = true;
    window.scrollTo({ top: 0, behavior: 'auto' });
  }
  closePopovers();
  closeMobileNav();
  render();
}

function navigate(page, focus = null) {
  if (!VALID_PAGES.has(page)) page = 'dashboard';
  pendingFocus = focus;
  if (location.hash === `#${page}`) {
    handleRoute();
    return;
  }
  location.hash = page;
}

function applyFocus(focus) {
  if (!focus) return;
  if (focus.type === 'partner') return openPartnerDrawer(focus.id);
  if (focus.type === 'client') return openClientDrawer(focus.id);
  if (focus.type === 'transaction') {
    highlightRow(focus.id);
    openTransactionDrawer(focus.id);
    return;
  }
  if (focus.type === 'employee') return openEmployeeDrawer(focus.id);
  if (focus.type === 'service') return openServiceDrawer(focus.id);
  if (focus.type === 'group') return openGroupDrawer(focus.id);
}

function highlightRow(id) {
  const row = document.querySelector(`[data-row-id="${CSS.escape(id)}"]`);
  if (!row) return;
  row.classList.add('is-highlight');
  row.scrollIntoView({ behavior: 'smooth', block: 'center' });
  window.setTimeout(() => row.classList.remove('is-highlight'), 2000);
}

/* =========================================================
   Search
   ========================================================= */

const searchState = { results: [], activeIndex: -1 };

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function highlightText(value, query) {
  const safe = esc(value);
  if (!query) return safe;
  try {
    return safe.replace(new RegExp(`(${escapeRegExp(query)})`, 'gi'), '<mark>$1</mark>');
  } catch (error) {
    return safe;
  }
}

function searchableData() {
  return {
    partners: state.partners.map((item) => ({ kind: 'partner', id: item.id, title: item.name, meta: `${item.type} · ${item.contact} · ${item.phone}`, search: `${item.name} ${item.short} ${item.type} ${item.contact} ${item.phone}` })),
    group: GROUP_ENTITIES.map((item) => ({ kind: 'group', id: item.id, title: item.name, meta: `集团成员 · 持股 ${item.share}% · 负责人 ${item.lead}`, search: `${item.name} ${item.short} ${item.role} ${item.lead}` })),
    clients: state.clients.map((item) => ({ kind: 'client', id: item.id, title: item.name, meta: `${item.contact} · ${item.phone} · 信任交易额 ${fmtMoney(item.amount)}`, search: `${item.name} ${item.contact} ${item.phone} ${item.status}` })),
    transactions: state.transactions.map((item) => ({ kind: 'transaction', id: item.id, title: `${item.counterparty} · ${item.summary}`, meta: `${item.date} · ${item.type} ${CURRENCIES[item.currency].symbol}${nf(item.amount, item.currency === 'JPY' ? 0 : 2)}`, search: `${item.counterparty} ${item.summary} ${item.date} ${item.type} ${item.account}` })),
    employees: state.employees.map((item) => ({ kind: 'employee', id: item.id, title: item.name, meta: `${item.role} · ${item.dept} · ${item.phone}`, search: `${item.name} ${item.role} ${item.dept} ${item.phone} ${item.email}` })),
    services: state.services.map((item) => ({ kind: 'service', id: item.id, title: item.name, meta: `${item.owner} 负责 · ${item.projects} 个项目 · ${item.status}`, search: `${item.name} ${item.desc} ${item.owner} ${item.tags.join(' ')}` })),
    stocks: STOCKS.map((item) => ({ kind: 'stock', id: item.code, title: `${item.name} ${item.code}`, meta: `${item.market} · 收盘 ${fmtPrice(item.price)} · ${fmtPct(item.changePct)}`, search: `${item.name} ${item.code} ${item.market}` }))
  };
}

function getSearchGroups(query) {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const data = searchableData();
  const config = [
    { key: 'partners', label: '合作公司', mark: '司' },
    { key: 'clients', label: '客户', mark: '客' },
    { key: 'transactions', label: '交易记录', mark: '账' },
    { key: 'employees', label: '员工', mark: '人' },
    { key: 'services', label: '服务项目', mark: '项' },
    { key: 'stocks', label: '股票', mark: '股' },
    { key: 'group', label: '集团成员', mark: '团' }
  ];
  return config.map((group) => {
    const items = data[group.key].filter((item) => item.search.toLowerCase().includes(q)).slice(0, 3);
    return { ...group, items };
  }).filter((group) => group.items.length > 0);
}

function renderSearchPanel(query = '') {
  const panel = $('#searchPanel');
  if (!panel) return;
  const q = query.trim();
  if (!q) {
    panel.innerHTML = `
      <div class="search-hint">输入关键词检索 <strong>合作公司、客户、交易记录、员工</strong> 等内容。按 ↑↓ 选择，Enter 打开。</div>
      <div class="search-group-label">快速前往</div>
      <div class="quick-links">
        ${[
          ['dashboard', '数据看板', 'grid'], ['partners', '合作与集团', 'building'],
          ['funds', '存入与转出', 'transfer'], ['clients', '客户信息', 'users'],
          ['team', '服务与团队', 'layers'], ['stocks', '股市数据', 'chart']
        ].map(([page, label, iconName]) => `<button class="quick-link" type="button" data-search-nav="${page}">${icon(iconName)}${label}</button>`).join('')}
      </div>
    `;
    searchState.results = [];
    searchState.activeIndex = -1;
    return;
  }
  const groups = getSearchGroups(q);
  const total = groups.reduce((sum, group) => sum + group.items.length, 0);
  if (!groups.length) {
    panel.innerHTML = `<div class="search-empty"><div class="search-empty-title">没有找到与“${esc(q)}”相关的内容</div><div class="search-empty-desc">试试公司名、联系人、日期或职位。</div></div>`;
    searchState.results = [];
    searchState.activeIndex = -1;
    return;
  }
  panel.innerHTML = `
    <div class="search-hint" style="padding-top:8px;padding-bottom:5px;">显示 <strong>${total}</strong> 条匹配结果，使用更具体的关键词可缩小范围</div>
    ${groups.map((group) => `
      <div class="search-group">
        <div class="search-group-label"><span>${group.label}</span><span>${group.items.length}</span></div>
        ${group.items.map((item) => `
          <button class="search-result" type="button" data-search-kind="${item.kind}" data-search-id="${item.id}">
            <span class="search-result-mark">${group.mark}</span>
            <span class="search-result-main">
              <span class="search-result-title">${highlightText(item.title, q)}</span>
              <span class="search-result-meta">${highlightText(item.meta, q)}</span>
            </span>
            <span class="search-result-type">${group.label}</span>
          </button>
        `).join('')}
      </div>
    `).join('')}
  `;
  searchState.results = $$('.search-result', panel);
  searchState.activeIndex = searchState.results.length ? 0 : -1;
  updateSearchActive();
}

function updateSearchActive() {
  searchState.results.forEach((item, index) => item.classList.toggle('is-active', index === searchState.activeIndex));
}

function openSearch() {
  const panel = $('#searchPanel');
  const input = $('#globalSearch');
  if (!panel || !input) return;
  closePopovers();
  panel.hidden = false;
  input.setAttribute('aria-expanded', 'true');
  renderSearchPanel(input.value);
}

function closeSearch({ clear = false } = {}) {
  const panel = $('#searchPanel');
  const input = $('#globalSearch');
  if (!panel || !input) return;
  panel.hidden = true;
  input.setAttribute('aria-expanded', 'false');
  if (clear) input.value = '';
  searchState.activeIndex = -1;
}

function openSearchResult(kind, id) {
  closeSearch({ clear: true });
  const input = $('#globalSearch');
  if (input) input.blur();
  if (kind === 'partner') {
    ui.partnerTab = 'partners'; ui.partnerFilter = 'all'; ui.partnerSort = 'amount'; ui.partnerPage = 1;
    return navigate('partners', { type: 'partner', id });
  }
  if (kind === 'group') {
    ui.partnerTab = 'group';
    return navigate('partners', { type: 'group', id });
  }
  if (kind === 'client') {
    ui.clientFilter = 'all'; ui.clientSort = 'amount'; ui.clientPage = 1;
    return navigate('clients', { type: 'client', id });
  }
  if (kind === 'transaction') {
    ui.fundFilter = 'all';
    const rows = fundRows();
    const index = rows.findIndex((item) => item.id === id);
    ui.fundPage = index >= 0 ? Math.floor(index / PAGE_SIZE) + 1 : 1;
    return navigate('funds', { type: 'transaction', id });
  }
  if (kind === 'employee') {
    ui.teamTab = 'employees'; ui.employeeFilter = 'all';
    return navigate('team', { type: 'employee', id });
  }
  if (kind === 'service') {
    ui.teamTab = 'services';
    return navigate('team', { type: 'service', id });
  }
  if (kind === 'stock') {
    ui.stockCode = id;
    return navigate('stocks');
  }
}

/* =========================================================
   Notifications, popovers, mobile nav, toast
   ========================================================= */

function renderNotifications() {
  const list = $('#notifList');
  const badge = $('#notifBadge');
  const sub = $('#notifSub');
  if (!list || !badge || !sub) return;
  const unread = state.notifications.filter((item) => !item.read).length;
  badge.textContent = String(unread);
  badge.classList.toggle('is-hidden', unread === 0);
  sub.textContent = unread ? `${unread} 条未读` : '已全部读完';
  list.innerHTML = state.notifications.map((item) => `
    <button class="notif-item ${item.read ? '' : 'unread'}" type="button" data-notification="${item.id}">
      <span class="notif-mark"></span>
      <span class="notif-main">
        <span class="notif-title">${esc(item.title)}</span>
        <span class="notif-desc">${esc(item.desc)}</span>
        <span class="notif-time">${esc(item.time)}</span>
      </span>
    </button>
  `).join('');
}

function openNotification(id) {
  const notification = state.notifications.find((item) => item.id === id);
  if (!notification) return;
  notification.read = true;
  saveState();
  renderNotifications();
  closePopovers();
  if (notification.target.kind) {
    if (notification.target.page === 'partners') {
      ui.partnerTab = 'partners'; ui.partnerFilter = 'all'; ui.partnerPage = 1;
    }
    if (notification.target.page === 'funds') {
      ui.fundFilter = 'all'; ui.fundPage = 1;
    }
    navigate(notification.target.page, { type: notification.target.kind, id: notification.target.id });
  } else {
    navigate(notification.target.page);
  }
}

function closePopovers() {
  const notifPanel = $('#notifPanel');
  const userPanel = $('#userPanel');
  const notifBtn = $('#notifBtn');
  const userBtn = $('#userBtn');
  if (notifPanel) notifPanel.hidden = true;
  if (userPanel) userPanel.hidden = true;
  if (notifBtn) notifBtn.setAttribute('aria-expanded', 'false');
  if (userBtn) userBtn.setAttribute('aria-expanded', 'false');
}

function closeMobileNav() {
  document.body.classList.remove('nav-open');
  const scrim = $('#sidebarScrim');
  if (scrim) {
    scrim.classList.remove('is-visible');
    window.setTimeout(() => {
      if (!document.body.classList.contains('nav-open')) scrim.hidden = true;
    }, 200);
  }
  const menu = $('#mobileMenu');
  if (menu) menu.setAttribute('aria-expanded', 'false');
}

function openMobileNav() {
  document.body.classList.add('nav-open');
  const scrim = $('#sidebarScrim');
  if (scrim) {
    scrim.hidden = false;
    requestAnimationFrame(() => scrim.classList.add('is-visible'));
  }
  const menu = $('#mobileMenu');
  if (menu) menu.setAttribute('aria-expanded', 'true');
}

function toast(message, variant = 'success') {
  const root = $('#toastRoot');
  if (!root) return;
  const element = document.createElement('div');
  element.className = 'toast';
  element.innerHTML = `${icon(variant === 'error' ? 'alert' : 'check')}<span>${esc(message)}</span>`;
  root.appendChild(element);
  window.setTimeout(() => {
    element.classList.add('out');
    window.setTimeout(() => element.remove(), 220);
  }, 3200);
}

/* =========================================================
   Chart interactions & motion
   ========================================================= */

function bindCharts() {
  bindRevenueChart();
  bindStockChart();
  animateChartLines();
}

function bindRevenueChart() {
  const wrap = $('[data-chart-wrap="revenue"]');
  const cache = charts.revenue;
  if (!wrap || !cache) return;
  const svg = $('.chart-svg', wrap);
  const tooltip = $('[data-chart-tooltip="revenue"]', wrap);
  if (!svg || !tooltip) return;
  const hoverLine = $('[data-hover-line]', svg);
  const revDot = $('[data-hover-dot="rev"]', svg);
  const expDot = $('[data-hover-dot="exp"]', svg);
  let activeIndex = -1;
  const hide = () => {
    activeIndex = -1;
    tooltip.classList.remove('is-visible');
    if (hoverLine) hoverLine.style.opacity = '0';
    if (revDot) revDot.style.opacity = '0';
    if (expDot) expDot.style.opacity = '0';
  };
  const move = (event) => {
    const rect = svg.getBoundingClientRect();
    if (!rect.width) return;
    const viewX = ((event.clientX - rect.left) / rect.width) * cache.width;
    let nearest = 0;
    let best = Infinity;
    cache.points.forEach((point, index) => {
      const distance = Math.abs(point.x - viewX);
      if (distance < best) { best = distance; nearest = index; }
    });
    if (nearest === activeIndex) return;
    activeIndex = nearest;
    const point = cache.points[nearest];
    if (hoverLine) { hoverLine.setAttribute('x1', point.x); hoverLine.setAttribute('x2', point.x); hoverLine.style.opacity = '1'; }
    if (revDot) { revDot.setAttribute('cx', point.x); revDot.setAttribute('cy', point.yRev); revDot.style.opacity = '1'; }
    if (expDot) { expDot.setAttribute('cx', point.x); expDot.setAttribute('cy', point.yExp); expDot.style.opacity = '1'; }
    tooltip.innerHTML = `<div class="tt-title">${point.label}</div><div class="tt-row"><span class="legend-dot"></span>营收<span class="tt-value">${fmtMoney(point.rev)}</span></div><div class="tt-row"><span class="legend-dot expense"></span>支出<span class="tt-value">${fmtMoney(point.exp)}</span></div>`;
    tooltip.classList.add('is-visible');
    const tw = tooltip.offsetWidth;
    const th = tooltip.offsetHeight;
    const left = clamp((point.x / cache.width) * rect.width - tw / 2, 4, rect.width - tw - 4);
    const top = clamp((Math.min(point.yRev, point.yExp) / cache.height) * rect.height - th - 12, 4, rect.height - th - 6);
    tooltip.style.left = `${left}px`;
    tooltip.style.top = `${top}px`;
  };
  svg.addEventListener('pointermove', move);
  svg.addEventListener('pointerdown', move);
  svg.addEventListener('pointerleave', hide);
}

function bindStockChart() {
  const wrap = $('[data-chart-wrap="stock"]');
  const cache = charts.stock;
  if (!wrap || !cache) return;
  const svg = $('.chart-svg', wrap);
  const tooltip = $('[data-chart-tooltip="stock"]', wrap);
  if (!svg || !tooltip) return;
  const hoverLine = $('[data-hover-line]', svg);
  const dot = $('[data-hover-dot="stock"]', svg);
  let activeIndex = -1;
  const hide = () => {
    activeIndex = -1;
    tooltip.classList.remove('is-visible');
    if (hoverLine) hoverLine.style.opacity = '0';
    if (dot) dot.style.opacity = '0';
  };
  const move = (event) => {
    const rect = svg.getBoundingClientRect();
    if (!rect.width) return;
    const viewX = ((event.clientX - rect.left) / rect.width) * cache.width;
    let nearest = 0;
    let best = Infinity;
    cache.points.forEach((point, index) => {
      const distance = Math.abs(point.x - viewX);
      if (distance < best) { best = distance; nearest = index; }
    });
    if (nearest === activeIndex) return;
    activeIndex = nearest;
    const point = cache.points[nearest];
    const previous = cache.points[Math.max(0, nearest - 1)];
    const change = (point.close / previous.close - 1) * 100;
    if (hoverLine) { hoverLine.setAttribute('x1', point.x); hoverLine.setAttribute('x2', point.x); hoverLine.style.opacity = '1'; }
    if (dot) { dot.setAttribute('cx', point.x); dot.setAttribute('cy', point.y); dot.style.opacity = '1'; }
    tooltip.innerHTML = `<div class="tt-title">${point.date}</div><div class="tt-row">收盘<span class="tt-value">${fmtPrice(point.close)}</span></div><div class="tt-row">涨跌<span class="tt-value">${fmtPct(change)}</span></div><div class="tt-row">成交量<span class="tt-value">${nf(point.volume / 10000, 1)} 万手</span></div>`;
    tooltip.classList.add('is-visible');
    const tw = tooltip.offsetWidth;
    const th = tooltip.offsetHeight;
    const left = clamp((point.x / cache.width) * rect.width - tw / 2, 4, rect.width - tw - 4);
    const top = clamp((point.y / cache.height) * rect.height - th - 12, 4, rect.height - th - 6);
    tooltip.style.left = `${left}px`;
    tooltip.style.top = `${top}px`;
  };
  svg.addEventListener('pointermove', move);
  svg.addEventListener('pointerdown', move);
  svg.addEventListener('pointerleave', hide);
}

function animateChartLines() {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  $$('.chart-svg').forEach((svg) => requestAnimationFrame(() => svg.classList.add('is-ready')));
  if (reduced) return;
  $$('.chart-line[data-chart-line="revenue"], .chart-line[data-chart-line="stock"]').forEach((path) => {
    let length = 0;
    try { length = path.getTotalLength(); } catch (error) { return; }
    if (!length) return;
    path.style.strokeDasharray = `${length}`;
    path.style.strokeDashoffset = `${length}`;
    path.getBoundingClientRect();
    requestAnimationFrame(() => {
      path.style.transition = 'stroke-dashoffset 720ms cubic-bezier(0.22, 1, 0.36, 1)';
      path.style.strokeDashoffset = '0';
    });
    window.setTimeout(() => {
      path.style.transition = '';
      path.style.strokeDasharray = '';
      path.style.strokeDashoffset = '';
    }, 900);
  });
}
