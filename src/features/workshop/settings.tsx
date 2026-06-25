import { Separator } from '@/components/ui/separator'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { AppearanceForm } from '@/features/settings/appearance/appearance-form'

export function SettingsPage() {
  return (
    <>
      <Header>
        <Search className='me-auto' />
        <ThemeSwitch />
        <ConfigDrawer />
      </Header>

      <Main fixed>
        <div className='space-y-0.5'>
          <h1 className='text-2xl font-bold tracking-tight'>Settings</h1>
          <p className='text-muted-foreground'>
            Adjust appearance preferences for the Workshop shell.
          </p>
        </div>
        <Separator className='my-4 lg:my-6' />
        <div className='max-w-2xl'>
          <AppearanceForm />
        </div>
      </Main>
    </>
  )
}
