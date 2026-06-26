import placeholderLightbox from './assets/placeholder-lightbox.png'
import placeholderLogo from './assets/placeholder-logo.png'

export function FeaturesLayout14Renderer() {
  return (
    <section className='h-[615px] w-[1024px] bg-white text-black'>
      <div className='grid h-full grid-cols-[430px_428px] gap-[54px] px-[56px] py-[48px]'>
        <div className='flex min-w-0 flex-col justify-center'>
          <p className='mb-[15px] text-[12px] leading-none font-semibold'>
            Tagline
          </p>
          <h2 className='max-w-[375px] text-[32px] leading-[1.22] font-bold tracking-normal'>
            Medium length section heading goes here
          </h2>
          <p className='mt-[23px] max-w-[410px] text-[13px] leading-[1.52]'>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse
            varius enim in eros elementum tristique. Duis cursus, mi quis
            viverra ornare, eros dolor interdum nulla, ut commodo diam libero
            vitae erat.
          </p>

          <div className='mt-[30px] grid max-w-[516px] grid-cols-4 items-center gap-[12px]'>
            <LogoMark alt='Webflow logo placeholder' />
            <LogoMark alt='Relume logo placeholder' />
            <LogoMark alt='Webflow logo placeholder' />
            <LogoMark alt='Relume logo placeholder' />
          </div>

          <div className='mt-[34px] flex items-center gap-[17px]'>
            <button className='h-9 border border-black px-[20px] text-[12px]'>
              Button
            </button>
            <button className='flex h-9 items-center gap-2 text-[12px]'>
              Button
              <span aria-hidden='true' className='text-base leading-none'>
                ›
              </span>
            </button>
          </div>
        </div>

        <div className='flex items-start justify-end pt-[32px]'>
          <img
            src={placeholderLightbox}
            alt='Video placeholder'
            className='h-[428px] w-[428px] object-cover'
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
