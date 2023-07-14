/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

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
