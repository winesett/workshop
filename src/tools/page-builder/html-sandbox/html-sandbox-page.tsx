import { type ReactNode, useLayoutEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Main } from '@/components/layout/main'
import {
  FeaturesLayout1Renderer,
  layout1Tuning,
} from '../html-renderers/experiments/features-layout-1'
import {
  FeaturesLayout2Renderer,
  layout2Tuning,
} from '../html-renderers/experiments/features-layout-2'
import {
  FeaturesLayout3Renderer,
  layout3Tuning,
} from '../html-renderers/experiments/features-layout-3'
import {
  FeaturesLayout4Renderer,
  layout4Tuning,
} from '../html-renderers/experiments/features-layout-4'
import {
  FeaturesLayout5Renderer,
  layout5Tuning,
} from '../html-renderers/experiments/features-layout-5'
import {
  FeaturesLayout6Renderer,
  layout6Tuning,
} from '../html-renderers/experiments/features-layout-6'
import {
  FeaturesLayout7Renderer,
  layout7Tuning,
} from '../html-renderers/experiments/features-layout-7'
import {
  FeaturesLayout8Renderer,
  layout8Tuning,
} from '../html-renderers/experiments/features-layout-8'
import '../html-renderers/experiments/relume-renderer.css'

const SANDBOX_SECTIONS = [
  {
    id: 'features-layout-1',
    category: 'Features',
    name: 'Layout 1',
    imagePath: '/local-assets/page-builder/Features/Layout%201.png',
    Renderer: FeaturesLayout1Renderer,
    tuning: layout1Tuning,
  },
  {
    id: 'features-layout-2',
    category: 'Features',
    name: 'Layout 2',
    imagePath: '/local-assets/page-builder/Features/Layout%202.png',
    Renderer: FeaturesLayout2Renderer,
    tuning: layout2Tuning,
  },
  {
    id: 'features-layout-3',
    category: 'Features',
    name: 'Layout 3',
    imagePath: '/local-assets/page-builder/Features/Layout%203.png',
    Renderer: FeaturesLayout3Renderer,
    tuning: layout3Tuning,
  },
  {
    id: 'features-layout-4',
    category: 'Features',
    name: 'Layout 4',
    imagePath: '/local-assets/page-builder/Features/Layout%204.png',
    Renderer: FeaturesLayout4Renderer,
    tuning: layout4Tuning,
  },
  {
    id: 'features-layout-5',
    category: 'Features',
    name: 'Layout 5',
    imagePath: '/local-assets/page-builder/Features/Layout%205.png',
    Renderer: FeaturesLayout5Renderer,
    tuning: layout5Tuning,
  },
  {
    id: 'features-layout-6',
    category: 'Features',
    name: 'Layout 6',
    imagePath: '/local-assets/page-builder/Features/Layout%206.png',
    Renderer: FeaturesLayout6Renderer,
    tuning: layout6Tuning,
  },
  {
    id: 'features-layout-7',
    category: 'Features',
    name: 'Layout 7',
    imagePath: '/local-assets/page-builder/Features/Layout%207.png',
    Renderer: FeaturesLayout7Renderer,
    tuning: layout7Tuning,
  },
  {
    id: 'features-layout-8',
    category: 'Features',
    name: 'Layout 8',
    imagePath: '/local-assets/page-builder/Features/Layout%208.png',
    Renderer: FeaturesLayout8Renderer,
    tuning: layout8Tuning,
  },
] as const

type ComparisonMode = 'side-by-side' | 'stacked'
type SandboxSectionId = (typeof SANDBOX_SECTIONS)[number]['id']

