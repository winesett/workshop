import { Tldraw } from 'tldraw'
import 'tldraw/tldraw.css'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { Search } from '@/components/search'

export function CanvasPage() {
  return (
    <>
      <Header>
        <Search className='me-auto' />
      </Header>

      <Main fixed fluid className='p-0'>
        <div className='relative min-h-0 flex-1 overflow-hidden'>
          <Tldraw />
        </div>
      </Main>
    </>
  )
}
