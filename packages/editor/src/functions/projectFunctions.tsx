import { client } from '@xrengine/client-core/src/feathers'
import { ProjectInterface } from '@xrengine/common/src/interfaces/ProjectInterface'

/**
 * Gets a list of projects installed
 * @returns {ProjectInterface[]}
 */
export const getProjects = async (): Promise<ProjectInterface[]> => {
  try {
    const { data } = await client.service('project').find()
    return data
  } catch (error) {
    throw new Error(error)
  }
}

/**
 * Saves a project
 * @param projectName
 */
export const saveProject = async (projectName: string) => {
  try {
    await client.service('project').patch(projectName)
  } catch (error) {
    console.log('Error saving project', projectName)
    throw new Error(error)
  }
}
