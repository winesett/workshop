import { type PageBuilderDocument, type PageBuilderPageModel } from '../types'

const PAGE_BUILDER_STORAGE_KEY = 'workshop:page-builder:v1'

function createPage(name = 'Home'): PageBuilderPageModel {
  return {
    id: crypto.randomUUID(),
    name,
    sections: [],
  }
}

export function createDefaultDocument(): PageBuilderDocument {
  const homePage = createPage()
  return {
    activePageId: homePage.id,
    pages: [homePage],
  }
}

function isDocument(value: unknown): value is PageBuilderDocument {
  if (!value || typeof value !== 'object') return false

  const document = value as Record<string, unknown>
  if (typeof document.activePageId !== 'string') return false
  if (!Array.isArray(document.pages) || document.pages.length === 0) {
    return false
  }

  return document.pages.every((page) => {
    if (!page || typeof page !== 'object') return false
    const pageValue = page as Record<string, unknown>
    return (
      typeof pageValue.id === 'string' &&
      typeof pageValue.name === 'string' &&
      Array.isArray(pageValue.sections) &&
      pageValue.sections.every((section) => {
        if (!section || typeof section !== 'object') return false
        const sectionValue = section as Record<string, unknown>
        const unresolved = sectionValue.unresolved
        const hasValidUnresolved =
          unresolved === undefined ||
          (typeof unresolved === 'object' &&
            unresolved !== null &&
            typeof (unresolved as Record<string, unknown>).source === 'string')

        return (
          typeof sectionValue.id === 'string' &&
          typeof sectionValue.assetId === 'string' &&
          hasValidUnresolved
        )
      })
    )
  })
}

export function loadPageBuilderDocument(): PageBuilderDocument {
  if (typeof window === 'undefined') return createDefaultDocument()

  try {
    const rawDocument = window.localStorage.getItem(PAGE_BUILDER_STORAGE_KEY)
    if (!rawDocument) return createDefaultDocument()

    const parsedDocument = JSON.parse(rawDocument)
    if (!isDocument(parsedDocument)) return createDefaultDocument()

    const activePageExists = parsedDocument.pages.some(
      (page) => page.id === parsedDocument.activePageId
    )

    return activePageExists
      ? parsedDocument
      : {
          ...parsedDocument,
          activePageId: parsedDocument.pages[0].id,
        }
  } catch {
    return createDefaultDocument()
  }
}

export function savePageBuilderDocument(document: PageBuilderDocument) {
  window.localStorage.setItem(
    PAGE_BUILDER_STORAGE_KEY,
    JSON.stringify(document)
  )
}

export function createBlankPage(name: string): PageBuilderPageModel {
  return createPage(name)
}
