/**
 * 图片压缩脚本 — 将高清原图压缩为适合移动端展示的尺寸
 *
 * 使用场景：
 *   你有高清原图（如 4000×3000 像素，单张 2~10MB），需要压缩为
 *   手机屏幕展示友好的版本，同时保持清晰不糊。
 *
 * 压缩策略：
 *   - 目标宽度 1400px（覆盖 3x Retina 屏幕 + 适当余量）
 *   - JPEG quality 85（视觉无损，文件体积大幅降低）
 *   - 保持原始宽高比
 *   - 仅处理 .jpg/.jpeg/.png 文件
 *
 * 预期效果：
 *   原图 2~10MB → 压缩后约 200~500KB（降低 10~20 倍）
 *   手机 4G 网络下加载时间从 10~30 秒 → 1~2 秒
 *
 * 用法：
 *   # 压缩指定目录下的所有图片（原地覆盖）
 *   node scripts/compressImages.js ./public/photos/full
 *
 *   # 指定输出目录（保留原图）
 *   node scripts/compressImages.js ./public/photos/full ./public/photos/compressed
 *
 *   # 同时指定宽度和画质
 *   node scripts/compressImages.js ./public/photos/full ./public/photos/full 1200 80
 *
 * 参数说明：
 *   inputDir   - 源图片目录（必填）
 *   outputDir  - 输出目录（可选，默认覆盖源目录）
 *   width      - 目标宽度 px（可选，默认 1400）
 *   quality    - JPEG 质量 1-100（可选，默认 85）
 */

const fs = require('fs')
const path = require('path')
const sharp = require('sharp')

// ===================== 配置解析 =====================

const inputDir = path.resolve(process.argv[2] || '')
const outputDir = path.resolve(process.argv[3] || inputDir + '_compressed')
const targetWidth = parseInt(process.argv[4]) || 1400
const quality = parseInt(process.argv[5]) || 85

if (!inputDir || !fs.existsSync(inputDir)) {
  console.error('❌ 错误：请提供有效的源图片目录路径')
  console.log('用法: node scripts/compressImages.js <inputDir> [outputDir] [width] [quality]')
  process.exit(1)
}

// 确保输出目录存在
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true })
}

const EXT_REGEX = /\.(jpe?g|png)$/i
const isDryRun = process.argv.includes('--dry-run')

// ===================== 核心逻辑 =====================

/** 递归收集目录下所有图片文件 */
function collectImages(dir) {
  const results = []
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      results.push(...collectImages(fullPath))
    } else if (EXT_REGEX.test(entry.name)) {
      results.push(fullPath)
    }
  }
  return results
}

/** 压缩单张图片 */
async function compressImage(inputPath) {
  // 计算对应的输出路径
  const relativePath = path.relative(inputDir, inputPath)
  const outputPath = path.join(outputDir, relativePath)

  // 确保输出子目录存在
  const outputParent = path.dirname(outputPath)
  if (!fs.existsSync(outputParent)) {
    fs.mkdirSync(outputParent, { recursive: true })
  }

  const originalSize = fs.statSync(inputPath).size

  if (isDryRun) {
    const metadata = await sharp(inputPath).metadata()
    console.log(`  [DRY-RUN] ${path.basename(inputPath)} — ${metadata.width}×${metadata.height} — ${formatSize(originalSize)}`)
    return { originalSize, compressedSize: null }
  }

  try {
    const buffer = await sharp(inputPath)
      .resize({ width: targetWidth, withoutEnlargement: true })
      .jpeg({ quality, progressive: true })
      .toBuffer()

    // 确保输出目录存在
    const outputParent = path.dirname(outputPath)
    if (!fs.existsSync(outputParent)) {
      fs.mkdirSync(outputParent, { recursive: true })
    }

    // 直接写入目标路径（toBuffer 已释放 sharp 的文件句柄）
    fs.writeFileSync(outputPath, buffer)

    const compressedSize = fs.statSync(outputPath).size
    return { originalSize, compressedSize }
  } catch (err) {
    console.error(`  ⚠️ 压缩失败: ${path.basename(inputPath)} — ${err.message}`)
    return { originalSize, compressedSize: null, error: err.message }
  }
}

/** 人类可读的文件大小 */
function formatSize(bytes) {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
}

// ===================== 主流程 =====================

async function main() {
  console.log('')
  console.log('📷  图片压缩工具')
  console.log('─────────────────────────────────────')
  console.log(`  源目录:    ${inputDir}`)
  console.log(`  输出目录:  ${outputDir}`)
  console.log(`  目标宽度:  ${targetWidth}px`)
  console.log(`  JPEG质量:  ${quality}`)
  if (isDryRun) console.log(`  模式:      DRY-RUN（仅预览，不实际压缩）`)
  console.log('─────────────────────────────────────')
  console.log('')

  const images = collectImages(inputDir)
  if (images.length === 0) {
    console.log('⚠️  未找到任何图片文件 (.jpg/.jpeg/.png)')
    return
  }

  console.log(`找到 ${images.length} 张图片，开始处理...\n`)

  let totalOriginal = 0
  let totalCompressed = 0
  let successCount = 0
  let failCount = 0

  for (let i = 0; i < images.length; i++) {
    const imgPath = images[i]
    const result = await compressImage(imgPath)

    totalOriginal += result.originalSize

    if (result.error) {
      failCount++
    } else {
      successCount++
      if (result.compressedSize !== null) {
        totalCompressed += result.compressedSize
        const reduction = ((1 - result.compressedSize / result.originalSize) * 100).toFixed(0)
        console.log(`  [${i + 1}/${images.length}] ✅ ${path.basename(imgPath)}  ${formatSize(result.originalSize)} → ${formatSize(result.compressedSize)}  (-${reduction}%)`)
      }
    }
  }

  console.log('')
  console.log('─────────────────────────────────────')
  console.log(`  完成: ${successCount} 成功, ${failCount} 失败`)
  if (!isDryRun && totalCompressed > 0) {
    const reduction = ((1 - totalCompressed / totalOriginal) * 100).toFixed(0)
    console.log(`  总大小: ${formatSize(totalOriginal)} → ${formatSize(totalCompressed)}  (-${reduction}%)`)
    console.log(`  节省:   ${formatSize(totalOriginal - totalCompressed)}`)
  }
  console.log('─────────────────────────────────────')
  console.log('')
}

main().catch(err => {
  console.error('❌ 执行失败:', err.message)
  process.exit(1)
})
