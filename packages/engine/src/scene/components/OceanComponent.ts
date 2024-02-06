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

import { Color, Vector2 } from 'three'

import { defineComponent } from '@etherealengine/ecs/src/ComponentFunctions'
import { setCallback } from '@etherealengine/spatial/src/common/CallbackComponent'
import { addObjectToGroup } from '@etherealengine/spatial/src/renderer/components/GroupComponent'
import { Ocean } from '../classes/Ocean'
import { UpdatableCallback } from './UpdatableComponent'

export const OceanComponent = defineComponent({
  name: 'OceanComponent',
  jsonID: 'ocean',
  onInit: () => {
    return {
      ocean: null! as Ocean,
      normalMap: '',
      distortionMap: '',
      envMap: '',
      color: new Color(0x2876dd),
      opacityRange: new Vector2(0.6, 0.9),
      opacityFadeDistance: 0.12,
      shallowToDeepDistance: 0.1,
      shallowWaterColor: new Color(0x30c3dd),
      waveScale: new Vector2(0.25, 0.25),
      waveSpeed: new Vector2(0.08, 0.0),
      waveTiling: 12.0,
      waveDistortionTiling: 7.0,
      waveDistortionSpeed: new Vector2(0.08, 0.08),
      shininess: 40,
      reflectivity: 0.25,
      bigWaveHeight: 0.7,
      bigWaveTiling: new Vector2(1.5, 1.5),
      bigWaveSpeed: new Vector2(0.02, 0.0),
      foamSpeed: new Vector2(0.05, 0.0),
      foamTiling: 2.0,
      foamColor: new Color(0xffffff)
    }
  },
  onSet: (entity, component, json) => {
    if (!json) return
    if (typeof json.normalMap === 'string') component.normalMap.set(json.normalMap)
    if (typeof json.distortionMap === 'string') component.distortionMap.set(json.distortionMap)
    if (typeof json.envMap === 'string') component.envMap.set(json.envMap)
    if (typeof json.color === 'string') component.color.set(new Color(json.color))
    if (typeof json.opacityRange === 'object')
      component.opacityRange.set(new Vector2(json.opacityRange.x, json.opacityRange.y))
    if (typeof json.opacityFadeDistance === 'number') component.opacityFadeDistance.set(json.opacityFadeDistance)
    if (typeof json.shallowToDeepDistance === 'number') component.shallowToDeepDistance.set(json.shallowToDeepDistance)
    if (typeof json.shallowWaterColor === 'string') component.shallowWaterColor.set(new Color(json.shallowWaterColor))
    if (typeof json.waveScale === 'object') component.waveScale.set(new Vector2(json.waveScale.x, json.waveScale.y))
    if (typeof json.waveSpeed === 'object') component.waveSpeed.set(new Vector2(json.waveSpeed.x, json.waveSpeed.y))
    if (typeof json.waveTiling === 'number') component.waveTiling.set(json.waveTiling)
    if (typeof json.waveDistortionTiling === 'number') component.waveDistortionTiling.set(json.waveDistortionTiling)
    if (typeof json.waveDistortionSpeed === 'object')
      component.waveDistortionSpeed.set(new Vector2(json.waveDistortionSpeed.x, json.waveDistortionSpeed.y))
    if (typeof json.shininess === 'number') component.shininess.set(json.shininess)
    if (typeof json.reflectivity === 'number') component.reflectivity.set(json.reflectivity)
    if (typeof json.bigWaveHeight === 'number') component.bigWaveHeight.set(json.bigWaveHeight)
    if (typeof json.bigWaveTiling === 'object')
      component.bigWaveTiling.set(new Vector2(json.bigWaveTiling.x, json.bigWaveTiling.y))
    if (typeof json.bigWaveSpeed === 'object')
      component.bigWaveSpeed.set(new Vector2(json.bigWaveSpeed.x, json.bigWaveSpeed.y))
    if (typeof json.foamSpeed === 'object') component.foamSpeed.set(new Vector2(json.foamSpeed.x, json.foamSpeed.y))
    if (typeof json.foamTiling === 'number') component.foamTiling.set(json.foamTiling)
    if (typeof json.foamColor === 'string') component.foamColor.set(new Color(json.foamColor))

    if (!component.ocean.value) {
      const ocean = new Ocean(entity)
      addObjectToGroup(entity, ocean)
      setCallback(entity, UpdatableCallback, (dt: number) => {
        ocean.update(dt)
      })
    }
  },
  toJSON: (entity, component) => {
    return {
      normalMap: component.normalMap.value,
      distortionMap: component.distortionMap.value,
      envMap: component.envMap.value,
      color: component.color.value,
      opacityRange: component.opacityRange.value,
      opacityFadeDistance: component.opacityFadeDistance.value,
      shallowToDeepDistance: component.shallowToDeepDistance.value,
      shallowWaterColor: component.shallowWaterColor.value,
      waveScale: component.waveScale.value,
      waveSpeed: component.waveSpeed.value,
      waveTiling: component.waveTiling.value,
      waveDistortionTiling: component.waveDistortionTiling.value,
      waveDistortionSpeed: component.waveDistortionSpeed.value,
      shininess: component.shininess.value,
      reflectivity: component.reflectivity.value,
      bigWaveHeight: component.bigWaveHeight.value,
      bigWaveTiling: component.bigWaveTiling.value,
      bigWaveSpeed: component.bigWaveSpeed.value,
      foamSpeed: component.foamSpeed.value,
      foamTiling: component.foamTiling.value,
      foamColor: component.foamColor.value
    }
  },
  errors: ['DISTORTION_MAP_ERROR', 'ENVIRONMENT_MAP_ERROR', 'NORMAL_MAP_ERROR']
})
