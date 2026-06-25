import { LayoutTemplate } from 'lucide-react'
import { type WorkshopTool } from './types'

export const tools: WorkshopTool[] = [
  {
    id: 'page-builder',
    name: 'Page Builder',
    description: 'Assemble pages from reusable screenshot sections.',
    route: '/workshop/tools/page-builder',
    icon: LayoutTemplate,
  },
]
