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

import '../threejsPatches'

import {
  ECSState,
  Engine,
  Entity,
  PresentationSystemGroup,
  QueryReactor,
  defineComponent,
  defineQuery,
  defineSystem,
  getComponent,
  hasComponent,
  useComponent,
  useEntityContext
} from '@etherealengine/ecs'
import { defineState, getMutableState, getState, useHookstate } from '@etherealengine/hyperflux'
import { EffectComposer, NormalPass, RenderPass, SMAAPreset } from 'postprocessing'
import React, { useEffect } from 'react'
import {
  ArrayCamera,
  LinearToneMapping,
  PCFSoftShadowMap,
  SRGBColorSpace,
  ShadowMapType,
  ToneMapping,
  WebGL1Renderer,
  WebGLRenderer,
  WebGLRendererParameters
} from 'three'
import { EngineState } from '../EngineState'
import { CameraComponent } from '../camera/components/CameraComponent'
import { ExponentialMovingAverage } from '../common/classes/ExponentialAverageCurve'
import { SceneComponent } from '../scene/SceneComponent'
import { getNestedChildren } from '../transform/components/EntityTree'
import { WebXRManager, createWebXRManager } from '../xr/WebXRManager'
import { XRState } from '../xr/XRState'
import { PerformanceManager } from './PerformanceState'
import { RendererState } from './RendererState'
import WebGL from './THREE.WebGL'
import { GroupComponent } from './components/GroupComponent'
import { ObjectLayers } from './constants/ObjectLayers'
import { defaultPostProcessingSchema } from './effects/PostProcessing'
import { SDFSettingsState } from './effects/sdf/SDFSettingsState'
import { changeRenderMode } from './functions/changeRenderMode'
import { configureEffectComposer } from './functions/configureEffectComposer'

export const RendererComponent = defineComponent({
  name: 'RendererComponent',

  onInit() {
    return new EngineRenderer()
  },

  onSet(entity, component, json) {
    if (json?.canvas) component.value.canvas = json.canvas
  }
})

export type EffectComposerWithSchema = EffectComposer // & EffectMapType

let lastRenderTime = 0

export class EngineRenderer {
  /** Is resize needed? */
  needsResize: boolean

  /** Maximum Quality level of the rendered. **Default** value is 5. */
  maxQualityLevel = 5
  /** point at which we downgrade quality level (large delta) */
  maxRenderDelta = 1000 / 28 // 28 fps = 35 ms  (on some devices, rAF updates at 30fps, e.g., Low Power Mode)
  /** point at which we upgrade quality level (small delta) */
  minRenderDelta = 1000 / 55 // 55 fps = 18 ms
  /** Resoulion scale. **Default** value is 1. */
  scaleFactor = 1

  renderPass: RenderPass
  normalPass: NormalPass
  renderContext: WebGLRenderingContext | WebGL2RenderingContext

  supportWebGL2: boolean
  canvas: HTMLCanvasElement

  averageTimePeriods = 3 * 60 // 3 seconds @ 60fps
  /** init ExponentialMovingAverage */
  movingAverage = new ExponentialMovingAverage(this.averageTimePeriods)

  renderer: WebGLRenderer = null!
  /** used to optimize proxified threejs objects during render time, see loadGLTFModel and https://github.com/EtherealEngine/etherealengine/issues/9308 */
  rendering = false
  effectComposer: EffectComposerWithSchema = null!
  /** @todo deprecate and replace with engine implementation */
  xrManager: WebXRManager = null!
  webGLLostContext: any = null

  /** Array of entity hierarchies to render. */
  // sceneEntities = [] as Entity[]

