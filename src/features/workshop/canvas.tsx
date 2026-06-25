import { Tldraw } from 'tldraw'
import 'tldraw/tldraw.css'
import { Main } from '@/components/layout/main'

export function CanvasPage() {
  return (
    <>
      <Main fixed fluid className='p-0'>
        <div className='relative min-h-0 flex-1 overflow-hidden'>
          <Tldraw />
        </div>
      </Main>
    </>
  )
}
