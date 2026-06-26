import type { CSSProperties } from 'react'
import placeholderImage from './assets/placeholder-image.png'
import { relumeStyleFacts } from './relume-style-facts'

export const layout1Tuning = {
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
  buttonHeight: 48,
  buttonPaddingX: 24,
  buttonGroupGap: 24,
} as const

export function FeaturesLayout1Renderer() {
  const styles = createLayout1Styles()

  return (
    <section aria-label='Layout / 1 /' style={styles.section}>
      <div aria-label='Container' style={styles.container}>
        <div aria-label='Component' style={styles.component}>
          <div aria-label='Content' style={styles.contentColumn}>
            <div aria-label='Section Title' style={styles.sectionTitle}>
              <div aria-label='Tagline Wrapper' style={styles.taglineWrapper}>
                <p style={styles.tagline}>Tagline</p>
              </div>

              <div aria-label='Content' style={styles.titleContent}>
                <h2 style={styles.heading}>
                  Medium length section heading goes here
                </h2>
                <p style={styles.body}>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                  Suspendisse varius enim in eros elementum tristique. Duis
                  cursus, mi quis viverra ornare, eros dolor interdum nulla, ut
                  commodo diam libero vitae erat.
                </p>
              </div>
            </div>

            <div aria-label='Actions' style={styles.buttonGroup}>
              <button style={styles.primaryButton}>Button</button>
              <button style={styles.linkButton}>
                Button
                <span aria-hidden='true' style={styles.chevron}>
                  ›
                </span>
              </button>
            </div>
          </div>

          <div aria-label='Placeholder Image' style={styles.mediaColumn}>
            <img src={placeholderImage} alt='Image placeholder' style={styles.media} />
          </div>
        </div>
      </div>
    </section>
  )
}

function createLayout1Styles() {
  const { colors, fontFamily, typography, ui } = relumeStyleFacts

  return {
    section: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      width: layout1Tuning.sectionFrameWidth,
      height: layout1Tuning.sectionFrameHeight,
      padding: `${layout1Tuning.sectionPaddingY}px ${layout1Tuning.sectionPaddingX}px`,
      boxSizing: 'border-box',
      background: colors.white,
      color: colors.black,
      fontFamily,
    },
    container: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-start',
      width: layout1Tuning.containerWidth,
      height: layout1Tuning.componentHeight,
    },
    component: {
      display: 'flex',
      alignItems: 'center',
      gap: layout1Tuning.columnGap,
      width: layout1Tuning.containerWidth,
      height: layout1Tuning.componentHeight,
    },
    contentColumn: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-start',
      gap: layout1Tuning.contentStackGap,
      width: layout1Tuning.leftColumnWidth,
    },
    sectionTitle: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-start',
      gap: layout1Tuning.sectionTitleGap,
      width: layout1Tuning.leftColumnWidth,
    },
    taglineWrapper: {
      display: 'flex',
      flexDirection: 'column',
      gap: 0,
    },
    titleContent: {
      display: 'flex',
      flexDirection: 'column',
      gap: layout1Tuning.titleContentGap,
      width: layout1Tuning.leftColumnWidth,
    },
    tagline: {
      margin: 0,
      fontSize: typography.tagline.fontSize,
      lineHeight: typography.tagline.lineHeight,
      fontWeight: 600,
    },
    heading: {
      margin: 0,
      width: layout1Tuning.leftColumnWidth,
      fontSize: typography.h2.fontSize,
      lineHeight: typography.h2.lineHeight,
      fontWeight: typography.h2.fontWeight,
      letterSpacing: 0,
    },
    body: {
      margin: 0,
      width: layout1Tuning.leftColumnWidth,
      fontSize: typography.textMedium.fontSize,
      lineHeight: typography.textMedium.lineHeight,
      fontWeight: typography.textMedium.fontWeight,
      letterSpacing: 0,
    },
    buttonGroup: {
      display: 'flex',
      alignItems: 'center',
      gap: layout1Tuning.buttonGroupGap,
      height: layout1Tuning.buttonHeight,
    },
    primaryButton: {
      height: layout1Tuning.buttonHeight,
      padding: `0 ${layout1Tuning.buttonPaddingX}px`,
      border: `${ui.borderWidth}px solid ${colors.black}`,
      borderRadius: ui.radiusSmall,
      background: colors.white,
      color: colors.black,
      fontFamily,
      fontSize: typography.textRegular.fontSize,
      lineHeight: typography.textRegular.lineHeight,
      fontWeight: typography.textRegular.fontWeight,
    },
    linkButton: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      height: layout1Tuning.buttonHeight,
      padding: 0,
      border: 0,
      borderRadius: ui.radiusSmall,
      background: 'transparent',
      color: colors.black,
      fontFamily,
      fontSize: typography.textRegular.fontSize,
      lineHeight: typography.textRegular.lineHeight,
      fontWeight: typography.textRegular.fontWeight,
    },
    chevron: {
      fontSize: typography.textRegular.fontSize,
      lineHeight: 1,
    },
    mediaColumn: {
      width: layout1Tuning.mediaBlockWidth,
      height: layout1Tuning.mediaBlockHeight,
    },
    media: {
      display: 'block',
      width: layout1Tuning.mediaBlockWidth,
      height: layout1Tuning.mediaBlockHeight,
      objectFit: 'fill',
      background: colors.neutralLight,
    },
  } satisfies Record<string, CSSProperties>
}
