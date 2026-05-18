export const HEAVENLY_STEMS = [
  { name:'甲', wuXing:'木', yinYang:'阳', num:1 },
  { name:'乙', wuXing:'木', yinYang:'阴', num:2 },
  { name:'丙', wuXing:'火', yinYang:'阳', num:3 },
  { name:'丁', wuXing:'火', yinYang:'阴', num:4 },
  { name:'戊', wuXing:'土', yinYang:'阳', num:5 },
  { name:'己', wuXing:'土', yinYang:'阴', num:6 },
  { name:'庚', wuXing:'金', yinYang:'阳', num:7 },
  { name:'辛', wuXing:'金', yinYang:'阴', num:8 },
  { name:'壬', wuXing:'水', yinYang:'阳', num:9 },
  { name:'癸', wuXing:'水', yinYang:'阴', num:10 },
];

export const EARTHLY_BRANCHES = [
  { name:'子', wuXing:'水', yinYang:'阳', zodiac:'鼠', num:1, hour:'23-01', month:'十一月' },
  { name:'丑', wuXing:'土', yinYang:'阴', zodiac:'牛', num:2, hour:'01-03', month:'十二月' },
  { name:'寅', wuXing:'木', yinYang:'阳', zodiac:'虎', num:3, hour:'03-05', month:'正月' },
  { name:'卯', wuXing:'木', yinYang:'阴', zodiac:'兔', num:4, hour:'05-07', month:'二月' },
  { name:'辰', wuXing:'土', yinYang:'阳', zodiac:'龙', num:5, hour:'07-09', month:'三月' },
  { name:'巳', wuXing:'火', yinYang:'阴', zodiac:'蛇', num:6, hour:'09-11', month:'四月' },
  { name:'午', wuXing:'火', yinYang:'阳', zodiac:'马', num:7, hour:'11-13', month:'五月' },
  { name:'未', wuXing:'土', yinYang:'阴', zodiac:'羊', num:8, hour:'13-15', month:'六月' },
  { name:'申', wuXing:'金', yinYang:'阳', zodiac:'猴', num:9, hour:'15-17', month:'七月' },
  { name:'酉', wuXing:'金', yinYang:'阴', zodiac:'鸡', num:10, hour:'17-19', month:'八月' },
  { name:'戌', wuXing:'土', yinYang:'阳', zodiac:'狗', num:11, hour:'19-21', month:'九月' },
  { name:'亥', wuXing:'水', yinYang:'阴', zodiac:'猪', num:12, hour:'21-23', month:'十月' },
];

export const WU_XING_RELATIONS = {
  '木': { generates:'火', overcomes:'土', generatedBy:'水', overcomeBy:'金' },
  '火': { generates:'土', overcomes:'金', generatedBy:'木', overcomeBy:'水' },
  '土': { generates:'金', overcomes:'水', generatedBy:'火', overcomeBy:'木' },
  '金': { generates:'水', overcomes:'木', generatedBy:'土', overcomeBy:'火' },
  '水': { generates:'木', overcomes:'火', generatedBy:'金', overcomeBy:'土' },
};
