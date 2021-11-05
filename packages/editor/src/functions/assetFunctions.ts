import { client } from '@xrengine/client-core/src/feathers'
import { MathUtils } from 'three'

export const uploadProjectAsset = async (projectName: string, blob: Blob, assetType = 'asset') => {
  console.log(projectName, blob, assetType)
  return await client
    .service('file-browser')
    .patch(`projects/${projectName}/assets/${MathUtils.generateUUID()}.${assetType}.`, {
      body: await blob.arrayBuffer(),
      contentType: blob.type
    })
}
