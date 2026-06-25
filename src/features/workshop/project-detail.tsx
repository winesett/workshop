import { Link } from '@tanstack/react-router'
import { ArrowLeft, FolderKanban } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Main } from '@/components/layout/main'
import { getProject } from './projects-storage'

export function ProjectDetailPage({ projectId }: { projectId: string }) {
  const project = getProject(projectId)

  return (
    <>
      <Main>
        <Button asChild variant='ghost' className='mb-6 px-0'>
          <Link to='/workshop'>
            <ArrowLeft />
            Projects
          </Link>
        </Button>

        {project ? (
          <div className='space-y-6'>
            <div className='space-y-1'>
              <h1 className='text-2xl font-bold tracking-tight'>
                {project.name}
              </h1>
              <p className='text-muted-foreground'>
                Project workspace details are stored locally in this browser.
              </p>
            </div>

            <section className='flex min-h-80 flex-col items-center justify-center rounded-lg border border-dashed bg-muted/20 px-6 py-12 text-center'>
              <div className='mb-4 flex size-12 items-center justify-center rounded-lg border bg-background'>
                <FolderKanban className='size-6 text-muted-foreground' />
              </div>
              <h2 className='text-lg font-semibold'>Project canvas coming next</h2>
              <p className='mt-2 max-w-md text-sm text-muted-foreground'>
                This project will connect to its canvas workspace in Cycle 2B.
              </p>
            </section>
          </div>
        ) : (
          <section className='flex min-h-80 flex-col items-center justify-center rounded-lg border border-dashed bg-muted/20 px-6 py-12 text-center'>
            <div className='mb-4 flex size-12 items-center justify-center rounded-lg border bg-background'>
              <FolderKanban className='size-6 text-muted-foreground' />
            </div>
            <h1 className='text-lg font-semibold'>Project not found</h1>
            <p className='mt-2 max-w-md text-sm text-muted-foreground'>
              This local project is not available in this browser.
            </p>
            <Button asChild className='mt-6'>
              <Link to='/workshop'>Back to Projects</Link>
            </Button>
          </section>
        )}
      </Main>
    </>
  )
}
