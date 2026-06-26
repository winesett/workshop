import type { CSSProperties } from 'react'
import placeholderLightbox from './assets/placeholder-lightbox.png'
import { RelumeChevronIcon } from './relume-icons'
import { relumeStyleFacts } from './relume-style-facts'

export const layout5Tuning = {
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
  featureGridGap: 24,
  featureGridPaddingY: 8,
  featureColumnGap: 16,
} as const

export function FeaturesLayout5Renderer() {
  const styles = createLayout5Styles()

  return (
    <section
      aria-label='Layout / 5 /'
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

            <div aria-label='Feature List' style={styles.featureGrid}>
              <div aria-label='Feature Item' style={styles.featureItem}>
                <h6 className='relume-heading-h6'>Subheading one</h6>
                <p className='relume-text-regular'>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                  Suspendisse varius enim in eros.
                </p>
              </div>
              <div aria-label='Feature Item' style={styles.featureItem}>
                <h6 className='relume-heading-h6'>Subheading two</h6>
                <p className='relume-text-regular'>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                  Suspendisse varius enim in eros.
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

function createLayout5Styles() {
  const { colors } = relumeStyleFacts

  return {
    section: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      width: layout5Tuning.sectionFrameWidth,
      height: layout5Tuning.sectionFrameHeight,
      padding: `${layout5Tuning.sectionPaddingY}px ${layout5Tuning.sectionPaddingX}px`,
      boxSizing: 'border-box',
      background: colors.white,
      color: colors.black,
    },
    container: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-start',
      width: layout5Tuning.containerWidth,
      height: layout5Tuning.componentHeight,
    },
    component: {
      display: 'flex',
      alignItems: 'center',
      gap: layout5Tuning.columnGap,
      width: layout5Tuning.containerWidth,
      height: layout5Tuning.componentHeight,
    },
    contentColumn: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-start',
      gap: layout5Tuning.contentStackGap,
      width: layout5Tuning.leftColumnWidth,
    },
    sectionTitle: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-start',
      gap: layout5Tuning.sectionTitleGap,
      width: layout5Tuning.leftColumnWidth,
    },
    taglineWrapper: {
      display: 'flex',
      flexDirection: 'column',
      gap: 0,
    },
    titleContent: {
      display: 'flex',
      flexDirection: 'column',
      gap: layout5Tuning.titleContentGap,
      width: layout5Tuning.leftColumnWidth,
    },
    featureGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
      gap: layout5Tuning.featureGridGap,
      width: layout5Tuning.leftColumnWidth,
      padding: `${layout5Tuning.featureGridPaddingY}px 0`,
      boxSizing: 'border-box',
    },
    featureItem: {
      display: 'flex',
      flexDirection: 'column',
      gap: layout5Tuning.featureColumnGap,
      minWidth: 0,
    },
    mediaColumn: {
      width: layout5Tuning.mediaBlockWidth,
      height: layout5Tuning.mediaBlockHeight,
    },
    media: {
      display: 'block',
      width: layout5Tuning.mediaBlockWidth,
      height: layout5Tuning.mediaBlockHeight,
      objectFit: 'fill',
      background: colors.neutral,
    },
  } satisfies Record<string, CSSProperties>
}
