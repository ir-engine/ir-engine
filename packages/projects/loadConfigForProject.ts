import { lazy } from 'react'

import type { ProjectConfigInterface } from './ProjectConfigInterface'

export const loadConfigForProject = async (project: string): Promise<ProjectConfigInterface | null> => {
  try {
    const projectConfig = (await import(`./projects/${project}/xrengine.config.ts`)).default as ProjectConfigInterface
    return projectConfig
  } catch (e) {
    console.log(`Failed to import config for project ${project} with reason ${e}`)
    return null!
  }
}
