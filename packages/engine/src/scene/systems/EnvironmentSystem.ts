import { useEffect } from 'react'

import { getMutableState, useHookstate } from '@etherealengine/hyperflux'

import { Engine } from '../../ecs/classes/Engine'
import { SceneState } from '../../ecs/classes/Scene'
import { defineSystem } from '../../ecs/functions/SystemFunctions'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { XRState } from '../../xr/XRState'
import { EnvMapBakeComponent } from '../components/EnvMapBakeComponent'
import { SkyboxComponent } from '../components/SkyboxComponent'
import { VisibleComponent } from '../components/VisibleComponent'
import { ScenePrefabs } from './SceneObjectUpdateSystem'

const reactor = () => {
  const background = useHookstate(getMutableState(SceneState).background)
  const sessionMode = useHookstate(getMutableState(XRState).sessionMode)

  useEffect(() => {
    Engine.instance.scene.background = sessionMode.value === 'immersive-ar' ? null : background.value
  }, [background, sessionMode])

  useEffect(() => {
    Engine.instance.scenePrefabRegistry.set(ScenePrefabs.skybox, [
      { name: VisibleComponent.jsonID },
      { name: SkyboxComponent.jsonID }
    ])

    Engine.instance.scenePrefabRegistry.set(ScenePrefabs.envMapbake, [
      { name: TransformComponent.jsonID },
      { name: VisibleComponent.jsonID },
      { name: EnvMapBakeComponent.jsonID }
    ])

    return () => {
      Engine.instance.scenePrefabRegistry.delete(ScenePrefabs.skybox)

      Engine.instance.scenePrefabRegistry.delete(ScenePrefabs.envMapbake)
    }
  }, [])
  return null
}

export const EnvironmentSystem = defineSystem({
  uuid: 'ee.engine.EnvironmentSystem',
  execute: () => {},
  reactor
})
