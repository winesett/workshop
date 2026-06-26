import placeholderLightbox from './assets/placeholder-lightbox.png'
import placeholderLogo from './assets/placeholder-logo.png'

export function FeaturesLayout14Renderer() {
  return (
    <section
      className='h-[860px] w-[1440px] bg-white text-black'
      style={{ fontFamily: 'Roboto, sans-serif' }}
    >
      <div className='grid h-full grid-cols-[600px_600px] gap-[80px] px-[80px] py-[110px]'>
        <div className='flex min-w-0 flex-col justify-center'>
          <p className='mb-4 text-[16px] leading-none font-semibold'>Tagline</p>
          <h2 className='max-w-[560px] text-[48px] leading-[1.2] font-bold tracking-normal'>
            Medium length section heading goes here
          </h2>
          <p className='mt-6 max-w-[560px] text-[18px] leading-[1.5] font-normal tracking-normal'>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse
            varius enim in eros elementum tristique. Duis cursus, mi quis
            viverra ornare, eros dolor interdum nulla, ut commodo diam libero
            vitae erat.
          </p>

          <div className='mt-9 grid max-w-[516px] grid-cols-4 items-center gap-[12px]'>
            <LogoMark alt='Webflow logo placeholder' />
            <LogoMark alt='Relume logo placeholder' />
            <LogoMark alt='Webflow logo placeholder' />
            <LogoMark alt='Relume logo placeholder' />
          </div>

          <div className='mt-10 flex items-center gap-6'>
            <button className='h-12 border border-black px-6 text-[16px]'>
              Button
            </button>
            <button className='flex h-12 items-center gap-2 text-[16px]'>
              Button
              <span aria-hidden='true' className='text-base leading-none'>
                ›
              </span>
            </button>
          </div>
        </div>

        <div className='flex items-center justify-end'>
          <img
            src={placeholderLightbox}
            alt='Video placeholder'
            className='h-[640px] w-[600px] object-fill'
          />
        </div>
      </div>
    </section>
  )
}

function LogoMark({ alt }: { alt: string }) {
  return (
    <span className='block h-12 w-[120px] overflow-hidden'>
      <img
        src={placeholderLogo}
        alt={alt}
        className='h-12 w-[120px] max-w-none object-contain object-left-top'
      />
    </span>
  )
}
