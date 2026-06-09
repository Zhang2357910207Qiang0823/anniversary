# 星空相册 - 十年回忆 | UI 设计方案

> 本文件用于方案确认与检讨。双方确认无遗漏后方可进入编码阶段。

---

## 一、项目概述

| 项目 | 说明 |
|------|------|
| **项目名称** | 星空相册 - 十年回忆 |
| **目标平台** | 手机浏览器（移动端 Web App） |
| **技术栈** | Vue3 + Vite |
| **设计风格** | 星空渐变梦幻风格 |
| **核心功能** | 年份堆叠浏览、背景拖拽、图片详情、背景音乐 |

---

## 二、色彩系统

```css
/* 背景渐变 */
--bg-gradient-start: #1a1a3e;      /* 深紫蓝 */
--bg-gradient-mid: #4a1a6e;        /* 紫色 */
--bg-gradient-end: #ff9ecd;        /* 淡粉色 */

/* 文字颜色 */
--text-primary: #ffffff;           /* 主文字 */
--text-secondary: rgba(255,255,255,0.7);  /* 次要文字 */

/* 卡片颜色 */
--card-bg: rgba(255,255,255,0.15); /* 卡片背景 */
--card-border: rgba(255,255,255,0.3);     /* 卡片边框 */
--card-glow: rgba(255,158,205,0.4);       /* 卡片光晕 */

/* 强调色 */
--accent-pink: #ff9ecd;            /* 粉色 */
--accent-purple: #b19cd9;          /* 淡紫 */
--accent-blue: #a8d8ea;            /* 淡蓝 */
```

---

## 三、页面结构

### 3.1 路由层级 ✅ 已确认

> 采用「平级路由」方案，详情页不与年份绑定，便于跨年份滑动切换照片。

```
/              → 主界面 HomeView（年份堆叠卡片）
/year/:year    → 展开界面 YearView（某年度图片网格）
/photo/:id     → 详情页 DetailView（大图浏览，独立于年份）
```

- **页面过渡**：使用 `<transition>` 组件实现 slide-left / slide-right 过渡动画
- **状态保持**：使用 `<keep-alive>` 包裹 `<router-view>`，保留 YearView 滚动位置

### 3.2 各页面结构

#### 📱 主界面 (HomeView)
- **星空背景动画** (StarBackground) — 全屏渐变 + 闪烁星星
- **漂浮装饰元素** (FloatingElements) — 心形、星星，缓慢上下浮动+左右摇摆
- **年份堆叠卡片** (YearStack) × 10 组（2016–2025）
  - 每张堆叠由 3–5 层卡片错位叠加，带 rotateX / rotateY 透视感
  - 卡片右下角显示年份文字
  - **交互**：
    1. 第一次点击 → 卡片微微放大（选中态，防误触）
    2. 再次点击放大的卡片 → 进入该年度的 YearView
    3. 点击其他卡片 → 前一个恢复原状，新卡片放大
- **播放/暂停按钮** (MusicToggle) — 右上角圆形按钮，白色半透明 + 柔光

#### 📱 展开界面 (YearView)
- **返回按钮** — 左上角白色返回箭头
- **年份标题** — 如“2020年”，白色柔光字体，两侧可配小爱心图标
- **图片网格** (PhotoGrid) — 3 列瀑布流布局
  - 每张照片圆角 + 柔影 + 淡粉色发光边框
  - **点击图片** → 进入 DetailView
- **播放/暂停按钮** — 右上角圆形按钮
- **底部音乐控制条**（可选）— 毛玻璃质感，仅含心形播放/暂停按钮

#### 📱 详情页 (DetailView)
- **关闭按钮** — 右上角
- **播放/暂停按钮** — 右上角圆形按钮
- **左右切换箭头** — 两侧半透明箭头提示
- **大图展示** — 居中显示，可左右滑动切换上一张/下一张
  - 图片带淡粉色发光边框 + 圆角
- **图片信息** — 下方显示日期、地点、描述文字（白色柔光文字）

---

## 四、核心交互

| 交互 | 说明 |
|------|------|
| **背景拖拽** | 主界面可上下左右拖动，查看不同位置的年份堆叠卡片 |
| **点击展开** | 第一下点击 → 卡片微微放大（选中态）；再次点击选中卡片 → 进入 YearView |
| **图片查看** | 点击网格图片 → 进入详情页大图 |
| **左右滑动** | 详情页左右滑动切换上一张/下一张 |
| **音乐控制** | 点击播放/暂停按钮控制背景音乐 |
| **自动播放** | 进入页面后需用户首次手动交互触发（浏览器限制） |

