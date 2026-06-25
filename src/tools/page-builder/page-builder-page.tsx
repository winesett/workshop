import { FolderOpen } from 'lucide-react'
import { Main } from '@/components/layout/main'

export function PageBuilderPage() {
  return (
    <Main>
      <div className='mb-6 space-y-1'>
        <h1 className='text-2xl font-bold tracking-tight'>Page Builder</h1>
        <p className='text-muted-foreground'>
          Assemble pages from reusable screenshot sections.
        </p>
      </div>

      <section className='flex min-h-80 flex-col items-center justify-center rounded-lg border border-dashed bg-muted/20 px-6 py-12 text-center'>
        <div className='mb-4 flex size-12 items-center justify-center rounded-lg border bg-background'>
          <FolderOpen className='size-6 text-muted-foreground' />
        </div>
        <h2 className='text-lg font-semibold'>Section assets are not loaded yet</h2>
        <p className='mt-2 max-w-md text-sm text-muted-foreground'>
          Page Builder screenshot assets will live in this tool&apos;s section,
          page, and thumbnail folders.
        </p>
      </section>
    </Main>
  )
}
