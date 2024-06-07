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

import { Entity } from '@etherealengine/ecs'
import { getMutableState, getState, none } from '@etherealengine/hyperflux'
import {
  EffectReactorProps,
  PostProcessingEffectState
} from '@etherealengine/spatial/src/renderer/effects/EffectRegistry'
import { BlendFunction, BloomEffect, KernelSize } from 'postprocessing'
import React, { useEffect } from 'react'
import { PropertyTypes } from './PostProcessingRegister'

declare module 'postprocessing' {
  interface EffectComposer {
    BloomEffect: BloomEffect
  }
}

const effectKey = 'BloomEffect'

export const BloomEffectProcessReactor: React.FC<EffectReactorProps> = (props: {
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
    const eff = new BloomEffect(effectData[effectKey].value)
    effects[effectKey].set(eff)
    return () => {
      effects[effectKey].set(none)
    }
  }, [isActive])

  return null
}

export const bloomAddToEffectRegistry = () => {
  // registers the effect

  getMutableState(PostProcessingEffectState).merge({
    [effectKey]: {
      reactor: BloomEffectProcessReactor,
      defaultValues: {
        isActive: true,
        blendFunction: BlendFunction.SCREEN,
        kernelSize: KernelSize.LARGE,
        luminanceThreshold: 0.9,
        luminanceSmoothing: 0.025,
        mipmapBlur: false,
        intensity: 1.0,
        radius: 0.85,
        levels: 8
      },
      schema: {
        blendFunction: { propertyType: PropertyTypes.BlendFunction, name: 'Blend Function' },
        kernelSize: { propertyType: PropertyTypes.KernelSize, name: 'Kernel Size' },
        intensity: { propertyType: PropertyTypes.Number, name: 'Intensity', min: 0, max: 10, step: 0.01 },
        luminanceSmoothing: {
          propertyType: PropertyTypes.Number,
          name: 'Luminance Smoothing',
          min: 0,
          max: 1,
          step: 0.01
        },
        luminanceThreshold: {
          propertyType: PropertyTypes.Number,
          name: 'Luminance Threshold',
          min: 0,
          max: 1,
          step: 0.01
        },
        mipmapBlur: { propertyType: PropertyTypes.Boolean, name: 'Mipmap Blur' },
        radius: { propertyType: PropertyTypes.Number, name: 'Resolution Scale', min: 0, max: 10, step: 0.01 },
        levels: { propertyType: PropertyTypes.Number, name: 'Resolution Scale', min: 1, max: 10, step: 1 }
      }
    }
  })
}
