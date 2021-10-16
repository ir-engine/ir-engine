export const loadRoute = async (project: string, route: string) => {
  const { default: getPage } = await import(`./projects/${project}/routes.tsx`)
  return getPage(route)
}