  initialize(entity: Entity) {
    this.supportWebGL2 = WebGL.isWebGL2Available()

    if (!this.canvas) throw new Error('Canvas is not defined')

    const canvas = this.canvas
    const context = this.supportWebGL2 ? canvas.getContext('webgl2')! : canvas.getContext('webgl')!

    this.renderContext = context!
    const options: WebGLRendererParameters = {
      precision: 'highp',
      powerPreference: 'high-performance',
      stencil: false,
      antialias: false,
      depth: true,
      logarithmicDepthBuffer: false,
      canvas,
      context,
      preserveDrawingBuffer: false,
      //@ts-ignore
      multiviewStereo: true
    }

    const renderer = this.supportWebGL2 ? new WebGLRenderer(options) : new WebGL1Renderer(options)
    this.renderer = renderer
    this.renderer.outputColorSpace = SRGBColorSpace

    // DISABLE THIS IF YOU ARE SEEING SHADER MISBEHAVING - UNCHECK THIS WHEN TESTING UPDATING THREEJS
    this.renderer.debug.checkShaderErrors = false

    // @ts-ignore
    this.xrManager = renderer.xr = createWebXRManager(this)
    this.xrManager.cameraAutoUpdate = false
    this.xrManager.enabled = true

    const onResize = () => {
      this.needsResize = true
    }

    window.addEventListener('resize', onResize, false)

    this.renderer.autoClear = true

    // configureEffectComposer(entity)

    //Todo: WebGL restore context
    this.webGLLostContext = context.getExtension('WEBGL_lose_context')

    // TODO: for test purpose, need to remove when PR is merging
    // webGLLostContext.loseContext() in inspect can simulate the conext lost
    //@ts-ignore
    window.webGLLostContext = this.webGLLostContext

    const handleWebGLConextLost = (e) => {
      console.log('Browser lost the context.', e)
      e.preventDefault()
      this.needsResize = false
      setTimeout(() => {
        this.effectComposer.setSize(0, 0, true)
        if (this.webGLLostContext) this.webGLLostContext.restoreContext()
      }, 1000)
    }

    const handleWebGLContextRestore = (e) => {
      console.log("Browser's context is restored.", e)
      this.canvas.removeEventListener('webglcontextlost', handleWebGLConextLost)
      this.canvas.removeEventListener('webglcontextrestored', handleWebGLContextRestore)
      this.initialize(entity)
      this.needsResize = true
    }

    if (this.webGLLostContext) {
      canvas.addEventListener('webglcontextlost', handleWebGLConextLost)
    } else {
      console.log('Browser does not support `WEBGL_lose_context` extension')
    }
  }
}

/**
 * Change the quality of the renderer.
 */
const changeQualityLevel = (renderer: EngineRenderer) => {
  const time = Date.now()
  const delta = time - lastRenderTime
  lastRenderTime = time

  const { qualityLevel } = getState(RendererState)
  let newQualityLevel = qualityLevel

  renderer.movingAverage.update(Math.min(delta, 50))
  const averageDelta = renderer.movingAverage.mean

  if (averageDelta > renderer.maxRenderDelta) {
    PerformanceManager.decrementPerformance()
    if (newQualityLevel > 1) newQualityLevel--
  } else if (averageDelta < renderer.minRenderDelta) {
    PerformanceManager.incrementPerformance()
    if (newQualityLevel < renderer.maxQualityLevel) newQualityLevel++
  }

  if (newQualityLevel !== qualityLevel) {
    getMutableState(RendererState).qualityLevel.set(newQualityLevel)
  }
}

/**
 * Executes the system. Called each frame by default from the Engine.instance.
 * @param delta Time since last frame.
 */
export const render = (
  delta: number,
  camera: ArrayCamera,
  renderer: EngineRenderer,
  entitiesToRender: Entity[],
  effectComposer = true
) => {
  const objects = entitiesToRender
    .filter((entity) => hasComponent(entity, GroupComponent))
    .map((entity) => getComponent(entity, GroupComponent))
    .flat()
  const xrFrame = getState(XRState).xrFrame

  const canvasParent = renderer.canvas.parentElement
  if (!canvasParent) return

  const state = getState(RendererState)

  const engineState = getState(EngineState)
  if (!engineState.isEditor && state.automatic) changeQualityLevel(renderer)

  if (renderer.needsResize) {
    const curPixelRatio = renderer.renderer.getPixelRatio()
    const scaledPixelRatio = window.devicePixelRatio * renderer.scaleFactor

    if (curPixelRatio !== scaledPixelRatio) renderer.renderer.setPixelRatio(scaledPixelRatio)

    const width = canvasParent.clientWidth
    const height = canvasParent.clientHeight

    if (camera.isPerspectiveCamera) {
      camera.aspect = width / height
      camera.updateProjectionMatrix()
    }

    state.qualityLevel > 0 && state.csm?.updateFrustums()

    if (renderer.effectComposer) {
      renderer.effectComposer.setSize(width, height, true)
    } else {
      renderer.renderer.setSize(width, height, true)
    }

    renderer.needsResize = false
  }

  Engine.instance.scene.children = objects

  /** Postprocessing does not support multipass yet, so just use basic renderer when in VR */
  if (xrFrame || !effectComposer || !renderer.effectComposer) {
    for (const c of camera.cameras) c.layers.mask = camera.layers.mask
    renderer.renderer.clear()
    renderer.renderer.render(Engine.instance.scene, camera)
  } else {
    renderer.effectComposer.render(delta)
  }

  Engine.instance.scene.children = []
}

