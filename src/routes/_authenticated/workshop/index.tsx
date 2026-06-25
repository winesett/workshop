import { createFileRoute } from '@tanstack/react-router'
import { ProjectsPage } from '@/features/workshop/projects'

export const Route = createFileRoute('/_authenticated/workshop/')({
  component: ProjectsPage,
})
