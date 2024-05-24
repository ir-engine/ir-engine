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
import { ArrayCamera, Scene, Texture, WebGLRenderer } from 'three'
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
  const renderMode = getState(RendererState).renderMode
  const effects = useHookstate<Record<string, Effect>>({})

  useEffect(() => {
    const composer = new EffectComposer(renderer.value.renderer as WebGLRenderer)
    renderer.effectComposer.set(composer)
    const renderPass = new RenderPass()
    renderer.value.effectComposer.addPass(renderPass)
    renderer.renderPass.set(renderPass)
  }, [])

  useEffect(() => {
    velocityDepthNormalPass.set(new VelocityDepthNormalPass(scene, camera))
  }, [scene])

  useEffect(() => {
    const renderSettings = getState(RendererState)

    const effectsVal = effects.get(NO_PROXY) as Record<string, Effect>

    if (renderSettings.usePostProcessing) {
      for (const key in effectsVal) {
        const val = effectsVal[key]
        renderer.value.effectComposer[key] = val
      }
    }

    //always have the smaa effect
    const smaaPreset = getState(RenderSettingsState).smaaPreset
    const smaaEffect = new SMAAEffect({
      preset: smaaPreset,
      edgeDetectionMode: EdgeDetectionMode.COLOR
    })

    //always have the outline effect for the highlight selection
    const outlineEffect = new OutlineEffect(scene.value as Scene, camera.value as ArrayCamera, getState(HighlightState))
    outlineEffect.selectionLayer = ObjectLayers.HighlightEffect
    effectsVal[Effects.OutlineEffect] = outlineEffect
    renderer.effectComposer[Effects.OutlineEffect].set(outlineEffect)

    if (renderer.value.effectComposer.EffectPass) {
      renderer.value.effectComposer.removePass(renderer.value.effectComposer.EffectPass as EffectPass)
    }

    const effectArray = Object.values(effectsVal)
    renderer.effectComposer.EffectPass.set(new EffectPass(camera.value as ArrayCamera, ...effectArray))
    renderer.value.effectComposer.addPass(renderer.value.effectComposer.EffectPass as EffectPass)
  }, [effects])

  useEffect(() => {
    if (!rendererEntity) return

    if (getState(EngineState).isEditor) changeRenderMode()
  }, [rendererEntity, postprocessingComponent.enabled, postprocessingComponent.effects, renderMode])

  return (
    <>
      {Object.entries(postprocessingComponent.effects.value).map(([effectKey, schema], index) => {
        return (
          <EffectReactor
            key={index}
            entity={entity}
            effectKey={effectKey}
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
            composer={renderer.value.effectComposer as EffectComposer}
          ></EffectReactor>
        )
      })}
    </>
  )
}

const EffectReactor = (props: {
  entity: Entity
  effectKey: string
  schema: any
  effects: State<Record<string, Effect>>
  camera: State<ArrayCamera>
  uiEffects: State<EffectPropsSchema>
  scene: State<Scene>
  lut1DEffectTexture: Texture | null
  lut3DEffectTexture: Texture | null
  velocityDepthNormalPass: any
  useVelocityDepthNormalPass: StateMethods<boolean, {}>
  normalPass: State<CustomNormalPass>
  depthDownsamplingPass: State<DepthDownsamplingPass>
  composer: EffectComposer
}) => {
  const {
    entity,
    effectKey,
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
    if (!schema.isActive) {
      effects[effectKey].set(none)
    }
  }, [schema.isActive])

  useEffect(() => {
    if (schema.isActive) {
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

      lookUp[effectKey](props)
    }
  }, [uiEffects])

  return null
}

const BloomEffectProcess = (props: { schema: any; effects: State<Record<string, Effect>> }) => {
  const { schema, effects } = props
  const eff = new BloomEffect(schema)
  effects[Effects.BloomEffect].set(eff)
}

const BrightnessContrastEffectProcess = (props: { schema: any; effects: State<Record<string, Effect>> }) => {
  const { schema, effects } = props
  const eff = new BrightnessContrastEffect(schema)
  effects[Effects.BrightnessContrastEffect].set(eff)
}

const ChromaticAberrationEffectProcess = (props: { schema: any; effects: State<Record<string, Effect>> }) => {
  const { schema, effects } = props
  const eff = new ChromaticAberrationEffect(schema)
  effects[Effects.ChromaticAberrationEffect].set(eff)
}

