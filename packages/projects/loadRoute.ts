export const loadRoute = async (project: string, route: string) => {
  try {
    const { default: getPage } = await import(`./projects/${project}/routes.tsx`)
    return getPage(route) ?? []
  } catch (e) {
    console.log(`Failed to import route ${route} for project ${project} with reason ${e}`)
  }
  return []
}
