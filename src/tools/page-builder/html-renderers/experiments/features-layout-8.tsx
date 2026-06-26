import type { CSSProperties } from 'react'
import placeholderLightbox from './assets/placeholder-lightbox.png'
import { RelumeChevronIcon, RelumeCubeIcon } from './relume-icons'
import { relumeStyleFacts } from './relume-style-facts'

export const layout8Tuning = {
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

export function FeaturesLayout8Renderer() {
  const styles = createLayout8Styles()

  return (
    <section
      aria-label='Layout / 8 /'
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

function FeatureItem({ title }: { title: string }) {
  const styles = createLayout8Styles()

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

function createLayout8Styles() {
  const { colors } = relumeStyleFacts

  return {
    section: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      width: layout8Tuning.sectionFrameWidth,
      height: layout8Tuning.sectionFrameHeight,
      padding: `${layout8Tuning.sectionPaddingY}px ${layout8Tuning.sectionPaddingX}px`,
      boxSizing: 'border-box',
      background: colors.white,
      color: colors.black,
    },
    container: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-start',
      width: layout8Tuning.containerWidth,
      height: layout8Tuning.componentHeight,
    },
    component: {
      display: 'flex',
      alignItems: 'center',
      gap: layout8Tuning.columnGap,
      width: layout8Tuning.containerWidth,
      height: layout8Tuning.componentHeight,
    },
    contentColumn: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-start',
      gap: layout8Tuning.contentStackGap,
      width: layout8Tuning.leftColumnWidth,
    },
    sectionTitle: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-start',
      gap: layout8Tuning.sectionTitleGap,
      width: layout8Tuning.leftColumnWidth,
    },
    taglineWrapper: {
      display: 'flex',
      flexDirection: 'column',
      gap: 0,
    },
    titleContent: {
      display: 'flex',
      flexDirection: 'column',
      gap: layout8Tuning.titleContentGap,
      width: layout8Tuning.leftColumnWidth,
    },
    featureGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
      gap: layout8Tuning.featureGridGap,
      width: layout8Tuning.leftColumnWidth,
      padding: `${layout8Tuning.featureGridPaddingY}px 0`,
      boxSizing: 'border-box',
    },
    featureItem: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: layout8Tuning.featureIconGap,
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
      gap: layout8Tuning.featureTextGap,
      width: 240,
    },
    mediaColumn: {
      width: layout8Tuning.mediaBlockWidth,
      height: layout8Tuning.mediaBlockHeight,
    },
    media: {
      display: 'block',
      width: layout8Tuning.mediaBlockWidth,
      height: layout8Tuning.mediaBlockHeight,
      objectFit: 'fill',
      background: colors.neutral,
    },
  } satisfies Record<string, CSSProperties>
}
