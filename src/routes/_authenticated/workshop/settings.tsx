import { createFileRoute } from '@tanstack/react-router'
import { SettingsPage } from '@/features/workshop/settings'

export const Route = createFileRoute('/_authenticated/workshop/settings')({
  component: SettingsPage,
})
