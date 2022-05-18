export interface ActiveRoutesInterface {
  id: string
  project: string
  route: string
}

export interface InstalledRoutesInterface {
  id?: string
  routes: string[]
  project: string
}
