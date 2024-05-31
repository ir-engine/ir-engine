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
import { EffectComposer } from 'postprocessing'
import React, { useEffect } from 'react'
import { SSREffect, VelocityDepthNormalPass } from 'realism-effects'
import { Scene } from 'three'
import { PropertyTypes } from './PostProcessingRegister'
const effectKey = 'SSREffect'

export const SSREffectProcessReactor: React.FC<EffectReactorProps> = (props: {
  isActive
  rendererEntity: Entity
  effectData
  effects
  composer: EffectComposer
  scene: Scene
}) => {
  const { isActive, rendererEntity, effectData, effects, composer, scene } = props
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
    const eff = new SSREffect(composer, scene, camera.value, {
      ...effectData[effectKey].value,
      velocityDepthNormalPass
    })
    effects[effectKey].set(eff)
    return () => {
      effects[effectKey].set(none)
    }
  }, [isActive])

  return null
}

export const ssrAddToEffectRegistry = () => {
  // registers the effect

  getMutableState(PostProcessingEffectState).merge({
    [effectKey]: {
      reactor: SSREffectProcessReactor,
      defaultValues: {
        isActive: false,
        distance: 10,
        thickness: 10,
        denoiseIterations: 1,
        denoiseKernel: 2,
        denoiseDiffuse: 10,
        denoiseSpecular: 10,
        radius: 3,
        phi: 0.5,
        lumaPhi: 5,
        depthPhi: 2,
        normalPhi: 50,
        roughnessPhi: 50,
        specularPhi: 50,
        envBlur: 0.5,
        importanceSampling: true,
        steps: 20,
        refineSteps: 5,
        resolutionScale: 1,
        missedRays: false
      },
      schema: {
        distance: { propertyType: PropertyTypes.Number, name: 'Distance', min: 0.001, max: 10, step: 0.01 },
        thickness: { propertyType: PropertyTypes.Number, name: 'Thickness', min: 0, max: 5, step: 0.01 },
        denoiseIterations: { propertyType: PropertyTypes.Number, name: 'Denoise Iterations', min: 0, max: 5, step: 1 },
        denoiseKernel: { propertyType: PropertyTypes.Number, name: 'Denoise Kernel', min: 1, max: 5, step: 1 },
        denoiseDiffuse: { propertyType: PropertyTypes.Number, name: 'Denoise Diffuse', min: 0, max: 50, step: 0.01 },
        denoiseSpecular: { propertyType: PropertyTypes.Number, name: 'Denoise Specular', min: 0, max: 50, step: 0.01 },
        radius: { propertyType: PropertyTypes.Number, name: 'Radius', min: 0, max: 50, step: 0.01 },
        phi: { propertyType: PropertyTypes.Number, name: 'Phi', min: 0, max: 50, step: 0.01 },
        lumaPhi: { propertyType: PropertyTypes.Number, name: 'Denoise Specular', min: 0, max: 50, step: 0.01 },
        depthPhi: { propertyType: PropertyTypes.Number, name: 'luminosity Phi', min: 0, max: 15, step: 0.001 },
        normalPhi: { propertyType: PropertyTypes.Number, name: 'Normal Phi', min: 0, max: 50, step: 0.001 },
        roughnessPhi: { propertyType: PropertyTypes.Number, name: 'Roughness Phi', min: 0, max: 100, step: 0.001 },
        specularPhi: { propertyType: PropertyTypes.Number, name: 'Specular Phi', min: 0, max: 50, step: 0.01 },
        envBlur: { propertyType: PropertyTypes.Number, name: 'Environment Blur', min: 0, max: 1, step: 0.01 },
        importanceSampling: { propertyType: PropertyTypes.Boolean, name: 'Importance Sampling' },
        steps: { propertyType: PropertyTypes.Number, name: 'Steps', min: 0, max: 256, step: 1 },
        refineSteps: { propertyType: PropertyTypes.Number, name: 'Refine Steps', min: 0, max: 16, step: 1 },
        resolutionScale: {
          propertyType: PropertyTypes.Number,
          name: 'Resolution Scale',
          min: 0.25,
          max: 1,
          step: 0.25
        },
        missedRays: { propertyType: PropertyTypes.Boolean, name: 'Missed Rays' }
      }
    }
  })
}
