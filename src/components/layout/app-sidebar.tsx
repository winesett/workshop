import { useLayout } from '@/context/layout-provider'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from '@/components/ui/sidebar'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { AppTitle } from './app-title'
import { sidebarData } from './data/sidebar-data'
import { NavGroup } from './nav-group'

export function AppSidebar() {
  const { collapsible, variant } = useLayout()
  return (
    <Sidebar collapsible={collapsible} variant={variant}>
      <SidebarHeader>
        <AppTitle />
        <Search className='mx-2 max-w-[calc(100%-1rem)] flex-none sm:w-auto lg:w-auto xl:w-auto group-data-[collapsible=icon]:mx-auto group-data-[collapsible=icon]:size-8 group-data-[collapsible=icon]:px-0' />
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
