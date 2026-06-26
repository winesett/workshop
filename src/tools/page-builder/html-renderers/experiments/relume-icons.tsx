import { relumeStyleFacts } from './relume-style-facts'

export function RelumeChevronIcon({ className }: { className?: string }) {
  const { chevron } = relumeStyleFacts.buttons

  return (
    <span
      aria-hidden='true'
      className={['relume-chevron-slot', className].filter(Boolean).join(' ')}
    >
      <svg
        focusable='false'
        role='presentation'
        viewBox={chevron.viewBox}
        width={chevron.width}
        height={chevron.height}
        className='relume-chevron-svg'
      >
        <path d={chevron.path} fill='currentColor' stroke='currentColor' />
      </svg>
    </span>
  )
}

export function RelumeCubeIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden='true'
      focusable='false'
      role='presentation'
      viewBox='0 0 24 24'
      width='24'
      height='24'
      className={className}
    >
      <path
        d='M12 2 3 7v10l9 5 9-5V7l-9-5Zm0 2.29 6.63 3.68L12 11.65 5.37 7.97 12 4.29ZM5 9.68l6 3.33v6.7l-6-3.33v-6.7Zm8 10.03v-6.7l6-3.33v6.7l-6 3.33Z'
        fill='currentColor'
      />
    </svg>
  )
}
