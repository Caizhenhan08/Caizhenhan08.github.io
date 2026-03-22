# WhyGroup 集体网站 — 设计规格

## 1. Concept & Vision

WhyGroup 是一个高中小团体/社群，网站应传达出**先锋、艺术、有温度**的气质。整体视觉以深色沉浸式为基底，大面积毛玻璃（Frosted Glass）叠加在流动渐变背景之上，制造出空间纵深感与层次感。页面浏览体验应如穿梭于一层层透明玻璃之间——朦胧但清晰，冷静但富有生命。

目标用户：社群成员、潜在合作者、品牌方。

---

## 2. Design Language

### 色彩系统
| 用途 | 色值 |
|---|---|
| 背景基底 | `#050510`（近黑蓝紫） |
| 渐变色1 | `#667eea` → `#764ba2`（紫蓝渐变） |
| 渐变色2 | `#f093fb` → `#f5576c`（粉橙渐变） |
| 渐变色3 | `#4facfe` → `#00f2fe`（青蓝渐变） |
| 毛玻璃背景 | `rgba(255,255,255,0.08)` |
| 毛玻璃边框 | `rgba(255,255,255,0.15)` |
| 主文字 | `#f0f0ff` |
| 次文字 | `rgba(240,240,255,0.6)` |
| 强调色 | `#a78bfa`（薰衣草紫） |

### 字体
- 标题：`"Syne"`（Google Fonts）— 几何感强，先锋气质
- 正文/UI：`"DM Sans"`（Google Fonts）— 现代、清晰
- 中文回退：`"PingFang SC", "Microsoft YaHei", sans-serif`

### 毛玻璃参数（核心变量）
```css
--glass-bg: rgba(255, 255, 255, 0.07);
--glass-border: rgba(255, 255, 255, 0.14);
--glass-blur: 20px;
--glass-shadow: 0 8px 32px rgba(0, 0, 0, 0.37);
--glass-highlight: inset 1px 1px 0 rgba(255,255,255,0.18);
```

### 动效哲学
- **入场动画**：元素从透明 + 轻微Y轴偏移淡入，交错延迟 100ms
- **滚动驱动**：Intersection Observer 触发节流入场动画
- **悬浮交互**：毛玻璃卡片 hover 时轻微上浮（translateY -4px）+ 边框增亮
- **背景动画**：三个渐变 blob 在视口中缓慢漂移，营造呼吸感
- **计时器**：无阻塞 CSS 动画，60fps

### 图标：Lucide Icons（CDN SVG sprite 或 CDN JS）

---

## 3. Layout & Structure

### 页面架构（单页滚动）

```
┌─────────────────────────────────────┐
│  Navigation（粘性透明导航栏）         │
├─────────────────────────────────────┤
│  Hero（满屏，浮动毛玻璃文字块）        │
├─────────────────────────────────────┤
│  About（集体介绍，玻璃卡片陈列）      │
├─────────────────────────────────────┤
│  Members（成员网格，毛玻璃头像卡）     │
├─────────────────────────────────────┤
│  Projects（项目展示，水平滚动画廊）  │
├─────────────────────────────────────┤
│  Contact（毛玻璃表单 + 社交链接）    │
├─────────────────────────────────────┤
│  Footer（简洁玻璃底栏）              │
└─────────────────────────────────────┘
```

### 响应式断点
- Mobile：< 768px（单列，hamburger菜单，触摸优化）
- Tablet：768px–1024px（双列网格）
- Desktop：> 1024px（三列+网格，全功能）

### 背景设计
三个绝对定位的伪元素 blob（150% viewport大小），filter blur 100px，使用 CSS animation 缓慢漂移，覆盖整个 `<body>`。

---

## 4. Features & Interactions

