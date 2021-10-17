import { ProjectManager } from '../managers/ProjectManager'

/**
 * deleteProjectAsset used to delete asset for specific project.
 *
 * @author Robert Long
 * @author Abhishek Pathak
 * @param  {any}  projectId
 * @param  {any}  assetId
 * @return {Promise}               [true if deleted successfully else throw error]
 */
export const deleteProjectAsset = async (projectId, assetId): Promise<any> => {
  try {
    const response = await (ProjectManager.instance.feathersClient.service('scene') as any).remove({
      projectId,
      assetId
    })
    console.log('Response: ' + Object.values(response))
  } catch (error) {
    console.log("Can't Delete Project Asset" + error)
    throw new Error(error)
  }
  return true
}
