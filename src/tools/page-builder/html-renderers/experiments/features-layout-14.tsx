export function FeaturesLayout14Renderer() {
  return (
    <section className='h-[615px] w-[1024px] bg-white text-black'>
      <div className='grid h-full grid-cols-[0.96fr_1fr] gap-[7%] px-[5.5%] py-[7.8%]'>
        <div className='flex min-w-0 flex-col justify-center'>
          <p className='mb-4 text-[12px] leading-none font-semibold'>Tagline</p>
          <h2 className='max-w-[410px] text-[32px] leading-[1.18] font-bold tracking-normal'>
            Medium length section heading goes here
          </h2>
          <p className='mt-6 max-w-[440px] text-[13px] leading-[1.48]'>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse
            varius enim in eros elementum tristique. Duis cursus, mi quis
            viverra ornare, eros dolor interdum nulla, ut commodo diam libero
            vitae erat.
          </p>

          <div className='mt-8 grid max-w-[430px] grid-cols-4 items-center gap-6'>
            <Wordmark label='Webflow' mark='W' />
            <Wordmark label='Relume' mark='R' />
            <Wordmark label='Webflow' mark='W' />
            <Wordmark label='Relume' mark='R' />
          </div>

          <div className='mt-9 flex items-center gap-4'>
            <button className='h-9 border border-black px-5 text-[12px]'>
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
          <div className='relative aspect-square w-full max-w-[428px] bg-[#8d8d8b]'>
            <div className='absolute top-1/2 left-1/2 flex h-[76px] w-[94px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-lg bg-black/15'>
              <div className='flex size-9 items-center justify-center rounded-full bg-white'>
                <span
                  aria-hidden='true'
                  className='ml-0.5 block h-0 w-0 border-y-[8px] border-l-[12px] border-y-transparent border-l-[#8d8d8b]'
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function Wordmark({ label, mark }: { label: string; mark: string }) {
  return (
    <div className='flex items-center gap-2 whitespace-nowrap'>
      <span className='flex size-5 items-center justify-center bg-black text-[10px] font-bold text-white'>
        {mark}
      </span>
      <span className='text-[14px] leading-none font-bold'>{label}</span>
    </div>
  )
}
