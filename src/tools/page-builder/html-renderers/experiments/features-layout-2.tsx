import type { CSSProperties } from 'react'
import placeholderLightbox from './assets/placeholder-lightbox.png'
import { RelumeChevronIcon } from './relume-icons'
import { relumeStyleFacts } from './relume-style-facts'

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

export function FeaturesLayout2Renderer() {
  const styles = createLayout2Styles()

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
                <p className='relume-tagline'>Tagline</p>
              </div>

              <div aria-label='Content' style={styles.titleContent}>
                <h2 className='relume-heading-h2 relume-text-width-600'>
                  Medium length section heading goes here
                </h2>
                <p className='relume-text-medium relume-text-width-600'>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                  Suspendisse varius enim in eros elementum tristique. Duis
                  cursus, mi quis viverra ornare, eros dolor interdum nulla, ut
                  commodo diam libero vitae erat.
                </p>
              </div>
            </div>

            <div aria-label='Actions' className='relume-actions'>
              <button className='relume-button-primary'>Button</button>
              <button className='relume-button-link'>
                Button
                <RelumeChevronIcon className='relume-chevron' />
              </button>
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

function createLayout2Styles() {
  const { colors } = relumeStyleFacts

  return {
    section: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      width: layout2Tuning.sectionFrameWidth,
      height: layout2Tuning.sectionFrameHeight,
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
      height: layout2Tuning.componentHeight,
    },
    component: {
      display: 'flex',
      alignItems: 'center',
      gap: layout2Tuning.columnGap,
      width: layout2Tuning.containerWidth,
      height: layout2Tuning.componentHeight,
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
