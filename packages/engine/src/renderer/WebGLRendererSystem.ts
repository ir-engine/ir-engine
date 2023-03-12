import _ from 'lodash'
import {
  BloomEffect,
  BrightnessContrastEffect,
  ColorDepthEffect,
  DepthOfFieldEffect,
  EffectComposer,
  HueSaturationEffect,
  NormalPass,
  OutlineEffect,
  RenderPass,
  SMAAEffect,
  SSAOEffect,
  ToneMappingEffect
} from 'postprocessing'
import { useEffect } from 'react'
import {
  LinearToneMapping,
  PCFSoftShadowMap,
  PerspectiveCamera,
  ShadowMapType,
  Skeleton,
  SkinnedMesh,
  sRGBEncoding,
  ToneMapping,
  WebGL1Renderer,
  WebGLRenderer,
  WebGLRendererParameters
} from 'three'

import {
  createActionQueue,
  defineState,
  dispatchAction,
  getMutableState,
  hookstate,
  removeActionQueue,
  startReactor,
  State,
  useHookstate
} from '@etherealengine/hyperflux'

import { CSM } from '../assets/csm/CSM'
import { ExponentialMovingAverage } from '../common/classes/ExponentialAverageCurve'
import { isMobile } from '../common/functions/isMobile'
import { nowMilliseconds } from '../common/functions/nowMilliseconds'
import { overrideOnBeforeCompile } from '../common/functions/OnBeforeCompilePlugin'
import { Engine } from '../ecs/classes/Engine'
import { EngineActions, getEngineState } from '../ecs/classes/EngineState'
import { Scene } from '../ecs/classes/Scene'
import { getComponent } from '../ecs/functions/ComponentFunctions'
import { GroupComponent } from '../scene/components/GroupComponent'
import { ObjectLayers } from '../scene/constants/ObjectLayers'
import { defaultPostProcessingSchema } from '../scene/constants/PostProcessing'
import { createWebXRManager, WebXRManager } from '../xr/WebXRManager'
import { isHeadset, useIsHeadset, XRState } from '../xr/XRState'
import { RenderModes, RenderModesType } from './constants/RenderModes'
import { LinearTosRGBEffect } from './effects/LinearTosRGBEffect'
import { changeRenderMode } from './functions/changeRenderMode'
import { configureEffectComposer } from './functions/configureEffectComposer'
import { updateShadowMap } from './functions/RenderSettingsFunction'
import { RendererState } from './RendererState'
import WebGL from './THREE.WebGL'

export interface EffectComposerWithSchema extends EffectComposer {
  OutlineEffect: OutlineEffect
  // FXAAEffect: FXAAEffect
  SMAAEffect: SMAAEffect
  SSAOEffect: SSAOEffect
  DepthOfFieldEffect: DepthOfFieldEffect
  BloomEffect: BloomEffect
  ToneMappingEffect: ToneMappingEffect
  BrightnessContrastEffect: BrightnessContrastEffect
  HueSaturationEffect: HueSaturationEffect
  ColorDepthEffect: ColorDepthEffect
  LinearTosRGBEffect: LinearTosRGBEffect
}

let lastRenderTime = 0

export class EngineRenderer {
  static instance: EngineRenderer

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

  averageFrameTime = 1000 / 60
  timeSamples = new Array(60 * 1).fill(1000 / 60) // 3 seconds @ 60fps
  index = 0

  averageTimePeriods = 3 * 60 // 3 seconds @ 60fps
  /** init ExponentialMovingAverage */
  movingAverage = new ExponentialMovingAverage(this.averageTimePeriods)

  renderer: WebGLRenderer = null!
  effectComposer: EffectComposerWithSchema = null!
  /** @todo deprecate and replace with engine implementation */
  xrManager: WebXRManager = null!
  csm: CSM = null!
  webGLLostContext: any = null