const ColorAverageEffectProcess = (props: { schema: any; effects: State<Record<string, Effect>> }) => {
  const { schema, effects } = props
  const eff = new ColorAverageEffect(schema.blendFunction)
  effects[Effects.ColorAverageEffect].set(eff)
}

const ColorDepthEffectProcess = (props: { schema: any; effects: State<Record<string, Effect>> }) => {
  const { schema, effects } = props
  const eff = new ColorDepthEffect(schema)
  effects[Effects.ColorDepthEffect].set(eff)
}

const DepthOfFieldEffectProcess = (props: {
  schema: any
  effects: State<Record<string, Effect>>
  camera: State<ArrayCamera>
}) => {
  const { schema, effects, camera } = props
  const eff = new DepthOfFieldEffect(camera.value as ArrayCamera, schema)
  effects[Effects.DepthOfFieldEffect].set(eff)
}

const DotScreenEffectProcess = (props: { schema: any; effects: State<Record<string, Effect>> }) => {
  const { schema, effects } = props
  const eff = new DotScreenEffect(schema)
  effects[Effects.DotScreenEffect].set(eff)
}

const FXAAEffectProcess = (props: { schema: any; effects: State<Record<string, Effect>> }) => {
  const { schema, effects } = props
  const eff = new FXAAEffect(schema)
  effects[Effects.FXAAEffect].set(eff)
}

const GlitchEffectProcess = (props: { schema: any; effects: State<Record<string, Effect>> }) => {
  const { schema, effects } = props
  const eff = new GlitchEffect(schema)
  effects[Effects.GlitchEffect].set(eff)
}

const GridEffectProcess = (props: { schema: any; effects: State<Record<string, Effect>> }) => {
  const { schema, effects } = props
  const eff = new GridEffect(schema)
  effects[Effects.GridEffect].set(eff)
}

const HueSaturationEffectProcess = (props: { schema: any; effects: State<Record<string, Effect>> }) => {
  const { schema, effects } = props
  const eff = new HueSaturationEffect(schema)
  effects[Effects.HueSaturationEffect].set(eff)
}

const LUT1DEffectProcess = (props: {
  schema: any
  effects: State<Record<string, Effect>>
  lut1DEffectTexture: Texture
}) => {
  const { schema, effects, lut1DEffectTexture } = props
  if (lut1DEffectTexture) {
    const eff = new LUT1DEffect(lut1DEffectTexture, schema)
    effects[Effects.LUT1DEffect].set(eff)
  }
}

const LUT3DEffectProcess = (props: {
  schema: any
  effects: State<Record<string, Effect>>
  lut3DEffectTexture: Texture
}) => {
  const { schema, effects, lut3DEffectTexture } = props
  if (lut3DEffectTexture) {
    const eff = new LUT3DEffect(lut3DEffectTexture, schema)
    effects[Effects.LUT3DEffect].set(eff)
  }
}

const LensDistortionEffectProcess = (props: { schema: any; effects: State<Record<string, Effect>> }) => {
  const { schema, effects } = props
  const eff = new LensDistortionEffect(schema)
  effects[Effects.LensDistortionEffect].set(eff)
}

const LinearTosRGBEffectProcess = (props: { schema: any; effects: State<Record<string, Effect>> }) => {
  const { schema, effects } = props
  const eff = new LinearTosRGBEffect(schema)
  effects[Effects.LinearTosRGBEffect].set(eff)
}

const MotionBlurEffectProcess = (props: {
  schema: any
  effects: State<Record<string, Effect>>
  velocityDepthNormalPass: any
}) => {
  const { schema, effects, velocityDepthNormalPass } = props
  const eff = new MotionBlurEffect(velocityDepthNormalPass, schema)
  effects[Effects.MotionBlurEffect].set(eff)
}

const NoiseEffectProcess = (props: {
  schema: any
  effects: State<Record<string, Effect>>
  camera: State<ArrayCamera>
  scene: State<Scene>
}) => {
  const { schema, effects, camera } = props
  const eff = new NoiseEffect(schema)
  effects[Effects.NoiseEffect].set(eff)
}

const PixelationEffectProcess = (props: { schema: any; effects: State<Record<string, Effect>> }) => {
  const { schema, effects } = props
  const eff = new PixelationEffect(schema.granularity)
  effects[Effects.PixelationEffect].set(eff)
}

