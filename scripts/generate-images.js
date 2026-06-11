/**
 * 图片处理脚本 - 生成缩略图和模糊占位图
 *
 * 目录结构：
 *   public/photos/
 *     full/<年份>/    ← 按年份放入原图
 *     thumb/<年份>/   ← 自动生成缩略图
 *     blur/<年份>/    ← 自动生成模糊占位图
 *
 * 使用方法：
 *   node scripts/generate-images.js [年份]
 *
 * 示例：
 *   node scripts/generate-images.js 2020    ← 只处理 2020 年的图片
 *   node scripts/generate-images.js         ← 处理所有年份
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// 解析命令行参数
const targetYear = process.argv[2];
if (process.argv.length > 4) {
  console.log('用法: node scripts/generate-images.js [年份]');
  console.log('示例: node scripts/generate-images.js 2020');
  console.log('      node scripts/generate-images.js          (处理所有年份)');
  process.exit(1);
}

const baseDir = path.join(__dirname, '../public/photos');
const fullDir = path.join(baseDir, 'full');
const thumbDir = path.join(baseDir, 'thumb');
const blurDir = path.join(baseDir, 'blur');

// 获取 full 目录下所有年份文件夹
const allYearDirs = fs.readdirSync(fullDir, { withFileTypes: true })
  .filter(d => d.isDirectory())
  .map(d => d.name);

if (allYearDirs.length === 0) {
  console.log('未找到年份文件夹！');
  console.log('请先创建 public/photos/full/<年份>/ 并放入原图，例如:');
  console.log('  public/photos/full/2020/photo1.jpg');
  process.exit(0);
}

// 根据参数确定要处理的年份
let yearDirs;
if (targetYear) {
  if (!allYearDirs.includes(targetYear)) {
    console.log(`错误：未找到年份文件夹 "${targetYear}"`);
    console.log(`可用的年份: ${allYearDirs.sort((a, b) => parseInt(a) - parseInt(b)).join(', ')}`);
    process.exit(0);
  }
  yearDirs = [targetYear];
  console.log(`处理年份: ${targetYear}\n`);
} else {
  yearDirs = allYearDirs.sort((a, b) => parseInt(a) - parseInt(b));
  console.log(`扫描到 ${yearDirs.length} 个年份文件夹 (使用参数可指定单年份，如: node scripts/generate-images.js 2020)\n`);
}

let totalImages = 0;
let totalProcessed = 0;
let totalSkipped = 0;
let totalFailed = 0;

async function processYear(year) {
  const yearFullDir = path.join(fullDir, year);
  const yearThumbDir = path.join(thumbDir, year);
  const yearBlurDir = path.join(blurDir, year);

  // 确保输出目录存在
  [yearThumbDir, yearBlurDir].forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`  Created: ${dir}`);
    }
  });

  // 读取该年份的原图
  const files = fs.readdirSync(yearFullDir).filter(f => /\.(jpg|jpeg|png)$/i.test(f));

  if (files.length === 0) {
    console.log(`  (无图片文件，跳过)`);
    return;
  }

  let yearImages = 0, yearNew = 0, yearSkipped = 0;

  for (const file of files) {
    const inputPath = path.join(yearFullDir, file);
    const baseName = path.basename(file, path.extname(file));
    const thumbPath = path.join(yearThumbDir, `${baseName}.jpg`);
    const blurPath = path.join(yearBlurDir, `${baseName}.jpg`);

    const thumbExists = fs.existsSync(thumbPath);
    const blurExists = fs.existsSync(blurPath);

    yearImages++;

    // 缩略图和模糊图都已存在，直接跳过
    if (thumbExists && blurExists) {
      yearSkipped++;
      continue;
    }

    console.log(`    Processing: ${file}`);
    let hasNew = false;

    try {
      // 生成缩略图 (300px 宽) - 仅当不存在时
      if (!thumbExists) {
        await sharp(inputPath)
          .resize(300)
          .jpeg({ quality: 60 })
          .toFile(thumbPath);
        console.log(`      ✓ Thumbnail: ${year}/${baseName}.jpg (300px)`);
        hasNew = true;
      } else {
        console.log(`      - Thumbnail: ${year}/${baseName}.jpg (exists, skipped)`);
      }

      // 生成模糊图 (20px 宽 + 模糊处理) - 仅当不存在时
      if (!blurExists) {
        await sharp(inputPath)
          .resize(20)
          .blur(5)
          .jpeg({ quality: 30 })
          .toFile(blurPath);
        console.log(`      ✓ Blur: ${year}/${baseName}.jpg (20px + blur)`);
        hasNew = true;
      } else {
        console.log(`      - Blur: ${year}/${baseName}.jpg (exists, skipped)`);
      }

      if (hasNew) yearNew++;
    } catch (err) {
      console.error(`      ✗ Error: ${year}/${file} - ${err.message}`);
      totalFailed++;
    }
  }

  totalImages += yearImages;
  totalProcessed += yearNew;
  totalSkipped += yearSkipped;

  // 输出该年份汇总
  const parts = [];
  parts.push(`${yearImages} source images`);
  if (yearNew > 0) parts.push(`${yearNew} new`);
  if (yearSkipped > 0) parts.push(`${yearSkipped} skipped`);
  console.log(`  → ${parts.join(', ')}`);
}

async function processAll() {
  for (const year of yearDirs) {
    console.log(`[${year}]`);
    await processYear(year);
    console.log('');
  }

  console.log('='.repeat(40));
  console.log(`Done! Source images: ${totalImages}`);
  console.log(`  ✓ Newly processed: ${totalProcessed}`);
  if (totalSkipped > 0) {
    console.log(`  - Skipped (already exist): ${totalSkipped}`);
  }
  if (totalFailed > 0) {
    console.log(`  ✗ Failed: ${totalFailed}`);
  }
  console.log(`\nOutput paths: thumb/<year>/  and  blur/<year>/`);
  console.log(`URL format: /photos/thumb/{year}/{filename}.jpg`);
}

processAll();
