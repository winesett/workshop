import {
  type FormEvent,
  type PointerEvent as ReactPointerEvent,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import {
  ArrowDown,
  ArrowUp,
  Eye,
  FilePlus,
  GripVertical,
  ImageOff,
  Maximize2,
  MoreHorizontal,
  Plus,
  Trash2,
  X,
} from 'lucide-react'
import { toast } from 'sonner'
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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { ConfirmDialog } from '@/components/confirm-dialog'
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
const SOURCE_LIBRARY_PATH = 'src/tools/page-builder/assets/relume-thumbnails'
const SYNC_COMMAND = 'pnpm sync:page-builder-library'
const SECTION_MENU_VALUE = '__section_menu__'
const ASSEMBLY_SCHEMA = 'workshop.pageBuilder.assembly.v1'
const naturalSort = new Intl.Collator(undefined, {
  numeric: true,
  sensitivity: 'base',
})

type CatalogState =
  | { status: 'loading'; assets: PageBuilderAsset[] }
  | { status: 'ready'; assets: PageBuilderAsset[] }
  | { status: 'missing'; assets: PageBuilderAsset[] }

type SectionDragState = {
  sectionId: string
  startY: number
  currentY: number
}

type PageViewMode = 'normal' | 'birdseye'

type ImportMode = 'replace' | 'append'

type ImportSectionRequest = {
  assetId?: string
  category?: string
  name?: string
  source: string
}

type ImportSectionPreview = {
  request: ImportSectionRequest
  asset?: PageBuilderAsset
}

type ImportPagePreview = {
  name: string
  sections: ImportSectionPreview[]
}

type ImportPreview = {
  errors: string[]
  pages: ImportPagePreview[]
  totalSections: number
  resolvedSections: number
  unresolvedSections: ImportSectionPreview[]
}

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
  const [importDialogOpen, setImportDialogOpen] = useState(false)
  const [renamePageTarget, setRenamePageTarget] =
    useState<PageBuilderPageModel | null>(null)
  const [deletePageTarget, setDeletePageTarget] =
    useState<PageBuilderPageModel | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(
    null
  )
  const [sectionDrag, setSectionDrag] = useState<SectionDragState | null>(null)
  const [pendingScrollSectionId, setPendingScrollSectionId] = useState<
    string | null
  >(null)
  const [pageViewMode, setPageViewMode] = useState<PageViewMode>('normal')
  const [birdseyeScale, setBirdseyeScale] = useState(1)
  const pageWorkspaceRef = useRef<HTMLDivElement>(null)
  const pageFrameRef = useRef<HTMLDivElement>(null)

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

  useEffect(() => {
    if (!pendingScrollSectionId) return

    const sectionElement = window.document.querySelector<HTMLElement>(
      `[data-page-builder-section-id="${pendingScrollSectionId}"]`
    )

    if (!sectionElement) return

    sectionElement.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    })
    setPendingScrollSectionId(null)
  }, [document, pendingScrollSectionId])

  useLayoutEffect(() => {
    if (pageViewMode === 'normal') {
      setBirdseyeScale(1)
      return
    }

    const updateScale = () => {
      const workspaceElement = pageWorkspaceRef.current
      const pageElement = pageFrameRef.current
      if (!workspaceElement || !pageElement) return

      const pageWidth = pageElement.offsetWidth
      const pageHeight = pageElement.scrollHeight
      if (pageWidth === 0 || pageHeight === 0) return

      const availableWidth = Math.max(1, workspaceElement.clientWidth - 32)
      const availableHeight = Math.max(1, workspaceElement.clientHeight - 32)
      const nextScale = Math.min(
        1,
        availableWidth / pageWidth,
        availableHeight / pageHeight
      )

      setBirdseyeScale((currentScale) =>
        Math.abs(currentScale - nextScale) > 0.005
          ? Math.max(0.1, nextScale)
          : currentScale
      )
    }

    updateScale()

    const resizeObserver = new ResizeObserver(updateScale)
    if (pageWorkspaceRef.current)
      resizeObserver.observe(pageWorkspaceRef.current)
    if (pageFrameRef.current) resizeObserver.observe(pageFrameRef.current)
    window.addEventListener('resize', updateScale)

    return () => {
      resizeObserver.disconnect()
      window.removeEventListener('resize', updateScale)
    }
  }, [document, pageViewMode])

  useEffect(() => {
    if (!selectedSectionId) return

    const sectionId = selectedSectionId

    function handleKeyDown(event: KeyboardEvent) {
      if (isTextEntryTarget(event.target)) return
      if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) {
        return
      }

      if (event.key === 'ArrowUp') {
        event.preventDefault()
        moveSection(sectionId, -1)
      }

      if (event.key === 'ArrowDown') {
        event.preventDefault()
        moveSection(sectionId, 1)
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [selectedSectionId])

  const activePage =
    document.pages.find((page) => page.id === document.activePageId) ??
    document.pages[0]
  const selectedSection =
    activePage.sections.find((section) => section.id === selectedSectionId) ??
    null

  const assetMap = useMemo(
    () =>
      new Map(catalogState.assets.map((asset) => [asset.id, asset] as const)),
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
      : null
  const visibleCategoryGroup = categoryGroups.find(
    (group) => group.category === visibleCategory
  )
  const hasSearch = search.trim().length > 0
  const visibleCategoryGroups = hasSearch
    ? categoryGroups
    : visibleCategoryGroup
      ? [visibleCategoryGroup]
      : []

  function updateDocument(
    updater: (current: PageBuilderDocument) => PageBuilderDocument
  ) {
    setDocument((current) => normalizeDocument(updater(current)))
  }

  function addSection(assetId: string) {
    const sectionId = crypto.randomUUID()
    setSelectedSectionId(sectionId)
    setPendingScrollSectionId(sectionId)

    updateDocument((current) => ({
      ...current,
      pages: current.pages.map((page) =>
        page.id === current.activePageId
          ? {
              ...page,
              sections: [...page.sections, { id: sectionId, assetId }],
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

  function addSectionBelowSelected(assetId: string) {
    if (!selectedSection) return

    const sectionId = crypto.randomUUID()
    setSelectedSectionId(sectionId)
    setPendingScrollSectionId(sectionId)

    updateDocument((current) => ({
      ...current,
      pages: current.pages.map((page) => {
        if (page.id !== current.activePageId) return page

        const selectedIndex = page.sections.findIndex(
          (section) => section.id === selectedSection.id
        )
        if (selectedIndex < 0) return page

        const nextSections = [...page.sections]
        nextSections.splice(selectedIndex + 1, 0, {
          id: sectionId,
          assetId,
        })

        return { ...page, sections: nextSections }
      }),
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

  function togglePageViewMode() {
    const nextMode = pageViewMode === 'birdseye' ? 'normal' : 'birdseye'
    setPageViewMode(nextMode)

    if (nextMode === 'birdseye') {
      window.requestAnimationFrame(() => {
        pageWorkspaceRef.current?.scrollTo({
          top: 0,
          left: 0,
          behavior: 'smooth',
        })
      })
    }
  }

  function importPages(previewPages: ImportPagePreview[], mode: ImportMode) {
    const importedPages = createImportedPages(previewPages)
    if (importedPages.length === 0) return

    setSelectedSectionId(null)

    if (mode === 'replace') {
      setDocument({
        activePageId: importedPages[0].id,
        pages: importedPages,
      })
      return
    }

    updateDocument((current) => {
      const existingNames = new Set(current.pages.map((page) => page.name))
      const uniqueImportedPages = importedPages.map((page) => {
        const uniqueName = getUniquePageName(page.name, existingNames)
        existingNames.add(uniqueName)
        return { ...page, name: uniqueName }
      })

      return {
        activePageId: uniqueImportedPages[0].id,
        pages: [...current.pages, ...uniqueImportedPages],
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
                value={visibleCategory ?? SECTION_MENU_VALUE}
                onValueChange={(value) =>
                  setSelectedCategory(value === SECTION_MENU_VALUE ? '' : value)
                }
              >
                <SelectTrigger className='w-full'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={SECTION_MENU_VALUE}>
                    Section Menu
                  </SelectItem>
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
              <p className='text-sm text-muted-foreground'>
                Loading catalog...
              </p>
            )}

            {catalogState.status === 'missing' && <MissingCatalogState />}

            {catalogState.status === 'ready' &&
              (visibleCategoryGroups.length > 0 ? (
                <div className='space-y-5'>
                  {visibleCategoryGroups.map((group) => (
                    <section key={group.category} className='space-y-3'>
                      <div className='flex items-center justify-between gap-3'>
                        <h2 className='text-sm font-medium'>
                          {readableCategory(group.category)}
                        </h2>
                        <span className='text-xs text-muted-foreground'>
                          {group.assets.length}
                        </span>
                      </div>
                      <div className='space-y-3'>
                        {group.assets.map((asset) => (
                          <AssetLibraryItem
                            key={asset.id}
                            asset={asset}
                            actionLabel={selectedSection ? 'Replace' : 'Add'}
                            onAction={() => handleAssetAction(asset.id)}
                            secondaryActionLabel={
                              selectedSection ? 'Add below' : undefined
                            }
                            onSecondaryAction={
                              selectedSection
                                ? () => addSectionBelowSelected(asset.id)
                                : undefined
                            }
                          />
                        ))}
                      </div>
                    </section>
                  ))}
                </div>
              ) : (
                <p className='text-sm text-muted-foreground'>
                  {hasSearch
                    ? 'No screenshots match that search.'
                    : 'Choose a section category to browse screenshots.'}
                </p>
              ))}
          </div>
        </aside>

        <section className='flex min-w-0 flex-1 flex-col'>
          <PageControls
            document={document}
            activePage={activePage}
            assetMap={assetMap}
            catalogAssets={
              catalogState.status === 'ready' ? catalogState.assets : []
            }
            pageViewMode={pageViewMode}
            onAddPage={() => setAddPageOpen(true)}
            onImportJson={() => setImportDialogOpen(true)}
            onTogglePageViewMode={togglePageViewMode}
            onSelectPage={(pageId) => {
              setSelectedSectionId(null)
              updateDocument((current) => ({
                ...current,
                activePageId: pageId,
              }))
            }}
            onRenamePage={(page) => setRenamePageTarget(page)}
            onDeletePage={(page) => setDeletePageTarget(page)}
          />

          <div
            ref={pageWorkspaceRef}
            className='min-h-0 flex-1 overflow-auto px-8 py-8'
            onClick={() => setSelectedSectionId(null)}
          >
            <div
              ref={pageFrameRef}
              className='mx-auto w-full max-w-5xl bg-background shadow-sm ring-1 ring-border transition-transform duration-200 ease-out'
              style={
                pageViewMode === 'birdseye'
                  ? {
                      transform: `scale(${birdseyeScale})`,
                      transformOrigin: 'top center',
                    }
                  : undefined
              }
            >
              {activePage.sections.length === 0 ? (
                <div className='flex min-h-[520px] flex-col items-center justify-center px-6 py-16 text-center'>
                  <FilePlus className='mb-4 size-10 text-muted-foreground' />
                  <h2 className='text-lg font-semibold'>
                    Start with a section
                  </h2>
                  <p className='mt-2 max-w-md text-sm text-muted-foreground'>
                    Add screenshots from the library to assemble this page.
                  </p>
                </div>
              ) : (
                activePage.sections.map((section, index) => (
                  <PageSection
                    key={section.id}
                    sectionId={section.id}
                    asset={assetMap.get(section.assetId)}
                    sectionName={
                      assetMap.get(section.assetId)?.name ??
                      section.unresolved?.name ??
                      section.unresolved?.source ??
                      'Missing section'
                    }
                    unresolvedLabel={section.unresolved?.source}
                    selected={section.id === selectedSection?.id}
                    dragging={sectionDrag?.sectionId === section.id}
                    dragOffsetY={
                      sectionDrag?.sectionId === section.id
                        ? sectionDrag.currentY - sectionDrag.startY
                        : 0
                    }
                    isFirst={index === 0}
                    isLast={index === activePage.sections.length - 1}
                    onSelect={() => setSelectedSectionId(section.id)}
                    onDragHandlePointerDown={(event) => {
                      event.currentTarget.setPointerCapture(event.pointerId)
                      setSelectedSectionId(section.id)
                      setSectionDrag({
                        sectionId: section.id,
                        startY: event.clientY,
                        currentY: event.clientY,
                      })
                    }}
                    onDragHandlePointerMove={(event) => {
                      setSectionDrag((current) =>
                        current?.sectionId === section.id
                          ? { ...current, currentY: event.clientY }
                          : current
                      )
                    }}
                    onDragHandlePointerEnd={(event) => {
                      finishSectionPointerDrag(section.id, event.clientY)
                      setSectionDrag(null)
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

      <ImportJsonDialog
        open={importDialogOpen}
        onOpenChange={setImportDialogOpen}
        assets={catalogState.status === 'ready' ? catalogState.assets : []}
        onImport={importPages}
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

  function finishSectionPointerDrag(sectionId: string, clientY: number) {
    const sectionElements = Array.from(
      window.document.querySelectorAll<HTMLElement>(
        '[data-page-builder-section-id]'
      )
    )
    const targetElements = sectionElements.filter(
      (element) => element.dataset.pageBuilderSectionId !== sectionId
    )

    if (targetElements.length === 0) return

    for (const targetElement of targetElements) {
      const rect = targetElement.getBoundingClientRect()
      const targetId = targetElement.dataset.pageBuilderSectionId

      if (targetId && clientY < rect.top + rect.height / 2) {
        moveSectionToTarget(sectionId, targetId, 'before')
        return
      }
    }

    const lastTarget = targetElements[targetElements.length - 1]
    const lastTargetId = lastTarget.dataset.pageBuilderSectionId

    if (lastTargetId) {
      moveSectionToTarget(sectionId, lastTargetId, 'after')
    }
  }
}

function AssetLibraryItem({
  asset,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
}: {
  asset: PageBuilderAsset
  actionLabel: string
  onAction: () => void
  secondaryActionLabel?: string
  onSecondaryAction?: () => void
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
      <div className='space-y-2 p-2'>
        <div className='min-w-0'>
          <p className='truncate text-sm font-medium'>{asset.name}</p>
          <p className='truncate text-xs text-muted-foreground'>
            {readableCategory(asset.category)}
          </p>
        </div>
        <div className='flex items-center justify-end gap-1.5'>
          {secondaryActionLabel && onSecondaryAction && (
            <Button
              type='button'
              size='sm'
              variant='ghost'
              onClick={onSecondaryAction}
            >
              {secondaryActionLabel}
            </Button>
          )}
          <Button type='button' size='sm' variant='outline' onClick={onAction}>
            {actionLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}

function PageControls({
  document,
  activePage,
  assetMap,
  catalogAssets,
  pageViewMode,
  onAddPage,
  onImportJson,
  onTogglePageViewMode,
  onSelectPage,
  onRenamePage,
  onDeletePage,
}: {
  document: PageBuilderDocument
  activePage: PageBuilderPageModel
  assetMap: Map<string, PageBuilderAsset>
  catalogAssets: PageBuilderAsset[]
  pageViewMode: PageViewMode
  onAddPage: () => void
  onImportJson: () => void
  onTogglePageViewMode: () => void
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
      <Button
        type='button'
        variant='outline'
        size='sm'
        onClick={onTogglePageViewMode}
      >
        {pageViewMode === 'birdseye' ? <Maximize2 /> : <Eye />}
        {pageViewMode === 'birdseye' ? 'Normal' : 'Birdseye'}
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type='button'
            variant='outline'
            size='icon'
            className='size-8'
          >
            <MoreHorizontal />
            <span className='sr-only'>Page actions</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end'>
          <DropdownMenuItem
            onSelect={() => copyReferenceLibrary(catalogAssets)}
          >
            Copy Reference Library
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={onImportJson}>
            Import from JSON
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={() => copyPageBuilderPrompt(activePage, assetMap)}
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

async function copyReferenceLibrary(assets: PageBuilderAsset[]) {
  const referenceLibrary = buildReferenceLibraryText(assets)

  try {
    await navigator.clipboard.writeText(referenceLibrary)
    toast.success(
      assets.length > 0
        ? 'Reference library copied'
        : 'Reference library instructions copied'
    )
  } catch {
    toast.error('Could not copy reference library')
  }
}

function buildReferenceLibraryText(assets: PageBuilderAsset[]) {
  if (assets.length === 0) {
    return [
      'No Page Builder reference library is available.',
      '',
      'Run:',
      SYNC_COMMAND,
      '',
      'Expected source:',
      SOURCE_LIBRARY_PATH,
    ].join('\n')
  }

  const groups = groupAssets(assets, '')
  const lines = [
    `Reference library: ${groups.length} categories, ${assets.length} desktop sections.`,
    '',
    `Use only these Page Builder section references when creating ${ASSEMBLY_SCHEMA} JSON.`,
    '',
    'Format each section reference as:',
    'Category / Section Name',
    '',
    'Available sections:',
  ]

  for (const group of groups) {
    lines.push('', group.category)

    for (const asset of group.assets) {
      lines.push(`- ${asset.category} / ${asset.name}`)
    }
  }

  return lines.join('\n')
}

function ImportJsonDialog({
  open,
  onOpenChange,
  assets,
  onImport,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  assets: PageBuilderAsset[]
  onImport: (pages: ImportPagePreview[], mode: ImportMode) => void
}) {
  const [jsonInput, setJsonInput] = useState('')
  const [mode, setMode] = useState<ImportMode>('replace')
  const preview = useMemo(
    () => parseAssemblyImport(jsonInput, assets),
    [assets, jsonInput]
  )
  const canImport = preview.errors.length === 0 && preview.pages.length > 0

  function handleOpenChange(nextOpen: boolean) {
    onOpenChange(nextOpen)
    if (!nextOpen) {
      setJsonInput('')
      setMode('replace')
    }
  }

  function handleImport() {
    if (!canImport) return

    onImport(preview.pages, mode)
    handleOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className='max-h-[85vh] overflow-y-auto sm:max-w-2xl'>
        <DialogHeader>
          <DialogTitle>Import from JSON</DialogTitle>
          <DialogDescription>
            Paste a Page Builder assembly JSON document to create pages from the
            current screenshot catalog.
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-5'>
          <div className='space-y-2'>
            <Label htmlFor='page-builder-import-json'>Assembly JSON</Label>
            <Textarea
              id='page-builder-import-json'
              value={jsonInput}
              onChange={(event) => setJsonInput(event.target.value)}
              placeholder={`{\n  "schema": "${ASSEMBLY_SCHEMA}",\n  "pages": []\n}`}
              className='h-80 resize-none overflow-y-auto font-mono text-xs'
              aria-invalid={preview.errors.length > 0 ? true : undefined}
            />
          </div>

          <div className='space-y-3'>
            <Label>Import mode</Label>
            <RadioGroup
              value={mode}
              onValueChange={(value) => setMode(value as ImportMode)}
              className='gap-2'
            >
              <div className='flex items-center gap-2'>
                <RadioGroupItem id='import-replace' value='replace' />
                <Label htmlFor='import-replace' className='font-normal'>
                  Replace current document
                </Label>
              </div>
              <div className='flex items-center gap-2'>
                <RadioGroupItem id='import-append' value='append' />
                <Label htmlFor='import-append' className='font-normal'>
                  Add as new pages
                </Label>
              </div>
            </RadioGroup>
          </div>

          <ImportPreviewPanel preview={preview} />
        </div>

        <DialogFooter>
          <Button
            type='button'
            variant='outline'
            onClick={() => handleOpenChange(false)}
          >
            Cancel
          </Button>
          <Button type='button' disabled={!canImport} onClick={handleImport}>
            Import
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function ImportPreviewPanel({ preview }: { preview: ImportPreview }) {
  if (preview.errors.length > 0) {
    return (
      <div className='space-y-2 rounded-md border border-destructive/30 bg-destructive/5 p-3'>
        <h3 className='text-sm font-medium text-destructive'>
          Import needs attention
        </h3>
        <ul className='space-y-1 text-sm text-destructive'>
          {preview.errors.map((error) => (
            <li key={error}>{error}</li>
          ))}
        </ul>
      </div>
    )
  }

  if (preview.pages.length === 0) {
    return (
      <div className='rounded-md border bg-muted/20 p-3 text-sm text-muted-foreground'>
        Paste assembly JSON to preview the import.
      </div>
    )
  }

  return (
    <div className='space-y-3 rounded-md border bg-muted/20 p-3'>
      <div className='grid gap-2 text-sm sm:grid-cols-4'>
        <PreviewMetric label='Pages' value={preview.pages.length} />
        <PreviewMetric label='Sections' value={preview.totalSections} />
        <PreviewMetric label='Resolved' value={preview.resolvedSections} />
        <PreviewMetric
          label='Unresolved'
          value={preview.unresolvedSections.length}
        />
      </div>

      <div className='space-y-1'>
        <h3 className='text-sm font-medium'>Pages</h3>
        <p className='text-sm text-muted-foreground'>
          {preview.pages.map((page) => page.name).join(', ')}
        </p>
      </div>

      {preview.unresolvedSections.length > 0 && (
        <div className='space-y-1'>
          <h3 className='text-sm font-medium'>Unresolved sections</h3>
          <ul className='space-y-1 text-sm text-muted-foreground'>
            {preview.unresolvedSections.map((section, index) => (
              <li key={`${section.request.source}-${index}`}>
                {section.request.source}
              </li>
            ))}
          </ul>
          <p className='text-xs text-muted-foreground'>
            These will import as missing placeholders.
          </p>
        </div>
      )}
    </div>
  )
}

function PreviewMetric({ label, value }: { label: string; value: number }) {
  return (
    <div className='rounded-md border bg-background p-2'>
      <p className='text-xs text-muted-foreground'>{label}</p>
      <p className='text-base font-semibold'>{value}</p>
    </div>
  )
}

function isTextEntryTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false

  return (
    target.isContentEditable ||
    target.matches('input, textarea, select, [role="textbox"]')
  )
}

async function copyPageBuilderPrompt(
  page: PageBuilderPageModel,
  assetMap: Map<string, PageBuilderAsset>
) {
  const prompt = buildPageBuilderPrompt(page, assetMap)

  try {
    await navigator.clipboard.writeText(prompt)
  } catch {
    downloadTextFile('relume-page-builder-prompt.txt', prompt)
  }
}

function buildPageBuilderPrompt(
  page: PageBuilderPageModel,
  assetMap: Map<string, PageBuilderAsset>
) {
  const lines = [
    'Build this page in Figma using the Relume Figma Kit (v3.7) Community library.',
    '',
    'Use desktop components. Create one frame per page. Assemble sections in the exact order listed. Match each section by category and layout name. If an exact component is unavailable, put in a missing element placeholder for that section.',
  ]

  lines.push('', `Page: ${page.name}`)

  if (page.sections.length === 0) {
    lines.push('No sections selected.')
    return lines.join('\n')
  }

  for (const [index, section] of page.sections.entries()) {
    const asset = assetMap.get(section.assetId)
    const category =
      asset?.category ?? section.unresolved?.category ?? 'Missing asset'
    const name =
      asset?.name ??
      section.unresolved?.name ??
      section.unresolved?.source ??
      section.assetId

    lines.push(`${index + 1}. ${category} / ${name}`)
  }

  return lines.join('\n')
}

function exportPageJson(
  page: PageBuilderPageModel,
  assetMap: Map<string, PageBuilderAsset>
) {
  const payload = {
    schema: ASSEMBLY_SCHEMA,
    pages: [
      {
        name: page.name,
        sections: page.sections.map((section) => {
          const asset = assetMap.get(section.assetId)

          return asset
            ? {
                category: asset.category,
                name: asset.name,
                assetId: asset.id,
              }
            : {
                category: section.unresolved?.category,
                name: section.unresolved?.name ?? section.unresolved?.source,
                assetId: section.unresolved?.assetId,
                unresolved: true,
              }
        }),
      },
    ],
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

function parseAssemblyImport(
  input: string,
  assets: PageBuilderAsset[]
): ImportPreview {
  const trimmedInput = input.trim()
  if (!trimmedInput) {
    return createEmptyImportPreview()
  }

  let parsed: unknown
  try {
    parsed = JSON.parse(trimmedInput)
  } catch {
    return {
      ...createEmptyImportPreview(),
      errors: ['JSON is malformed. Check the pasted text and try again.'],
    }
  }

  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    return {
      ...createEmptyImportPreview(),
      errors: ['JSON must be an object with schema and pages fields.'],
    }
  }

  const root = parsed as Record<string, unknown>
  const errors: string[] = []

  if (root.schema !== ASSEMBLY_SCHEMA) {
    errors.push(`Schema must be "${ASSEMBLY_SCHEMA}".`)
  }

  if (!Array.isArray(root.pages)) {
    errors.push('Pages must be an array.')
    return { ...createEmptyImportPreview(), errors }
  }

  if (root.pages.length === 0) {
    errors.push('Pages array must contain at least one page.')
  }

  const pages: ImportPagePreview[] = []
  const unresolvedSections: ImportSectionPreview[] = []
  let totalSections = 0
  let resolvedSections = 0

  root.pages.forEach((pageValue, pageIndex) => {
    if (
      !pageValue ||
      typeof pageValue !== 'object' ||
      Array.isArray(pageValue)
    ) {
      errors.push(`Page ${pageIndex + 1} must be an object.`)
      return
    }

    const page = pageValue as Record<string, unknown>
    const pageName = typeof page.name === 'string' ? page.name.trim() : ''

    if (!pageName) {
      errors.push(`Page ${pageIndex + 1} is missing a name.`)
    }

    if (!Array.isArray(page.sections)) {
      errors.push(
        `Page "${pageName || pageIndex + 1}" sections must be an array.`
      )
      return
    }

    const sections: ImportSectionPreview[] = []

    page.sections.forEach((sectionValue, sectionIndex) => {
      const request = parseImportSectionRequest(sectionValue)

      if (!request) {
        errors.push(
          `Page "${pageName || pageIndex + 1}" section ${sectionIndex + 1} is invalid.`
        )
        return
      }

      const asset = resolveImportSection(request, assets)
      const sectionPreview = { request, asset }
      sections.push(sectionPreview)
      totalSections += 1

      if (asset) {
        resolvedSections += 1
      } else {
        unresolvedSections.push(sectionPreview)
      }
    })

    if (pageName) {
      pages.push({ name: pageName, sections })
    }
  })

  return {
    errors,
    pages: errors.length > 0 ? [] : pages,
    totalSections: errors.length > 0 ? 0 : totalSections,
    resolvedSections: errors.length > 0 ? 0 : resolvedSections,
    unresolvedSections: errors.length > 0 ? [] : unresolvedSections,
  }
}

function createEmptyImportPreview(): ImportPreview {
  return {
    errors: [],
    pages: [],
    totalSections: 0,
    resolvedSections: 0,
    unresolvedSections: [],
  }
}

function parseImportSectionRequest(
  value: unknown
): ImportSectionRequest | null {
  if (typeof value === 'string') {
    const [category, name] = value.split('/').map((part) => part.trim())
    if (!category || !name) return null

    return {
      category,
      name,
      source: value,
    }
  }

  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null
  }

  const section = value as Record<string, unknown>
  const assetId =
    typeof section.assetId === 'string' ? section.assetId.trim() : undefined
  const category =
    typeof section.category === 'string' ? section.category.trim() : undefined
  const name =
    typeof section.name === 'string' ? section.name.trim() : undefined

  if (assetId) {
    return {
      assetId,
      category,
      name,
      source: assetId,
    }
  }

  if (category && name) {
    return {
      category,
      name,
      source: `${category} / ${name}`,
    }
  }

  return null
}

function resolveImportSection(
  request: ImportSectionRequest,
  assets: PageBuilderAsset[]
) {
  if (request.assetId) {
    const assetById = assets.find((asset) => asset.id === request.assetId)
    if (assetById) return assetById
  }

  const normalizedCategory = request.category
    ? normalizeImportValue(request.category)
    : ''
  const normalizedName = request.name ? normalizeImportValue(request.name) : ''

  if (normalizedCategory && normalizedName) {
    const assetByCategoryAndName = assets.find(
      (asset) =>
        normalizeImportValue(asset.category) === normalizedCategory &&
        normalizeImportValue(asset.name) === normalizedName
    )
    if (assetByCategoryAndName) return assetByCategoryAndName

    const assetByCategoryAndFilename = assets.find(
      (asset) =>
        normalizeImportValue(asset.category) === normalizedCategory &&
        normalizeImportValue(stripFileExtension(asset.filename)) ===
          normalizedName
    )
    if (assetByCategoryAndFilename) return assetByCategoryAndFilename
  }

  if (normalizedName) {
    const uniqueNameMatches = assets.filter(
      (asset) => normalizeImportValue(asset.name) === normalizedName
    )
    if (uniqueNameMatches.length === 1) return uniqueNameMatches[0]
  }

  return undefined
}

function createImportedPages(previewPages: ImportPagePreview[]) {
  return previewPages.map((page) => ({
    id: crypto.randomUUID(),
    name: page.name,
    sections: page.sections.map((section) => ({
      id: crypto.randomUUID(),
      assetId: section.asset?.id ?? createUnresolvedAssetId(section.request),
      unresolved: section.asset
        ? undefined
        : {
            assetId: section.request.assetId,
            category: section.request.category,
            name: section.request.name,
            source: section.request.source,
          },
    })),
  }))
}

function createUnresolvedAssetId(request: ImportSectionRequest) {
  const identifier =
    request.assetId ??
    [request.category, request.name].filter(Boolean).join(' ')
  const normalizedIdentifier = normalizeImportValue(
    identifier || request.source
  )
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9:-]/g, '')

  return `unresolved:${normalizedIdentifier || 'section'}`
}

function getUniquePageName(name: string, existingNames: Set<string>) {
  if (!existingNames.has(name)) return name

  let index = 2
  let nextName = `${name} (${index})`
  while (existingNames.has(nextName)) {
    index += 1
    nextName = `${name} (${index})`
  }

  return nextName
}

function normalizeImportValue(value: string) {
  return stripFileExtension(value)
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, ' ')
}

function stripFileExtension(value: string) {
  return value.replace(/\.[a-z0-9]+$/i, '')
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
  sectionId,
  asset,
  sectionName,
  unresolvedLabel,
  selected,
  dragging,
  dragOffsetY,
  isFirst,
  isLast,
  onSelect,
  onDragHandlePointerDown,
  onDragHandlePointerMove,
  onDragHandlePointerEnd,
  onMoveUp,
  onMoveDown,
  onRemove,
}: {
  sectionId: string
  asset?: PageBuilderAsset
  sectionName: string
  unresolvedLabel?: string
  selected: boolean
  dragging: boolean
  dragOffsetY: number
  isFirst: boolean
  isLast: boolean
  onSelect: () => void
  onDragHandlePointerDown: (event: ReactPointerEvent<HTMLButtonElement>) => void
  onDragHandlePointerMove: (event: ReactPointerEvent<HTMLButtonElement>) => void
  onDragHandlePointerEnd: (event: ReactPointerEvent<HTMLButtonElement>) => void
  onMoveUp: () => void
  onMoveDown: () => void
  onRemove: () => void
}) {
  return (
    <div
      data-page-builder-section-id={sectionId}
      className={`group relative border-b last:border-b-0 ${
        selected
          ? `z-10 ring-2 ring-purple-500 ${dragging ? 'shadow-lg' : ''}`
          : 'hover:ring-2 hover:ring-purple-500/20'
      }`}
      style={{
        transform: dragging ? `translateY(${dragOffsetY}px)` : undefined,
      }}
      onClick={(event) => {
        event.stopPropagation()
        onSelect()
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
            {unresolvedLabel
              ? `Unresolved import request: ${unresolvedLabel}`
              : 'This saved section references an asset that is no longer available.'}
          </p>
        </div>
      )}
      {selected && (
        <>
          <button
            type='button'
            aria-label='Drag section to reorder'
            className='absolute top-1/2 left-0 flex h-11 w-7 -translate-x-1/2 -translate-y-1/2 cursor-grab touch-none items-center justify-center rounded-md bg-purple-600 text-white shadow-sm ring-2 ring-background active:cursor-grabbing'
            onClick={(event) => event.stopPropagation()}
            onPointerDown={(event) => {
              event.stopPropagation()
              onDragHandlePointerDown(event)
            }}
            onPointerMove={(event) => {
              event.stopPropagation()
              onDragHandlePointerMove(event)
            }}
            onPointerUp={(event) => {
              event.stopPropagation()
              onDragHandlePointerEnd(event)
            }}
            onPointerCancel={(event) => {
              event.stopPropagation()
              onDragHandlePointerEnd(event)
            }}
          >
            <GripVertical className='size-4' />
          </button>
          <div
            className='absolute top-3 right-3 flex items-center gap-1 rounded-md border border-purple-300 bg-background/95 p-1 shadow-sm'
            onClick={(event) => event.stopPropagation()}
          >
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
