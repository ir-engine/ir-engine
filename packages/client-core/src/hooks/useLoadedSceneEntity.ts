import { staticResourcePath } from '@ir-engine/common/src/schema.type.module'
import { GLTFAssetState } from '@ir-engine/engine/src/gltf/GLTFState'
import { useMutableState } from '@ir-engine/hyperflux'
import { useGet } from '@ir-engine/spatial/src/common/functions/FeathersHooks'

export const useLoadedSceneEntity = (sceneID: string | undefined) => {
  const scene = useGet(staticResourcePath, sceneID).data
  const scenes = useMutableState(GLTFAssetState)
  const sceneKey = scene?.url
  return sceneKey ? scenes[sceneKey].value : null
}
