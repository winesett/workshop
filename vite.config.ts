/// <reference types="vitest/config" />
import path from 'path'
import { defineConfig } from 'vite'
import type { Plugin, ViteDevServer } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { tanstackRouter } from '@tanstack/router-plugin/vite'
import { playwright } from '@vitest/browser-playwright'
import { execFile } from 'node:child_process'
import fs from 'node:fs'
import type { IncomingMessage, ServerResponse } from 'node:http'
import { promisify } from 'node:util'

const execFileAsync = promisify(execFile)
const codexLinkRoute = '/__workshop/write-codex-link-payload'
const root = __dirname
const figmaPluginRoot = path.resolve(root, 'figma-plugins/workshop')

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    workshopCodexLinkWriter(),
    tanstackRouter({
      target: 'react',
      autoCodeSplitting: true,
    }),
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    silent: 'passed-only',
    unstubEnvs: true,
    browser: {
      enabled: true,
      provider: playwright(),
      instances: [{ browser: 'chromium' }],
    },
    coverage: {
      // include: ['src/**/*.{js,jsx,ts,tsx}'], // Uncomment to expand the report to all src/**/* so untested modules appear as 0% coverage.
      exclude: [
        'src/components/ui/**',
        'src/assets/**',
        'src/tanstack-table.d.ts',
        'src/routeTree.gen.ts',
        'src/test-utils/**',
        'src/routes/**',
      ],
    },
  },
})

function workshopCodexLinkWriter(): Plugin {
  return {
    name: 'workshop-codex-link-writer',
    configureServer(server: ViteDevServer) {
      server.middlewares.use(
        codexLinkRoute,
        async (req: IncomingMessage, res: ServerResponse) => {
          if (req.method !== 'POST') {
            res.statusCode = 405
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ error: 'Method not allowed' }))
            return
          }

          try {
            const payload = await readJsonBody(req)
            const keyedPayload = createKeyedCodexLinkPayload(payload)
            const payloadPath = path.join(
              figmaPluginRoot,
              'codex-link-payload.json'
            )

            fs.writeFileSync(
              payloadPath,
              `${JSON.stringify(keyedPayload, null, 2)}\n`
            )
            await execFileAsync('npm', ['run', 'build'], {
              cwd: figmaPluginRoot,
            })

            res.statusCode = 200
            res.setHeader('Content-Type', 'application/json')
            res.end(
              JSON.stringify({
                ok: true,
                path: path.relative(root, payloadPath),
                sectionCount: keyedPayload.sections.length,
              })
            )
          } catch (error) {
            res.statusCode = 400
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ error: readError(error) }))
          }
        }
      )
    },
  }
}

function createKeyedCodexLinkPayload(value: unknown) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error('Payload must be a JSON object.')
  }

  const input = value as Record<string, unknown>
  const registry = readRegistry()
  const sections = Array.isArray(input.sections) ? input.sections : []

  if (!sections.length) {
    throw new Error('Payload must include at least one section.')
  }

  return {
    schemaVersion: 'workshop.pageBuilder.assembly.v1',
    pageName: cleanString(input.pageName) || 'Untitled Page',
    spacing: typeof input.spacing === 'number' ? input.spacing : 0,
    sections: sections.map((section) => createKeyedSection(section, registry)),
  }
}

function createKeyedSection(section: unknown, registry: RegistryItem[]) {
  if (!section || typeof section !== 'object' || Array.isArray(section)) {
    throw new Error('Each section must be an object.')
  }

  const input = section as Record<string, unknown>
  const ref = cleanString(input.ref)
  const category = cleanString(input.category)
  const name = cleanString(input.name)
  const registryItem =
    findRegistryItem(registry, ref) ||
    findRegistryItem(registry, canonicalRef(category, name)) ||
    findRegistryItemByKey(registry, cleanString(input.key))

  if (!registryItem) {
    throw new Error(
      `No Figma registry key found for ${ref || `${category} / ${name}`}.`
    )
  }

  return {
    ref: registryItem.ref,
    category: registryItem.category,
    name: registryItem.name,
    kind: registryItem.kind,
    key: registryItem.key,
  }
}

