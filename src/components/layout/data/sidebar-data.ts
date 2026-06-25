import { FolderKanban, PenTool, Settings } from 'lucide-react'
import { tools } from '@/tools/tool-registry'
import { type SidebarData } from '../types'

export const sidebarData: SidebarData = {
  navGroups: [
    {
      title: 'Workshop',
      items: [
        {
          title: 'Projects',
          url: '/workshop',
          icon: FolderKanban,
        },
        {
          title: 'Canvas',
          url: '/workshop/canvas',
          icon: PenTool,
        },
        {
          title: 'Settings',
          url: '/workshop/settings',
          icon: Settings,
        },
      ],
    },
    {
      title: 'Tools',
      items: tools.map((tool) => ({
        title: tool.name,
        url: tool.route,
        icon: tool.icon,
      })),
    },
  ],
}
