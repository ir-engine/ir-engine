import { useEffect } from 'react'

import { defineActionQueue, getState } from '@etherealengine/hyperflux'

import { Engine } from '../../ecs/classes/Engine'
import { EngineActions, EngineState } from '../../ecs/classes/EngineState'
import { defineSystem } from '../../ecs/functions/SystemFunctions'
import { PortalComponent } from '../components/PortalComponent'
import { revertAvatarToMovingStateFromTeleport } from '../functions/loaders/PortalFunctions'
import { HyperspacePortalSystem } from './HyperspacePortalSystem'
import { PortalLoadSystem } from './PortalLoadSystem'
import { defaultSpatialComponents, ScenePrefabs } from './SceneObjectUpdateSystem'

const sceneLoadedQueue = defineActionQueue(EngineActions.sceneLoaded.matches)

const execute = () => {
  if (sceneLoadedQueue().length && getState(EngineState).isTeleporting) revertAvatarToMovingStateFromTeleport()
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
