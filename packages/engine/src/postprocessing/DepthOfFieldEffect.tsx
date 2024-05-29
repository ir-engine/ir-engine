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
import { BlendFunction, DepthOfFieldEffect, Resolution } from 'postprocessing'
import React, { useEffect } from 'react'
import { ArrayCamera } from 'three'
import { PropertyTypes } from './PostProcessingRegister'

const effectKey = 'DepthOfFieldEffect'

export const DepthOfFieldEffectProcessReactor: React.FC<EffectReactorProps> = (props: {
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
    const eff = new DepthOfFieldEffect(camera.value as ArrayCamera, effectData[effectKey].value)
    effects[effectKey].set(eff)
    return () => {
      effects[effectKey].set(none)
    }
  }, [isActive])

  return null
}

export const depthOfFieldAddToEffectRegistry = () => {
  // registers the effect

  getMutableState(PostProcessingEffectState).merge({
    [effectKey]: {
      reactor: DepthOfFieldEffectProcessReactor,
      defaultValues: {
        isActive: false,
        blendFunction: BlendFunction.NORMAL,
        focusDistance: 0.0,
        focalLength: 0.1,
        focusRange: 0.1,
        bokehScale: 1.0,
        resolutionScale: 1.0,
        resolutionX: Resolution.AUTO_SIZE,
        resolutionY: Resolution.AUTO_SIZE
      },
      schema: {
        blendFunction: { propertyType: PropertyTypes.BlendFunction, name: 'Blend Function' },
        bokehScale: { propertyType: PropertyTypes.Number, name: 'Bokeh Scale', min: -10, max: 10, step: 0.01 },
        focalLength: { propertyType: PropertyTypes.Number, name: 'Focal Length', min: 0, max: 1, step: 0.01 },
        focalRange: { propertyType: PropertyTypes.Number, name: 'Focal Range', min: 0, max: 1, step: 0.01 },
        focusDistance: { propertyType: PropertyTypes.Number, name: 'Focus Distance', min: 0, max: 1, step: 0.01 },
        resolutionScale: { propertyType: PropertyTypes.Number, name: 'Resolution Scale', min: -10, max: 10, step: 0.01 }
      }
    }
  })
}
