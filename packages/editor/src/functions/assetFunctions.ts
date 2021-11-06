import { client } from '@xrengine/client-core/src/feathers'
import { MathUtils } from 'three'

export const uploadProjectAsset = async (projectName: string, files: File[], assetType = 'asset') => {
  // console.log(projectName, files, assetType)
  const promises = []
  for (const file of files) {
    const pathName = `projects/${projectName}/assets/${file.name}`
    promises.push(
      client.service('file-browser').patch(pathName, {
        body: await file.arrayBuffer(),
        contentType: file.type
      })
    )
  }
  const responses = await Promise.all(promises)
  // console.log(responses)
  return responses
}
