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
import { MotionBlurEffect, VelocityDepthNormalPass } from 'realism-effects'
import { Scene } from 'three'
import { PropertyTypes } from './PostProcessingRegister'

declare module 'postprocessing' {
  interface EffectComposer {
    MotionBlurEffect: MotionBlurEffect
  }
}

const effectKey = 'MotionBlurEffect'

export const MotionBlurEffectProcessReactor: React.FC<EffectReactorProps> = (props: {
  isActive
  rendererEntity: Entity
  effectData
  effects
}) => {
  const { isActive, rendererEntity, effectData, effects } = props
  const effectState = getState(PostProcessingEffectState)
  const camera = useComponent(rendererEntity, CameraComponent)
  const scene = useHookstate<Scene>(() => new Scene())
  const velocityDepthNormalPass = useHookstate(new VelocityDepthNormalPass(scene, camera))
  const useVelocityDepthNormalPass = useHookstate(false)

  useEffect(() => {
    if (effectData[effectKey].value) return
    effectData[effectKey].set(effectState[effectKey].defaultValues)
  }, [])

  useEffect(() => {
    if (!isActive?.value) {
      if (effects[effectKey].value) effects[effectKey].set(none)
      return
    }
    const eff = new MotionBlurEffect(velocityDepthNormalPass, effectData[effectKey].value)
    effects[effectKey].set(eff)
    return () => {
      effects[effectKey].set(none)
    }
  }, [isActive])

  return null
}

export const motionBlurAddToEffectRegistry = () => {
  // registers the effect

  getMutableState(PostProcessingEffectState).merge({
    [effectKey]: {
      reactor: MotionBlurEffectProcessReactor,
      defaultValues: {
        isActive: false,
        intensity: 1,
        jitter: 1,
        samples: 16
      },
      schema: {
        intensity: { propertyType: PropertyTypes.Number, name: 'Intensity', min: 0, max: 10, step: 0.01 },
        jitter: { propertyType: PropertyTypes.Number, name: 'Jitter', min: 0, max: 10, step: 0.01 },
        samples: { propertyType: PropertyTypes.Number, name: 'Samples', min: 1, max: 64, step: 1 }
      }
    }
  })
}
