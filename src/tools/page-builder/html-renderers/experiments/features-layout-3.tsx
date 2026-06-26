import type { CSSProperties } from 'react'
import placeholderImage from './assets/placeholder-image.png'
import { relumeStyleFacts } from './relume-style-facts'

export const layout3Tuning = {
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
  contentStackGap: 24,
} as const

export function FeaturesLayout3Renderer() {
  const styles = createLayout3Styles()

  return (
    <section
      aria-label='Layout / 3 /'
      className='relume-renderer'
      style={styles.section}
    >
      <div aria-label='Container' style={styles.container}>
        <div aria-label='Component' style={styles.component}>
          <div aria-label='Content' style={styles.contentColumn}>
            <h3 className='relume-heading-h3 relume-text-width-600'>
              Long heading is what you see here in this feature section
            </h3>
            <p className='relume-text-medium relume-text-width-560'>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit.
              Suspendisse varius enim in eros elementum tristique. Duis cursus,
              mi quis viverra ornare, eros dolor interdum nulla, ut commodo diam
              libero vitae erat.
            </p>
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

function createLayout3Styles() {
  const { colors } = relumeStyleFacts

  return {
    section: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      width: layout3Tuning.sectionFrameWidth,
      height: layout3Tuning.sectionFrameHeight,
      padding: `${layout3Tuning.sectionPaddingY}px ${layout3Tuning.sectionPaddingX}px`,
      boxSizing: 'border-box',
      background: colors.white,
      color: colors.black,
    },
    container: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-start',
      width: layout3Tuning.containerWidth,
      height: layout3Tuning.componentHeight,
    },
    component: {
      display: 'flex',
      alignItems: 'center',
      gap: layout3Tuning.columnGap,
      width: layout3Tuning.containerWidth,
      height: layout3Tuning.componentHeight,
    },
    contentColumn: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-start',
      gap: layout3Tuning.contentStackGap,
      width: layout3Tuning.leftColumnWidth,
    },
    mediaColumn: {
      width: layout3Tuning.mediaBlockWidth,
      height: layout3Tuning.mediaBlockHeight,
    },
    media: {
      display: 'block',
      width: layout3Tuning.mediaBlockWidth,
      height: layout3Tuning.mediaBlockHeight,
      objectFit: 'fill',
      background: colors.neutralLightest,
    },
  } satisfies Record<string, CSSProperties>
}
