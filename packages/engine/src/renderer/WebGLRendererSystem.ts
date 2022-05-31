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
import {
  PerspectiveCamera,
  sRGBEncoding,
  WebGL1Renderer,
  WebGLRenderer,
  WebGLRendererParameters,
  WebXRManager,
  XRSession
} from 'three'

import { isDev } from '@xrengine/common/src/utils/isDev'
import { addActionReceptor, dispatchAction } from '@xrengine/hyperflux'

import { CSM } from '../assets/csm/CSM'
import { ExponentialMovingAverage } from '../common/classes/ExponentialAverageCurve'
import { nowMilliseconds } from '../common/functions/nowMilliseconds'
import { Engine } from '../ecs/classes/Engine'
import { EngineActions, getEngineState } from '../ecs/classes/EngineState'
import { Entity } from '../ecs/classes/Entity'
import { World } from '../ecs/classes/World'
import { matchActionOnce } from '../networking/functions/matchActionOnce'
import { LinearTosRGBEffect } from './effects/LinearTosRGBEffect'
import {
  accessEngineRendererState,
  EngineRendererAction,
  EngineRendererReceptor,
  restoreEngineRendererData
} from './EngineRendererState'
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
  rendereringEnabled = true
  canvas: HTMLCanvasElement

  averageFrameTime = 1000 / 60
  timeSamples = new Array(60 * 1).fill(1000 / 60) // 3 seconds @ 60fps
  index = 0

  averageTimePeriods = 3 * 60 // 3 seconds @ 60fps
  /** init ExponentialMovingAverage */
  movingAverage = new ExponentialMovingAverage(this.averageTimePeriods)

  renderer: WebGLRenderer = null!
  effectComposer: EffectComposerWithSchema = null!
  xrManager: WebXRManager = null!
  xrSession: XRSession = null!
  csm: CSM = null!
  isCSMEnabled = false
  directionalLightEntities: Entity[] = []
  activeCSMLightEntity: Entity | null = null

  initialize() {
    this.onResize = this.onResize.bind(this)

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
      depth: false,
      canvas,
      context,
      preserveDrawingBuffer: !Engine.instance.isHMD
    }

    this.canvas = canvas

    canvas.ondragstart = (e) => {
      e.preventDefault()
      return false
    }

    const renderer = this.supportWebGL2 ? new WebGLRenderer(options) : new WebGL1Renderer(options)
    this.renderer = renderer
    this.renderer.physicallyCorrectLights = true
    this.renderer.outputEncoding = sRGBEncoding

    // DISABLE THIS IF YOU ARE SEEING SHADER MISBEHAVING - UNCHECK THIS WHEN TESTING UPDATING THREEJS
    this.renderer.debug.checkShaderErrors = isDev

    this.xrManager = renderer.xr
    //@ts-ignore
    renderer.xr.cameraAutoUpdate = false
    this.xrManager.enabled = true

    window.addEventListener('resize', this.onResize, false)
    this.onResize()

    this.renderer.autoClear = true
    this.effectComposer = new EffectComposer(this.renderer) as any
  }

  resetScene() {
    this.directionalLightEntities = []
    this.activeCSMLightEntity = null!
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
    if (this.xrManager.isPresenting) {
      this.csm?.update()
      this.renderer.render(Engine.instance.currentWorld.scene, Engine.instance.currentWorld.camera)
    } else {
      const state = accessEngineRendererState()
      const engineState = getEngineState()
      if (state.automatic.value && engineState.joinedWorld.value) this.changeQualityLevel()
      if (this.rendereringEnabled) {
        if (this.needsResize) {
          const curPixelRatio = this.renderer.getPixelRatio()
          const scaledPixelRatio = window.devicePixelRatio * this.scaleFactor

          if (curPixelRatio !== scaledPixelRatio) this.renderer.setPixelRatio(scaledPixelRatio)

          const width = window.innerWidth
          const height = window.innerHeight

          if ((Engine.instance.currentWorld.camera as PerspectiveCamera).isPerspectiveCamera) {
            const cam = Engine.instance.currentWorld.camera as PerspectiveCamera
            cam.aspect = width / height
            cam.updateProjectionMatrix()
          }

          state.qualityLevel.value > 0 && this.csm?.updateFrustums()
          // Effect composer calls renderer.setSize internally
          this.effectComposer.setSize(width, height, true)
          this.needsResize = false
        }

        state.qualityLevel.value > 0 && this.csm?.update()
        if (state.usePostProcessing.value) {
          this.effectComposer.render(delta)
        } else {
          this.renderer.autoClear = true
          this.renderer.render(Engine.instance.currentWorld.scene, Engine.instance.currentWorld.camera)
        }
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

    const state = accessEngineRendererState()
    let qualityLevel = state.qualityLevel.value

    this.movingAverage.update(Math.min(delta, 50))
    const averageDelta = this.movingAverage.mean

    if (averageDelta > this.maxRenderDelta && qualityLevel > 1) {
      qualityLevel--
    } else if (averageDelta < this.minRenderDelta && qualityLevel < this.maxQualityLevel) {
      qualityLevel++
    }

    if (qualityLevel !== state.qualityLevel.value) {
      dispatchAction(EngineRendererAction.setQualityLevel(qualityLevel))
    }
  }
}

export default async function WebGLRendererSystem(world: World) {
  matchActionOnce(EngineActions.joinedWorld.matches, () => {
    restoreEngineRendererData()
  })

  addActionReceptor(EngineRendererReceptor)

  return () => {
    EngineRenderer.instance.execute(world.deltaSeconds)
  }
}

globalThis.EngineRenderer = EngineRenderer
