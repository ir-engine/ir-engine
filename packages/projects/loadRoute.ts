export type DynamicImportPromise = Promise<{ default: (props: any) => JSX.Element | JSX.ElementClass }>

export type RoutePageInterface = {
  route: string
  page: DynamicImportPromise
}

export const loadRoute = async (project: string, route: string) => {
  const { default: getPage } = await import(`./projects/${project}/routes.tsx`)
  return getPage(route)
}
