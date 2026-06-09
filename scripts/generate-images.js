/**
 * 图片处理脚本 - 生成缩略图和模糊占位图
 *
 * 使用方法：
 * 1. 将原图放入 public/photos/full/ 目录
 * 2. 运行: node scripts/generate-images.js
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const baseDir = path.join(__dirname, '../public/photos');
const fullDir = path.join(baseDir, 'full');
const thumbDir = path.join(baseDir, 'thumb');
const blurDir = path.join(baseDir, 'blur');

// 确保目录存在
[thumbDir, blurDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`Created directory: ${dir}`);
  }
});

// 检查原图目录
if (!fs.existsSync(fullDir)) {
  fs.mkdirSync(fullDir, { recursive: true });
  console.log(`Created directory: ${fullDir}`);
  console.log('请将原图放入 public/photos/full/ 目录，然后重新运行此脚本');
  process.exit(0);
}

const files = fs.readdirSync(fullDir).filter(f => /\.(jpg|jpeg|png)$/i.test(f));

if (files.length === 0) {
  console.log('没有找到图片文件！');
  console.log('请将原图放入 public/photos/full/ 目录，然后重新运行此脚本');
  process.exit(0);
}

async function processImages() {
  console.log(`Found ${files.length} images to process\n`);

  for (const file of files) {
    const inputPath = path.join(fullDir, file);
    const baseName = path.basename(file, path.extname(file));

    console.log(`Processing: ${file}`);

    try {
      // 生成缩略图 (300px 宽)
      const thumbPath = path.join(thumbDir, `${baseName}.jpg`);
      await sharp(inputPath)
        .resize(300)
        .jpeg({ quality: 60 })
        .toFile(thumbPath);
      console.log(`  ✓ Thumbnail: ${baseName}.jpg (300px)`);

      // 生成模糊图 (20px 宽 + 模糊处理)
      const blurPath = path.join(blurDir, `${baseName}.jpg`);
      await sharp(inputPath)
        .resize(20)
        .blur(5)
        .jpeg({ quality: 30 })
        .toFile(blurPath);
      console.log(`  ✓ Blur: ${baseName}.jpg (20px + blur)`);

    } catch (err) {
      console.error(`  ✗ Error processing ${file}:`, err.message);
    }
  }

  console.log('\nDone! All images processed.');
}

processImages();