export const RenderSettingsState = defineState({
  name: 'RenderSettingsState',
  initial: {
    csm: true,
    cascades: 5,
    toneMapping: LinearToneMapping as ToneMapping,
    toneMappingExposure: 0.8,
    shadowMapType: PCFSoftShadowMap as ShadowMapType,
    smaaPreset: SMAAPreset.MEDIUM
  }
})

export const PostProcessingSettingsState = defineState({
  name: 'PostProcessingSettingsState',
  initial: {
    enabled: false,
    effects: defaultPostProcessingSchema
  }
})

const rendererQuery = defineQuery([RendererComponent, CameraComponent, SceneComponent])

const execute = () => {
  for (const entity of rendererQuery()) {
    const deltaSeconds = getState(ECSState).deltaSeconds
    const camera = getComponent(entity, CameraComponent)
    const renderer = getComponent(entity, RendererComponent)
    const scene = getComponent(entity, SceneComponent)
    const entitiesToRender = scene.children.map((sceneEntity) => getNestedChildren(sceneEntity)).flat()
    render(deltaSeconds, camera, renderer, entitiesToRender)
  }
}

const rendererReactor = () => {
  const entity = useEntityContext()
  const renderer = useComponent(entity, RendererComponent).value
  const renderSettings = useHookstate(getMutableState(RenderSettingsState))
  const engineRendererSettings = useHookstate(getMutableState(RendererState))
  const postprocessing = useHookstate(getMutableState(PostProcessingSettingsState))
  const xrState = useHookstate(getMutableState(XRState))
  const sdfState = useHookstate(getMutableState(SDFSettingsState))

  useEffect(() => {
    renderer.renderer.toneMapping = renderSettings.toneMapping.value
  }, [renderSettings.toneMapping])

  useEffect(() => {
    renderer.renderer.toneMappingExposure = renderSettings.toneMappingExposure.value
  }, [renderSettings.toneMappingExposure])

  useEffect(() => {
    renderer.renderer.shadowMap.type = renderSettings.shadowMapType.value
    renderer.renderer.shadowMap.needsUpdate = true
  }, [xrState.supportedSessionModes, renderSettings.shadowMapType, engineRendererSettings.useShadows])

  useEffect(() => {
    configureEffectComposer(entity)
  }, [
    postprocessing.enabled,
    postprocessing.effects,
    sdfState.enabled,
    engineRendererSettings.usePostProcessing,
    renderSettings.smaaPreset
  ])

  useEffect(() => {
    renderer.scaleFactor = engineRendererSettings.qualityLevel.value / renderer.maxQualityLevel
    renderer.renderer.setPixelRatio(window.devicePixelRatio * renderer.scaleFactor)
    renderer.needsResize = true
  }, [engineRendererSettings.qualityLevel])

  useEffect(() => {
    changeRenderMode()
  }, [engineRendererSettings.renderMode])

  return null
}

const cameraReactor = () => {
  const entity = useEntityContext()
  const camera = useComponent(entity, CameraComponent).value
  const engineRendererSettings = useHookstate(getMutableState(RendererState))

  useEffect(() => {
    if (engineRendererSettings.physicsDebug.value) camera.layers.enable(ObjectLayers.PhysicsHelper)
    else camera.layers.disable(ObjectLayers.PhysicsHelper)
  }, [engineRendererSettings.physicsDebug])

  useEffect(() => {
    if (engineRendererSettings.avatarDebug.value) camera.layers.enable(ObjectLayers.AvatarHelper)
    else camera.layers.disable(ObjectLayers.AvatarHelper)
  }, [engineRendererSettings.avatarDebug])

  useEffect(() => {
    if (engineRendererSettings.gridVisibility.value) camera.layers.enable(ObjectLayers.Gizmos)
    else camera.layers.disable(ObjectLayers.Gizmos)
  }, [engineRendererSettings.gridVisibility])

  useEffect(() => {
    if (engineRendererSettings.nodeHelperVisibility.value) camera.layers.enable(ObjectLayers.NodeHelper)
    else camera.layers.disable(ObjectLayers.NodeHelper)
  }, [engineRendererSettings.nodeHelperVisibility])

  return null
}

export const WebGLRendererSystem = defineSystem({
  uuid: 'ee.engine.WebGLRendererSystem',
  insert: { with: PresentationSystemGroup },
  execute,
  reactor: () => {
    return (
      <>
        <QueryReactor Components={[RendererComponent]} ChildEntityReactor={rendererReactor} />
        <QueryReactor Components={[CameraComponent]} ChildEntityReactor={cameraReactor} />
      </>
    )
  }
})
