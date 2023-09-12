import { DistanceFromCameraComponent } from '@etherealengine/engine/src/transform/components/DistanceComponents'

import { isMobile } from '../../../common/functions/isMobile'
import { Entity } from '../../../ecs/classes/Entity'
import { getMutableComponent } from '../../../ecs/functions/ComponentFunctions'
import { isMobileXRHeadset } from '../../../xr/XRState'
import { ModelComponent } from '../../components/ModelComponent'
import { VariantComponent } from '../../components/VariantComponent'

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

/**
 * Handles setting model src for model component based on variant component
 * @param entity
 */
export function setModelVariant(entity: Entity) {
  const variantComponent = getMutableComponent(entity, VariantComponent)
  const modelComponent = getMutableComponent(entity, ModelComponent)

  if (variantComponent.heuristic.value === 'DEVICE') {
    const targetDevice = isMobile || isMobileXRHeadset ? 'MOBILE' : 'DESKTOP'
    //set model src to mobile variant src
    const deviceVariant = variantComponent.levels.find((level) => level.value.metadata['device'] === targetDevice)
    deviceVariant &&
      modelComponent.src.value !== deviceVariant.src.value &&
      modelComponent.src.set(deviceVariant.src.value)
  } else if (variantComponent.heuristic.value === 'DISTANCE') {
    const distance = DistanceFromCameraComponent.squaredDistance[entity]
    for (let i = 0; i < variantComponent.levels.length; i++) {
      const level = variantComponent.levels[i]
      if ([level.metadata['minDistance'], level.metadata['maxDistance']].includes(undefined)) continue
      const minDistance = Math.pow(level.metadata['minDistance'], 2)
      const maxDistance = Math.pow(level.metadata['maxDistance'], 2)
      const useLevel = minDistance <= distance && distance <= maxDistance
      useLevel && modelComponent.src.value !== level.src.value && modelComponent.src.set(level.src.value)
      if (useLevel) break
    }
  }
  variantComponent.calculated.set(true)
}
