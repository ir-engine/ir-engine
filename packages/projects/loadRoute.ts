import { ProjectConfigInterface } from './ProjectConfigInterface'
import { lazy } from 'react'
interface RouteData {
  component: ReturnType<typeof lazy>
  props: any
}

export const loadRoute = async (project: string, route: string): Promise<RouteData> => {
  try {
    const projectConfig = (await import(`./projects/${project}/xrengine.config.ts`)).default as ProjectConfigInterface
    if (!projectConfig.routes![route]) return null!
    return {
      component: lazy(projectConfig.routes![route].component),
      props: projectConfig.routes![route].props
    }
  } catch (e) {
    console.log(`Failed to import route ${route} for project ${project} with reason ${e}`)
    return null!
  }
}