### 4.1 主界面拖拽实现 ✅ 已确认

| 项目 | 说明 |
|------|------|
| 实现方式 | 手写 Touch 事件 (`touchstart` / `touchmove` / `touchend`)，通过 `transform: translate()` 移动卡片容器 |
| 画布大小 | 约 2-3 倍视口，10 张年份卡片绝对定位散布 |
| 惯性滑动 | 松手后按递减系数持续滑动 300-500ms |
| 弹性边界 | 拖到边界超过 20px 后触发回弹，`transition 0.3s ease-out` |
| 性能 | GPU 加速 (`will-change: transform`)，稳定 60fps |

### 4.2 详情页滑动实现 ✅ 已确认

| 项目 | 说明 |
|------|------|
| 实现方式 | 组件内 `currentIndex` 状态切换 |
| 驱动方式 | `translateX` 水平滑动，三张图（前、当前、后）排列 |
| 预加载 | `currentIndex ± 2` 的原图提前加载 |
| 手势判定 | 滑动距离 > 30% 卡片宽度 → 切换；否则回弹 |
| URL 不变 | 非路由切换，不产生多余跳转 |

### 4.3 背景音乐配置 ✅ 已确认

| 配置项 | 内容 |
|--------|------|
| 音乐文件 | 1 首 MP3 |
| 播放模式 | 单曲循环 (loop) |
| 存放位置 | CloudBase 云存储 `/music/` 目录 |
| 控制方式 | 全局 MusicToggle 按钮 (播放/暂停) |
| 自动播放 | 进入页面后需用户首次手动交互触发（浏览器限制） |

---

## 五、动画效果 ✅ 已确认

| 动画 | 实现方式 |
|------|----------|
| **星空背景** | Canvas 粒子系统，150 颗分 3 层（远景 50、中景 70、近景 30） |
| **星星闪烁** | Canvas 逐帧控制 opacity + 大小变化 |
| **心形漂浮** | CSS 动画（上下浮动 + 左右摇摆） |
| **卡片堆叠** | CSS transform（rotateX / rotateY） |
| **卡片选中** | CSS transition `scale(1.05)` 微微放大 |
| **页面切换** | Vue Router `<transition>`（slide-left / slide-right） |
| **按钮光晕** | CSS box-shadow 动画 |
| **图片加载** | 模糊占位图 → 原图 CSS transition `opacity` fade-in |

---

## 六、参考图说明

以下三张 AI 生成图为设计参考（已随项目提供）：

| 文件名 | 对应页面 |
|--------|----------|
| `album_dream_final_main.jpg` | 主界面 HomeView（年份堆叠卡片、星空背景、音乐按钮） |
| `album_dream_final_expanded.jpg` | 展开界面 YearView（年份标题、3列网格、返回按钮） |
| `album_dream_final_detail.jpg` | 详情页 DetailView（大图、左右切换、信息展示） |

---

## 七、组件清单

| 组件名 | 用途 | 所属页面 |
|--------|------|----------|
| StarBackground | 星空渐变 + 闪烁粒子 | 全局 |
| FloatingElements | 漂浮心形/星星装饰 | 全局 |
| MusicToggle | 播放/暂停按钮 | 全局 |
| YearStack | 年份堆叠卡片组 | HomeView |
| PhotoGrid | 瀑布流图片网格 | YearView |
| PhotoDetail | 大图 + 左右切换 + 信息 | DetailView |

---

## 八、后端服务 ✅ 已确认

> 采用 **腾讯云 CloudBase（云开发）**，免费额度完全满足需求。

| 资源 | 免费额度 | 预估用量 | 状态 |
|------|----------|----------|:--:|
| 云存储 | 5GB | ~105MB（原图100MB + 缩略图5MB） | ✅ |
| CDN 流量 | 5GB/月 | 单次浏览 ~2-5MB | ✅ |
| 数据库容量 | 2GB | 500条记录 ~几十KB | ✅ |
| 数据库读操作 | 5万次/天 | 个人项目 | ✅ |

### 8.1 CloudBase 存储结构

