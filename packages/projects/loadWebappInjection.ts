import { ProjectConfigInterface } from './ProjectConfigInterface'

export const loadWebappInjection = async (props: any, projects: string[]) => {
  return Promise.all(
    projects
      .map(async (project) => {
        try {
          const projectConfig = (await import(`./projects/${project}/xrengine.config.ts`))
            .default as ProjectConfigInterface
          if (typeof projectConfig.webappInjection !== 'function') return null!
          return (await projectConfig.webappInjection()).default(props)
        } catch (e) {
          console.log(`Failed to import world load event for project ${project} with reason ${e}`)
          return null!
        }
      })
      .filter(($) => !!$)
  )
}
