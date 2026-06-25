import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useRouter } from '@tanstack/react-router'
import { ReactQueryDevtoolsPanel } from '@tanstack/react-query-devtools'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { AppConfigurationPanel } from '@/components/config-drawer'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { Search } from '@/components/search'
import { AppearanceForm } from '@/features/settings/appearance/appearance-form'

export function SettingsPage() {
  return (
    <>
      <Header>
        <Search className='me-auto' />
      </Header>

      <Main fixed>
        <div className='space-y-0.5'>
          <h1 className='text-2xl font-bold tracking-tight'>Settings</h1>
          <p className='text-muted-foreground'>
            Adjust appearance preferences for the Workshop shell.
          </p>
        </div>
        <Separator className='my-4 lg:my-6' />
        <div className='max-w-4xl space-y-10'>
          <section className='max-w-2xl space-y-4'>
            <div>
              <h2 className='text-lg font-semibold'>Appearance</h2>
              <p className='text-sm text-muted-foreground'>
                Adjust theme and typography preferences for Workshop.
              </p>
            </div>
            <AppearanceForm />
          </section>

          <Separator />

          <section className='space-y-4'>
            <div>
              <h2 className='text-lg font-semibold'>App configuration</h2>
              <p className='text-sm text-muted-foreground'>
                Adjust shell layout and direction preferences.
              </p>
            </div>
            <AppConfigurationPanel includeTheme={false} />
          </section>

          {import.meta.env.DEV && (
            <>
              <Separator />
              <DeveloperToolsSection />
            </>
          )}
        </div>
      </Main>
    </>
  )
}

function DeveloperToolsSection() {
  const queryClient = useQueryClient()
  const router = useRouter()
  const [routerOpen, setRouterOpen] = useState(false)
  const [queryOpen, setQueryOpen] = useState(false)

  return (
    <section className='space-y-4'>
      <div>
        <h2 className='text-lg font-semibold'>Developer tools</h2>
        <p className='text-sm text-muted-foreground'>
          Open local development panels when inspecting Workshop routing or
          query state.
        </p>
      </div>

      <div className='flex flex-wrap gap-2'>
        <Button
          type='button'
          variant={routerOpen ? 'default' : 'outline'}
          onClick={() => setRouterOpen((open) => !open)}
        >
          TanStack Router Devtools
        </Button>
        <Button
          type='button'
          variant={queryOpen ? 'default' : 'outline'}
          onClick={() => setQueryOpen((open) => !open)}
        >
          TanStack Query Devtools
        </Button>
      </div>

      {routerOpen && (
        <div className='overflow-hidden rounded-md border'>
          <TanStackRouterDevtoolsPanel
            router={router}
            isOpen={routerOpen}
            setIsOpen={setRouterOpen}
            style={{ height: 420 }}
          />
        </div>
      )}

      {queryOpen && (
        <div className='overflow-hidden rounded-md border'>
          <ReactQueryDevtoolsPanel
            client={queryClient}
            onClose={() => setQueryOpen(false)}
            style={{ height: 420 }}
          />
        </div>
      )}
    </section>
  )
}
