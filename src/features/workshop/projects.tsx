import { useMemo, useState } from 'react'
import { Link } from '@tanstack/react-router'
import { FolderKanban, MoreHorizontal, Plus } from 'lucide-react'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import {
  createProject,
  deleteProject,
  listProjects,
  renameProject,
  type WorkshopProject,
} from './projects-storage'

export function ProjectsPage() {
  const [projects, setProjects] = useState<WorkshopProject[]>(() =>
    listProjects()
  )
  const [createOpen, setCreateOpen] = useState(false)
  const [renameProjectTarget, setRenameProjectTarget] =
    useState<WorkshopProject | null>(null)
  const [deleteProjectTarget, setDeleteProjectTarget] =
    useState<WorkshopProject | null>(null)

  function refreshProjects() {
    setProjects(listProjects())
  }

  function handleCreate(name: string) {
    createProject(name)
    refreshProjects()
  }

  function handleRename(projectId: string, name: string) {
    renameProject(projectId, name)
    refreshProjects()
  }

  function handleDelete(projectId: string) {
    deleteProject(projectId)
    refreshProjects()
  }

  return (
    <>
      <Header />

      <Main>
        <div className='mb-6 flex flex-wrap items-start justify-between gap-4'>
          <div className='space-y-1'>
            <h1 className='text-2xl font-bold tracking-tight'>Projects</h1>
            <p className='text-muted-foreground'>
              Create and organize Workshop projects and experiments.
            </p>
          </div>
          <Button onClick={() => setCreateOpen(true)}>
            <Plus />
            New project
          </Button>
        </div>

        {projects.length === 0 ? (
          <ProjectsEmptyState />
        ) : (
          <div className='grid gap-4 sm:grid-cols-2 xl:grid-cols-3'>
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onRename={() => setRenameProjectTarget(project)}
                onDelete={() => setDeleteProjectTarget(project)}
              />
            ))}
          </div>
        )}
      </Main>

      <ProjectNameDialog
        key='create-project'
        open={createOpen}
        onOpenChange={setCreateOpen}
        title='Create project'
        description='Name the local Workshop project.'
        submitLabel='Create'
        onSubmit={handleCreate}
      />

      <ProjectNameDialog
        key={renameProjectTarget?.id ?? 'rename-project'}
        open={renameProjectTarget !== null}
        onOpenChange={(open) => {
          if (!open) setRenameProjectTarget(null)
        }}
        title='Rename project'
        description='Update the project name shown in Workshop.'
        submitLabel='Rename'
        initialName={renameProjectTarget?.name}
        onSubmit={(name) => {
          if (!renameProjectTarget) return
          handleRename(renameProjectTarget.id, name)
          setRenameProjectTarget(null)
        }}
      />

      <ConfirmDialog
        open={deleteProjectTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteProjectTarget(null)
        }}
        title='Delete project'
        desc={
          deleteProjectTarget
            ? `Delete "${deleteProjectTarget.name}"? This local project will be removed from this browser.`
            : ''
        }
        destructive
        confirmText='Delete'
        handleConfirm={() => {
          if (!deleteProjectTarget) return
          handleDelete(deleteProjectTarget.id)
          setDeleteProjectTarget(null)
        }}
      />
    </>
  )
}

function ProjectsEmptyState() {
  return (
    <section className='flex min-h-80 flex-col items-center justify-center rounded-lg border border-dashed bg-muted/20 px-6 py-12 text-center'>
      <div className='mb-4 flex size-12 items-center justify-center rounded-lg border bg-background'>
        <FolderKanban className='size-6 text-muted-foreground' />
      </div>
      <h2 className='text-lg font-semibold'>No projects yet</h2>
      <p className='mt-2 max-w-md text-sm text-muted-foreground'>
        Projects and experiments will appear here once Workshop has a creation
        flow and local project storage.
      </p>
    </section>
  )
}

function ProjectCard({
  project,
  onRename,
  onDelete,
}: {
  project: WorkshopProject
  onRename: () => void
  onDelete: () => void
}) {
  return (
    <Card className='gap-4 rounded-lg py-5'>
      <CardHeader className='px-5'>
        <CardTitle className='truncate'>{project.name}</CardTitle>
        <CardDescription>
          Last updated {formatProjectDate(project.updatedAt)}
        </CardDescription>
        <CardAction>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='ghost' size='icon' className='size-8'>
                <MoreHorizontal />
                <span className='sr-only'>Project actions</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end'>
              <DropdownMenuItem onSelect={onRename}>Rename</DropdownMenuItem>
              <DropdownMenuItem variant='destructive' onSelect={onDelete}>
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardAction>
      </CardHeader>
      <CardFooter className='px-5'>
        <Button asChild variant='outline' className='w-full'>
          <Link
            to='/workshop/projects/$projectId'
            params={{ projectId: project.id }}
          >
            Open
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}

function ProjectNameDialog({
  open,
  onOpenChange,
  title,
  description,
  submitLabel,
  initialName = '',
  onSubmit,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  submitLabel: string
  initialName?: string
  onSubmit: (name: string) => void
}) {
  const [name, setName] = useState(initialName)
  const [submitted, setSubmitted] = useState(false)
  const error = useMemo(
    () =>
      submitted && name.trim().length === 0 ? 'Project name is required.' : '',
    [name, submitted]
  )

  function handleOpenChange(nextOpen: boolean) {
    onOpenChange(nextOpen)
    if (!nextOpen) {
      setName('')
      setSubmitted(false)
    }
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitted(true)

    const nextName = name.trim()
    if (!nextName) return

    onSubmit(nextName)
    setName('')
    setSubmitted(false)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit} className='space-y-4'>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>

          <div className='space-y-2'>
            <Label htmlFor='project-name'>Project name</Label>
            <Input
              id='project-name'
              value={name}
              onChange={(event) => setName(event.target.value)}
              aria-invalid={error ? true : undefined}
              autoFocus
            />
            {error && <p className='text-sm text-destructive'>{error}</p>}
          </div>

          <DialogFooter>
            <Button
              type='button'
              variant='outline'
              onClick={() => handleOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type='submit'>{submitLabel}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function formatProjectDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value))
}
