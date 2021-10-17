import { ProjectManager } from '../managers/ProjectManager'

/**
 * getScene used to Calling api to get scene data using id.
 *
 * @author Robert Long
 * @author Abhishek Pathak
 */
export const getScene = async (sceneId): Promise<JSON> => {
  let json
  try {
    json = await ProjectManager.instance.feathersClient.service('scene').get(sceneId)
  } catch (error) {
    console.log("Can't get URL from id" + error)
    throw new Error(error)
  }
  return json.scenes[0]
}
