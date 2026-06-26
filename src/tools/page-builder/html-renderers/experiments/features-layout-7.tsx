import type { CSSProperties } from 'react'
import placeholderImage from './assets/placeholder-image.png'
import { RelumeChevronIcon, RelumeCubeIcon } from './relume-icons'
import { relumeStyleFacts } from './relume-style-facts'

export const layout7Tuning = {
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
  featureIconGap: 16,
  featureTextGap: 16,
} as const

export function FeaturesLayout7Renderer() {
  const styles = createLayout7Styles()

  return (
    <section
      aria-label='Layout / 7 /'
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
              <FeatureItem title='Subheading one' />
              <FeatureItem title='Subheading two' />
            </div>

            <div aria-label='Actions' className='relume-actions'>
              <button className='relume-button-primary'>Button</button>
              <button className='relume-button-link'>
                Button
                <RelumeChevronIcon className='relume-chevron' />
              </button>
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

function FeatureItem({ title }: { title: string }) {
  const styles = createLayout7Styles()

  return (
    <div aria-label='Feature Item' style={styles.featureItem}>
      <span aria-label='Icon Wrapper' style={styles.featureIcon}>
        <RelumeCubeIcon />
      </span>
      <div aria-label='Content' style={styles.featureText}>
        <h6 className='relume-heading-h6'>{title}</h6>
        <p className='relume-text-regular'>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse
          varius enim in eros.
        </p>
      </div>
    </div>
  )
}

function createLayout7Styles() {
  const { colors } = relumeStyleFacts

  return {
    section: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      width: layout7Tuning.sectionFrameWidth,
      height: layout7Tuning.sectionFrameHeight,
      padding: `${layout7Tuning.sectionPaddingY}px ${layout7Tuning.sectionPaddingX}px`,
      boxSizing: 'border-box',
      background: colors.white,
      color: colors.black,
    },
    container: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-start',
      width: layout7Tuning.containerWidth,
      height: layout7Tuning.componentHeight,
    },
    component: {
      display: 'flex',
      alignItems: 'center',
      gap: layout7Tuning.columnGap,
      width: layout7Tuning.containerWidth,
      height: layout7Tuning.componentHeight,
    },
    contentColumn: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-start',
      gap: layout7Tuning.contentStackGap,
      width: layout7Tuning.leftColumnWidth,
    },
    sectionTitle: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-start',
      gap: layout7Tuning.sectionTitleGap,
      width: layout7Tuning.leftColumnWidth,
    },
    taglineWrapper: {
      display: 'flex',
      flexDirection: 'column',
      gap: 0,
    },
    titleContent: {
      display: 'flex',
      flexDirection: 'column',
      gap: layout7Tuning.titleContentGap,
      width: layout7Tuning.leftColumnWidth,
    },
    featureGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
      gap: layout7Tuning.featureGridGap,
      width: layout7Tuning.leftColumnWidth,
      padding: `${layout7Tuning.featureGridPaddingY}px 0`,
      boxSizing: 'border-box',
    },
    featureItem: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: layout7Tuning.featureIconGap,
      minWidth: 0,
    },
    featureIcon: {
      display: 'flex',
      width: 32,
      height: 32,
      flexShrink: 0,
      alignItems: 'center',
      justifyContent: 'flex-start',
    },
    featureText: {
      display: 'flex',
      flexDirection: 'column',
      gap: layout7Tuning.featureTextGap,
      width: 240,
    },
    mediaColumn: {
      width: layout7Tuning.mediaBlockWidth,
      height: layout7Tuning.mediaBlockHeight,
    },
    media: {
      display: 'block',
      width: layout7Tuning.mediaBlockWidth,
      height: layout7Tuning.mediaBlockHeight,
      objectFit: 'fill',
      background: colors.neutralLightest,
    },
  } satisfies Record<string, CSSProperties>
}