```
CloudBase 云存储
  ├── /photos/full/     ← 原图 (1200px宽, 质量85%, ~150-250KB/张)
  ├── /photos/thumb/    ← 缩略图 (300px宽, 质量60%, ~8-12KB/张)
  ├── /photos/blur/     ← 模糊占位图 (20px宽, 质量30%, ~1-2KB/张)
  └── /music/           ← 背景音乐文件 (1首 MP3)

CloudBase 云数据库
  ├── 集合: photos      ← 照片元数据
  └── 集合: years       ← 年份信息
```

### 8.2 数据模型

#### 年份集合 `years`
```json
{
  "_id": "string",
  "year": 2020,
  "title": "2020年 - 相伴而行",
  "cover": "string (封面图URL, 来自云存储)",
  "coverThumb": "string (封面缩略图URL)"
}
```

#### 照片集合 `photos`
```json
{
  "_id": "string",
  "year": 2020,
  "date": "2020-05-20",
  "location": "厦门鼓浪屿",
  "description": "第一次一起看海，落日很美",
  "thumbUrl": "string (缩略图URL, /photos/thumb/)",
  "imageUrl": "string (原图URL, /photos/full/)",
  "blurUrl": "string (模糊占位图URL, /photos/blur/)"
}
```

### 8.3 图片加载策略

| 场景 | 加载内容 | 策略 |
|------|----------|------|
| 主界面 (HomeView) | 无需加载照片 | 仅展示年份堆叠卡片 |
| 展开界面 (YearView) | 可见区域缩略图 | IntersectionObserver 懒加载，~9张 × 10KB = 90KB |
| 详情页 (DetailView) | 当前 + 前后各2张缩略图 | 预加载相邻图片 |
| 大图查看 | 一张原图 | 按需加载，模糊占位图 fade-in 过渡 |
| 加载过渡 | blurUrl (1-2KB) → imageUrl | 模糊占位图瞬间显示 → 原图加载完 opacity 过渡 |

---

## 九、方案确认清单 ✅ 全部完成

| # | 事项 | 结论 |
|---|------|------|
| 1 | 路由结构 | 平级路由 `/` `/year/:year` `/photo/:id` |
| 2 | 图片存储 | CloudBase 云存储 + 三级图片（原图/缩略图/模糊占位） |
| 3 | 背景音乐 | 1 首 MP3，单曲循环，存 `/music/` |
| 4 | 主界面拖拽 | 手写 Touch + CSS transform，画布 2-3x 视口，弹性边界回弹 |
| 5 | 详情页切图 | 组件内 `currentIndex` 状态切换，`translateX` 滑动 |
| 6 | 年份点击 | 两步确认：第一下选中放大 → 第二下进入 YearView |
| 7 | 响应式 | 仅竖屏，锁定 `orientation: portrait` |
| 8 | 图片占位 | 渐进加载：blur(1-2KB) → 原图 fade-in |
| 9 | 星空背景 | Canvas 粒子系统，150 颗 / 3 层 |
| 10 | 分享功能 | 无 |

---

## 十、开发与部署策略

### 10.1 开发阶段 → 数据分离

编码阶段使用 **本地 mock 数据**，不依赖 CloudBase 真实数据：

```
src/
  mock/
    years.json     ← 10 条年份假数据
    photos.json    ← 若干条照片假数据（含占位图 URL）
```

- API 调用层封装适配器，本地开发读 mock JSON，上线后切 CloudBase 数据库
- 照片显示用纯色占位或在线占位图服务（如 `picsum.photos`）做未加载态

### 10.2 编码完成后 → CloudBase 数据导入

按 `CLOUDBASE_GUIDE.md` 手顺书操作，将真实照片和元数据导入 CloudBase。

### 10.3 部署上线

| 方式 | 说明 |
|------|------|
| **EdgeOne Pages**（推荐） | 关联 GitHub 仓库，push 后自动构建部署，分配公网 URL |
| CloudBase 静态托管 | `npm run build` → 上传 `dist/` → 获取域名 |

> 手机端通过 URL 直接访问。

---

## 📁 关联文件

| 文件 | 用途 |
|------|------|
| `DESIGN.md` | 本文件 — 设计方案（开发依据） |
| `CLOUDBASE_GUIDE.md` | CloudBase 操作手顺书（编码完成后使用） |

---

> ✅ **方案确认阶段完成。用户确认后方可进入编码阶段。**
