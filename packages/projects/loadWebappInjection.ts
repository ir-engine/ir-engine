import { loadConfigForProject } from './loadConfigForProject'

export const loadWebappInjection = async (projects: string[]) => {
  return (
    await Promise.all(
      projects.map(async (project) => {
        try {
          const projectConfig = (await loadConfigForProject(project))!
          if (typeof projectConfig.webappInjection !== 'function') return null!
          return (await projectConfig.webappInjection()).default
        } catch (e) {
          console.log(`Failed to import world load event for project ${project} with reason ${e}`)
          return null!
        }
      })
    )
  ).filter(($) => !!$)
}
