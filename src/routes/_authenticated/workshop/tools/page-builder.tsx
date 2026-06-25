import { createFileRoute } from '@tanstack/react-router'
import { PageBuilderPage } from '@/tools/page-builder'

export const Route = createFileRoute(
  '/_authenticated/workshop/tools/page-builder'
)({
  component: PageBuilderPage,
})
