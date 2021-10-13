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
  for (const route of routesToLoad.routes) {
    // TODO: rename packs to project
    const { default: getPage } = await import(`./projects/${routesToLoad.project}/routes.tsx`)
    // const page = {
    //   route: route,
    //   page:
    // }
    pages.push(getPage(route))
  }
  return pages
}
