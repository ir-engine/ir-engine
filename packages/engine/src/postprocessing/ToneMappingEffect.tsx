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
import { BlendFunction, ToneMappingEffect, ToneMappingMode } from 'postprocessing'
import React, { useEffect } from 'react'
import { PropertyTypes } from './PostProcessingRegister'

declare module 'postprocessing' {
  interface EffectComposer {
    ToneMappingEffect: ToneMappingEffect
  }
}

const effectKey = 'ToneMappingEffect'

export const ToneMappingEffectProcessReactor: React.FC<EffectReactorProps> = (props: {
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

    const eff = new ToneMappingEffect(effectData[effectKey].value)
    effects[effectKey].set(eff)

    return () => {
      effects[effectKey].set(none)
    }
  }, [isActive, effectData[effectKey]])

  return null
}

export const toneMappingAddToEffectRegistry = () => {
  // registers the effect

  getMutableState(PostProcessingEffectState).merge({
    [effectKey]: {
      reactor: ToneMappingEffectProcessReactor,
      defaultValues: {
        isActive: false,
        blendFunction: BlendFunction.SRC,
        adaptive: false,
        mode: ToneMappingMode.AGX,
        resolution: 256,
        maxLuminance: 4.0,
        whitePoint: 4.0,
        middleGrey: 0.6,
        minLuminance: 0.01,
        averageLuminance: 1.0,
        adaptationRate: 1.0
      },
      schema: {
        blendFunction: { propertyType: PropertyTypes.BlendFunction, name: 'Blend Function' },
        adaptive: { propertyType: PropertyTypes.Boolean, name: 'Adaptive' },
        adaptationRate: { propertyType: PropertyTypes.Number, name: 'Adaptation Rate', min: -1, max: 1, step: 0.01 },
        averageLuminance: {
          propertyType: PropertyTypes.Number,
          name: 'Average Luminance',
          min: -1,
          max: 1,
          step: 0.01
        },
        maxLuminance: { propertyType: PropertyTypes.Number, name: 'Max Luminance', min: -1, max: 1, step: 0.01 },
        middleGrey: { propertyType: PropertyTypes.Number, name: 'Middle Grey', min: -1, max: 1, step: 0.01 },
        resolution: { propertyType: PropertyTypes.Number, name: 'Resolution' },
        whitePoint: { propertyType: PropertyTypes.Number, name: 'Resolution' },
        minLuminance: { propertyType: PropertyTypes.Number, name: 'Resolution' }
      }
    }
  })
}