const SMAAEffectProcess = (props: { schema: any; effects: State<Record<string, Effect>> }) => {
  const { schema, effects } = props
  const eff = new SMAAEffect(schema)
  effects[Effects.SMAAEffect].set(eff)
}

const SSAOEffectProcess = (props: {
  schema: any
  effects: State<Record<string, Effect>>
  camera: State<ArrayCamera>
  normalPass: State<CustomNormalPass>
  depthDownsamplingPass: State<DepthDownsamplingPass>
}) => {
  const { schema, effects, camera, normalPass, depthDownsamplingPass } = props
  const eff = new SSAOEffect(camera.value as ArrayCamera, normalPass.value.texture, {
    ...schema,
    normalDepthBuffer: depthDownsamplingPass.value.texture
  })
  effects[Effects.SSAOEffect].set(eff)
}

const SSGIEffectProcess = (props: { schema: any; effects: State<Record<string, Effect>> }) => {
  const { schema, effects } = props
  const eff = new SSGIEffect(schema)
  effects[Effects.SSGIEffect].set(eff)
}

// SSR is just a mode of SSGI, and can't both be run at the same time
const SSREffectProcess = (props: {
  schema: any
  effects: State<Record<string, Effect>>
  camera: State<ArrayCamera>
  scene: State<Scene, {}>
  velocityDepthNormalPass: any
  useVelocityDepthNormalPass: StateMethods<boolean, {}>
  composer: State<EffectComposer>
}) => {
  const { schema, effects, camera, scene, velocityDepthNormalPass, useVelocityDepthNormalPass, composer } = props

  let usingSSGI = false
  const ssgiEffect = effects.value[Effects.SSGIEffect] as any
  if (ssgiEffect) {
    usingSSGI = true
  }
  if (!usingSSGI) {
    const eff = new SSREffect(composer.value, scene.value, camera.value, { ...schema, velocityDepthNormalPass })
    useVelocityDepthNormalPass.set(true)
    effects[Effects.SSREffect].set(eff)
  }
}

const ScanlineEffectProcess = (props: { schema: any; effects: State<Record<string, Effect>> }) => {
  const { schema, effects } = props
  const eff = new ScanlineEffect(schema)
  effects[Effects.ScanlineEffect].set(eff)
}

const ShockWaveEffectProcess = (props: {
  schema: any
  effects: State<Record<string, Effect>>
  camera: State<ArrayCamera>
}) => {
  const { schema, effects, camera } = props
  const eff = new ShockWaveEffect(camera.value as ArrayCamera, schema.position, schema)
  effects[Effects.ShockWaveEffect].set(eff)
}

const TRAAEffectProcess = (props: {
  schema: any
  effects: State<Record<string, Effect>>
  camera: State<ArrayCamera>
  scene: State<Scene, {}>
  velocityDepthNormalPass: any
  useVelocityDepthNormalPass: StateMethods<boolean, {}>
}) => {
  const { schema, effects, camera, scene, velocityDepthNormalPass, useVelocityDepthNormalPass } = props
  // todo support more than 1 texture
  const textureCount = 1
  const eff = new TRAAEffect(scene.value, camera.value, velocityDepthNormalPass, textureCount, schema)
  useVelocityDepthNormalPass.set(true)
  effects[Effects.TRAAEffect].set(eff)
}

const TextureEffectProcess = (props: { schema: any; effects: State<Record<string, Effect>> }) => {
  const { schema, effects } = props
  const eff = new TextureEffect(schema)
  effects[Effects.TextureEffect].set(eff)
}

const TiltShiftEffectProcess = (props: { schema: any; effects: State<Record<string, Effect>> }) => {
  const { schema, effects } = props
  const eff = new TiltShiftEffect(schema)
  effects[Effects.TiltShiftEffect].set(eff)
}

const ToneMappingEffectProcess = (props: { schema: any; effects: State<Record<string, Effect>> }) => {
  const { schema, effects } = props
  const eff = new ToneMappingEffect(schema)
  effects[Effects.ToneMappingEffect].set(eff)
}

const VignetteEffectProcess = (props: { schema: any; effects: State<Record<string, Effect>> }) => {
  const { schema, effects } = props
  const eff = new VignetteEffect(schema)
  effects[Effects.VignetteEffect].set(eff)
}
