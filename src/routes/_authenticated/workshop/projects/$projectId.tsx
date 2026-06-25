import { createFileRoute } from '@tanstack/react-router'
import { ProjectDetailPage } from '@/features/workshop/project-detail'

export const Route = createFileRoute(
  '/_authenticated/workshop/projects/$projectId'
)({
  component: ProjectDetailRoute,
})

// eslint-disable-next-line react-refresh/only-export-components
function ProjectDetailRoute() {
  const { projectId } = Route.useParams()

  return <ProjectDetailPage projectId={projectId} />
}
