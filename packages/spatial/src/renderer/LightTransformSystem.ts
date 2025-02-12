/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2023 
Infinite Reality Engine. All Rights Reserved.
*/

import { defineQuery, defineSystem, getComponent } from '@ir-engine/ecs'
import { DirectionalLight, SpotLight, Vector3 } from 'three'
import { TransformSystem } from '../transform/systems/TransformSystem'
import { GroupComponent } from './components/GroupComponent'
import { DirectionalLightComponent } from './components/lights/DirectionalLightComponent'
import { SpotLightComponent } from './components/lights/SpotLightComponent'

const _vec3 = new Vector3()

const spotLightQuery = defineQuery([GroupComponent, SpotLightComponent])
const directionalLightQuery = defineQuery([GroupComponent, DirectionalLightComponent])

/** @todo will be simplified after ObjectComponent refactor */
const execute = () => {
  for (const entity of spotLightQuery()) {
    const light = getComponent(entity, GroupComponent).find((c) => c instanceof SpotLight) as SpotLight
    if (!light?.target) continue
    light.getWorldDirection(_vec3)
    light.getWorldPosition(light.target.position).add(_vec3)
    light.target.updateMatrixWorld()
  }
  for (const entity of directionalLightQuery()) {
    const light = getComponent(entity, GroupComponent).find((c) => c instanceof DirectionalLight) as DirectionalLight
    if (!light?.target) continue
    light.getWorldDirection(_vec3)
    light.getWorldPosition(light.target.position).add(_vec3)
    light.target.updateMatrixWorld()
  }
}

export const LightTransformSystem = defineSystem({
  uuid: 'ee.engine.LightTransformSystem',
  insert: { after: TransformSystem },
  execute
})
