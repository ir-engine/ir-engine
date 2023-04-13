import { useEffect } from 'react'

import { createActionQueue, getMutableState, removeActionQueue } from '@etherealengine/hyperflux'

import { Engine } from '../../ecs/classes/Engine'
import { EngineActions, EngineState } from '../../ecs/classes/EngineState'
import { defineSystem } from '../../ecs/functions/SystemFunctions'
import { PortalComponent, SCENE_COMPONENT_PORTAL } from '../components/PortalComponent'
import { revertAvatarToMovingStateFromTeleport } from '../functions/loaders/PortalFunctions'
import { defaultSpatialComponents, ScenePrefabs } from './SceneObjectUpdateSystem'

const sceneLoadedQueue = createActionQueue(EngineActions.sceneLoaded.matches)

const execute = () => {
  if (sceneLoadedQueue().length && getMutableState(EngineState).isTeleporting.value)
    revertAvatarToMovingStateFromTeleport()
}

const reactor = () => {
  useEffect(() => {
    Engine.instance.scenePrefabRegistry.set(ScenePrefabs.portal, [
      ...defaultSpatialComponents,
      { name: SCENE_COMPONENT_PORTAL, props: {} }
    ])

    Engine.instance.sceneComponentRegistry.set(PortalComponent.name, SCENE_COMPONENT_PORTAL)
    Engine.instance.sceneLoadingRegistry.set(SCENE_COMPONENT_PORTAL, {})

    return () => {
      Engine.instance.scenePrefabRegistry.delete(ScenePrefabs.portal)

      Engine.instance.sceneLoadingRegistry.delete(SCENE_COMPONENT_PORTAL)
      Engine.instance.sceneComponentRegistry.delete(PortalComponent.name)

      removeActionQueue(sceneLoadedQueue)
    }
  }, [])
  return null
}

export const PortalSystem = defineSystem({
  uuid: 'ee.engine.PortalSystem',
  execute,
  reactor
})
