import { createActionQueue, getMutableState, removeActionQueue } from '@etherealengine/hyperflux'

import { Engine } from '../../ecs/classes/Engine'
import { EngineActions, EngineState } from '../../ecs/classes/EngineState'
import { PortalComponent, SCENE_COMPONENT_PORTAL } from '../components/PortalComponent'
import { revertAvatarToMovingStateFromTeleport } from '../functions/loaders/PortalFunctions'
import { defaultSpatialComponents, ScenePrefabs } from './SceneObjectUpdateSystem'

export default async function PortalSystem() {
  Engine.instance.scenePrefabRegistry.set(ScenePrefabs.portal, [
    ...defaultSpatialComponents,
    { name: SCENE_COMPONENT_PORTAL, props: {} }
  ])

  Engine.instance.sceneComponentRegistry.set(PortalComponent.name, SCENE_COMPONENT_PORTAL)
  Engine.instance.sceneLoadingRegistry.set(SCENE_COMPONENT_PORTAL, {})

  const sceneLoadedQueue = createActionQueue(EngineActions.sceneLoaded.matches)
  const execute = () => {
    if (sceneLoadedQueue().length && getMutableState(EngineState).isTeleporting.value)
      revertAvatarToMovingStateFromTeleport()
  }

  const cleanup = async () => {
    Engine.instance.scenePrefabRegistry.delete(ScenePrefabs.portal)

    Engine.instance.sceneLoadingRegistry.delete(SCENE_COMPONENT_PORTAL)
    Engine.instance.sceneComponentRegistry.delete(PortalComponent.name)

    removeActionQueue(sceneLoadedQueue)
  }

  return { execute, cleanup }
}