  initialize() {
    overrideOnBeforeCompile()
    this.onResize = this.onResize.bind(this)
    this.handleWebGLConextLost = this.handleWebGLConextLost.bind(this)
    this.handleWebGLConextRestore = this.handleWebGLConextRestore.bind(this)

    this.supportWebGL2 = WebGL.isWebGL2Available()

    if (!this.supportWebGL2 && !WebGL.isWebGLAvailable()) {
      WebGL.dispatchWebGLDisconnectedEvent()
    }

    const canvas: HTMLCanvasElement = document.querySelector('canvas')!
    const context = this.supportWebGL2 ? canvas.getContext('webgl2')! : canvas.getContext('webgl')!

    if (!context) {
      dispatchAction(
        EngineActions.browserNotSupported({
          msg: 'Your browser does not have WebGL enabled. Please enable WebGL, or try another browser.'
        }) as any
      )
    }

    this.renderContext = context!
    const options: WebGLRendererParameters = {
      precision: 'highp',
      powerPreference: 'high-performance',
      stencil: false,
      antialias: false,
      depth: true,
      logarithmicDepthBuffer: true,
      canvas,
      context,
      preserveDrawingBuffer: false,
      //@ts-ignore
      multiviewStereo: true
    }

    this.canvas = canvas
    canvas.focus()

    canvas.ondragstart = (e) => {
      e.preventDefault()
      return false
    }

    const renderer = this.supportWebGL2 ? new WebGLRenderer(options) : new WebGL1Renderer(options)
    this.renderer = renderer
    // @ts-ignore
    this.renderer.useLegacyLights = false //true
    this.renderer.outputEncoding = sRGBEncoding

    // DISABLE THIS IF YOU ARE SEEING SHADER MISBEHAVING - UNCHECK THIS WHEN TESTING UPDATING THREEJS
    this.renderer.debug.checkShaderErrors = false //isDev

    // @ts-ignore
    this.xrManager = renderer.xr = createWebXRManager()
    this.xrManager.cameraAutoUpdate = false
    this.xrManager.enabled = true

    window.addEventListener('resize', this.onResize, false)
    this.onResize()

    this.renderer.autoClear = true
    this.effectComposer = new EffectComposer(this.renderer) as any

    //Todo: WebGL restore context
    this.webGLLostContext = context.getExtension('WEBGL_lose_context')

    // TODO: for test purpose, need to remove when PR is merging
    // webGLLostContext.loseContext() in inspect can simulate the conext lost
    //@ts-ignore
    window.webGLLostContext = this.webGLLostContext

    if (this.webGLLostContext) {
      canvas.addEventListener('webglcontextlost', this.handleWebGLConextLost)
      canvas.addEventListener('webglcontextrestored', this.handleWebGLConextRestore)
    } else {
      console.log('Browser does not support `WEBGL_lose_context` extension')
    }
  }

  handleWebGLConextLost(e) {
    console.log('Browser lost the context.', e)
    e.preventDefault()
    this.needsResize = false
    setTimeout(() => {
      this.effectComposer.setSize(0, 0, true)
      if (this.webGLLostContext) this.webGLLostContext.restoreContext()
    }, 1000)
  }

  handleWebGLConextRestore(e) {
    console.log("Browser's context is restored.", e)
    this.canvas.removeEventListener('webglcontextlost', this.handleWebGLConextLost)
    this.canvas.removeEventListener('webglcontextrestored', this.handleWebGLConextRestore)
    this.initialize()
    this.needsResize = true
  }

  /** Called on resize, sets resize flag. */
  onResize(): void {
    this.needsResize = true
  }

  /**
   * Executes the system. Called each frame by default from the Engine.instance.
   * @param delta Time since last frame.
   */
  execute(delta: number): void {
    const xrCamera = EngineRenderer.instance.xrManager.getCamera()
    const xrFrame = Engine.instance.xrFrame

    /** Postprocessing does not support multipass yet, so just use basic renderer when in VR */
    if (xrFrame) {
      // Assume Engine.instance.camera.layers is source of truth for all xr cameras
      const camera = Engine.instance.camera as PerspectiveCamera
      xrCamera.layers.mask = camera.layers.mask
      for (const c of xrCamera.cameras) c.layers.mask = camera.layers.mask

      this.renderer.render(Engine.instance.scene, Engine.instance.camera)
    } else {
      const state = getMutableState(RendererState)
      const engineState = getEngineState()
      if (!engineState.isEditor.value && state.automatic.value && engineState.joinedWorld.value)
        this.changeQualityLevel()
      if (this.needsResize) {
        const curPixelRatio = this.renderer.getPixelRatio()
        const scaledPixelRatio = window.devicePixelRatio * this.scaleFactor

        if (curPixelRatio !== scaledPixelRatio) this.renderer.setPixelRatio(scaledPixelRatio)

        const width = window.innerWidth
        const height = window.innerHeight

        if ((Engine.instance.camera as PerspectiveCamera).isPerspectiveCamera) {
          const cam = Engine.instance.camera as PerspectiveCamera
          cam.aspect = width / height
          cam.updateProjectionMatrix()
        }

        state.qualityLevel.value > 0 && this.csm?.updateFrustums()
        // Effect composer calls renderer.setSize internally
        this.effectComposer.setSize(width, height, true)
        this.needsResize = false
      }

      /**
       * Editor should always use post processing, even if no postprocessing schema is in the scene,
       *   it still uses post processing for effects such as outline.
       */
      if (state.usePostProcessing.value || engineState.isEditor.value) {
        this.effectComposer.render(delta)
      } else {
        this.renderer.autoClear = true
        this.renderer.render(Engine.instance.scene, Engine.instance.camera)
      }
    }
  }

