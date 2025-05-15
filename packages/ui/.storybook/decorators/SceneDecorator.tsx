import { LocationState } from '@ir-engine/client-core/src/social/services/LocationService'
import * as ECS from '@ir-engine/ecs'
import { SceneState } from '@ir-engine/engine/src/gltf/GLTFState'
import { getMutableState, getState } from '@ir-engine/hyperflux'
import { ReferenceSpaceState, TransformComponent } from '@ir-engine/spatial'
import { useEffect } from 'react'
import { Euler, Quaternion, Vector3 } from 'three'

export default function SceneDecorator({ sceneName }: { sceneName?: string }) {
  console.log({ sceneName })
  useEffect(() => {
    getMutableState(LocationState).currentLocation.location.sceneId.set(1 as any)
    getMutableState(LocationState).currentLocation.location.sceneURL.set('default.gltf')
    const viewerEntity = getState(ReferenceSpaceState).viewerEntity
    ECS.setComponent(viewerEntity, TransformComponent, {
      position: new Vector3(0, 2, 0),
      rotation: new Quaternion().setFromEuler(new Euler(0, Math.PI, 0))
    })

    const unload = SceneState.loadScene(sceneName as any, 1 as any, viewerEntity)
    return () => {
      if (!ECS.Engine.instance) return
      getMutableState(LocationState).currentLocation.location.sceneId.set('')
      getMutableState(LocationState).currentLocation.location.sceneURL.set('')
      unload()
    }
  }, [])
  return null
}
