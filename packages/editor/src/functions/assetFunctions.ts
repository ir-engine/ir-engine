import { client } from '@xrengine/client-core/src/feathers'
import { upload } from '@xrengine/client-core/src/util/upload'

export const uploadProjectAsset = async (
  projectName: string,
  files: File[],
  onProgress?
): Promise<{ url: string }[]> => {
  const promises = []
  for (const file of files) {
    const pathName = `projects/${projectName}/assets`
    promises.push(
      new Promise(async (resolve) => {
        await upload(file, onProgress, null, pathName, file.name)
        const response = await client.service('project').patch(projectName, {
          files: [`${pathName}/${file.name}`]
        })
        console.log(response)
        resolve({ url: response[0] })
      })
    )
  }
  return await Promise.all(promises)
}
