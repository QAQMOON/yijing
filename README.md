# 易解

易解是一套面向中国术数的前端排盘站点，覆盖六爻、八字、大六壬、奇门遁甲与紫微斗数。项目采用 React + Vite 构建，目标不是做演示页，而是做能直接使用、能继续扩展的排盘工具。

在线地址：<https://yijing-pi.vercel.app>

## 主要内容

- 六爻起卦与卦例阅读
- 八字排盘与四柱命盘
- 大六壬三盘排布
- 奇门遁甲排盘
- 紫微斗数在线排盘
- 主题切换与历史记录

## 页面效果

![奇门遁甲起局页面](docs/assets/qimen-home.png)

## 本地开发

```bash
npm install
npm run dev
```

## 验证命令

```bash
npm test
npm run lint
npm run build
```

## 目录

- `src/pages/` 页面
- `src/components/` 通用组件
- `src/utils/` 排盘与日期工具
- `scripts/` 单元测试
- `docs/assets/` README 截图

## 说明

紫微斗数排盘使用 `iztro` 作为算法底座，避免手写复杂星曜规则带来的偏差。其余术数模块继续保留项目原有的风格与交互方式。
