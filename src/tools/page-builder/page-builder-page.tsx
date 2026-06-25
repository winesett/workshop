import {
  type DragEvent,
  type FormEvent,
  useEffect,
  useMemo,
  useState,
} from 'react'
import {
  ArrowDown,
  ArrowUp,
  FilePlus,
  GripVertical,
  ImageOff,
  MoreHorizontal,
  Plus,
  Trash2,
  X,
} from 'lucide-react'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Main } from '@/components/layout/main'
import {
  createBlankPage,
  loadPageBuilderDocument,
  savePageBuilderDocument,
} from './lib/page-builder-storage'
import {
  type PageBuilderAsset,
  type PageBuilderDocument,
  type PageBuilderPageModel,
} from './types'

const CATALOG_PATH = '/local-assets/page-builder/catalog.json'
const SOURCE_LIBRARY_PATH =
  'src/tools/page-builder/assets/relume-thumbnails'
const SYNC_COMMAND = 'pnpm sync:page-builder-library'
const naturalSort = new Intl.Collator(undefined, {
  numeric: true,
  sensitivity: 'base',
})

type CatalogState =
  | { status: 'loading'; assets: PageBuilderAsset[] }
  | { status: 'ready'; assets: PageBuilderAsset[] }
  | { status: 'missing'; assets: PageBuilderAsset[] }

