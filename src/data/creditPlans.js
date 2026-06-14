export const STARTER_CREDITS = 8;

export const CREDIT_COSTS = {
  aiReading: 2,
};

export const CREDIT_PLANS = [
  {
    id: 'starter',
    name: '入门包',
    credits: 20,
    priceLabel: '¥19',
    description: '适合偶尔问事与短篇解读。',
  },
  {
    id: 'standard',
    name: '常用包',
    credits: 68,
    priceLabel: '¥59',
    description: '适合连续保存多份报告。',
    recommended: true,
  },
  {
    id: 'pro',
    name: '进阶包',
    credits: 168,
    priceLabel: '¥129',
    description: '适合系统学习和阶段性复盘。',
  },
];
