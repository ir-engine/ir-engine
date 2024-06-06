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
import { BlendFunction, GlitchEffect } from 'postprocessing'
import React, { useEffect } from 'react'
import { Vector2 } from 'three'
import { PropertyTypes } from './PostProcessingRegister'

declare module 'postprocessing' {
  interface EffectComposer {
    GlitchEffect: GlitchEffect
  }
}

const effectKey = 'GlitchEffect'

export const GlitchEffectProcessReactor: React.FC<EffectReactorProps> = (props: {
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
    const eff = new GlitchEffect(effectData[effectKey].value)
    effects[effectKey].set(eff)
    return () => {
      effects[effectKey].set(none)
    }
  }, [isActive])

  return null
}

export const glitchAddToEffectRegistry = () => {
  // registers the effect

  getMutableState(PostProcessingEffectState).merge({
    [effectKey]: {
      reactor: GlitchEffectProcessReactor,
      defaultValues: {
        isActive: false,
        blendFunction: BlendFunction.NORMAL,
        chromaticAberrationOffset: undefined,
        delay: new Vector2(1.5, 3.5),
        duration: new Vector2(0.6, 1.0),
        strength: new Vector2(0.3, 1.0),
        perturbationMap: undefined,
        dtSize: 64,
        columns: 0.05,
        ratio: 0.85
      },
      schema: {
        blendFunction: { propertyType: PropertyTypes.BlendFunction, name: 'Blend Function' },
        chromaticAberrationOffset: { propertyType: PropertyTypes.Vector2, name: 'Chromatic Aberration Offset' },
        delay: { propertyType: PropertyTypes.Vector2, name: 'Delay' },
        duration: { propertyType: PropertyTypes.Vector2, name: 'Duration' },
        strength: { propertyType: PropertyTypes.Vector2, name: 'Strength' },
        perturbationMap: { propertyType: PropertyTypes.Texture, name: 'Perturbation Map' },
        dtSize: { propertyType: PropertyTypes.Number, name: 'DT Size', min: 0, max: 10, step: 0.1 },
        columns: { propertyType: PropertyTypes.Number, name: 'Columns', min: 0, max: 10, step: 0.1 },
        ratio: { propertyType: PropertyTypes.Number, name: 'Ratio', min: 0, max: 10, step: 0.1 }
      }
    }
  })
}
