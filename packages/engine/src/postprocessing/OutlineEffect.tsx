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

import { Entity } from '@ir-engine/ecs'
import { getMutableState, getState, none } from '@ir-engine/hyperflux'
import { EffectReactorProps, PostProcessingEffectState } from '@ir-engine/spatial/src/renderer/effects/EffectRegistry'
import { BlendFunction, KernelSize, OutlineEffect, Resolution } from 'postprocessing'
import React, { useEffect } from 'react'
import { PropertyTypes } from './PostProcessingRegister'

const effectKey = 'OutlineEffect'

export const OutlineEffectProcessReactor: React.FC<EffectReactorProps> = (props: {
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
    const eff = new OutlineEffect(effectData[effectKey].value)
    effects[effectKey].set(eff)
    return () => {
      effects[effectKey].set(none)
    }
  }, [isActive])

  return null
}

export const outlineAddToEffectRegistry = () => {
  // registers the effect

  getMutableState(PostProcessingEffectState).merge({
    [effectKey]: {
      reactor: OutlineEffectProcessReactor,
      defaultValues: {
        isActive: false,
        blendFunction: BlendFunction.SCREEN,
        patternScale: 1.0,
        edgeStrength: 1.0,
        pulseSpeed: 0.0,
        visibleEdgeColor: 0xffffff,
        hiddenEdgeColor: 0x22090a,
        multisampling: 0,
        resolutionScale: 0.5,
        resolutionX: Resolution.AUTO_SIZE,
        resolutionY: Resolution.AUTO_SIZE,
        width: Resolution.AUTO_SIZE,
        height: 480,
        kernelSize: KernelSize.VERY_SMALL,
        blur: false,
        xRay: true
      },
      schema: {
        blendFunction: { propertyType: PropertyTypes.BlendFunction, name: 'Blend Function' },
        patternScale: { propertyType: PropertyTypes.Number, name: 'Pattern Scale', min: 0, max: 10, step: 0.01 },
        edgeStrength: { propertyType: PropertyTypes.Number, name: 'Edge Strength', min: 0, max: 10, step: 0.01 },
        pulseSpeed: { propertyType: PropertyTypes.Number, name: 'Pulse Speed', min: 0, max: 10, step: 0.01 },
        visibleEdgeColor: { propertyType: PropertyTypes.Color, name: 'Visible Edge Color' },
        hiddenEdgeColor: { propertyType: PropertyTypes.Color, name: 'Hidden Edge Color' },
        multisampling: { propertyType: PropertyTypes.Number, name: 'Multisampling', min: 0, max: 10, step: 0.01 },
        resolutionScale: { propertyType: PropertyTypes.Number, name: 'ResolutionScale', min: 0, max: 10, step: 0.01 },
        blur: { propertyType: PropertyTypes.Boolean, name: 'Blur' },
        xRay: { propertyType: PropertyTypes.Boolean, name: 'xRay' },
        kernelSize: { propertyType: PropertyTypes.KernelSize, name: 'KernelSize' }
        //resolutionX: Resolution.AUTO_SIZE,
        //resolutionY: Resolution.AUTO_SIZE,
        //width: Resolution.AUTO_SIZE,
        //height: 480,
      }
    }
  })
}
