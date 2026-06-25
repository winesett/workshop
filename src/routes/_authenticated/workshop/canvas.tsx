import { createFileRoute } from '@tanstack/react-router'
import { CanvasPage } from '@/features/workshop/canvas'

export const Route = createFileRoute('/_authenticated/workshop/canvas')({
  component: CanvasPage,
})
