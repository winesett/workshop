import type { CSSProperties } from 'react'
import placeholderLightbox from './assets/placeholder-lightbox.png'
import { RelumeChevronIcon } from './relume-icons'
import { relumeStyleFacts } from './relume-style-facts'

export type FeaturesLayout2Content = {
  tagline: string[]
  heading: string[]
  body: string[]
  primaryButtonLabel: string[]
  secondaryButtonLabel: string[]
}

export type FeaturesLayout2ContentSlot = {
  id: keyof FeaturesLayout2Content
  label: string
  ariaPath: string
  input: 'text' | 'textarea'
}

export const featuresLayout2DefaultContent = {
  tagline: ['Tagline'],
  heading: ['Medium length section heading goes here'],
  body: [
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla, ut commodo diam libero vitae erat.',
  ],
  primaryButtonLabel: ['Button'],
  secondaryButtonLabel: ['Button'],
} satisfies FeaturesLayout2Content

export const featuresLayout2ContentSlots = [
  {
    id: 'tagline',
    label: 'Tagline',
    ariaPath: 'Section Title / Tagline Wrapper / Tagline',
    input: 'text',
  },
  {
    id: 'heading',
    label: 'Heading',
    ariaPath: 'Section Title / Content / Heading',
    input: 'textarea',
  },
  {
    id: 'body',
    label: 'Body',
    ariaPath: 'Section Title / Content / Text',
    input: 'textarea',
  },
  {
    id: 'primaryButtonLabel',
    label: 'Primary button',
    ariaPath: 'Actions / Button',
    input: 'text',
  },
  {
    id: 'secondaryButtonLabel',
    label: 'Secondary button',
    ariaPath: 'Actions / Button',
    input: 'text',
  },
] satisfies FeaturesLayout2ContentSlot[]

export const layout2Tuning = {
  sectionFrameWidth: 1440,
  sectionFrameHeight: 864,
  sectionPaddingX: 64,
  sectionPaddingY: relumeStyleFacts.layout.sectionPaddingLarge,
  containerWidth: relumeStyleFacts.layout.containerLarge,
  componentHeight: 640,
  columnGap: 80,
  leftColumnWidth: 600,
  mediaBlockWidth: 600,
  mediaBlockHeight: 640,
  contentStackGap: 32,
  sectionTitleGap: 16,
  titleContentGap: 24,
} as const

export function FeaturesLayout2Renderer({
  content = featuresLayout2DefaultContent,
  fitContent = false,
}: {
  content?: FeaturesLayout2Content
  fitContent?: boolean
}) {
  const styles = createLayout2Styles(fitContent)

  return (
    <section
      aria-label='Layout / 2 /'
      className='relume-renderer'
      style={styles.section}
    >
      <div aria-label='Container' style={styles.container}>
        <div aria-label='Component' style={styles.component}>
          <div aria-label='Content' style={styles.contentColumn}>
            <div aria-label='Section Title' style={styles.sectionTitle}>
              <div aria-label='Tagline Wrapper' style={styles.taglineWrapper}>
                {content.tagline.map((tagline, index) => (
                  <p
                    key={index}
                    aria-label='Tagline'
                    className='relume-tagline'
                  >
                    {tagline}
                  </p>
                ))}
              </div>

              <div aria-label='Content' style={styles.titleContent}>
                {content.heading.map((heading, index) => (
                  <h2
                    key={index}
                    aria-label='Heading'
                    className='relume-heading-h2 relume-text-width-600'
                  >
                    {heading}
                  </h2>
                ))}
                <div aria-label='Text' style={styles.bodyStack}>
                  {content.body.map((bodyBlock, index) => (
                    <p
                      key={index}
                      aria-label='Text'
                      className='relume-text-medium relume-text-width-600'
                    >
                      {bodyBlock}
                    </p>
                  ))}
                </div>
              </div>
            </div>

            <div aria-label='Actions' className='relume-actions'>
              {content.primaryButtonLabel.map((label, index) => (
                <button
                  key={`primary-${index}`}
                  aria-label='Button'
                  className='relume-button-primary'
                >
                  {label}
                </button>
              ))}
              {content.secondaryButtonLabel.map((label, index) => (
                <button
                  key={`secondary-${index}`}
                  className='relume-button-link'
                >
                  {label}
                  <RelumeChevronIcon className='relume-chevron' />
                </button>
              ))}
            </div>
          </div>

          <div aria-label='Placeholder Lightbox' style={styles.mediaColumn}>
            <img
              src={placeholderLightbox}
              alt='Video placeholder'
              style={styles.media}
            />
          </div>
        </div>
      </div>
    </section>
  )
}

function createLayout2Styles(fitContent: boolean) {
  const { colors } = relumeStyleFacts

  return {
    section: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      width: layout2Tuning.sectionFrameWidth,
      height: fitContent ? 'auto' : layout2Tuning.sectionFrameHeight,
      minHeight: layout2Tuning.sectionFrameHeight,
      padding: `${layout2Tuning.sectionPaddingY}px ${layout2Tuning.sectionPaddingX}px`,
      boxSizing: 'border-box',
      background: colors.white,
      color: colors.black,
    },
    container: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-start',
      width: layout2Tuning.containerWidth,
      height: fitContent ? 'auto' : layout2Tuning.componentHeight,
      minHeight: layout2Tuning.componentHeight,
    },
    component: {
      display: 'flex',
      alignItems: 'center',
      gap: layout2Tuning.columnGap,
      width: layout2Tuning.containerWidth,
      height: fitContent ? 'auto' : layout2Tuning.componentHeight,
      minHeight: layout2Tuning.componentHeight,
    },
    contentColumn: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-start',
      gap: layout2Tuning.contentStackGap,
      width: layout2Tuning.leftColumnWidth,
    },
    sectionTitle: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-start',
      gap: layout2Tuning.sectionTitleGap,
      width: layout2Tuning.leftColumnWidth,
    },
    taglineWrapper: {
      display: 'flex',
      flexDirection: 'column',
      gap: 0,
    },
    titleContent: {
      display: 'flex',
      flexDirection: 'column',
      gap: layout2Tuning.titleContentGap,
      width: layout2Tuning.leftColumnWidth,
    },
    bodyStack: {
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
      width: layout2Tuning.leftColumnWidth,
    },
    mediaColumn: {
      width: layout2Tuning.mediaBlockWidth,
      height: layout2Tuning.mediaBlockHeight,
    },
    media: {
      display: 'block',
      width: layout2Tuning.mediaBlockWidth,
      height: layout2Tuning.mediaBlockHeight,
      objectFit: 'fill',
      background: colors.neutral,
    },
  } satisfies Record<string, CSSProperties>
}
