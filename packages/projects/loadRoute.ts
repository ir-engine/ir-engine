export type RoutesInterface = {
  project: string
  routes: string[]
}

export type DynamicImportPromise = Promise<{ default: (props: any) => JSX.Element | JSX.ElementClass }>

export type RoutePageInterface = {
  route: string
  page: DynamicImportPromise
}

export const loadRoute = async (routesToLoad: RoutesInterface) => {
  const pages: RoutePageInterface[] = []
  const { default: getPage } = await import(`./projects/${routesToLoad.project}/routes.tsx`)
  for (const route of routesToLoad.routes) {
    // TODO: rename packs to project
    pages.push(...getPage(route))
  }
  return pages
}