export function PageBuilderPage() {
  const [catalogState, setCatalogState] = useState<CatalogState>({
    status: 'loading',
    assets: [],
  })
  const [document, setDocument] = useState<PageBuilderDocument>(() =>
    loadPageBuilderDocument()
  )
  const [search, setSearch] = useState('')
  const [addPageOpen, setAddPageOpen] = useState(false)
  const [renamePageTarget, setRenamePageTarget] =
    useState<PageBuilderPageModel | null>(null)
  const [deletePageTarget, setDeletePageTarget] =
    useState<PageBuilderPageModel | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(
    null
  )
  const [draggedSectionId, setDraggedSectionId] = useState<string | null>(null)

  useEffect(() => {
    let canceled = false

    async function loadCatalog() {
      try {
        const response = await fetch(CATALOG_PATH)
        if (!response.ok) throw new Error('Catalog unavailable')

        const catalog = (await response.json()) as PageBuilderAsset[]
        if (!Array.isArray(catalog)) throw new Error('Catalog malformed')

        if (!canceled) {
          setCatalogState({
            status: 'ready',
            assets: catalog.filter(isPageBuilderAsset),
          })
        }
      } catch {
        if (!canceled) {
          setCatalogState({ status: 'missing', assets: [] })
        }
      }
    }

    loadCatalog()

    return () => {
      canceled = true
    }
  }, [])

  useEffect(() => {
    savePageBuilderDocument(document)
  }, [document])

  const activePage =
    document.pages.find((page) => page.id === document.activePageId) ??
    document.pages[0]
  const selectedSection =
    activePage.sections.find((section) => section.id === selectedSectionId) ??
    null

  const assetMap = useMemo(
    () =>
      new Map(
        catalogState.assets.map((asset) => [asset.id, asset] as const)
      ),
    [catalogState.assets]
  )

  const categoryGroups = useMemo(
    () => groupAssets(catalogState.assets, search),
    [catalogState.assets, search]
  )
  const categoryOptions = useMemo(
    () => getCategoryOptions(catalogState.assets),
    [catalogState.assets]
  )
  const visibleCategory =
    selectedCategory &&
    categoryOptions.some((option) => option === selectedCategory)
      ? selectedCategory
      : categoryOptions[0]
  const visibleCategoryGroup = categoryGroups.find(
    (group) => group.category === visibleCategory
  )

  function updateDocument(
    updater: (current: PageBuilderDocument) => PageBuilderDocument
  ) {
    setDocument((current) => normalizeDocument(updater(current)))
  }

  function addSection(assetId: string) {
    updateDocument((current) => ({
      ...current,
      pages: current.pages.map((page) =>
        page.id === current.activePageId
          ? {
              ...page,
              sections: [
                ...page.sections,
                { id: crypto.randomUUID(), assetId },
              ],
            }
          : page
      ),
    }))
  }

  function replaceSection(assetId: string) {
    if (!selectedSection) return

    updateDocument((current) => ({
      ...current,
      pages: current.pages.map((page) =>
        page.id === current.activePageId
          ? {
              ...page,
              sections: page.sections.map((section) =>
                section.id === selectedSection.id
                  ? { ...section, assetId }
                  : section
              ),
            }
          : page
      ),
    }))
  }

  function handleAssetAction(assetId: string) {
    if (selectedSection) {
      replaceSection(assetId)
      return
    }

    addSection(assetId)
  }

  function moveSection(sectionId: string, direction: -1 | 1) {
    updateDocument((current) => ({
      ...current,
      pages: current.pages.map((page) => {
        if (page.id !== current.activePageId) return page

        const index = page.sections.findIndex(
          (section) => section.id === sectionId
        )
        const nextIndex = index + direction
        if (index < 0 || nextIndex < 0 || nextIndex >= page.sections.length) {
          return page
        }

        const nextSections = [...page.sections]
        const [section] = nextSections.splice(index, 1)
        nextSections.splice(nextIndex, 0, section)

        return { ...page, sections: nextSections }
      }),
    }))
  }

  function moveSectionToTarget(
    sectionId: string,
    targetSectionId: string,
    placement: 'before' | 'after'
  ) {
    if (sectionId === targetSectionId) return

    updateDocument((current) => ({
      ...current,
      pages: current.pages.map((page) => {
        if (page.id !== current.activePageId) return page

        const sourceIndex = page.sections.findIndex(
          (section) => section.id === sectionId
        )
        const targetIndex = page.sections.findIndex(
          (section) => section.id === targetSectionId
        )

        if (sourceIndex < 0 || targetIndex < 0) return page

        const nextSections = [...page.sections]
        const [section] = nextSections.splice(sourceIndex, 1)
        const adjustedTargetIndex =
          sourceIndex < targetIndex ? targetIndex - 1 : targetIndex
        const insertionIndex =
          placement === 'before' ? adjustedTargetIndex : adjustedTargetIndex + 1

        nextSections.splice(insertionIndex, 0, section)

        return { ...page, sections: nextSections }
      }),
    }))
  }

  function removeSection(sectionId: string) {
    if (sectionId === selectedSectionId) {
      setSelectedSectionId(null)
    }

    updateDocument((current) => ({
      ...current,
      pages: current.pages.map((page) =>
        page.id === current.activePageId
          ? {
              ...page,
              sections: page.sections.filter(
                (section) => section.id !== sectionId
              ),
            }
          : page
      ),
    }))
  }

  function addPage(name: string) {
    const page = createBlankPage(name)
    setSelectedSectionId(null)
    updateDocument((current) => ({
      activePageId: page.id,
      pages: [...current.pages, page],
    }))
  }

  function renamePage(pageId: string, name: string) {
    updateDocument((current) => ({
      ...current,
      pages: current.pages.map((page) =>
        page.id === pageId ? { ...page, name } : page
      ),
    }))
  }

  function deletePage(pageId: string) {
    setSelectedSectionId(null)
    updateDocument((current) => {
      if (current.pages.length <= 1) return current

      const deletedIndex = current.pages.findIndex((page) => page.id === pageId)
      const pages = current.pages.filter((page) => page.id !== pageId)
      const activePageId =
        current.activePageId === pageId
          ? pages[Math.max(0, deletedIndex - 1)]?.id
          : current.activePageId

      return {
        activePageId: activePageId ?? pages[0].id,
        pages,
      }
    })
  }

  return (
    <Main fixed fluid className='p-0'>
      <div className='flex min-h-0 flex-1 bg-muted/30'>
        <aside className='flex w-80 shrink-0 flex-col border-r bg-background'>
          <div className='space-y-3 border-b p-4'>
            <div className='flex items-start justify-between gap-3'>
              <div>
                <h1 className='text-lg font-semibold'>
                  {selectedSection ? 'Replace section' : 'Add sections'}
                </h1>
                <p className='text-sm text-muted-foreground'>
                  {catalogState.status === 'ready'
                    ? `${catalogState.assets.length} screenshots`
                    : 'Sync screenshots to load the library'}
                </p>
              </div>
              {selectedSection && (
                <Button
                  type='button'
                  variant='ghost'
                  size='icon'
                  className='size-8'
                  onClick={() => setSelectedSectionId(null)}
                >
                  <X />
                  <span className='sr-only'>Close Replace mode</span>
                </Button>
              )}
            </div>
            {selectedSection && (
              <p className='text-sm text-muted-foreground'>
                Choose another screenshot to swap into the selected section.
              </p>
            )}
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder='Search sections'
            />
            {catalogState.status === 'ready' && categoryOptions.length > 0 && (
              <Select
                value={visibleCategory}
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger className='w-full'>
                  <SelectValue placeholder='Choose a section category' />
                </SelectTrigger>
                <SelectContent>
                  {categoryOptions.map((category) => (
                    <SelectItem key={category} value={category}>
                      {readableCategory(category)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <div className='min-h-0 flex-1 overflow-y-auto p-4'>
            {catalogState.status === 'loading' && (
              <p className='text-sm text-muted-foreground'>Loading catalog...</p>
            )}

            {catalogState.status === 'missing' && <MissingCatalogState />}

            {catalogState.status === 'ready' &&
              (visibleCategoryGroup ? (
                <section className='space-y-3'>
                  <div className='flex items-center justify-between gap-3'>
                    <h2 className='text-sm font-medium'>
                      {readableCategory(visibleCategoryGroup.category)}
                    </h2>
                    <span className='text-xs text-muted-foreground'>
                      {visibleCategoryGroup.assets.length}
                    </span>
                  </div>
                  <div className='space-y-3'>
                    {visibleCategoryGroup.assets.map((asset) => (
                      <AssetLibraryItem
                        key={asset.id}
                        asset={asset}
                        actionLabel={selectedSection ? 'Replace' : 'Add'}
                        onAction={() => handleAssetAction(asset.id)}
                      />
                    ))}
                  </div>
                </section>
              ) : (
                <p className='text-sm text-muted-foreground'>
                  No screenshots match that search.
                </p>
              ))}
          </div>
        </aside>

        <section className='flex min-w-0 flex-1 flex-col'>
          <PageControls
            document={document}
            activePage={activePage}
            assetMap={assetMap}
            onAddPage={() => setAddPageOpen(true)}
            onSelectPage={(pageId) =>
              {
                setSelectedSectionId(null)
                updateDocument((current) => ({
                  ...current,
                  activePageId: pageId,
                }))
              }
            }
            onRenamePage={(page) => setRenamePageTarget(page)}
            onDeletePage={(page) => setDeletePageTarget(page)}
          />

          <div
            className='min-h-0 flex-1 overflow-auto px-8 py-8'
            onClick={() => setSelectedSectionId(null)}
          >
            <div className='mx-auto w-full max-w-5xl bg-background shadow-sm ring-1 ring-border'>
              {activePage.sections.length === 0 ? (
                <div className='flex min-h-[520px] flex-col items-center justify-center px-6 py-16 text-center'>
                  <FilePlus className='mb-4 size-10 text-muted-foreground' />
                  <h2 className='text-lg font-semibold'>Start with a section</h2>
                  <p className='mt-2 max-w-md text-sm text-muted-foreground'>
                    Add screenshots from the library to assemble this page.
                  </p>
                </div>
              ) : (
                activePage.sections.map((section, index) => (
                  <PageSection
                    key={section.id}
                    asset={assetMap.get(section.assetId)}
                    sectionName={`Section ${index + 1}`}
                    selected={section.id === selectedSection?.id}
                    isFirst={index === 0}
                    isLast={index === activePage.sections.length - 1}
                    onSelect={() => setSelectedSectionId(section.id)}
                    onDeselect={() => setSelectedSectionId(null)}
                    onDragStart={(event) => {
                      event.dataTransfer.effectAllowed = 'move'
                      event.dataTransfer.setData('text/plain', section.id)
                      setDraggedSectionId(section.id)
                      setSelectedSectionId(section.id)
                    }}
                    onDragEnd={() => setDraggedSectionId(null)}
                    onDrop={(event) => {
                      const sourceSectionId =
                        event.dataTransfer.getData('text/plain') ||
                        draggedSectionId
                      const rect = event.currentTarget.getBoundingClientRect()
                      const placement =
                        event.clientY < rect.top + rect.height / 2
                          ? 'before'
                          : 'after'

                      if (sourceSectionId) {
                        moveSectionToTarget(
                          sourceSectionId,
                          section.id,
                          placement
                        )
                      }

                      setDraggedSectionId(null)
                    }}
                    onMoveUp={() => moveSection(section.id, -1)}
                    onMoveDown={() => moveSection(section.id, 1)}
                    onRemove={() => removeSection(section.id)}
                  />
                ))
              )}
            </div>
          </div>
        </section>
      </div>

      <PageNameDialog
        key='add-page'
        open={addPageOpen}
        onOpenChange={setAddPageOpen}
        title='Add page'
        description='Create another page in this local composition.'
        submitLabel='Add page'
        initialName='Untitled page'
        onSubmit={addPage}
      />

      <PageNameDialog
        key={renamePageTarget?.id ?? 'rename-page'}
        open={renamePageTarget !== null}
        onOpenChange={(open) => {
          if (!open) setRenamePageTarget(null)
        }}
        title='Rename page'
        description='Update the page name shown in the page selector.'
        submitLabel='Rename'
        initialName={renamePageTarget?.name ?? ''}
        onSubmit={(name) => {
          if (!renamePageTarget) return
          renamePage(renamePageTarget.id, name)
          setRenamePageTarget(null)
        }}
      />

      <ConfirmDialog
        open={deletePageTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeletePageTarget(null)
        }}
        title='Delete page'
        desc={
          deletePageTarget
            ? `Delete "${deletePageTarget.name}"? Its section stack will be removed from this browser.`
            : ''
        }
        destructive
        confirmText='Delete'
        disabled={document.pages.length <= 1}
        handleConfirm={() => {
          if (!deletePageTarget) return
          deletePage(deletePageTarget.id)
          setDeletePageTarget(null)
        }}
      />
    </Main>
  )
}

function AssetLibraryItem({
  asset,
  actionLabel,
  onAction,
}: {
  asset: PageBuilderAsset
  actionLabel: string
  onAction: () => void
}) {
  return (
    <div className='group rounded-md border bg-card text-card-foreground'>
      <button
        type='button'
        className='block w-full overflow-hidden rounded-t-md bg-muted text-start'
        onClick={onAction}
      >
        <img
          src={asset.imagePath}
          alt={asset.name}
          loading='lazy'
          className='h-auto w-full transition-opacity group-hover:opacity-90'
        />
      </button>
      <div className='flex items-center gap-2 p-2'>
        <div className='min-w-0 flex-1'>
          <p className='truncate text-sm font-medium'>{asset.name}</p>
          <p className='truncate text-xs text-muted-foreground'>
            {readableCategory(asset.category)}
          </p>
        </div>
        <Button type='button' size='sm' variant='outline' onClick={onAction}>
          {actionLabel}
        </Button>
      </div>
    </div>
  )
}

function PageControls({
  document,
  activePage,
  assetMap,
  onAddPage,
  onSelectPage,
  onRenamePage,
  onDeletePage,
}: {
  document: PageBuilderDocument
  activePage: PageBuilderPageModel
  assetMap: Map<string, PageBuilderAsset>
  onAddPage: () => void
  onSelectPage: (pageId: string) => void
  onRenamePage: (page: PageBuilderPageModel) => void
  onDeletePage: (page: PageBuilderPageModel) => void
}) {
  return (
    <div className='flex min-h-14 items-center gap-3 border-b bg-background px-4'>
      <div className='flex min-w-0 flex-1 items-center gap-2 overflow-x-auto'>
        {document.pages.map((page) => (
          <Button
            key={page.id}
            type='button'
            variant={page.id === activePage.id ? 'default' : 'outline'}
            size='sm'
            onClick={() => onSelectPage(page.id)}
            className='shrink-0'
          >
            {page.name}
          </Button>
        ))}
      </div>
      <Button type='button' variant='outline' size='sm' onClick={onAddPage}>
        <Plus />
        Page
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button type='button' variant='outline' size='icon' className='size-8'>
            <MoreHorizontal />
            <span className='sr-only'>Page actions</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end'>
          <DropdownMenuItem
            onSelect={() => copyPageBuilderPrompt(document, assetMap)}
          >
            Copy Figma prompt
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={() => exportPageJson(activePage, assetMap)}
          >
            Export JSON
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => onRenamePage(activePage)}>
            Rename page
          </DropdownMenuItem>
          <DropdownMenuItem
            variant='destructive'
            disabled={document.pages.length <= 1}
            onSelect={() => onDeletePage(activePage)}
          >
            Delete page
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

async function copyPageBuilderPrompt(
  document: PageBuilderDocument,
  assetMap: Map<string, PageBuilderAsset>
) {
  const prompt = buildPageBuilderPrompt(document, assetMap)

  try {
    await navigator.clipboard.writeText(prompt)
  } catch {
    downloadTextFile('relume-page-builder-prompt.txt', prompt)
  }
}

function buildPageBuilderPrompt(
  document: PageBuilderDocument,
  assetMap: Map<string, PageBuilderAsset>
) {
  const lines = [
    'Build this page in Figma using the Relume Figma Kit (v3.7) Community library.',
    '',
    'Use desktop components. Create one frame per page. Assemble sections in the exact order listed. Match each section by category and layout name. If an exact component is unavailable, put in a missing element placeholder for that section.',
  ]

  for (const page of document.pages) {
    lines.push('', `Page: ${page.name}`)

    if (page.sections.length === 0) {
      lines.push('No sections selected.')
      continue
    }

    for (const [index, section] of page.sections.entries()) {
      const asset = assetMap.get(section.assetId)
      const category = asset?.category ?? 'Missing asset'
      const name = asset?.name ?? section.assetId

      lines.push(`${index + 1}. ${category} / ${name}`)
    }
  }

  return lines.join('\n')
}

function exportPageJson(
  page: PageBuilderPageModel,
  assetMap: Map<string, PageBuilderAsset>
) {
  const payload = {
    [page.name]: page.sections.map((section, index) => {
      const asset = assetMap.get(section.assetId)

      return {
        order: index + 1,
        sectionInstanceId: section.id,
        assetId: section.assetId,
        layout: asset
          ? {
              name: asset.name,
              category: asset.category,
              filename: asset.filename,
              imagePath: asset.imagePath,
            }
          : null,
        missing: !asset,
      }
    }),
  }
  const blob = new Blob([`${JSON.stringify(payload, null, 2)}\n`], {
    type: 'application/json',
  })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')

  link.href = url
  link.download = `${slugify(page.name || 'page')}-layouts.json`
  link.click()
  URL.revokeObjectURL(url)
}

function downloadTextFile(filename: string, text: string) {
  const blob = new Blob([`${text}\n`], {
    type: 'text/plain',
  })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')

  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

function PageSection({
  asset,
  sectionName,
  selected,
  isFirst,
  isLast,
  onSelect,
  onDeselect,
  onDragStart,
  onDragEnd,
  onDrop,
  onMoveUp,
  onMoveDown,
  onRemove,
}: {
  asset?: PageBuilderAsset
  sectionName: string
  selected: boolean
  isFirst: boolean
  isLast: boolean
  onSelect: () => void
  onDeselect: () => void
  onDragStart: (event: DragEvent<HTMLDivElement>) => void
  onDragEnd: () => void
  onDrop: (event: DragEvent<HTMLDivElement>) => void
  onMoveUp: () => void
  onMoveDown: () => void
  onRemove: () => void
}) {
  return (
    <div
      className={`group relative border-b last:border-b-0 ${
        selected
          ? 'z-10 ring-2 ring-purple-500'
          : 'hover:ring-2 hover:ring-purple-500/20'
      }`}
      onClick={(event) => {
        event.stopPropagation()
        onSelect()
      }}
      onDragOver={(event) => {
        event.preventDefault()
        event.dataTransfer.dropEffect = 'move'
      }}
      onDrop={(event) => {
        event.preventDefault()
        event.stopPropagation()
        onDrop(event)
      }}
    >
      {asset ? (
        <img
          src={asset.imagePath}
          alt={asset.name}
          className='block h-auto w-full'
        />
      ) : (
        <div className='flex min-h-48 flex-col items-center justify-center bg-muted/30 px-6 py-12 text-center'>
          <ImageOff className='mb-3 size-8 text-muted-foreground' />
          <h3 className='text-sm font-medium'>Missing screenshot asset</h3>
          <p className='mt-1 max-w-sm text-sm text-muted-foreground'>
            This saved section references an asset that is no longer available.
          </p>
        </div>
      )}
      {selected && (
        <>
          <div className='absolute left-0 top-1/2 h-10 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple-600 shadow-sm' />
          <div
            className='absolute right-3 top-3 flex items-center gap-1 rounded-md border border-purple-300 bg-background/95 p-1 shadow-sm'
            onClick={(event) => event.stopPropagation()}
          >
            <div
              draggable
              role='button'
              tabIndex={0}
              aria-label='Drag section to reorder'
              className='flex size-7 cursor-grab items-center justify-center rounded text-purple-700 hover:bg-purple-100 active:cursor-grabbing dark:text-purple-300 dark:hover:bg-purple-950/40'
              onClick={(event) => event.stopPropagation()}
              onDragStart={(event) => {
                event.stopPropagation()
                onDragStart(event)
              }}
              onDragEnd={onDragEnd}
            >
              <GripVertical className='size-4' />
            </div>
            <span className='px-2 text-xs font-medium text-purple-700 dark:text-purple-300'>
              {sectionName}
            </span>
            <Button
              type='button'
              variant='ghost'
              size='icon'
              className='size-7'
              disabled={isFirst}
              onClick={onMoveUp}
            >
              <ArrowUp />
              <span className='sr-only'>Move section up</span>
            </Button>
            <Button
              type='button'
              variant='ghost'
              size='icon'
              className='size-7'
              disabled={isLast}
              onClick={onMoveDown}
            >
              <ArrowDown />
              <span className='sr-only'>Move section down</span>
            </Button>
            <Button
              type='button'
              variant='ghost'
              size='icon'
              className='size-7'
              onClick={onRemove}
            >
              <Trash2 />
              <span className='sr-only'>Remove section</span>
            </Button>
            <Button
              type='button'
              variant='ghost'
              size='icon'
              className='size-7'
              onClick={onDeselect}
            >
              <X />
              <span className='sr-only'>Deselect section</span>
            </Button>
          </div>
        </>
      )}
    </div>
  )
}

function PageNameDialog({
  open,
  onOpenChange,
  title,
  description,
  submitLabel,
  initialName,
  onSubmit,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  submitLabel: string
  initialName: string
  onSubmit: (name: string) => void
}) {
  const [name, setName] = useState(initialName)
  const [submitted, setSubmitted] = useState(false)
  const error =
    submitted && name.trim().length === 0 ? 'Page name is required.' : ''

  function handleOpenChange(nextOpen: boolean) {
    onOpenChange(nextOpen)
    if (!nextOpen) {
      setName(initialName)
      setSubmitted(false)
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitted(true)

    const nextName = name.trim()
    if (!nextName) return

    onSubmit(nextName)
    setName(initialName)
    setSubmitted(false)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit} className='space-y-4'>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>

          <div className='space-y-2'>
            <Label htmlFor='page-name'>Page name</Label>
            <Input
              id='page-name'
              value={name}
              onChange={(event) => setName(event.target.value)}
              aria-invalid={error ? true : undefined}
              autoFocus
            />
            {error && <p className='text-sm text-destructive'>{error}</p>}
          </div>

          <DialogFooter>
            <Button
              type='button'
              variant='outline'
              onClick={() => handleOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type='submit'>{submitLabel}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function MissingCatalogState() {
  return (
    <div className='space-y-3 rounded-lg border border-dashed bg-muted/20 p-4'>
      <div>
        <h2 className='text-sm font-medium'>Screenshot catalog not found</h2>
        <p className='mt-1 text-sm text-muted-foreground'>
          Sync the local screenshot library before using Page Builder.
        </p>
      </div>
      <div className='space-y-1 text-xs text-muted-foreground'>
        <p>
          Command: <code className='font-mono'>{SYNC_COMMAND}</code>
        </p>
        <p>
          Source: <code className='font-mono'>{SOURCE_LIBRARY_PATH}</code>
        </p>
      </div>
    </div>
  )
}

function groupAssets(assets: PageBuilderAsset[], search: string) {
  const query = search.trim().toLowerCase()
  const groups = new Map<string, PageBuilderAsset[]>()

  for (const asset of assets) {
    const searchable = `${asset.category} ${asset.filename} ${asset.name}`
      .toLowerCase()
      .replace(/-/g, ' ')
    if (query && !searchable.includes(query)) continue

    const group = groups.get(asset.category) ?? []
    group.push(asset)
    groups.set(asset.category, group)
  }

  return [...groups.entries()]
    .sort(([a], [b]) => naturalSort.compare(a, b))
    .map(([category, groupAssets]) => ({
      category,
      assets: groupAssets.sort((a, b) => naturalSort.compare(a.name, b.name)),
    }))
}

function getCategoryOptions(assets: PageBuilderAsset[]) {
  return [...new Set(assets.map((asset) => asset.category))].sort((a, b) =>
    naturalSort.compare(a, b)
  )
}

function normalizeDocument(document: PageBuilderDocument): PageBuilderDocument {
  if (document.pages.length === 0) {
    const page = createBlankPage('Home')
    return {
      activePageId: page.id,
      pages: [page],
    }
  }

  if (document.pages.some((page) => page.id === document.activePageId)) {
    return document
  }

  return {
    ...document,
    activePageId: document.pages[0].id,
  }
}

function readableCategory(category: string) {
  return category.replace(/-/g, ' ')
}

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function isPageBuilderAsset(value: unknown): value is PageBuilderAsset {
  if (!value || typeof value !== 'object') return false

  const asset = value as Record<string, unknown>
  return (
    typeof asset.id === 'string' &&
    typeof asset.category === 'string' &&
    typeof asset.filename === 'string' &&
    typeof asset.name === 'string' &&
    typeof asset.imagePath === 'string'
  )
}
