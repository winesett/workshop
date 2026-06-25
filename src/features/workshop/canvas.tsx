import { Tldraw } from 'tldraw'
import 'tldraw/tldraw.css'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'

export function CanvasPage() {
  return (
    <>
      <Header>
        <Search className='me-auto' />
        <ThemeSwitch />
        <ConfigDrawer />
      </Header>

      <Main fixed fluid className='p-0'>
        <div className='relative min-h-0 flex-1 overflow-hidden'>
          <Tldraw />
        </div>
      </Main>
    </>
  )
}
