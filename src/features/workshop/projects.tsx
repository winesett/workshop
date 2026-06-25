import { FolderKanban, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { Search } from '@/components/search'

export function ProjectsPage() {
  return (
    <>
      <Header>
        <Search className='me-auto' />
      </Header>

      <Main>
        <div className='mb-6 flex flex-wrap items-start justify-between gap-4'>
          <div className='space-y-1'>
            <h1 className='text-2xl font-bold tracking-tight'>Projects</h1>
            <p className='text-muted-foreground'>
              Create and organize Workshop projects and experiments.
            </p>
          </div>
          <Button>
            <Plus />
            New project
          </Button>
        </div>

        <section className='flex min-h-80 flex-col items-center justify-center rounded-lg border border-dashed bg-muted/20 px-6 py-12 text-center'>
          <div className='mb-4 flex size-12 items-center justify-center rounded-lg border bg-background'>
            <FolderKanban className='size-6 text-muted-foreground' />
          </div>
          <h2 className='text-lg font-semibold'>No projects yet</h2>
          <p className='mt-2 max-w-md text-sm text-muted-foreground'>
            Projects and experiments will appear here once Workshop has a
            creation flow and local project storage.
          </p>
        </section>
      </Main>
    </>
  )
}
