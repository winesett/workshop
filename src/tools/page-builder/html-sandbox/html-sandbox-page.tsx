import { type ReactNode, useLayoutEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Main } from '@/components/layout/main'
import { FeaturesLayout14Renderer } from '../html-renderers/experiments/features-layout-14'

const TARGET_ASSET = {
  category: 'Features',
  name: 'Layout 14',
  imagePath: '/local-assets/page-builder/Features/Layout%2014.png',
}
const TARGET_WIDTH = 1440
const TARGET_HEIGHT = 860

type ComparisonMode = 'side-by-side' | 'stacked'

export function HtmlSandboxPage() {
  const [mode, setMode] = useState<ComparisonMode>('side-by-side')
  const [overlayOpacity, setOverlayOpacity] = useState(0)

  return (
    <Main fixed fluid className='p-0'>
      <div className='flex min-h-0 flex-1 flex-col bg-muted/30'>
        <header className='flex min-h-14 shrink-0 items-center justify-between gap-4 border-b bg-background px-4'>
          <div className='min-w-0'>
            <h1 className='truncate text-lg font-semibold'>
              HTML Renderer Sandbox
            </h1>
            <p className='truncate text-sm text-muted-foreground'>
              {TARGET_ASSET.category} / {TARGET_ASSET.name}
            </p>
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
            <ComparisonPanel title='Original screenshot reference'>
              <ScaledArtboardFrame>
                <img
                  src={TARGET_ASSET.imagePath}
                  alt={`${TARGET_ASSET.category} ${TARGET_ASSET.name}`}
                  className='block size-full bg-white'
                />
              </ScaledArtboardFrame>
            </ComparisonPanel>

            <ComparisonPanel title='HTML reconstruction'>
              <ScaledArtboardFrame>
                <FeaturesLayout14Renderer />
                {overlayOpacity > 0 && (
                  <img
                    src={TARGET_ASSET.imagePath}
                    alt=''
                    aria-hidden='true'
                    className='pointer-events-none absolute inset-0 size-full bg-white'
                    style={{ opacity: overlayOpacity / 100 }}
                  />
                )}
              </ScaledArtboardFrame>
            </ComparisonPanel>
          </div>
        </div>
      </div>
    </Main>
  )
}

function ScaledArtboardFrame({ children }: { children: ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)

  useLayoutEffect(() => {
    const element = containerRef.current
    if (!element) return

    const updateScale = () => {
      const nextScale = Math.min(
        1,
        Math.max(0.1, element.clientWidth / TARGET_WIDTH)
      )
      setScale(Number.isFinite(nextScale) ? nextScale : 1)
    }

    updateScale()

    const resizeObserver = new ResizeObserver(updateScale)
    resizeObserver.observe(element)

    return () => resizeObserver.disconnect()
  }, [])

  return (
    <div
      ref={containerRef}
      className='relative w-full overflow-hidden border bg-white shadow-sm'
      style={{ height: TARGET_HEIGHT * scale }}
    >
      <div
        className='absolute top-0 left-0'
        style={{
          width: TARGET_WIDTH,
          height: TARGET_HEIGHT,
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
