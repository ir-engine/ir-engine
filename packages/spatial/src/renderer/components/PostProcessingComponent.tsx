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

import { Entity, defineComponent, useComponent, useEntityContext } from '@etherealengine/ecs'
import { ErrorBoundary, NO_PROXY, State, getState, useHookstate } from '@etherealengine/hyperflux'
import { Effect, EffectComposer, EffectPass, SMAAEffect } from 'postprocessing'
import React, { Suspense, useEffect } from 'react'
import { ArrayCamera, Scene } from 'three'
import { CameraComponent } from '../../camera/components/CameraComponent'
import { RendererState } from '../RendererState'
import { RendererComponent } from '../WebGLRendererSystem'
import { PostProcessingEffectState } from '../effects/EffectRegistry'
import { useScene } from './SceneComponents'

declare module 'postprocessing' {
  interface EffectComposer {
    // passes
    EffectPass: EffectPass
    // effects
    SMAAEffect: SMAAEffect
  }
  interface Effect {
    isActive: boolean
  }
}
export { Effect, EffectComposer } from 'postprocessing'

export const PostProcessingComponent = defineComponent({
  name: 'PostProcessingComponent',
  jsonID: 'EE_postprocessing',

  onInit(entity) {
    return {
      enabled: false,
      effects: {} as Record<string, Effect> // effect name, parameters
    }
  },

  onSet: (entity, component, json) => {
    if (!json) return
    if (typeof json.enabled === 'boolean') component.enabled.set(json.enabled)
    if (typeof json.effects === 'object') component.merge({ effects: json.effects })
  },

  toJSON: (entity, component) => {
    return {
      effects: component.effects.value,
      enabled: component.enabled.value
    }
  },

  /** @todo this will be replaced with spatial queries or distance checks */
  reactor: () => {
    const entity = useEntityContext()
    const rendererEntity = useScene(entity)

    if (!rendererEntity) return null

    return <PostProcessingReactor entity={entity} rendererEntity={rendererEntity} />
  }
})

const PostProcessingReactor = (props: { entity: Entity; rendererEntity: Entity }) => {
  const { entity, rendererEntity } = props
  const postProcessingComponent = useComponent(entity, PostProcessingComponent)
  const EffectRegistry = getState(PostProcessingEffectState)
  const effects = useHookstate<Record<string, Effect>>({})
  const renderer = useComponent(rendererEntity, RendererComponent)
  const renderSettings = getState(RendererState)
  const camera = useComponent(rendererEntity, CameraComponent)
  const composer = renderer.effectComposer.value as EffectComposer
  const scene = renderer.scene.value as Scene

  useEffect(() => {
    if (!renderer.value.effectComposer) return

    const effectsVal = effects.get(NO_PROXY) as Record<string, Effect>

    if (renderSettings.usePostProcessing && postProcessingComponent.enabled.value) {
      for (const key in effectsVal) {
        const val = effectsVal[key]
        renderer.value.effectComposer[key] = val
      }
    } else {
      renderer.value.effectComposer.removePass(renderer.value.effectComposer.EffectPass as EffectPass)
      return
    }

    if (renderer.value.effectComposer.EffectPass) {
      renderer.value.effectComposer.removePass(renderer.value.effectComposer.EffectPass as EffectPass)
    }

    const effectArray = Object.values(effectsVal)
    ;(renderer.effectComposer as State<EffectComposer>).EffectPass.set(
      new EffectPass(camera.value as ArrayCamera, ...effectArray)
    )
    renderer.value.effectComposer.addPass(renderer.value.effectComposer.EffectPass as EffectPass)
  }, [renderer.value.effectComposer, effects, postProcessingComponent.enabled])

  // for each effect specified in our postProcessingComponent, we mount a sub-reactor based on the effect registry for that effect ID
  return (
    <>
      {Object.keys(EffectRegistry).map((key) => {
        const effect = EffectRegistry[key] // get effect registry entry
        if (!effect) return null
        return (
          <Suspense key={key}>
            <ErrorBoundary>
              <effect.reactor
                isActive={postProcessingComponent.effects[key]?.isActive}
                rendererEntity={rendererEntity}
                effectData={postProcessingComponent.effects}
                effects={effects}
                composer={composer}
                scene={scene}
              />
            </ErrorBoundary>
          </Suspense>
        )
      })}
    </>
  )
}
