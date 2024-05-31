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
import { NO_PROXY, getMutableState, getState, none } from '@etherealengine/hyperflux'
import {
  EffectReactorProps,
  PostProcessingEffectState
} from '@etherealengine/spatial/src/renderer/effects/EffectRegistry'
import { BlendFunction, TextureEffect } from 'postprocessing'
import React, { useEffect } from 'react'
import { useTexture } from '../assets/functions/resourceLoaderHooks'
import { PropertyTypes } from './PostProcessingRegister'

const effectKey = 'TextureEffect'

export const TextureEffectProcessReactor: React.FC<EffectReactorProps> = (props: {
  isActive
  rendererEntity: Entity
  effectData
  effects
}) => {
  const { isActive, rendererEntity, effectData, effects } = props
  const effectState = getState(PostProcessingEffectState)

  const [textureEffectTexture, textureEffectTextureError] = useTexture(effectData[effectKey].value?.texturePath!)

  useEffect(() => {
    if (effectData[effectKey].value) return
    effectData[effectKey].set(effectState[effectKey].defaultValues)
  }, [])

  useEffect(() => {
    if (!isActive?.value) {
      if (effects[effectKey].value) effects[effectKey].set(none)
      return
    }
    if (textureEffectTexture) {
      let data = effectData[effectKey].get(NO_PROXY)
      data.texture = textureEffectTexture
      const eff = new TextureEffect(data)
      effects[effectKey].set(eff)
    }
    return () => {
      effects[effectKey].set(none)
    }
  }, [isActive, effectData[effectKey], textureEffectTexture])

  return null
}

export const textureAddToEffectRegistry = () => {
  // registers the effect

  getMutableState(PostProcessingEffectState).merge({
    [effectKey]: {
      reactor: TextureEffectProcessReactor,
      defaultValues: {
        isActive: false,
        blendFunction: BlendFunction.NORMAL,
        texturePath: undefined,
        texture: undefined,
        aspectCorrection: false
      },
      schema: {
        blendFunction: { propertyType: PropertyTypes.BlendFunction, name: 'Blend Function' },
        texturePath: { propertyType: PropertyTypes.Texture, name: 'Texture' },
        aspectCorrection: { propertyType: PropertyTypes.Boolean, name: 'Aspect Correction' }
      }
    }
  })
}
