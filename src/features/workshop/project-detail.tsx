import { Tldraw } from 'tldraw'
import 'tldraw/tldraw.css'
import { Link } from '@tanstack/react-router'
import { ArrowLeft, FolderKanban } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Main } from '@/components/layout/main'
import { getProject } from './projects-storage'

export function ProjectDetailPage({ projectId }: { projectId: string }) {
  const project = getProject(projectId)

  return (
    <>
      {project ? (
        <Main fixed fluid className='gap-3 p-0'>
          <div className='flex min-h-14 items-center gap-3 border-b px-4'>
            <Button asChild variant='ghost' size='icon' className='size-8'>
              <Link to='/workshop'>
                <ArrowLeft />
                <span className='sr-only'>Back to Projects</span>
              </Link>
            </Button>
            <div className='min-w-0'>
              <h1 className='text-2xl font-bold tracking-tight'>
                {project.name}
              </h1>
            </div>
          </div>

          <div className='relative min-h-0 flex-1 overflow-hidden'>
            <Tldraw
              key={project.id}
              persistenceKey={`workshop:project:${project.id}:tldraw:v1`}
            />
          </div>
        </Main>
      ) : (
        <Main>
          <Button asChild variant='ghost' className='mb-6 px-0'>
            <Link to='/workshop'>
              <ArrowLeft />
              Projects
            </Link>
          </Button>

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
        </Main>
      )}
    </>
  )
}
