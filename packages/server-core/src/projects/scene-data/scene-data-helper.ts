import { ProjectType, projectPath } from '@etherealengine/engine/src/schemas/projects/project.schema'
import { SceneDataType } from '@etherealengine/engine/src/schemas/projects/scene.schema'
import { Application, Paginated } from '@feathersjs/feathers'
import logger from '../../ServerLogger'
import { getStorageProvider } from '../../media/storageprovider/storageprovider'
import { getSceneData } from '../scene/scene-helper'
import { SceneDataParams } from './scene-data.class'

export const getScenesForProject = async (app: Application, params?: SceneDataParams) => {
  const storageProvider = getStorageProvider(params?.query?.storageProviderName)
  const projectName = params?.projectName
  const metadataOnly = params?.metadataOnly
  const internal = params?.internal
  try {
    const project = (await app
      .service(projectPath)
      .find({ ...params, query: { name: projectName, $limit: 1 } })) as Paginated<ProjectType>
    if (project.data.length === 0) throw new Error(`No project named ${projectName} exists`)

    const newSceneJsonPath = `projects/${projectName}/`

    const fileResults = await storageProvider.listObjects(newSceneJsonPath, false)
    const files = fileResults.Contents.map((dirent) => dirent.Key)
      .filter((name) => name.endsWith('.scene.json'))
      .map((name) => name.slice(0, -'.scene.json'.length))

    const sceneData: SceneDataType[] = await Promise.all(
      files.map(async (sceneName) =>
        getSceneData(projectName!, sceneName.replace(newSceneJsonPath, ''), metadataOnly, internal)
      )
    )

    return { data: sceneData }
  } catch (e) {
    logger.error(e)
    return { data: [] as SceneDataType[] }
  }
}
