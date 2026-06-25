import { PenTool } from 'lucide-react'
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

      <Main>
        <div className='mb-6 space-y-1'>
          <h1 className='text-2xl font-bold tracking-tight'>Canvas</h1>
          <p className='text-muted-foreground'>
            A spatial workspace for future Workshop experiments.
          </p>
        </div>

        <section className='flex min-h-80 flex-col items-center justify-center rounded-lg border border-dashed bg-muted/20 px-6 py-12 text-center'>
          <div className='mb-4 flex size-12 items-center justify-center rounded-lg border bg-background'>
            <PenTool className='size-6 text-muted-foreground' />
          </div>
          <h2 className='text-lg font-semibold'>
            Canvas workspace coming next
          </h2>
          <p className='mt-2 max-w-md text-sm text-muted-foreground'>
            A tldraw workspace will be added in the next cycle. This page is
            only a placeholder inside the application shell.
          </p>
        </section>
      </Main>
    </>
  )
}
