import type { CSSProperties } from 'react'
import placeholderImage from './assets/placeholder-image.png'
import { relumeStyleFacts } from './relume-style-facts'

export const layout6Tuning = {
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
  contentStackGap: 40,
  titleContentGap: 24,
  featureGridGap: 24,
  featureColumnGap: 16,
} as const

export function FeaturesLayout6Renderer() {
  const styles = createLayout6Styles()

  return (
    <section
      aria-label='Layout / 6 /'
      className='relume-renderer'
      style={styles.section}
    >
      <div aria-label='Container' style={styles.container}>
        <div aria-label='Component' style={styles.component}>
          <div aria-label='Content' style={styles.contentColumn}>
            <div aria-label='Content' style={styles.titleContent}>
              <h3 className='relume-heading-h3 relume-text-width-600'>
                Long heading is what you see here in this feature section
              </h3>
              <p className='relume-text-medium relume-text-width-600'>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                Suspendisse varius enim in eros elementum tristique. Duis
                cursus, mi quis viverra ornare, eros dolor interdum nulla, ut
                commodo diam libero vitae erat.
              </p>
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
          </div>

          <div aria-label='Placeholder Image' style={styles.mediaColumn}>
            <img
              src={placeholderImage}
              alt='Image placeholder'
              style={styles.media}
            />
          </div>
        </div>
      </div>
    </section>
  )
}

function createLayout6Styles() {
  const { colors } = relumeStyleFacts

  return {
    section: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      width: layout6Tuning.sectionFrameWidth,
      height: layout6Tuning.sectionFrameHeight,
      padding: `${layout6Tuning.sectionPaddingY}px ${layout6Tuning.sectionPaddingX}px`,
      boxSizing: 'border-box',
      background: colors.white,
      color: colors.black,
    },
    container: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-start',
      width: layout6Tuning.containerWidth,
      height: layout6Tuning.componentHeight,
    },
    component: {
      display: 'flex',
      alignItems: 'center',
      gap: layout6Tuning.columnGap,
      width: layout6Tuning.containerWidth,
      height: layout6Tuning.componentHeight,
    },
    contentColumn: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-start',
      gap: layout6Tuning.contentStackGap,
      width: layout6Tuning.leftColumnWidth,
    },
    titleContent: {
      display: 'flex',
      flexDirection: 'column',
      gap: layout6Tuning.titleContentGap,
      width: layout6Tuning.leftColumnWidth,
    },
    featureGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
      gap: layout6Tuning.featureGridGap,
      width: layout6Tuning.leftColumnWidth,
    },
    featureItem: {
      display: 'flex',
      flexDirection: 'column',
      gap: layout6Tuning.featureColumnGap,
      minWidth: 0,
    },
    mediaColumn: {
      width: layout6Tuning.mediaBlockWidth,
      height: layout6Tuning.mediaBlockHeight,
    },
    media: {
      display: 'block',
      width: layout6Tuning.mediaBlockWidth,
      height: layout6Tuning.mediaBlockHeight,
      objectFit: 'fill',
      background: colors.neutralLightest,
    },
  } satisfies Record<string, CSSProperties>
}
