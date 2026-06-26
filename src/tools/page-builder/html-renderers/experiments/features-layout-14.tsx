import type { CSSProperties } from 'react'
import placeholderLightbox from './assets/placeholder-lightbox.png'
import placeholderLogo from './assets/placeholder-logo.png'
import { relumeStyleFacts } from './relume-style-facts'

export const layout14Tuning = {
  sectionFrameWidth: 1440,
  sectionFrameHeight: 864,
  containerWidth: relumeStyleFacts.layout.containerLarge,
  sectionPaddingY: relumeStyleFacts.layout.sectionPaddingLarge,
  columnGap: 80,
  leftColumnWidth: 600,
  textBlockWidth: 560,
  mediaBlockWidth: 600,
  mediaBlockHeight: 640,
  logoWidth: 120,
  logoHeight: 48,
  logoRowGap: 16,
  contentStackGap: 24,
  contentBodyGap: 24,
  sectionTitleGap: 16,
  buttonHeight: 48,
  buttonPaddingX: 24,
  buttonGroupGap: 24,
} as const

export function FeaturesLayout14Renderer() {
  const styles = createLayout14Styles()

  return (
    <section aria-label='Layout / 14 /' style={styles.section}>
      <div aria-label='Container' style={styles.container}>
        <div aria-label='Component' style={styles.component}>
          <div aria-label='Content' style={styles.contentColumn}>
            <div aria-label='Content' style={styles.contentBody}>
              <div aria-label='Section Title' style={styles.sectionTitle}>
                <p style={styles.tagline}>Tagline</p>
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

              <div aria-label='Logos' style={styles.logoRow}>
                <LogoMark alt='Webflow logo placeholder' />
                <LogoMark alt='Relume logo placeholder' />
                <LogoMark alt='Webflow logo placeholder' />
                <LogoMark alt='Relume logo placeholder' />
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

function LogoMark({ alt }: { alt: string }) {
  return (
    <span
      aria-label='Placeholder Logo'
      style={{
        display: 'block',
        width: layout14Tuning.logoWidth,
        height: layout14Tuning.logoHeight,
        overflow: 'hidden',
      }}
    >
      <img
        src={placeholderLogo}
        alt={alt}
        style={{
          width: layout14Tuning.logoWidth,
          height: layout14Tuning.logoHeight,
          maxWidth: 'none',
          objectFit: 'contain',
          objectPosition: 'left top',
        }}
      />
    </span>
  )
}

function createLayout14Styles() {
  const { colors, fontFamily, typography, ui } = relumeStyleFacts

  return {
    section: {
      width: layout14Tuning.sectionFrameWidth,
      height: layout14Tuning.sectionFrameHeight,
      background: colors.white,
      color: colors.black,
      fontFamily,
    },
    container: {
      display: 'flex',
      alignItems: 'center',
      width: layout14Tuning.containerWidth,
      height: '100%',
      margin: '0 auto',
    },
    component: {
      display: 'grid',
      gridTemplateColumns: `${layout14Tuning.leftColumnWidth}px ${layout14Tuning.mediaBlockWidth}px`,
      alignItems: 'center',
      gap: layout14Tuning.columnGap,
      width: layout14Tuning.containerWidth,
      height: layout14Tuning.mediaBlockHeight,
    },
    contentColumn: {
      display: 'flex',
      flexDirection: 'column',
      gap: layout14Tuning.contentStackGap,
      width: layout14Tuning.leftColumnWidth,
      minWidth: 0,
    },
    contentBody: {
      display: 'flex',
      flexDirection: 'column',
      gap: layout14Tuning.contentBodyGap,
      maxWidth: layout14Tuning.textBlockWidth,
    },
    sectionTitle: {
      display: 'flex',
      flexDirection: 'column',
      gap: layout14Tuning.sectionTitleGap,
      maxWidth: layout14Tuning.textBlockWidth,
    },
    tagline: {
      margin: 0,
      fontSize: typography.tagline.fontSize,
      lineHeight: typography.tagline.lineHeight,
      fontWeight: 700,
    },
    heading: {
      margin: 0,
      maxWidth: layout14Tuning.textBlockWidth,
      fontSize: typography.h2.fontSize,
      lineHeight: typography.h2.lineHeight,
      fontWeight: typography.h2.fontWeight,
      letterSpacing: 0,
    },
    body: {
      margin: 0,
      maxWidth: layout14Tuning.textBlockWidth,
      fontSize: typography.textRegular.fontSize,
      lineHeight: typography.textRegular.lineHeight,
      fontWeight: typography.textRegular.fontWeight,
      letterSpacing: 0,
    },
    logoRow: {
      display: 'grid',
      gridTemplateColumns: 'repeat(4, max-content)',
      alignItems: 'center',
      gap: layout14Tuning.logoRowGap,
    },
    buttonGroup: {
      display: 'flex',
      alignItems: 'center',
      gap: layout14Tuning.buttonGroupGap,
    },
    primaryButton: {
      height: layout14Tuning.buttonHeight,
      padding: `0 ${layout14Tuning.buttonPaddingX}px`,
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
      height: layout14Tuning.buttonHeight,
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
      display: 'flex',
      justifyContent: 'flex-end',
      alignItems: 'center',
      width: layout14Tuning.mediaBlockWidth,
      minWidth: 0,
    },
    media: {
      width: layout14Tuning.mediaBlockWidth,
      height: layout14Tuning.mediaBlockHeight,
      objectFit: 'fill',
      background: colors.neutralLight,
    },
  } satisfies Record<string, CSSProperties>
}
