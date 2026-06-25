import { FolderKanban, PenTool, Settings } from 'lucide-react'
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
  ],
}
