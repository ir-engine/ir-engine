import { ProjectInterface } from '@xrengine/common/src/interfaces/ProjectInterface'
import { client } from '@xrengine/client-core/src/feathers'

/**
 * getProjects used to get list projects created by user.
 *
 * @return {Promise}
 */
export const getProjects = async (): Promise<ProjectInterface[]> => {
  try {
    const { data } = await client.service('project').find()
    return data
  } catch (error) {
    console.log('Error in Getting Project:' + error)
    throw new Error(error)
  }
}
