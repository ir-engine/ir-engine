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

import { ComponentUpdateFunction } from '../../../common/constants/PrefabFunctionType'
import { Entity } from '../../../ecs/classes/Entity'
import { getComponent } from '../../../ecs/functions/ComponentFunctions'
import { OceanComponent } from '../../components/OceanComponent'
import { addError, removeError } from '../ErrorFunctions'

export const updateOcean: ComponentUpdateFunction = (entity: Entity) => {
  const obj3d = getComponent(entity, OceanComponent).ocean!
  const component = getComponent(entity, OceanComponent)

  if (obj3d.normalMap !== component.normalMap) {
    try {
      obj3d.normalMap = component.normalMap
      removeError(entity, OceanComponent, 'NORMAL_MAP_ERROR')
    } catch (error) {
      addError(entity, OceanComponent, 'NORMAL_MAP_ERROR', error.message)
      console.error(error)
    }
  }

  if (obj3d.distortionMap !== component.distortionMap) {
    try {
      obj3d.distortionMap = component.distortionMap
      removeError(entity, OceanComponent, 'DISTORTION_MAP_ERROR')
    } catch (error) {
      addError(entity, OceanComponent, 'DISTORTION_MAP_ERROR', error.message)
      console.error(error)
    }
  }

  if (obj3d.envMap !== component.envMap) {
    try {
      obj3d.envMap = component.envMap
      removeError(entity, OceanComponent, 'ENVIRONMENT_MAP_ERROR')
    } catch (error) {
      addError(entity, OceanComponent, 'ENVIRONMENT_MAP_ERROR', error.message)
      console.error(error)
    }
  }

  obj3d.color = component.color
  obj3d.opacityRange = component.opacityRange
  obj3d.opacityFadeDistance = component.opacityFadeDistance
  obj3d.shallowToDeepDistance = component.shallowToDeepDistance
  obj3d.shallowWaterColor = component.shallowWaterColor
  obj3d.waveScale = component.waveScale
  obj3d.waveSpeed = component.waveSpeed
  obj3d.waveTiling = component.waveTiling
  obj3d.waveDistortionTiling = component.waveDistortionTiling
  obj3d.waveDistortionSpeed = component.waveDistortionSpeed
  obj3d.shininess = component.shininess
  obj3d.reflectivity = component.reflectivity
  obj3d.bigWaveHeight = component.bigWaveHeight
  obj3d.bigWaveTiling = component.bigWaveTiling
  obj3d.bigWaveSpeed = component.bigWaveSpeed
  obj3d.foamSpeed = component.foamSpeed
  obj3d.foamTiling = component.foamTiling
  obj3d.foamColor = component.foamColor
}
