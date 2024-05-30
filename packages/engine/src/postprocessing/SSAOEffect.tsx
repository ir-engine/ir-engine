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

import { Entity, useComponent } from '@etherealengine/ecs'
import { getMutableState, getState, none } from '@etherealengine/hyperflux'
import { CameraComponent } from '@etherealengine/spatial/src/camera/components/CameraComponent'
import {
  EffectReactorProps,
  PostProcessingEffectState
} from '@etherealengine/spatial/src/renderer/effects/EffectRegistry'
import { BlendFunction, Resolution, SSAOEffect } from 'postprocessing'
import React, { useEffect } from 'react'
import { ArrayCamera } from 'three'
import { PropertyTypes } from './PostProcessingRegister'

const effectKey = 'SSAOEffect'

export const SSAOEffectProcessReactor: React.FC<EffectReactorProps> = (props: {
  isActive
  rendererEntity: Entity
  effectData
  effects
}) => {
  const { isActive, rendererEntity, effectData, effects } = props
  const effectState = getState(PostProcessingEffectState)

  useEffect(() => {
    if (effectData[effectKey].value) return
    effectData[effectKey].set(effectState[effectKey].defaultValues)
  }, [])

  useEffect(() => {
    if (!isActive?.value) {
      if (effects[effectKey].value) effects[effectKey].set(none)
      return
    }
    const camera = useComponent(rendererEntity, CameraComponent)
    const eff = new SSAOEffect(camera.value as ArrayCamera, effectData[effectKey].value)
    effects[effectKey].set(eff)
    return () => {
      effects[effectKey].set(none)
    }
  }, [isActive])

  return null
}

export const ssaoAddToEffectRegistry = () => {
  // registers the effect

  getMutableState(PostProcessingEffectState).merge({
    [effectKey]: {
      reactor: SSAOEffectProcessReactor,
      defaultValues: {
        isActive: false,
        blendFunction: BlendFunction.MULTIPLY,
        distanceScaling: true,
        depthAwareUpsampling: true,
        normalDepthBuffer: undefined,
        samples: 9,
        rings: 7,
        // worldDistanceThreshold: 0.97,
        // worldDistanceFalloff: 0.03,
        // worldProximityThreshold: 0.0005,
        // worldProximityFalloff: 0.001,
        distanceThreshold: 0.97, // Render up to a distance of ~20 world units
        distanceFalloff: 0.03, // with an additional ~2.5 units of falloff.
        rangeThreshold: 0.0005,
        rangeFalloff: 0.001,
        minRadiusScale: 0.1,
        luminanceInfluence: 0.7,
        bias: 0.025,
        radius: 0.1825,
        intensity: 1.0,
        fade: 0.01,
        color: undefined,
        resolutionScale: 1.0,
        resolutionX: Resolution.AUTO_SIZE,
        resolutionY: Resolution.AUTO_SIZE,
        width: Resolution.AUTO_SIZE,
        height: Resolution.AUTO_SIZE
      },
      schema: {
        preset: { propertyType: PropertyTypes.SMAAPreset, name: 'Preset' }
      }
    }
  })
}
