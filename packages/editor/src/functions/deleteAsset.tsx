import { client } from '@xrengine/client-core/src/feathers'
import { ProjectManager } from '../managers/ProjectManager'

/**
 * deleteAsset used to delete existing asset using assetId.
 *
 * @author Robert Long
 * @author Abhishek Pathak
 * @param  {any}  assetId
 * @return {Promise}               [true if deleted successfully else throw error]
 */
export const deleteAsset = async (assetId, projectid?, fileidentifier?): Promise<any> => {
  const headers = {
    assetId: assetId
  }
  if (projectid) headers['projectid'] = projectid

  if (fileidentifier) headers['fileidentifier'] = fileidentifier
  try {
    const response = await client.service('static-resource').remove(assetId, { headers })
    console.log('Response: ' + Object.values(response))
  } catch (error) {
    console.log("Can't Delete Asset" + error)
    throw new Error(error)
  }
  return true
}
