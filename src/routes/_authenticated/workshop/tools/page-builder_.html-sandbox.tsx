import { createFileRoute } from '@tanstack/react-router'
import { HtmlSandboxPage } from '@/tools/page-builder/html-sandbox/html-sandbox-page'

export const Route = createFileRoute(
  '/_authenticated/workshop/tools/page-builder_/html-sandbox'
)({
  component: HtmlSandboxPage,
})
