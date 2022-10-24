import { lazy } from 'react'

import { loadConfigForProject } from './loadConfigForProject'

interface RouteData {
  component: ReturnType<typeof lazy>
  props: any
}

export const loadRoute = async (project: string, route: string): Promise<RouteData | null> => {
  try {
    const projectConfig = (await loadConfigForProject(project))!
    if (!projectConfig.routes || !projectConfig.routes[route]) return null
    return {
      component: lazy(projectConfig.routes[route].component),
      props: projectConfig.routes![route].props
    }
  } catch (e) {
    console.log(`Failed to import route ${route} for project ${project} with reason ${e}`)
    return null!
  }
}
