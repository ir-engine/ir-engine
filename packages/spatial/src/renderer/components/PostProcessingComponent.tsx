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
import { ErrorBoundary, NO_PROXY, getState, useHookstate } from '@etherealengine/hyperflux'
import { Effect, EffectComposer, EffectPass, OutlineEffect, RenderPass } from 'postprocessing'
import React, { Suspense, useEffect } from 'react'
import { MotionBlurEffect, SSGIEffect, SSREffect, TRAAEffect } from 'realism-effects'
import { ArrayCamera, Scene, WebGLRenderer } from 'three'
import { CameraComponent } from '../../camera/components/CameraComponent'
import { HighlightState } from '../HighlightState'
import { RendererState } from '../RendererState'
import { RendererComponent } from '../WebGLRendererSystem'
import { ObjectLayers } from '../constants/ObjectLayers'
import { PostProcessingEffectState } from '../effects/EffectRegistry'
import { LinearTosRGBEffect } from '../effects/LinearTosRGBEffect'
import { useScene } from './SceneComponents'

declare module 'postprocessing' {
  interface EffectComposer {
    // passes
    EffectPass: EffectPass
    // effects

    BloomEffect: BloomEffect
    BrightnessContrastEffect: BrightnessContrastEffect
    ChromaticAberrationEffect: ChromaticAberrationEffect
    ColorAverageEffect: ColorAverageEffect
    ColorDepthEffect: ColorDepthEffect
    DepthOfFieldEffect: DepthOfFieldEffect
    DotScreenEffect: DotScreenEffect
    FXAAEffect: FXAAEffect
    GlitchEffect: GlitchEffect
    //GodRaysEffect: GodRaysEffect
    GridEffect: GridEffect
    HueSaturationEffect: HueSaturationEffect
    LensDistortionEffect: LensDistortionEffect
    LinearTosRGBEffect: LinearTosRGBEffect
    LUT1DEffect: LUT1DEffect
    LUT3DEffect: LUT3DEffect
    MotionBlurEffect: MotionBlurEffect
    NoiseEffect: NoiseEffect
    PixelationEffect: PixelationEffect
    ScanlineEffect: ScanlineEffect
    ShockWaveEffect: ShockWaveEffect
    SSAOEffect: SSAOEffect
    SSREffect: SSREffect
    SSGIEffect: SSGIEffect
    TextureEffect: TextureEffect
    TiltShiftEffect: TiltShiftEffect
    ToneMappingEffect: ToneMappingEffect
    TRAAEffect: TRAAEffect
    VignetteEffect: VignetteEffect

    SMAAEffect: SMAAEffect
    OutlineEffect: OutlineEffect
  }
}

export const PostProcessingComponent = defineComponent({
  name: 'PostProcessingComponent',
  jsonID: 'EE_postprocessing',

  onInit(entity) {
    return {
      enabled: false,
      effects: {} as Record<string, any> // effect name, parameters
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
  const scene = new Scene()
  const composer = new EffectComposer(renderer.value.renderer as WebGLRenderer)

  useEffect(() => {
    renderer.effectComposer.set(composer)
    const renderPass = new RenderPass()
    renderer.value.effectComposer.addPass(renderPass)
    renderer.renderPass.set(renderPass)
  }, [])

  useEffect(() => {
    const effectsVal = effects.get(NO_PROXY) as Record<string, Effect>

    if (renderSettings.usePostProcessing && postProcessingComponent.enabled.value) {
      for (const key in effectsVal) {
        const val = effectsVal[key]
        renderer.value.effectComposer[key] = val
      }
    } else {
      renderer.value.effectComposer.removePass(renderer.value.effectComposer.EffectPass as EffectPass)
    }

    //always have the smaa effect
    // const smaaPreset = getState(RenderSettingsState).smaaPreset
    // const smaaEffect = new SMAAEffect({
    //   preset: smaaPreset,
    //   edgeDetectionMode: EdgeDetectionMode.COLOR
    // })
    // effectsVal["SMAAEffect"].effect = smaaEffect
    // renderer.effectComposer["SMAAEffect"].set(smaaEffect)

    // //always have the outline effect for the highlight selection
    const outlineEffect = new OutlineEffect(scene as Scene, camera.value as ArrayCamera, getState(HighlightState))
    outlineEffect.selectionLayer = ObjectLayers.HighlightEffect
    effectsVal['OutlineEffect'] = outlineEffect
    renderer.effectComposer['OutlineEffect'].set(outlineEffect)

    if (renderer.value.effectComposer.EffectPass) {
      renderer.value.effectComposer.removePass(renderer.value.effectComposer.EffectPass as EffectPass)
    }

    const effectArray = Object.values(effectsVal)
    renderer.effectComposer.EffectPass.set(new EffectPass(camera.value as ArrayCamera, ...effectArray))
    renderer.value.effectComposer.addPass(renderer.value.effectComposer.EffectPass as EffectPass)
  }, [effects, postProcessingComponent.enabled])

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