  /**
   * Change the quality of the renderer.
   */
  changeQualityLevel(): void {
    const time = nowMilliseconds()
    const delta = time - lastRenderTime
    lastRenderTime = time

    const state = getMutableState(RendererState)
    let qualityLevel = state.qualityLevel.value

    this.movingAverage.update(Math.min(delta, 50))
    const averageDelta = this.movingAverage.mean

    if (averageDelta > this.maxRenderDelta && qualityLevel > 1) {
      qualityLevel--
    } else if (averageDelta < this.minRenderDelta && qualityLevel < this.maxQualityLevel) {
      qualityLevel++
    }

    if (qualityLevel !== state.qualityLevel.value) {
      state.qualityLevel.set(qualityLevel)
    }
  }
}

export const DefaultRenderSettingsState = {
  // LODs: { ...DEFAULT_LOD_DISTANCES },
  csm: true,
  toneMapping: LinearToneMapping as ToneMapping,
  toneMappingExposure: 0.8,
  shadowMapType: PCFSoftShadowMap as ShadowMapType
}

export type RenderSettingsState = State<typeof DefaultRenderSettingsState>

export const DefaultPostProcessingState = {
  enabled: false,
  effects: defaultPostProcessingSchema
}

export type PostProcessingState = State<typeof DefaultPostProcessingState>

export const RendererSceneMetadataLabel = 'renderSettings'
export const PostProcessingSceneMetadataLabel = 'postprocessing'

export const getRendererSceneMetadataState = (scene: Scene) =>
  scene.sceneMetadataRegistry[RendererSceneMetadataLabel].state as RenderSettingsState
export const getPostProcessingSceneMetadataState = (scene: Scene) =>
  scene.sceneMetadataRegistry[PostProcessingSceneMetadataLabel].state as PostProcessingState

export default async function WebGLRendererSystem() {
  Engine.instance.currentScene.sceneMetadataRegistry[RendererSceneMetadataLabel] = {
    state: hookstate(_.cloneDeep(DefaultRenderSettingsState)),
    default: DefaultRenderSettingsState
  }

  Engine.instance.currentScene.sceneMetadataRegistry[PostProcessingSceneMetadataLabel] = {
    state: hookstate(_.cloneDeep(DefaultPostProcessingState)),
    default: DefaultPostProcessingState
  }

  const rendererState = getMutableState(RendererState)

  const reactor = startReactor(function RendererReactor() {
    const renderSettings = useHookstate(getRendererSceneMetadataState(Engine.instance.currentScene))
    const engineRendererSettings = useHookstate(rendererState)
    const postprocessing = useHookstate(getPostProcessingSceneMetadataState(Engine.instance.currentScene))
    const xrState = useHookstate(getMutableState(XRState))

    useEffect(() => {
      EngineRenderer.instance.renderer.toneMapping = renderSettings.toneMapping.value
    }, [renderSettings.toneMapping])

    useEffect(() => {
      EngineRenderer.instance.renderer.toneMappingExposure = renderSettings.toneMappingExposure.value
    }, [renderSettings.toneMappingExposure])

    useEffect(() => {
      updateShadowMap()
    }, [xrState.supportedSessionModes, renderSettings.shadowMapType, engineRendererSettings.useShadows])

    useEffect(() => {
      configureEffectComposer()
    }, [postprocessing, engineRendererSettings.usePostProcessing])

    useEffect(() => {
      EngineRenderer.instance.scaleFactor =
        engineRendererSettings.qualityLevel.value / EngineRenderer.instance.maxQualityLevel
      EngineRenderer.instance.renderer.setPixelRatio(window.devicePixelRatio * EngineRenderer.instance.scaleFactor)
      EngineRenderer.instance.needsResize = true
    }, [engineRendererSettings.qualityLevel])

    useEffect(() => {
      changeRenderMode()
    }, [engineRendererSettings.renderMode])

    useEffect(() => {
      if (engineRendererSettings.debugEnable.value) Engine.instance.camera.layers.enable(ObjectLayers.PhysicsHelper)
      else Engine.instance.camera.layers.disable(ObjectLayers.PhysicsHelper)
    }, [engineRendererSettings.debugEnable])

    useEffect(() => {
      if (engineRendererSettings.gridVisibility.value) Engine.instance.camera.layers.enable(ObjectLayers.Gizmos)
      else Engine.instance.camera.layers.disable(ObjectLayers.Gizmos)
    }, [engineRendererSettings.gridVisibility])

    useEffect(() => {
      if (engineRendererSettings.nodeHelperVisibility.value)
        Engine.instance.camera.layers.enable(ObjectLayers.NodeHelper)
      else Engine.instance.camera.layers.disable(ObjectLayers.NodeHelper)
    }, [engineRendererSettings.nodeHelperVisibility])

    return null
  })

  const execute = () => {
    EngineRenderer.instance.execute(Engine.instance.deltaSeconds)
  }

  const cleanup = async () => {
    await reactor.stop()
  }

  return { execute, cleanup }
}

globalThis.EngineRenderer = EngineRenderer
