import placeholderLightbox from './assets/placeholder-lightbox.png'

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

          <div className='mt-[30px] grid max-w-[410px] grid-cols-4 items-center gap-[18px]'>
            <LogoMark label='Webflow' mark='W' />
            <LogoMark label='Relume' mark='R' />
            <LogoMark label='Webflow' mark='W' />
            <LogoMark label='Relume' mark='R' />
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

        <div className='flex items-center justify-end'>
          <img
            src={placeholderLightbox}
            alt='Video placeholder'
            className='h-[488px] w-[428px] object-fill'
          />
        </div>
      </div>
    </section>
  )
}

function LogoMark({ label, mark }: { label: string; mark: string }) {
  return (
    <div className='flex items-center gap-2 whitespace-nowrap'>
      <span className='flex size-[18px] items-center justify-center bg-black text-[10px] leading-none font-bold text-white'>
        {mark}
      </span>
      <span className='text-[14px] leading-none font-bold'>{label}</span>
    </div>
  )
}
