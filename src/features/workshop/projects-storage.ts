export type WorkshopProject = {
  id: string
  name: string
  createdAt: string
  updatedAt: string
}

const PROJECTS_STORAGE_KEY = 'workshop:projects:v1'

function readStoredProjects(): WorkshopProject[] {
  if (typeof window === 'undefined') return []

  try {
    const rawProjects = window.localStorage.getItem(PROJECTS_STORAGE_KEY)
    if (!rawProjects) return []

    const parsed = JSON.parse(rawProjects)
    if (!Array.isArray(parsed)) return []

    return parsed.filter(isWorkshopProject)
  } catch {
    return []
  }
}

function writeStoredProjects(projects: WorkshopProject[]) {
  window.localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(projects))
}

function isWorkshopProject(project: unknown): project is WorkshopProject {
  if (!project || typeof project !== 'object') return false

  const value = project as Record<string, unknown>
  return (
    typeof value.id === 'string' &&
    typeof value.name === 'string' &&
    typeof value.createdAt === 'string' &&
    typeof value.updatedAt === 'string'
  )
}

export function listProjects() {
  return readStoredProjects().sort(
    (a, b) =>
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  )
}

export function getProject(projectId: string) {
  return readStoredProjects().find((project) => project.id === projectId)
}

export function createProject(name: string) {
  const now = new Date().toISOString()
  const project: WorkshopProject = {
    id: crypto.randomUUID(),
    name: name.trim(),
    createdAt: now,
    updatedAt: now,
  }

  writeStoredProjects([project, ...readStoredProjects()])
  return project
}

export function renameProject(projectId: string, name: string) {
  const nextName = name.trim()
  const now = new Date().toISOString()
  const projects = readStoredProjects()
  const nextProjects = projects.map((project) =>
    project.id === projectId
      ? { ...project, name: nextName, updatedAt: now }
      : project
  )

  writeStoredProjects(nextProjects)
  return nextProjects.find((project) => project.id === projectId)
}

export function deleteProject(projectId: string) {
  writeStoredProjects(
    readStoredProjects().filter((project) => project.id !== projectId)
  )
}
