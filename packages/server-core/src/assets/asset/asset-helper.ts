import { AssetDataType, ProjectType, assetPath } from '@etherealengine/common/src/schema.type.module'
import { getDateTimeSql } from '@etherealengine/common/src/utils/datetime-sql'
import { v4 } from 'uuid'
import { Application } from '../../../declarations'
import { getStorageProvider } from '../../media/storageprovider/storageprovider'

export const syncAllSceneJSONAssets = async (projects: ProjectType[], app: Application) => {
  const knex = app.get('knexClient')
  const now = await getDateTimeSql()
  const storageProvider = getStorageProvider()
  const assets = await app.service(assetPath).find()

  const sceneJSONAssetsData = (
    await Promise.all(
      projects.map(async (project) => {
        const projectPath = `projects/${project.name}`
        const projectAssets = (await storageProvider.listObjects(projectPath, false)).Contents.map(({ Key }) => Key)
        const sceneJSONAssets = projectAssets.filter(
          (asset) =>
            asset.endsWith('.scene.json') && !assets.data.find((item: AssetDataType) => item.assetURL === asset)
        )
        if (!sceneJSONAssets.length) return
        return sceneJSONAssets.map((asset) => ({
          id: v4(),
          assetURL: asset,
          projectId: project.id,
          thumbnailURL: asset.replace('.scene.json', '.thumbnail.jpg'),
          createdAt: now,
          updatedAt: now
        }))
      })
    )
  )
    .flat()
    .filter(Boolean)

  await knex(assetPath).insert(sceneJSONAssetsData)
}
