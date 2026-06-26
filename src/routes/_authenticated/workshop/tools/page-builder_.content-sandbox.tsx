import { createFileRoute } from '@tanstack/react-router'
import { ContentSandboxPage } from '@/tools/page-builder/content-sandbox/content-sandbox-page'

export const Route = createFileRoute(
  '/_authenticated/workshop/tools/page-builder_/content-sandbox'
)({
  component: ContentSandboxPage,
})
