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
import { LensDistortionEffect } from 'postprocessing'
import React, { useEffect } from 'react'
import { Vector2 } from 'three'
import { PropertyTypes } from './PostProcessingRegister'

const effectKey = 'LensDistortionEffect'

export const LensDistortionEffectProcessReactor: React.FC<EffectReactorProps> = (props: {
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
    const eff = new LensDistortionEffect(effectData[effectKey].value)
    effects[effectKey].set(eff)
    return () => {
      effects[effectKey].set(none)
    }
  }, [isActive])

  return null
}

export const lensDistortionAddToEffectRegistry = () => {
  // registers the effect

  getMutableState(PostProcessingEffectState).merge({
    [effectKey]: {
      reactor: LensDistortionEffectProcessReactor,
      defaultValues: {
        isActive: false,
        distortion: new Vector2(0, 0),
        principalPoint: new Vector2(0, 0),
        focalLength: new Vector2(1, 1),
        skew: 0
      },
      schema: {
        distortion: { propertyType: PropertyTypes.Vector2, name: 'Distortion' },
        principalPoint: { propertyType: PropertyTypes.Vector2, name: 'Principal Point' },
        focalLength: { propertyType: PropertyTypes.Vector2, name: 'Focal Length' },
        skew: { propertyType: PropertyTypes.Number, name: 'Skew', min: 0, max: 10, step: 0.05 }
      }
    }
  })
}