### Navigation
- 粘性定位，背景从透明过渡到毛玻璃（滚动超过 50px）
- Logo：WhyGroup 文字 logo，使用 Syne 字体带渐变色
- 链接：Home / About / Members / Projects / Contact
- Mobile：汉堡按钮 → 全屏毛玻璃下拉菜单
- Active 状态：下划线渐变色指示

### Hero
- 标题动画：字母逐个淡入
- 副标题：Typewriter 打字机效果
- 两个 CTA 按钮：「了解我们」「看看项目」，毛玻璃按钮样式
- 背景：3个动态渐变 blob
- 右侧/下方：装饰性几何图形（毛玻璃多边形）

### About
- 3列玻璃卡片展示 WhyGroup 的核心理念
- 每张卡片：图标 + 标题 + 描述文字
- 卡片入场：滚动进入视口时从下方淡入
- Hover：边框高亮 + 阴影加深

### Members
- 头像 + 名字 + 角色 + 一句话标签
- 头像区域：圆形裁切 + 玻璃边框
- 网格布局（4列 desktop / 2列 tablet / 1列 mobile）
- Hover：展开简介文字，出现社交图标

### Projects
- 水平滚动画廊（移动端触摸滑动）
- 每张项目卡片：毛玻璃大卡 + 图片缩略图 + 项目名 + 简介
- 分类标签（毛玻璃 pill 样式）
- 点击展开详情弹窗（毛玻璃 Modal）

### Contact
- 姓名 / 邮箱 / 留言 三个输入框，全毛玻璃样式
- 提交按钮：渐变背景 + 玻璃质感
- 社交媒体图标链接（微信/GitHub/B站/邮箱）
- 地图/地址信息（可选毛玻璃嵌入）

### Modal（项目详情弹窗）
- 毛玻璃全覆盖遮罩
- 弹窗内容区：毛玻璃大卡
- 关闭按钮 + ESC 键支持
- 背景滚动锁定

---

## 5. Component Inventory

### Glass Card
- 默认：`--glass-bg` 背景，`--glass-border` 1px 边框，`blur(20px)`, `box-shadow`
- Hover：`translateY(-4px)`，边框增亮至 `rgba(255,255,255,0.25)`，`box-shadow` 加大
- Active/Focus：边框变为强调色

### Glass Button
- Default：渐变背景 + 玻璃叠层 + `backdrop-filter`
- Hover：亮度提升 + 微缩放 `scale(1.02)`
- Active：`scale(0.98)` 按压反馈
- Disabled：`opacity: 0.4`, `cursor: not-allowed`

### Glass Input
- 背景 `rgba(255,255,255,0.06)`，边框透明
- Focus：边框变为薰衣草紫渐变，`box-shadow` 发光

### Nav Link
- 默认：次文字色
- Hover：主文字色 + 下划线淡入
- Active：强调色 + 下划线

### Avatar Card
- 圆形头像，玻璃边框
- Hover：头像微微放大（scale），简介滑出

### Pill Tag（分类标签）
- 毛玻璃小药丸，`border-radius: 999px`
- Hover：背景变亮

---

## 6. Technical Approach

- **纯前端**：HTML5 + CSS3 + Vanilla JS（无框架依赖）
- **字体**：Google Fonts（Syne + DM Sans）
- **图标**：Lucide Icons CDN
- **构建**：单文件 `index.html`（内联 CSS + JS），便于快速部署
- **动画**：CSS @keyframes + Intersection Observer API
- **响应式**：CSS Grid + Flexbox + CSS 变量 + Media Queries
- **图片**：Unsplash / picsum / placeholder 外部 CDN
- **性能**：`will-change` 优化动画性能，`prefers-reduced-motion` 媒体查询降级

---

## 7. 内容填充（示例数据）

- **WhyGroup 标语**：*Creative Collective. Built Together.*
- **About**：共创精神 / 多元视角 / 打破边界
- **成员示例**：5-6人，含头像（placeholder）、名字、角色、一句话
- **项目示例**：4-5个项目，含封面图、名称、简介、分类标签
