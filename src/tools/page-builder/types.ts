export type PageBuilderAsset = {
  id: string
  category: string
  filename: string
  name: string
  imagePath: string
}

export type PageBuilderSectionInstance = {
  id: string
  assetId: string
}

export type PageBuilderPageModel = {
  id: string
  name: string
  sections: PageBuilderSectionInstance[]
}

export type PageBuilderDocument = {
  activePageId: string
  pages: PageBuilderPageModel[]
}
