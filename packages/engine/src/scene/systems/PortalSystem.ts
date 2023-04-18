import { useEffect } from 'react'

import { createActionQueue, getMutableState, removeActionQueue } from '@etherealengine/hyperflux'

import { Engine } from '../../ecs/classes/Engine'
import { EngineActions, EngineState } from '../../ecs/classes/EngineState'
import { defineSystem } from '../../ecs/functions/SystemFunctions'
import { PortalComponent } from '../components/PortalComponent'
import { revertAvatarToMovingStateFromTeleport } from '../functions/loaders/PortalFunctions'
import { HyperspacePortalSystem } from './HyperspacePortalSystem'
import { PortalLoadSystem } from './PortalLoadSystem'
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
      { name: PortalComponent.jsonID }
    ])

    return () => {
      Engine.instance.scenePrefabRegistry.delete(ScenePrefabs.portal)
    }
  }, [])
  return null
}

export const PortalSystem = defineSystem({
  uuid: 'ee.engine.PortalSystem',
  execute,
  reactor,
  subSystems: [PortalLoadSystem, HyperspacePortalSystem]
})
