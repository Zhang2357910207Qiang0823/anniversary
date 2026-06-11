# CloudBase 操作手顺书

> 本文档在你完成编码后使用。按顺序执行，大约 30 分钟即可完成。

---

## 准备工作

- [x] 已注册腾讯云账号
- [x] 已在 IDE 集成面板登录 CloudBase
- [x] CloudBase 环境已创建（ID：`anniversary-album-d8dqof1f7d1e48`）

---

## 第一步：创建 CloudBase 环境 ✅ 已完成

环境 ID：`anniversary-album-d8dqof1f7d1e48`

---

## 第二步：创建数据库集合 ✅ 已完成

- `years` 集合：10 条年份数据（2016-2025）
- `photos` 集合：照片数据（待导入）

---

## 第三步：准备图片（本地文件方案）

### 3.1 目录结构

在项目根目录下创建以下文件夹：

```
public/
  └── photos/
      ├── full/        ← 原图，按年份分子目录 (1200px 宽)
      │   ├── 2016/
      │   ├── 2017/
      │   └── ...2026/
      ├── thumb/       ← 缩略图，按年份分子目录 (300px 宽)
      │   ├── 2016/
      │   ├── 2017/
      │   └── ...2026/
      └── blur/        ← 模糊占位图，按年份分子目录 (20px 宽)
          ├── 2016/
          ├── 2017/
          └── ...2026/
```

### 3.2 生成缩略图和模糊图

**方法一：使用 Node.js 脚本（推荐）**

1. 在项目根目录安装依赖：
```bash
npm install sharp --save-dev
```

2. 脚本 `scripts/generate-images.js` 已内置在项目中，它会：
   - 自动扫描 `full/` 下所有年份文件夹
   - 为每张原图生成缩略图（300px）和模糊占位图（20px）
   - **增量处理**：已生成的图片自动跳过，支持分批放入原图重复运行

3. 按年份放入原图并运行脚本：
```bash
# 分批放入原图，每次都可以直接运行
node scripts/generate-images.js
```

运行输出示例：
```
[2020]
  Found 7 images
    Processing: beach.jpg
      ✓ Thumbnail: 2020/beach.jpg (300px)
      ✓ Blur: 2020/beach.jpg (20px + blur)
  → 7 source images, 2 new, 5 skipped
```

---

### 方法二：在线工具处理（无需安装）

如果不想安装软件，可以使用在线工具：

1. **缩略图**：访问 [https://www.iloveimg.com/resize-image](https://www.iloveimg.com/resize-image)
   - 批量上传原图
   - 设置宽度为 300px
   - 下载并放入 `public/photos/thumb/<年份>/`

2. **模糊图**：访问 [https://www.iloveimg.com/compress-image](https://www.iloveimg.com/compress-image)
   - 批量上传原图
   - 压缩到最低质量
   - 或直接用缩略图作为模糊图（效果稍差但可用）

---

## 第四步：导入照片数据到数据库

### 4.1 生成照片数据 JSON

在 `src/mock/` 目录下更新 `photos.json`，格式如下：

```json
[
  {
    "id": "2020_01",
    "year": 2020,
    "date": "2020-05-20",
    "location": "厦门鼓浪屿",
    "description": "第一次一起看海，落日很美",
    "thumbUrl": "/photos/thumb/2020/2020_01.jpg",
    "imageUrl": "/photos/full/2020/2020_01.jpg",
    "blurUrl": "/photos/blur/2020/2020_01.jpg"
  }
]
```

> 注意：本地文件使用相对路径 `/photos/...` 即可。

### 4.2 更新 years.json 封面图

同样更新 `src/mock/years.json`：

```json
{
  "id": "y2020",
  "year": 2020,
  "title": "2020年 · 甜蜜",
  "cover": "/photos/thumb/2020/cover_2020.jpg",
  "coverThumb": "/photos/thumb/2020/cover_2020.jpg"
}
```

### 4.3 导入 CloudBase 数据库

由于图片改用本地方案，`photos` 集合数据可以保留为 mock 数据，无需导入到 CloudBase。

---

## 第五步：配置安全规则 ✅ 已完成

- `years` 集合：所有用户可读 ✅
- `photos` 集合：所有用户可读 ✅

---

## 第六步：背景音乐设置

### 方式一：本地音乐文件

1. 将 `.mp3` 文件放入 `public/music/` 目录
2. 在代码中引用：`/music/bgm.mp3`

### 方式二：使用公开音乐链接

在 `useMusic.js` 中使用网易云音乐外链或其他公开 URL。

---

## 第七步：部署上线

### 方式一：EdgeOne Pages（推荐，自动部署）

1. IDE 集成面板 → EdgeOne Pages → 登录授权
2. 关联 GitHub 仓库
3. 自动构建并分配 URL（如 `xxx.edgeonepages.com`）
4. 手机直接打开 URL 即可访问

### 方式二：CloudBase 静态托管

1. 本地执行 `npm run build`
2. CloudBase 控制台 → 静态网站托管 → 上传 `dist/` 文件夹
3. 获取访问域名

---

## 快速检查清单

| 步骤 | 检查项 | 状态 |
|------|--------|------|
| 1 | CloudBase 环境已创建 | ✅ |
| 2 | `years` 集合已创建并添加 10 条数据 | ✅ |
| 3 | `photos` 集合已创建 | ✅ |
| 4 | 原图已按年份放入 `public/photos/full/<年份>/` | ☐ |
| 5 | 缩略图已生成到 `public/photos/thumb/<年份>/` | ☐ |
| 6 | 模糊图已生成到 `public/photos/blur/<年份>/` | ☐ |
| 7 | `photos.json` 数据路径已更新 | ☐ |
| 8 | `years.json` 封面图路径已更新 | ☐ |
| 9 | 背景音乐已放入 `public/music/` | ☐ |
| 10 | 数据库权限设为「所有用户可读」 | ✅ |
| 11 | 项目已部署上线 | ☐ |
| 12 | 手机浏览器可正常访问 | ☐ |
