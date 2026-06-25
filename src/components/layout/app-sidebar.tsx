import { SearchIcon } from 'lucide-react'
import { useLayout } from '@/context/layout-provider'
import { useSearch } from '@/context/search-provider'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@/components/ui/sidebar'
import { ThemeSwitch } from '@/components/theme-switch'
import { AppTitle } from './app-title'
import { sidebarData } from './data/sidebar-data'
import { NavGroup } from './nav-group'

export function AppSidebar() {
  const { collapsible, variant } = useLayout()
  const { setOpen } = useSearch()

  return (
    <Sidebar collapsible={collapsible} variant={variant}>
      <SidebarHeader>
        <AppTitle />
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip='Search'
              aria-keyshortcuts='Meta+K Control+K'
              onClick={() => setOpen(true)}
            >
              <SearchIcon />
              <span>Search</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {sidebarData.navGroups.map((props) => (
          <NavGroup key={props.title} {...props} />
        ))}
      </SidebarContent>
      <SidebarFooter>
        <div className='flex items-center justify-between gap-2 px-2 py-1 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0'>
          <span className='text-sm text-sidebar-foreground group-data-[collapsible=icon]:sr-only'>
            Theme
          </span>
          <ThemeSwitch />
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
