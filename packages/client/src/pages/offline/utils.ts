import { useDispatch } from '@xrengine/client-core/src/store'
import { corsProxyPath } from '@xrengine/client-core/src/util/config'
import { SceneAction } from '@xrengine/client-core/src/world/services/SceneService'
import { SceneJson } from '@xrengine/common/src/interfaces/SceneInterface'

const sceneRelativePathIdentifier = '__$project$__'
const sceneCorsPathIdentifier = '__$cors-proxy$__'
const fileServer = process.env[`VITE_FILE_SERVER`] ?? `https://localhost:8642`
const corsPath = process.env[`VITE_CORS_SERVER_PORT`] ? corsProxyPath : `https://localhost:3029`

const parseSceneDataCacheURLsLocal = (projectName: string, sceneData: any) => {
  for (const [key, val] of Object.entries(sceneData)) {
    if (val && typeof val === 'object') {
      sceneData[key] = parseSceneDataCacheURLsLocal(projectName, val)
    }
    if (typeof val === 'string') {
      if (val.includes(sceneRelativePathIdentifier)) {
        sceneData[key] = `${fileServer}/projects` + sceneData[key].replace(sceneRelativePathIdentifier, '')
      }
      if (val.startsWith(sceneCorsPathIdentifier)) {
        sceneData[key] = sceneData[key].replace(sceneCorsPathIdentifier, corsPath)
      }
    }
  }
  return sceneData
}

export const loadSceneJsonOffline = async (projectName, sceneName) => {
  const dispatch = useDispatch()
  const locationName = `${projectName}/${sceneName}`
  const sceneData = (await (await fetch(`${fileServer}/projects/${locationName}.scene.json`)).json()) as SceneJson
  dispatch(
    SceneAction.currentSceneChanged({
      scene: parseSceneDataCacheURLsLocal(projectName, sceneData),
      name: sceneName,
      thumbnailUrl: `${fileServer}/projects/${locationName}.thumbnail.jpeg`,
      project: projectName
    })
  )
}
