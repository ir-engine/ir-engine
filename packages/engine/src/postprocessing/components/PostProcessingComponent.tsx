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
import { useTexture } from '@etherealengine/engine/src/assets/functions/resourceLoaderHooks'
import { NO_PROXY, State, StateMethods, getState, none, useHookstate } from '@etherealengine/hyperflux'
import { EngineState } from '@etherealengine/spatial/src/EngineState'
import { CameraComponent } from '@etherealengine/spatial/src/camera/components/CameraComponent'
import { HighlightState } from '@etherealengine/spatial/src/renderer/HighlightState'
import { RendererState } from '@etherealengine/spatial/src/renderer/RendererState'
import { RenderSettingsState, RendererComponent } from '@etherealengine/spatial/src/renderer/WebGLRendererSystem'
import { useScene } from '@etherealengine/spatial/src/renderer/components/SceneComponents'
import { ObjectLayers } from '@etherealengine/spatial/src/renderer/constants/ObjectLayers'
import { LinearTosRGBEffect } from '@etherealengine/spatial/src/renderer/effects/LinearTosRGBEffect'
import { changeRenderMode } from '@etherealengine/spatial/src/renderer/functions/changeRenderMode'
import {
  BloomEffect,
  BrightnessContrastEffect,
  ChromaticAberrationEffect,
  ColorAverageEffect,
  ColorDepthEffect,
  DepthDownsamplingPass,
  DepthOfFieldEffect,
  DotScreenEffect,
  EdgeDetectionMode,
  Effect,
  EffectComposer,
  EffectPass,
  FXAAEffect,
  GlitchEffect,
  //GodRaysEffect,
  GridEffect,
  HueSaturationEffect,
  LUT1DEffect,
  LUT3DEffect,
  LensDistortionEffect,
  NoiseEffect,
  OutlineEffect,
  PixelationEffect,
  RenderPass,
  SMAAEffect,
  SSAOEffect,
  ScanlineEffect,
  ShockWaveEffect,
  TextureEffect,
  TiltShiftEffect,
  ToneMappingEffect,
  VignetteEffect
} from 'postprocessing'
import React, { useEffect } from 'react'
import { MotionBlurEffect, SSGIEffect, SSREffect, TRAAEffect, VelocityDepthNormalPass } from 'realism-effects'
import { ArrayCamera, Scene, Texture } from 'three'
import { EffectPropsSchema, Effects, defaultPostProcessingSchema } from '../PostProcessing'
import { CustomNormalPass } from '../passes/CustomNormalPass'

