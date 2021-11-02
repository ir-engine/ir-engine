import config from '../../appconfig'
import { SceneDetailData, SceneDetailInterface } from '@xrengine/common/src/interfaces/SceneInterface'
import { BlobStore } from '../../media/storageprovider/storageprovider.interface'

// export function mapSceneData(scene: any, projectId: string): SceneDetailData {
//   if (!scene) {
//     return null
//   }
//   const selectedSceneData = {
//     ...scene,
//     sceneId: scene?.sid,
//     scene_id: projectId,
//     url: `${config.server.hub.endpoint}/scene/${scene.slug as string}`,
//     model_url: scene?.model_owned_file?.url,
//     screenshot_url: scene?.screenshot_owned_file?.url
//   }
//   delete selectedSceneData.model_owned_file
//   delete selectedSceneData.screenshot_owned_file
//   delete selectedSceneData.scene_owned_file
//   return selectedSceneData
// }
// export function defaultSceneImport(models: any): any[] {
//   const includedEntities = [
//     {
//       model: models.static_resource,
//       as: 'thumbnail_owned_file',
//       attributes: ['url']
//     }
//   ]
//   return includedEntities
// }

export function readJSONFromBlobStore(storage: BlobStore, key): any {
  return new Promise((resolve, reject) => {
    const chunks = []
    storage
      .createReadStream({
        key
      })
      .on('data', (data: any) => {
        chunks.push(data.toString())
      })
      .on('end', () => {
        try {
          const json = JSON.parse(chunks.join(''))
          resolve(json)
        } catch (error) {
          console.log('Failed to parse JSON', error, chunks)
          reject()
        }
      })
      .on('error', reject)
  })
}

// export function mapSceneDetailData(project: any): SceneDetailInterface {
//   const _proj = {
//     name: project.name,
//     parent_scene: mapSceneData(project?.parent_scene_listing || project?.parent_scene, project.sid),
//     scene_id: project.sid,
//     scene_url: project?.url,
//     scene: mapSceneData(project.scene, project.sid),
//     thumbnailUrl: project?.thumbnail_owned_file?.url,
//     ownedFileIds: project?.ownedFileIds
//   } as any
//   return _proj
// }

// export function mapSceneTemplateDetailData(projectTemplate: any): any {
//   const selectedSceneData = {
//     ...projectTemplate,
//     sceneId: null,
//     scene_id: projectTemplate.sid,
//     url: null,
//     model_url: null,
//     screenshot_url: projectTemplate?.thumbnail_file?.url
//   }

//   const _proj = {
//     name: projectTemplate.name,
//     parent_scene: null,
//     scene_id: projectTemplate.sid,
//     scene_url: null,
//     scenes: [selectedSceneData],
//     thumbnailUrl: projectTemplate?.thumbnail_file?.url
//   }
//   return _proj
// }
