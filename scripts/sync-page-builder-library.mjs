import { mkdir, readdir, rm, copyFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(__dirname, '..')
const sourceRoot = path.join(
  repoRoot,
  'src/tools/page-builder/assets/relume-thumbnails'
)
const outputRoot = path.join(repoRoot, 'public/local-assets/page-builder')
const supportedExtensions = new Set(['.png', '.jpg', '.jpeg', '.webp'])
const collator = new Intl.Collator(undefined, {
  numeric: true,
  sensitivity: 'base',
})

function readableName(filename) {
  return path.basename(filename, path.extname(filename)).trim()
}

function slug(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function hash(value) {
  let result = 5381
  for (let index = 0; index < value.length; index += 1) {
    result = (result * 33) ^ value.charCodeAt(index)
  }
  return (result >>> 0).toString(36)
}

function publicPath(category, filename) {
  return `/local-assets/page-builder/${encodeURIComponent(category)}/${encodeURIComponent(filename)}`
}

async function safeReadDir(directory, options) {
  try {
    return await readdir(directory, options)
  } catch {
    return []
  }
}

async function syncLibrary() {
  const categories = await safeReadDir(sourceRoot, { withFileTypes: true })
  const records = []

  await rm(outputRoot, { recursive: true, force: true })
  await mkdir(outputRoot, { recursive: true })

  for (const categoryEntry of categories) {
    if (!categoryEntry.isDirectory()) continue

    const category = categoryEntry.name
    const desktopDirectory = path.join(sourceRoot, category, 'Desktop')
    const desktopFiles = await safeReadDir(desktopDirectory, {
      withFileTypes: true,
    })
    const outputCategoryDirectory = path.join(outputRoot, category)
    let copiedInCategory = 0

    for (const fileEntry of desktopFiles) {
      if (!fileEntry.isFile()) continue

      const filename = fileEntry.name
      const extension = path.extname(filename).toLowerCase()
      if (!supportedExtensions.has(extension)) continue

      const sourcePath = path.join(desktopDirectory, filename)
      const outputPath = path.join(outputCategoryDirectory, filename)

      try {
        await mkdir(outputCategoryDirectory, { recursive: true })
        await copyFile(sourcePath, outputPath)
        copiedInCategory += 1
      } catch {
        continue
      }

      const stableKey = `${category}/${filename}`
      records.push({
        id: `${slug(category)}-${slug(readableName(filename))}-${hash(stableKey)}`,
        category,
        filename,
        name: readableName(filename),
        imagePath: publicPath(category, filename),
      })
    }

    if (copiedInCategory === 0) {
      await rm(outputCategoryDirectory, { recursive: true, force: true })
    }
  }

  records.sort(
    (a, b) =>
      collator.compare(a.category, b.category) || collator.compare(a.name, b.name)
  )

  await writeFile(
    path.join(outputRoot, 'catalog.json'),
    `${JSON.stringify(records, null, 2)}\n`
  )

  const categoryCount = new Set(records.map((record) => record.category)).size
  console.log(
    `Synced ${records.length} Desktop screenshots across ${categoryCount} categories.`
  )
  console.log('Wrote public/local-assets/page-builder/catalog.json')
}

syncLibrary().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
