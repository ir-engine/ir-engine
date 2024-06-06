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
import { getMutableState, getState, none, useHookstate } from '@etherealengine/hyperflux'
import { CameraComponent } from '@etherealengine/spatial/src/camera/components/CameraComponent'
import {
  EffectReactorProps,
  PostProcessingEffectState
} from '@etherealengine/spatial/src/renderer/effects/EffectRegistry'
import React, { useEffect } from 'react'
import { TRAAEffect, VelocityDepthNormalPass } from 'realism-effects'
import { Scene } from 'three'
import { PropertyTypes } from './PostProcessingRegister'

declare module 'postprocessing' {
  interface EffectComposer {
    TRAAEffect: TRAAEffect
  }
}

const effectKey = 'TRAAEffect'

export const TRAAEffectProcessReactor: React.FC<EffectReactorProps> = (props: {
  isActive
  rendererEntity: Entity
  effectData
  effects
  scene: Scene
}) => {
  const { isActive, rendererEntity, effectData, effects, scene } = props
  const effectState = getState(PostProcessingEffectState)
  const camera = useComponent(rendererEntity, CameraComponent)
  const velocityDepthNormalPass = useHookstate(new VelocityDepthNormalPass(scene, camera))

  useEffect(() => {
    if (effectData[effectKey].value) return
    effectData[effectKey].set(effectState[effectKey].defaultValues)
  }, [])

  useEffect(() => {
    if (!isActive?.value) {
      if (effects[effectKey].value) effects[effectKey].set(none)
      return
    }

    // todo support more than 1 texture
    const textureCount = 1

    const eff = new TRAAEffect(scene, camera.value, velocityDepthNormalPass, textureCount, effectData[effectKey].value)
    effects[effectKey].set(eff)

    return () => {
      effects[effectKey].set(none)
    }
  }, [isActive, effectData[effectKey], scene, velocityDepthNormalPass])

  return null
}

export const traaAddToEffectRegistry = () => {
  // registers the effect

  getMutableState(PostProcessingEffectState).merge({
    [effectKey]: {
      reactor: TRAAEffectProcessReactor,
      defaultValues: {
        isActive: false,
        blend: 0.8,
        constantBlend: true,
        dilation: true,
        blockySampling: false,
        logTransform: false, // ! TODO: check if can use logTransform withoutt artifacts
        depthDistance: 10,
        worldDistance: 5,
        neighborhoodClamping: true
      },
      schema: {
        blend: { propertyType: PropertyTypes.Number, name: 'Blend', min: 0, max: 1, step: 0.001 },
        constantBlend: { propertyType: PropertyTypes.Boolean, name: 'Constant Blend' },
        dilation: { propertyType: PropertyTypes.Boolean, name: 'Dilation' },
        blockySampling: { propertyType: PropertyTypes.Boolean, name: 'Blocky Sampling' },
        logTransform: { propertyType: PropertyTypes.Boolean, name: 'Log Transform' },
        depthDistance: { propertyType: PropertyTypes.Number, name: 'Depth Distance', min: 0.01, max: 100, step: 0.01 },
        worldDistance: { propertyType: PropertyTypes.Number, name: 'World Distance', min: 0.01, max: 100, step: 0.01 },
        neighborhoodClamping: { propertyType: PropertyTypes.Boolean, name: 'Neighborhood Clamping' }
      }
    }
  })
}
