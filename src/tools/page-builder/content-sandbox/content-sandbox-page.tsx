import { type ReactNode, useLayoutEffect, useRef, useState } from 'react'
import { Dices, FileJson, Plus, RotateCcw, X } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Main } from '@/components/layout/main'
import {
  type FeaturesLayout2Content,
  FeaturesLayout2Renderer,
  featuresLayout2ContentSlots,
  featuresLayout2DefaultContent,
  layout2Tuning,
} from '../html-renderers/experiments/features-layout-2'
import '../html-renderers/experiments/relume-renderer.css'

export function ContentSandboxPage() {
  const [content, setContent] = useState<FeaturesLayout2Content>(
    featuresLayout2DefaultContent
  )

  const updateRepeatableContentSlot = (
    id: keyof FeaturesLayout2Content,
    index: number,
    value: string
  ) => {
    setContent((currentContent) => {
      const currentValue = currentContent[id]

      if (!Array.isArray(currentValue)) {
        return currentContent
      }

      return {
        ...currentContent,
        [id]: currentValue.map((item, itemIndex) =>
          itemIndex === index ? value : item
        ),
      }
    })
  }

  const duplicateRepeatableContentSlot = (id: keyof FeaturesLayout2Content) => {
    setContent((currentContent) => {
      const currentValue = currentContent[id]

      if (!Array.isArray(currentValue)) {
        return currentContent
      }

      const lastValue = currentValue[currentValue.length - 1] ?? ''

      return {
        ...currentContent,
        [id]: [...currentValue, lastValue],
      }
    })
  }

  const removeRepeatableContentSlot = (
    id: keyof FeaturesLayout2Content,
    index: number
  ) => {
    setContent((currentContent) => {
      const currentValue = currentContent[id]

      if (!Array.isArray(currentValue) || currentValue.length <= 1) {
        return currentContent
      }

      return {
        ...currentContent,
        [id]: currentValue.filter((_, itemIndex) => itemIndex !== index),
      }
    })
  }

  return (
    <Main fixed fluid className='p-0'>
      <div className='flex min-h-0 flex-1 flex-col bg-muted/30'>
        <header className='flex min-h-14 shrink-0 items-center justify-between gap-3 border-b bg-background px-4'>
          <div className='min-w-0'>
            <h1 className='truncate text-lg font-semibold'>
              Content Slot Sandbox
            </h1>
            <p className='truncate text-sm text-muted-foreground'>
              Features / Layout 2
            </p>
          </div>
          <Button
            type='button'
            variant='outline'
            size='sm'
            onClick={() => downloadContentSlotPayload(content)}
          >
            <FileJson />
            Draft JSON
          </Button>
        </header>

        <div className='grid min-h-0 flex-1 grid-cols-[minmax(0,1fr)_22rem] gap-4 overflow-auto p-6'>
          <section className='min-w-0 space-y-3'>
            <h2 className='text-sm font-medium text-muted-foreground'>
              HTML preview
            </h2>
            <ArtboardFrame
              width={layout2Tuning.sectionFrameWidth}
              height={layout2Tuning.sectionFrameHeight}
              fitContent
            >
              <FeaturesLayout2Renderer content={content} fitContent />
            </ArtboardFrame>
          </section>

          <aside className='min-w-0 space-y-3'>
            <h2 className='text-sm font-medium text-muted-foreground'>
              Content fields
            </h2>
            <Card className='gap-4 rounded-md py-0'>
              <CardHeader className='border-b px-4 py-4'>
                <CardTitle className='text-sm'>Features / Layout 2</CardTitle>
                <CardAction className='flex items-center gap-1'>
                  <Button
                    type='button'
                    variant='ghost'
                    size='icon'
                    onClick={() => setContent(createRandomContent())}
                    aria-label='Generate random funny content'
                  >
                    <Dices />
                  </Button>
                  <Button
                    type='button'
                    variant='ghost'
                    size='icon'
                    onClick={() => setContent(featuresLayout2DefaultContent)}
                    aria-label='Reset content fields'
                  >
                    <RotateCcw />
                  </Button>
                </CardAction>
              </CardHeader>
              <CardContent className='space-y-4 px-4 pb-4'>
                {featuresLayout2ContentSlots.map((slot) => {
                  const fieldId = `content-slot-${slot.id}`
                  const value = content[slot.id]
                  const characterCount = getLongestCharacterCount(value)
                  const recommendedCharacterCount =
                    getRecommendedCharacterCount(slot.id)
                  const isOverRecommended =
                    characterCount > recommendedCharacterCount

                  return (
                    <div key={slot.id} className='space-y-2'>
                      <div className='flex items-start justify-between gap-2'>
                        <div className='space-y-1'>
                          <div className='flex flex-wrap items-center gap-x-2 gap-y-1'>
                            <Label htmlFor={fieldId}>{slot.label}</Label>
                            <span
                              className={
                                isOverRecommended
                                  ? 'text-xs font-medium text-destructive'
                                  : 'text-xs text-muted-foreground'
                              }
                            >
                              {characterCount}/{recommendedCharacterCount}
                            </span>
                          </div>
                          <p className='text-xs text-muted-foreground'>
                            {slot.ariaPath}
                          </p>
                        </div>
                        <Button
                          type='button'
                          variant='ghost'
                          size='icon'
                          className='size-7 shrink-0'
                          onClick={() =>
                            duplicateRepeatableContentSlot(slot.id)
                          }
                          aria-label={`Duplicate ${slot.label}`}
                        >
                          <Plus />
                        </Button>
                      </div>
                      <div className='space-y-2'>
                        {value.map((repeatableValue, index) => (
                          <div
                            key={`${slot.id}-${index}`}
                            className='flex items-start gap-2'
                          >
                            {slot.input === 'textarea' ? (
                              <Textarea
                                id={index === 0 ? fieldId : undefined}
                                value={repeatableValue}
                                rows={slot.id === 'body' ? 5 : 3}
                                aria-label={`${slot.label} ${index + 1}`}
                                onChange={(event) =>
                                  updateRepeatableContentSlot(
                                    slot.id,
                                    index,
                                    event.target.value
                                  )
                                }
                              />
                            ) : (
                              <Input
                                id={index === 0 ? fieldId : undefined}
                                value={repeatableValue}
                                aria-label={`${slot.label} ${index + 1}`}
                                onChange={(event) =>
                                  updateRepeatableContentSlot(
                                    slot.id,
                                    index,
                                    event.target.value
                                  )
                                }
                              />
                            )}
                            {value.length > 1 && (
                              <Button
                                type='button'
                                variant='ghost'
                                size='icon'
                                className='mt-1 size-7 shrink-0'
                                onClick={() =>
                                  removeRepeatableContentSlot(slot.id, index)
                                }
                                aria-label={`Remove ${slot.label} ${index + 1}`}
                              >
                                <X />
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </Main>
  )
}

function ArtboardFrame({
  children,
  width,
  height,
  fitContent = false,
}: {
  children: ReactNode
  width: number
  height: number
  fitContent?: boolean
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)
  const [naturalHeight, setNaturalHeight] = useState(height)

  useLayoutEffect(() => {
    const element = containerRef.current
    const contentElement = contentRef.current
    if (!element) return

    const updateFrame = () => {
      const nextScale = Math.min(1, Math.max(0.1, element.clientWidth / width))
      setScale(Number.isFinite(nextScale) ? nextScale : 1)

      if (fitContent && contentElement) {
        setNaturalHeight(Math.max(height, contentElement.scrollHeight))
      } else {
        setNaturalHeight(height)
      }
    }

    updateFrame()

    const resizeObserver = new ResizeObserver(updateFrame)
    resizeObserver.observe(element)
    if (contentElement) {
      resizeObserver.observe(contentElement)
    }

    return () => resizeObserver.disconnect()
  }, [fitContent, height, width])

  return (
    <div
      ref={containerRef}
      className='relative w-full overflow-hidden border bg-white shadow-sm'
      style={{ height: naturalHeight * scale }}
    >
      <div
        ref={contentRef}
        className='absolute top-0 left-0'
        style={{
          width,
          height: fitContent ? 'auto' : height,
          minHeight: height,
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
        }}
      >
        {children}
      </div>
    </div>
  )
}

function createRandomContent(): FeaturesLayout2Content {
  return {
    tagline: randomItems([
      'Tiny thunder',
      'Soup approved',
      'Probably fine',
      'Very official',
      'Launch-ish',
    ]),
    heading: randomItems([
      'Build the thing before the committee finds the whiteboard',
      'A suspiciously useful section for very serious ideas',
      'Medium length section heading goes here, but with snacks',
      'Your layout survived another meeting',
      'Good ideas, neatly folded',
    ]),
    body: randomItems([
      'This section now contains a surprising amount of personality for something made out of rectangles.',
      'A practical little paragraph wanders in, checks the spacing, and decides to stay for the demo.',
      'Short copy. Big confidence.',
      'Longer copy gives the layout room to prove it can behave when the words get chatty, specific, and mildly dramatic.',
    ]),
    primaryButtonLabel: randomItems([
      'Do it',
      'Launch',
      'Begin',
      'Make it weird',
      'Ship it',
    ]),
    secondaryButtonLabel: randomItems([
      'See why',
      'Peek',
      'Later maybe',
      'Read the memo',
      'One more thing',
    ]),
  }
}

function downloadContentSlotPayload(content: FeaturesLayout2Content) {
  const payload = buildContentSlotPayload(content)
  const blob = new Blob([`${JSON.stringify(payload, null, 2)}\n`], {
    type: 'application/json',
  })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')

  link.href = url
  link.download = 'content-slot-sandbox-payload.json'
  link.click()
  URL.revokeObjectURL(url)
  toast.success('Draft content payload downloaded')
}

function buildContentSlotPayload(content: FeaturesLayout2Content) {
  return {
    schemaVersion: 'workshop.pageBuilder.contentSlots.v0',
    pageName: 'Content Slot Sandbox',
    spacing: 0,
    sections: [
      {
        ref: 'Features / Layout 2',
        category: 'Features',
        name: 'Layout 2',
        renderer: 'features-layout-2',
        contentSlots: featuresLayout2ContentSlots.map((slot) => ({
          id: slot.id,
          label: slot.label,
          ariaPath: slot.ariaPath,
          input: slot.input,
          recommendedCharacters: getRecommendedCharacterCount(slot.id),
          values: content[slot.id],
        })),
      },
    ],
  }
}

function getLongestCharacterCount(values: string[]) {
  return values.reduce((longest, value) => Math.max(longest, value.length), 0)
}

function getRecommendedCharacterCount(id: keyof FeaturesLayout2Content) {
  const defaultLength = getLongestCharacterCount(
    featuresLayout2DefaultContent[id]
  )

  return Math.max(10, Math.ceil(defaultLength / 10) * 10)
}

function randomItems(items: string[]) {
  const count = Math.floor(Math.random() * 3) + 1
  const shuffledItems = [...items].sort(() => Math.random() - 0.5)

  return shuffledItems.slice(0, count)
}