function readRegistry(): RegistryItem[] {
  const registryPath = path.join(
    figmaPluginRoot,
    'data/relume-page-builder-registry.json'
  )
  const registry = JSON.parse(fs.readFileSync(registryPath, 'utf8')) as {
    items?: unknown[]
  }

  return Array.isArray(registry.items)
    ? registry.items.filter(isRegistryItem)
    : []
}

function findRegistryItem(registry: RegistryItem[], ref: string) {
  if (!ref) return null
  const candidateRefs = canonicalRefsFromString(ref)
  return findFirstRegistryMatch(registry, candidateRefs)
}

function findRegistryItemByKey(registry: RegistryItem[], key: string) {
  if (!key) return null
  return registry.find((item) => item.key === key) ?? null
}

function canonicalRefsFromString(ref: string) {
  const parts = ref
    .split('/')
    .map((part) => part.trim())
    .filter(Boolean)
  if (parts.length < 2) return [ref]
  return canonicalRefs(parts[0], parts.slice(1).join(' / '))
}

function canonicalRef(category: string, name: string) {
  return canonicalRefs(category, name)[0] ?? ''
}

function canonicalRefs(category: string, name: string) {
  if (!category || !name) return []
  const categoryAliases: Record<string, string> = {
    header: 'Header',
    headers: 'Header',
    hero: 'Hero-Headers',
    heroheader: 'Hero-Headers',
    heroheaders: 'Hero-Headers',
    heroheadersheader: 'Hero-Headers',
    navbar: 'Navbars',
    navbars: 'Navbars',
    footer: 'Footers',
    footers: 'Footers',
    cta: 'CTA',
    feature: 'Features',
    features: 'Features',
    logo: 'Logos',
    logos: 'Logos',
    testimonial: 'Testimonials',
    testimonials: 'Testimonials',
    faq: 'FAQ',
    faqs: 'FAQ',
  }
  const canonicalCategory = categoryAliases[normalizeKey(category)] || category

  const refs = [`${canonicalCategory} / ${name}`]
  const number = name.match(/\d+/u)?.[0]

  if (number) {
    refs.push(`${canonicalCategory} / ${number} /`)
  }

  return refs
}

function findFirstRegistryMatch(registry: RegistryItem[], refs: string[]) {
  const normalizedRefs = refs.map(normalizeKey)
  return (
    registry.find((item) =>
      normalizedRefs.some(
        (normalizedRef) => normalizeKey(item.ref) === normalizedRef
      )
    ) ?? null
  )
}

function normalizeKey(value: string) {
  return value
    .toLowerCase()
    .replace(/&/gu, 'and')
    .replace(/[^a-z0-9]+/gu, '')
}

function cleanString(value: unknown) {
  return typeof value === 'string' ? value.trim() : ''
}

function isRegistryItem(value: unknown): value is RegistryItem {
  if (!value || typeof value !== 'object') return false
  const item = value as Record<string, unknown>

  return (
    typeof item.ref === 'string' &&
    typeof item.category === 'string' &&
    typeof item.name === 'string' &&
    typeof item.kind === 'string' &&
    typeof item.key === 'string'
  )
}

function readJsonBody(req: import('node:http').IncomingMessage) {
  return new Promise<unknown>((resolve, reject) => {
    let body = ''

    req.on('data', (chunk: Buffer) => {
      body += chunk.toString('utf8')
    })
    req.on('end', () => {
      try {
        resolve(JSON.parse(body))
      } catch (error) {
        reject(error)
      }
    })
    req.on('error', reject)
  })
}

function readError(error: unknown) {
  return error instanceof Error ? error.message : String(error)
}

type RegistryItem = {
  ref: string
  category: string
  name: string
  kind: string
  key: string
}
