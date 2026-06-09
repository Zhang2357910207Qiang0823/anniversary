# CloudBase 操作手顺书

> 本文档在你完成编码后使用。按顺序执行，大约 30 分钟即可完成。

---

## 准备工作

- [ ] 已注册腾讯云账号
- [ ] 已在 IDE 集成面板登录 CloudBase

---

## 第一步：创建 CloudBase 环境

1. 打开 [腾讯云 CloudBase 控制台](https://console.cloud.tencent.com/tcb)
2. 点击「新建环境」
3. 选择「按量计费」（免费额度内不产生费用）
4. 环境名称：如 `anniversary-album`
5. 等待环境创建完成（约 2 分钟）

---

## 第二步：创建数据库集合

在 CloudBase 控制台 → 数据库 → 集合管理：

### 创建 `years` 集合

点击「新建集合」→ 名称输入 `years` → 确定

然后点击「添加记录」，添加 10 条年份数据：

```json
{ "year": 2016, "title": "2016年 - 初遇", "cover": "", "coverThumb": "" }
{ "year": 2017, "title": "2017年 - 相知", "cover": "", "coverThumb": "" }
{ "year": 2018, "title": "2018年 - 心动", "cover": "", "coverThumb": "" }
{ "year": 2019, "title": "2019年 - 陪伴", "cover": "", "coverThumb": "" }
{ "year": 2020, "title": "2020年 - 甜蜜", "cover": "", "coverThumb": "" }
{ "year": 2021, "title": "2021年 - 同行", "cover": "", "coverThumb": "" }
{ "year": 2022, "title": "2022年 - 守护", "cover": "", "coverThumb": "" }
{ "year": 2023, "title": "2023年 - 温暖", "cover": "", "coverThumb": "" }
{ "year": 2024, "title": "2024年 - 携手", "cover": "", "coverThumb": "" }
{ "year": 2025, "title": "2025年 - 十年", "cover": "", "coverThumb": "" }
```

> `cover` 和 `coverThumb` 先留空，上传封面图后再填写 URL。

### 创建 `photos` 集合

点击「新建集合」→ 名称输入 `photos` → 确定

> 照片数据稍后批量导入。

---

## 第三步：上传照片到云存储

### 3.1 准备图片

按以下目录结构准备好所有照片：

```
本地照片目录/
  ├── full/        ← 原图 (1200px 宽)
  ├── thumb/       ← 缩略图 (300px 宽)
  └── blur/        ← 模糊占位图 (20px 宽)
```

**缩略图/模糊图批量生成**（在本地用命令行）：

```bash
# 安装 sharp（仅需一次）
npm install -g sharp-cli

# 进入照片目录，批量生成缩略图
sharp -i ./原图/*.jpg -o ./thumb/ resize 300 --quality 60

# 批量生成模糊占位图
sharp -i ./原图/*.jpg -o ./blur/ resize 20 --quality 30
```

### 3.2 上传到 CloudBase

在 CloudBase 控制台 → 云存储：

1. 创建文件夹 `photos/full/`，上传原图
2. 创建文件夹 `photos/thumb/`，上传缩略图
3. 创建文件夹 `photos/blur/`，上传模糊占位图
4. 创建文件夹 `music/`，上传背景音乐 `.mp3` 文件

> 💡 上传后每张图会获得一个 URL（点击图片 → 详情 → 文件路径），记下域名前缀。

---

## 第四步：导入照片数据到数据库

### 4.1 生成照片数据 JSON

准备一个 `photos.json` 文件，格式如下：

```json
[
  {
    "year": 2020,
    "date": "2020-05-20",
    "location": "厦门鼓浪屿",
    "description": "第一次一起看海，落日很美",
    "thumbUrl": "https://你的环境ID.tcb.qcloud.la/photos/thumb/2020_001.jpg",
    "imageUrl": "https://你的环境ID.tcb.qcloud.la/photos/full/2020_001.jpg",
    "blurUrl": "https://你的环境ID.tcb.qcloud.la/photos/blur/2020_001.jpg"
  },
  ...
]
```

> ⚠️ 把 `你的环境ID` 替换为实际的 CloudBase 环境 ID（在控制台概览页查看）。

### 4.2 导入数据库

在 CloudBase 控制台 → 数据库 → `photos` 集合 → 「导入」→ 选择 `photos.json` 文件。

---

## 第五步：配置安全规则（重要）

在 CloudBase 控制台 → 数据库 → `years` 集合 → 权限设置：

```
{
  "read": true,
  "write": false
}
```

`photos` 集合同样设置为「所有用户可读」。

云存储权限 → 存储桶权限 → 设置为「公有读」。

> ⚠️ 这样手机端才能正常加载图片和数据。

---

## 第六步：获取环境 ID 并填入项目

1. CloudBase 控制台 → 概览 → 复制「环境 ID」
2. 在项目代码中找到 CloudBase 初始化配置，填入环境 ID
3. 重新构建并部署

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

| 步骤 | 检查项 | ✓ |
|------|--------|---|
| 1 | CloudBase 环境已创建 | ☐ |
| 2 | `years` 集合已创建并添加 10 条数据 | ☐ |
| 3 | `photos` 集合已创建 | ☐ |
| 4 | 原图已上传到 `/photos/full/` | ☐ |
| 5 | 缩略图已上传到 `/photos/thumb/` | ☐ |
| 6 | 模糊占位图已上传到 `/photos/blur/` | ☐ |
| 7 | 音乐文件已上传到 `/music/` | ☐ |
| 8 | 照片数据已导入 `photos` 集合 | ☐ |
| 9 | 数据库权限设为「所有用户可读」 | ☐ |
| 10 | 云存储权限设为「公有读」 | ☐ |
| 11 | 环境 ID 已填入项目代码 | ☐ |
| 12 | 封面图 URL 已填入 `years` 集合 | ☐ |
| 13 | 项目已部署上线 | ☐ |
| 14 | 手机浏览器可正常访问 | ☐ |
