import { useEffect } from 'react'

import { Engine } from '../../ecs/classes/Engine'
import { defineQuery, getComponent, removeQuery } from '../../ecs/functions/ComponentFunctions'
import { defineSystem } from '../../ecs/functions/SystemFunctions'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { AmbientLightComponent } from '../components/AmbientLightComponent'
import { DirectionalLightComponent } from '../components/DirectionalLightComponent'
import { HemisphereLightComponent } from '../components/HemisphereLightComponent'
import { PointLightComponent } from '../components/PointLightComponent'
import { SelectTagComponent } from '../components/SelectTagComponent'
import { SpotLightComponent } from '../components/SpotLightComponent'
import { VisibleComponent } from '../components/VisibleComponent'

export const LightPrefabs = {
  directionalLight: 'Directional Light' as const,
  hemisphereLight: 'Hemisphere Light' as const,
  ambientLight: 'Ambient Light' as const,
  pointLight: 'Point Light' as const,
  spotLight: 'Spot Light' as const
}

const directionalLightSelectQuery = defineQuery([TransformComponent, DirectionalLightComponent, SelectTagComponent])

const execute = () => {
  for (const entity of directionalLightSelectQuery()) {
    const helper = getComponent(entity, DirectionalLightComponent)?.helper
    if (helper) helper.update()
    // light.cameraHelper.update()
  }
}

const reactor = () => {
  useEffect(() => {
    Engine.instance.scenePrefabRegistry.set(LightPrefabs.directionalLight, [
      { name: VisibleComponent.jsonID },
      { name: TransformComponent.jsonID },
      { name: DirectionalLightComponent.jsonID }
    ])

    Engine.instance.scenePrefabRegistry.set(LightPrefabs.hemisphereLight, [
      { name: VisibleComponent.jsonID },
      { name: HemisphereLightComponent.jsonID }
    ])

    Engine.instance.scenePrefabRegistry.set(LightPrefabs.ambientLight, [
      { name: VisibleComponent.jsonID },
      { name: AmbientLightComponent.jsonID }
    ])

    Engine.instance.scenePrefabRegistry.set(LightPrefabs.pointLight, [
      { name: TransformComponent.jsonID },
      { name: VisibleComponent.jsonID },
      { name: PointLightComponent.jsonID }
    ])

    Engine.instance.scenePrefabRegistry.set(LightPrefabs.spotLight, [
      { name: TransformComponent.jsonID },
      { name: VisibleComponent.jsonID },
      { name: SpotLightComponent.jsonID }
    ])
    return () => {
      Engine.instance.scenePrefabRegistry.delete(LightPrefabs.directionalLight)
      Engine.instance.scenePrefabRegistry.delete(LightPrefabs.hemisphereLight)
      Engine.instance.scenePrefabRegistry.delete(LightPrefabs.ambientLight)
      Engine.instance.scenePrefabRegistry.delete(LightPrefabs.pointLight)
      Engine.instance.scenePrefabRegistry.delete(LightPrefabs.spotLight)
    }
  }, [])
  return null
}

export const LightSystem = defineSystem({
  uuid: 'ee.engine.LightSystem',
  execute,
  reactor
})