export function HtmlSandboxPage() {
  const [sectionId, setSectionId] =
    useState<SandboxSectionId>('features-layout-2')
  const [mode, setMode] = useState<ComparisonMode>('stacked')
  const [overlayOpacity, setOverlayOpacity] = useState(0)
  const activeSection =
    SANDBOX_SECTIONS.find((section) => section.id === sectionId) ??
    SANDBOX_SECTIONS[0]
  const ActiveRenderer = activeSection.Renderer
  const targetWidth = activeSection.tuning.sectionFrameWidth
  const targetHeight = activeSection.tuning.sectionFrameHeight

  return (
    <Main fixed fluid className='p-0'>
      <div className='flex min-h-0 flex-1 flex-col bg-muted/30'>
        <header className='flex min-h-14 shrink-0 items-center justify-between gap-4 border-b bg-background px-4'>
          <div className='min-w-0'>
            <h1 className='truncate text-lg font-semibold'>
              HTML Renderer Sandbox
            </h1>
            <Select
              value={activeSection.id}
              onValueChange={(value) => setSectionId(value as SandboxSectionId)}
            >
              <SelectTrigger
                size='sm'
                className='mt-1 h-7 border-0 bg-transparent px-0 text-sm text-muted-foreground shadow-none hover:text-foreground focus-visible:ring-0'
                aria-label='Select sandbox section'
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent align='start'>
                {SANDBOX_SECTIONS.map((section) => (
                  <SelectItem key={section.id} value={section.id}>
                    {section.category} / {section.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className='flex shrink-0 items-center gap-3'>
            <div className='flex rounded-md border bg-background p-0.5'>
              <Button
                type='button'
                size='sm'
                variant={mode === 'side-by-side' ? 'secondary' : 'ghost'}
                onClick={() => setMode('side-by-side')}
              >
                Side by side
              </Button>
              <Button
                type='button'
                size='sm'
                variant={mode === 'stacked' ? 'secondary' : 'ghost'}
                onClick={() => setMode('stacked')}
              >
                Stacked
              </Button>
            </div>
            <div className='hidden w-44 items-center gap-2 sm:flex'>
              <Label
                htmlFor='html-sandbox-overlay'
                className='text-xs whitespace-nowrap text-muted-foreground'
              >
                Overlay
              </Label>
              <Input
                id='html-sandbox-overlay'
                type='range'
                min='0'
                max='80'
                step='5'
                value={overlayOpacity}
                onChange={(event) =>
                  setOverlayOpacity(Number(event.target.value))
                }
                className='h-8'
              />
            </div>
          </div>
        </header>

        <div className='min-h-0 flex-1 overflow-auto p-6'>
          <div
            className={
              mode === 'side-by-side'
                ? 'grid gap-6 lg:grid-cols-2'
                : 'mx-auto grid max-w-5xl gap-6'
            }
          >
            <ComparisonPanel title='HTML reconstruction'>
              <ArtboardFrame width={targetWidth} height={targetHeight}>
                <ActiveRenderer />
                {overlayOpacity > 0 && (
                  <img
                    src={activeSection.imagePath}
                    alt=''
                    aria-hidden='true'
                    className='pointer-events-none absolute inset-0 size-full bg-white'
                    style={{ opacity: overlayOpacity / 100 }}
                  />
                )}
              </ArtboardFrame>
            </ComparisonPanel>

            <ComparisonPanel title='Original screenshot reference'>
              <ArtboardFrame width={targetWidth} height={targetHeight}>
                <img
                  src={activeSection.imagePath}
                  alt={`${activeSection.category} ${activeSection.name}`}
                  className='block size-full bg-white'
                />
              </ArtboardFrame>
            </ComparisonPanel>
          </div>
        </div>
      </div>
    </Main>
  )
}

function ArtboardFrame({
  children,
  width,
  height,
}: {
  children: ReactNode
  width: number
  height: number
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)

  useLayoutEffect(() => {
    const element = containerRef.current
    if (!element) return

    const updateScale = () => {
      const nextScale = Math.min(1, Math.max(0.1, element.clientWidth / width))
      setScale(Number.isFinite(nextScale) ? nextScale : 1)
    }

    updateScale()

    const resizeObserver = new ResizeObserver(updateScale)
    resizeObserver.observe(element)

    return () => resizeObserver.disconnect()
  }, [width])

  return (
    <div
      ref={containerRef}
      className='relative w-full overflow-hidden border bg-white shadow-sm'
      style={{ height: height * scale }}
    >
      <div
        className='absolute top-0 left-0'
        style={{
          width,
          height,
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
        }}
      >
        {children}
      </div>
    </div>
  )
}

function ComparisonPanel({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  return (
    <section className='min-w-0 space-y-3'>
      <h2 className='text-sm font-medium text-muted-foreground'>{title}</h2>
      {children}
    </section>
  )
}