export const PostProcessingComponent = defineComponent({
  name: 'PostProcessingComponent',
  jsonID: 'EE_postprocessing',

  onInit(entity) {
    return {
      enabled: false,
      effects: defaultPostProcessingSchema
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

    return <RendererReactor entity={entity} rendererEntity={rendererEntity} />
  }
})

const RendererReactor = (props: { entity: Entity; rendererEntity: Entity }) => {
  const { entity, rendererEntity } = props

  const postprocessingComponent = useComponent(entity, PostProcessingComponent)
  const camera = useComponent(rendererEntity, CameraComponent)
  const renderer = useComponent(rendererEntity, RendererComponent)
  const composer = useHookstate<EffectComposer>(() => new EffectComposer(renderer.value.renderer))
  renderer.value.effectComposer = composer.value
  const renderPass = new RenderPass()
  renderer.value.effectComposer.addPass(renderPass)
  renderer.value.renderPass = renderPass

  let lut1DEffectTexturePath: string | undefined
  if (
    postprocessingComponent.effects[Effects.LUT1DEffect].lutPath &&
    postprocessingComponent.effects[Effects.LUT1DEffect].isActive.value
  ) {
    lut1DEffectTexturePath = postprocessingComponent.effects[Effects.LUT1DEffect].lutPath.value
  }
  let lut3DEffectTexturePath: string | undefined
  if (
    postprocessingComponent.effects[Effects.LUT3DEffect].lutPath &&
    postprocessingComponent.effects[Effects.LUT3DEffect].isActive.value
  ) {
    lut3DEffectTexturePath = postprocessingComponent.effects[Effects.LUT3DEffect].lutPath.value
  }
  let textureEffectTexturePath: string | undefined
  if (
    postprocessingComponent.effects[Effects.TextureEffect].texturePath &&
    postprocessingComponent.effects[Effects.TextureEffect].isActive.value
  ) {
    textureEffectTexturePath = postprocessingComponent.effects[Effects.TextureEffect].texturePath.value
  }

  const [lut1DEffectTexture, lut1DEffectTextureError] = useTexture(lut1DEffectTexturePath!, entity)
  const [lut3DEffectTexture, lut3DEffectTextureError] = useTexture(lut3DEffectTexturePath!, entity)
  const [textureEffectTexture, textureEffectTextureError] = useTexture(textureEffectTexturePath!, entity)

  const scene = useHookstate<Scene>(() => new Scene())
  const normalPass = useHookstate<CustomNormalPass>(() => new CustomNormalPass(scene, camera))
  const depthDownsamplingPass = useHookstate<DepthDownsamplingPass>(
    () =>
      new DepthDownsamplingPass({
        normalBuffer: normalPass.value.texture,
        resolutionScale: 0.5
      })
  )
  const velocityDepthNormalPass = useHookstate(new VelocityDepthNormalPass(scene, camera))
  const useVelocityDepthNormalPass = useHookstate(false)
  const useDepthDownsamplingPass = useHookstate(false)

  const effects = useHookstate<Record<string, Effect>>({})

  useEffect(() => {
    velocityDepthNormalPass.set(new VelocityDepthNormalPass(scene, camera))
  }, [scene])

  useEffect(() => {
    const renderSettings = getState(RendererState)

    const effectsVal = effects.get(NO_PROXY)

    if (renderSettings.usePostProcessing) {
      for (const key in effectsVal) {
        const val = effectsVal[key]
        composer.value[key] = val
      }
    }

    //always have the smaa effect
    const smaaPreset = getState(RenderSettingsState).smaaPreset
    const smaaEffect = new SMAAEffect({
      preset: smaaPreset,
      edgeDetectionMode: EdgeDetectionMode.COLOR
    })

    //always have the outline effect for the highlight selection
    const outlineEffect = new OutlineEffect(scene.value, camera.value, getState(HighlightState))
    outlineEffect.selectionLayer = ObjectLayers.HighlightEffect
    effectsVal[Effects.OutlineEffect] = outlineEffect
    composer.value[Effects.OutlineEffect] = outlineEffect

    const effectArray = Object.values(effectsVal)
    composer.value.EffectPass = new EffectPass(camera.value, ...effectArray)
    composer.value.addPass(composer.value.EffectPass)

    console.log('react to effects')
  }, [effects])

  useEffect(() => {
    if (!rendererEntity) return

    if (getState(EngineState).isEditor) changeRenderMode()
  }, [rendererEntity, postprocessingComponent.enabled, postprocessingComponent.effects])

  return (
    <>
      {Object.entries(postprocessingComponent.effects.value).map(([effect, schema], index) => {
        return (
          <EffectReactor
            key={index}
            entity={entity}
            effect={effect}
            schema={schema}
            effects={effects}
            camera={camera}
            uiEffects={postprocessingComponent.effects}
            scene={scene}
            lut1DEffectTexture={lut1DEffectTexture}
            lut3DEffectTexture={lut3DEffectTexture}
            velocityDepthNormalPass={velocityDepthNormalPass}
            useVelocityDepthNormalPass={useVelocityDepthNormalPass}
            normalPass={normalPass}
            depthDownsamplingPass={depthDownsamplingPass}
            composer={composer}
          ></EffectReactor>
        )
      })}
    </>
  )
}

const EffectReactor = (props: {
  entity: Entity
  effect: string
  schema: any
  effects: State<Record<string, Effect>, {}>
  camera: State<ArrayCamera>
  uiEffects: State<EffectPropsSchema, {}>
  scene: State<Scene, {}>
  lut1DEffectTexture: Texture | null
  lut3DEffectTexture: Texture | null
  velocityDepthNormalPass: any
  useVelocityDepthNormalPass: StateMethods<boolean, {}>
  normalPass: State<CustomNormalPass, {}>
  depthDownsamplingPass: State<DepthDownsamplingPass, {}>
  composer: State<EffectComposer, {}>
}) => {
  const {
    entity,
    effect,
    schema,
    effects,
    camera,
    uiEffects,
    scene,
    lut1DEffectTexture,
    lut3DEffectTexture,
    velocityDepthNormalPass,
    useVelocityDepthNormalPass,
    normalPass,
    depthDownsamplingPass,
    composer
  } = props
  const lookUp = {
    BloomEffect: BloomEffectProcess,
    BrightnessContrastEffect: BrightnessContrastEffectProcess,
    ChromaticAberrationEffect: ChromaticAberrationEffectProcess,
    ColorAverageEffect: ColorAverageEffectProcess,
    ColorDepthEffect: ColorDepthEffectProcess,
    DepthOfFieldEffect: DepthOfFieldEffectProcess,
    DotScreenEffect: DotScreenEffectProcess,
    FXAAEffect: FXAAEffectProcess,
    GlitchEffect: GlitchEffectProcess,
    GridEffect: GridEffectProcess,
    HueSaturationEffect: HueSaturationEffectProcess,
    LUT1DEffect: LUT1DEffectProcess,
    LUT3DEffect: LUT3DEffectProcess,
    LensDistortionEffect: LensDistortionEffectProcess,
    LinearTosRGBEffect: LinearTosRGBEffectProcess,
    MotionBlurEffect: MotionBlurEffectProcess,
    NoiseEffect: NoiseEffectProcess,
    PixelationEffect: PixelationEffectProcess,
    SMAAEffect: SMAAEffectProcess,
    SSAOEffect: SSAOEffectProcess,
    SSGIEffect: SSGIEffectProcess,
    SSREffect: SSREffectProcess,
    ScanlineEffect: ScanlineEffectProcess,
    ShockWaveEffect: ShockWaveEffectProcess,
    TRAAEffect: TRAAEffectProcess,
    TextureEffect: TextureEffectProcess,
    TiltShiftEffect: TiltShiftEffectProcess,
    ToneMappingEffect: ToneMappingEffectProcess,
    VignetteEffect: VignetteEffectProcess
  }

  useEffect(() => {
    if (schema.isActive) {
      console.log('add effect = ' + effect)

      const props = {
        schema: schema,
        effects: effects,
        camera: camera,
        scene: scene,
        lut1DEffectTexture: lut1DEffectTexture,
        lut3DEffectTexture: lut3DEffectTexture,
        velocityDepthNormalPass: velocityDepthNormalPass,
        useVelocityDepthNormalPass: useVelocityDepthNormalPass,
        normalPass: normalPass,
        depthDownsamplingPass: depthDownsamplingPass,
        composer: composer
      }

      lookUp[effect](props)
    }

    return () => {
      console.log('remove effect = ' + effect)
      effects[effect].set(none)
    }
  }, [uiEffects])

  return null
}

const BloomEffectProcess = (props: { schema: any; effects: State<Record<string, Effect>, {}> }) => {
  const { schema, effects } = props
  console.log('BloomEffectProcess')

  console.log(schema)
  const eff = new BloomEffect(schema.value)
  effects[Effects.BloomEffect].set(eff)
}

const BrightnessContrastEffectProcess = (props: { schema: any; effects: State<Record<string, Effect>, {}> }) => {
  const { schema, effects } = props
  console.log('BrightnessContrastEffect')

  const eff = new BrightnessContrastEffect(schema.value)
  effects[Effects.BrightnessContrastEffect].set(eff)
}

const ChromaticAberrationEffectProcess = (props: { schema: any; effects: State<Record<string, Effect>, {}> }) => {
  const { schema, effects } = props
  console.log('ChromaticAberrationEffect')

  const eff = new ChromaticAberrationEffect(schema.value)
  effects[Effects.ChromaticAberrationEffect].set(eff)
}

const ColorAverageEffectProcess = (props: { schema: any; effects: State<Record<string, Effect>, {}> }) => {
  const { schema, effects } = props
  console.log('ColorAverageEffect')

  const eff = new ColorAverageEffect(schema.value.blendFunction)
  effects[Effects.ColorAverageEffect].set(eff)
}

const ColorDepthEffectProcess = (props: { schema: any; effects: State<Record<string, Effect>, {}> }) => {
  const { schema, effects } = props
  console.log('ColorDepthEffect')

  const eff = new ColorDepthEffect(schema.value)
  effects[Effects.ColorDepthEffect].set(eff)
}

const DepthOfFieldEffectProcess = (props: {
  schema: any
  effects: State<Record<string, Effect>, {}>
  camera: State<ArrayCamera>
}) => {
  const { schema, effects, camera } = props
  console.log('DepthOfFieldEffect')

  const eff = new DepthOfFieldEffect(camera.value, schema.value)
  effects[Effects.DepthOfFieldEffect].set(eff)
}

const DotScreenEffectProcess = (props: { schema: any; effects: State<Record<string, Effect>, {}> }) => {
  const { schema, effects } = props
  console.log('DotScreenEffect')

  const eff = new DotScreenEffect(schema.value)
  effects[Effects.DotScreenEffect].set(eff)
}

const FXAAEffectProcess = (props: { schema: any; effects: State<Record<string, Effect>, {}> }) => {
  const { schema, effects } = props
  console.log('FXAAEffect')

  const eff = new FXAAEffect(schema.value)
  effects[Effects.FXAAEffect].set(eff)
}

const GlitchEffectProcess = (props: { schema: any; effects: State<Record<string, Effect>, {}> }) => {
  const { schema, effects } = props
  console.log('GlitchEffect')

  const eff = new GlitchEffect(schema.value)
  effects[Effects.GlitchEffect].set(eff)
}

const GridEffectProcess = (props: { schema: any; effects: State<Record<string, Effect>, {}> }) => {
  const { schema, effects } = props
  console.log('GridEffect')

  const eff = new GridEffect(schema.value)
  effects[Effects.GridEffect].set(eff)
}

const HueSaturationEffectProcess = (props: { schema: any; effects: State<Record<string, Effect>, {}> }) => {
  const { schema, effects } = props
  console.log('HueSaturationEffect')

  const eff = new HueSaturationEffect(schema.value)
  effects[Effects.HueSaturationEffect].set(eff)
}

const LUT1DEffectProcess = (props: {
  schema: any
  effects: State<Record<string, Effect>, {}>
  lut1DEffectTexture: Texture
}) => {
  const { schema, effects, lut1DEffectTexture } = props
  console.log('LUT1DEffect')

  if (lut1DEffectTexture) {
    const eff = new LUT1DEffect(lut1DEffectTexture, schema.value)
    effects[Effects.LUT1DEffect].set(eff)
  }
}

const LUT3DEffectProcess = (props: {
  schema: any
  effects: State<Record<string, Effect>, {}>
  lut3DEffectTexture: Texture
}) => {
  const { schema, effects, lut3DEffectTexture } = props
  console.log('LUT3DEffect')
  if (lut3DEffectTexture) {
    const eff = new LUT3DEffect(lut3DEffectTexture, schema.value)
    effects[Effects.LUT3DEffect].set(eff)
  }
}

const LensDistortionEffectProcess = (props: { schema: any; effects: State<Record<string, Effect>, {}> }) => {
  const { schema, effects } = props
  console.log('LensDistortionEffect')

  const eff = new LensDistortionEffect(schema.value)
  effects[Effects.LensDistortionEffect].set(eff)
}

const LinearTosRGBEffectProcess = (props: { schema: any; effects: State<Record<string, Effect>, {}> }) => {
  const { schema, effects } = props

  console.log('LinearTosRGBEffect')

  const eff = new LinearTosRGBEffect(schema.value)
  effects[Effects.LinearTosRGBEffect].set(eff)
}

const MotionBlurEffectProcess = (props: {
  schema: any
  effects: State<Record<string, Effect>, {}>
  velocityDepthNormalPass: any
}) => {
  const { schema, effects, velocityDepthNormalPass } = props

  console.log('MotionBlurEffect')

  const eff = new MotionBlurEffect(velocityDepthNormalPass, schema.value)
  effects[Effects.MotionBlurEffect].set(eff)
}

const NoiseEffectProcess = (props: {
  schema: any
  effects: State<Record<string, Effect>, {}>
  camera: State<ArrayCamera>
  scene: State<Scene, {}>
}) => {
  const { schema, effects, camera } = props

  console.log('NoiseEffect')

  const eff = new NoiseEffect(schema.value)
  effects[Effects.NoiseEffect].set(eff)
}

const PixelationEffectProcess = (props: { schema: any; effects: State<Record<string, Effect>, {}> }) => {
  const { schema, effects } = props

  console.log('PixelationEffect')

  const eff = new PixelationEffect(schema.value.granularity)
  effects[Effects.PixelationEffect].set(eff)
}

const SMAAEffectProcess = (props: { schema: any; effects: State<Record<string, Effect>, {}> }) => {
  const { schema, effects } = props

  console.log('SMAAEffect')

  const eff = new SMAAEffect(schema.value)
  effects[Effects.SMAAEffect].set(eff)
}

const SSAOEffectProcess = (props: {
  schema: any
  effects: State<Record<string, Effect>, {}>
  camera: State<ArrayCamera>
  normalPass: State<CustomNormalPass, {}>
  depthDownsamplingPass: State<DepthDownsamplingPass, {}>
}) => {
  const { schema, effects, camera, normalPass, depthDownsamplingPass } = props

  console.log('SSAOEffect')

  const eff = new SSAOEffect(camera.value, normalPass.value.texture, {
    ...schema.value,
    normalDepthBuffer: depthDownsamplingPass.value.texture
  })
  effects[Effects.SSAOEffect].set(eff)
}

const SSGIEffectProcess = (props: { schema: any; effects: State<Record<string, Effect>, {}> }) => {
  const { schema, effects } = props

  console.log('SSGIEffect')

  const eff = new SSGIEffect(schema.value)
  effects[Effects.SSGIEffect].set(eff)
}

// SSR is just a mode of SSGI, and can't both be run at the same time
const SSREffectProcess = (props: {
  schema: any
  effects: State<Record<string, Effect>, {}>
  camera: State<ArrayCamera>
  scene: State<Scene, {}>
  velocityDepthNormalPass: any
  useVelocityDepthNormalPass: StateMethods<boolean, {}>
  composer: State<EffectComposer, {}>
}) => {
  const { schema, effects, camera, scene, velocityDepthNormalPass, useVelocityDepthNormalPass, composer } = props

  console.log('SSREffect')
  let usingSSGI = false
  const ssgiEffect = effects.value[Effects.SSGIEffect] as any
  if (ssgiEffect) {
    usingSSGI = true
  }
  if (!usingSSGI) {
    const eff = new SSREffect(composer.value, scene.value, camera.value, { ...schema.value, velocityDepthNormalPass })
    useVelocityDepthNormalPass.set(true)
    effects[Effects.SSREffect].set(eff)
  }
}

const ScanlineEffectProcess = (props: { schema: any; effects: State<Record<string, Effect>, {}> }) => {
  const { schema, effects } = props

  console.log('ScanlineEffect')

  const eff = new ScanlineEffect(schema.value)
  effects[Effects.ScanlineEffect].set(eff)
}

const ShockWaveEffectProcess = (props: {
  schema: any
  effects: State<Record<string, Effect>, {}>
  camera: State<ArrayCamera>
}) => {
  const { schema, effects, camera } = props

  console.log('ShockWaveEffect')

  const eff = new ShockWaveEffect(camera.value, schema.value.position, schema.value)
  effects[Effects.ShockWaveEffect].set(eff)
}

const TRAAEffectProcess = (props: {
  schema: any
  effects: State<Record<string, Effect>, {}>
  camera: State<ArrayCamera>
  scene: State<Scene, {}>
  velocityDepthNormalPass: any
  useVelocityDepthNormalPass: StateMethods<boolean, {}>
}) => {
  const { schema, effects, camera, scene, velocityDepthNormalPass, useVelocityDepthNormalPass } = props

  console.log('TRAAEffect')

  // todo support more than 1 texture
  const textureCount = 1
  const eff = new TRAAEffect(scene.value, camera.value, velocityDepthNormalPass, textureCount, schema.value)
  useVelocityDepthNormalPass.set(true)
  effects[Effects.TRAAEffect].set(eff)
}

const TextureEffectProcess = (props: { schema: any; effects: State<Record<string, Effect>, {}> }) => {
  const { schema, effects } = props

  console.log('TextureEffect')

  const eff = new TextureEffect(schema.value)
  effects[Effects.TextureEffect].set(eff)
}

const TiltShiftEffectProcess = (props: { schema: any; effects: State<Record<string, Effect>, {}> }) => {
  const { schema, effects } = props

  console.log('TiltShiftEffect')

  const eff = new TiltShiftEffect(schema.value)
  effects[Effects.TiltShiftEffect].set(eff)
}

const ToneMappingEffectProcess = (props: { schema: any; effects: State<Record<string, Effect>, {}> }) => {
  const { schema, effects } = props

  console.log('ToneMappingEffect')

  const eff = new ToneMappingEffect(schema.value)
  effects[Effects.ToneMappingEffect].set(eff)
}

const VignetteEffectProcess = (props: { schema: any; effects: State<Record<string, Effect>, {}> }) => {
  const { schema, effects } = props

  console.log('VignetteEffect')

  const eff = new VignetteEffect(schema.value)
  effects[Effects.VignetteEffect].set(eff)
}
