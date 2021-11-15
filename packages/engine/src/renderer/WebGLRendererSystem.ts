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
  SSAOEffect,
  ToneMappingEffect
} from 'postprocessing'
import { MathUtils, PerspectiveCamera, sRGBEncoding, WebGL1Renderer, WebGLRenderer, WebGLRenderTarget } from 'three'
import { ClientStorage } from '../common/classes/ClientStorage'
import { nowMilliseconds } from '../common/functions/nowMilliseconds'
import { Engine } from '../ecs/classes/Engine'
import { EngineEvents } from '../ecs/classes/EngineEvents'
import { System } from '../ecs/classes/System'
import WebGL from './THREE.WebGL'
import { FXAAEffect } from './effects/FXAAEffect'
import { LinearTosRGBEffect } from './effects/LinearTosRGBEffect'
import { World } from '../ecs/classes/World'
import { useWorld } from '../ecs/functions/SystemHooks'
import { configureEffectComposer } from './functions/configureEffectComposer'

export enum RENDERER_SETTINGS {
  AUTOMATIC = 'automatic',
  PBR = 'usePBR',
  POST_PROCESSING = 'usePostProcessing',
  SHADOW_QUALITY = 'shadowQuality',
  SCALE_FACTOR = 'scaleFactor'
}

const databasePrefix = 'graphics-settings-'

export interface EffectComposerWithSchema extends EffectComposer {
  // TODO: 'postprocessing' needs typing, we could create a '@types/postprocessing' package?
  renderer: WebGLRenderer
  inputBuffer: WebGLRenderTarget
  outputBuffer: WebGLRenderTarget
  copyPass: any
  depthTexture: any
  passes: any[]
  autoRenderToScreen: boolean
  multisampling: number
  getRenderer()
  replaceRenderer(renderer, updateDOM)
  createDepthTexture()
  deleteDepthTexture()
  createBuffer(depthBuffer, stencilBuffer, type, multisampling)
  addPass(renderPass: any)
  removePass()
  removeAllPasses()
  render(delta: number)
  setSize(width: number, height: number, arg2: boolean)
  reset()
  dispose()

  // this is what this is for, i just added the EffectComposer typings above
  OutlineEffect: OutlineEffect
  FXAAEffect: FXAAEffect
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

type EngineRendererProps = {
  canvas: HTMLCanvasElement
  enabled: boolean
}

export class EngineRenderer {
  static EVENTS = {
    QUALITY_CHANGED: 'WEBGL_RENDERER_SYSTEM_EVENT_QUALITY_CHANGE',
    SET_RESOLUTION: 'WEBGL_RENDERER_SYSTEM_EVENT_SET_RESOLUTION',
    USE_SHADOWS: 'WEBGL_RENDERER_SYSTEM_EVENT_SET_SHADOW_QUALITY',
    SET_POST_PROCESSING: 'WEBGL_RENDERER_SYSTEM_EVENT_SET_POST_PROCESSING',
    SET_USE_AUTOMATIC: 'WEBGL_RENDERER_SYSTEM_EVENT_SET_USE_AUTOMATIC'
  }

  static instance: EngineRenderer

  /** Is resize needed? */
  needsResize: boolean

  /** Maximum Quality level of the rendered. **Default** value is 5. */
  maxQualityLevel = 5
  /** Current quality level. */
  qualityLevel: number = this.maxQualityLevel
  /** Previous Quality leve. */
  prevQualityLevel: number = this.qualityLevel
  /** point at which we downgrade quality level (large delta) */
  maxRenderDelta = 1000 / 40 // 40 fps = 25 ms
  /** point at which we upgrade quality level (small delta) */
  minRenderDelta = 1000 / 60 // 60 fps = 16 ms

  automatic = true
  usePBR = true
  usePostProcessing = true
  useShadows = true
  /** Resoulion scale. **Default** value is 1. */
  scaleFactor = 1

  postProcessingConfig = null
  renderPass: RenderPass
  normalPass: NormalPass
  renderContext: WebGLRenderingContext | WebGL2RenderingContext

  supportWebGL2: boolean
  rendereringEnabled = true
  canvas: HTMLCanvasElement

  averageFrameTime = 1000 / 60
  timeSamples = new Array(60 * 1).fill(1000 / 60) // 3 seconds @ 60fps
  index = 0

  /** Constructs WebGL Renderer System. */
  constructor(attributes: EngineRendererProps) {
    EngineRenderer.instance = this
    this.onResize = this.onResize.bind(this)

    this.supportWebGL2 = WebGL.isWebGL2Available()

    if (!this.supportWebGL2 && !WebGL.isWebGLAvailable()) {
      WebGL.dispatchWebGLDisconnectedEvent()
    }

    const canvas: HTMLCanvasElement = attributes.canvas ?? document.querySelector('canvas')
    const context = this.supportWebGL2 ? canvas.getContext('webgl2') : canvas.getContext('webgl')

    if (!context) {
      EngineEvents.instance.dispatchEvent({
        type: EngineEvents.EVENTS.BROWSER_NOT_SUPPORTED,
        message: 'Your brower does not support webgl,or it disable webgl,Please enable webgl'
      })
    }

    this.renderContext = context!
    const options: any = {
      powerPreference: 'high-performance',
      canvas,
      context,
      antialias: !Engine.isHMD,
      preserveDrawingBuffer: !Engine.isHMD
    }

    this.canvas = canvas

    canvas.ondragstart = (e) => {
      e.preventDefault()
      return false
    }

    const renderer = this.supportWebGL2 ? new WebGLRenderer(options) : new WebGL1Renderer(options)
    Engine.renderer = renderer
    Engine.renderer.physicallyCorrectLights = true
    Engine.renderer.outputEncoding = sRGBEncoding

    // DISABLE THIS IF YOU ARE SEEING SHADER MISBEHAVING - UNCHECK THIS WHEN TESTING UPDATING THREEJS
    // Engine.renderer.debug.checkShaderErrors = false

    Engine.xrManager = renderer.xr
    //@ts-ignore
    renderer.xr.cameraAutoUpdate = false
    Engine.xrManager.enabled = true

    window.addEventListener('resize', this.onResize, false)
    this.onResize()

    this.needsResize = true
    Engine.renderer.autoClear = true

    configureEffectComposer(EngineRenderer.instance.postProcessingConfig)

    EngineEvents.instance.addEventListener(EngineRenderer.EVENTS.SET_POST_PROCESSING, (ev: any) => {
      this.setUsePostProcessing(this.supportWebGL2 && ev.payload)
    })
    EngineEvents.instance.addEventListener(EngineRenderer.EVENTS.SET_RESOLUTION, (ev: any) => {
      this.setResolution(ev.payload)
    })
    EngineEvents.instance.addEventListener(EngineRenderer.EVENTS.USE_SHADOWS, (ev: any) => {
      this.setShadowQuality(ev.payload)
    })
    EngineEvents.instance.addEventListener(EngineRenderer.EVENTS.SET_USE_AUTOMATIC, (ev: any) => {
      this.setUseAutomatic(ev.payload)
    })
    EngineEvents.instance.addEventListener(EngineEvents.EVENTS.ENABLE_SCENE, (ev: any) => {
      if (typeof ev.renderer !== 'undefined') {
        this.rendereringEnabled = ev.renderer
      }
    })
  }

  /** Called on resize, sets resize flag. */
  onResize(): void {
    this.needsResize = true
  }

  /**
   * Executes the system. Called each frame by default from the Engine.
   * @param delta Time since last frame.
   */
  execute(delta: number): void {
    if (Engine.xrManager.isPresenting) {
      Engine.csm?.update()
      Engine.renderer.render(Engine.scene, Engine.camera)
    } else {
      this.changeQualityLevel()

      if (this.rendereringEnabled) {
        if (this.needsResize) {
          const curPixelRatio = Engine.renderer.getPixelRatio()
          const scaledPixelRatio = window.devicePixelRatio * this.scaleFactor

          if (curPixelRatio !== scaledPixelRatio) Engine.renderer.setPixelRatio(scaledPixelRatio)

          const width = window.innerWidth
          const height = window.innerHeight

          if ((Engine.camera as PerspectiveCamera).isPerspectiveCamera) {
            const cam = Engine.camera as PerspectiveCamera
            cam.aspect = width / height
            cam.updateProjectionMatrix()
          }

          this.qualityLevel > 0 && Engine.csm?.updateFrustums()
          Engine.renderer.setSize(width, height, false)
          Engine.effectComposer.setSize(width, height, false)
          this.needsResize = false
        }

        this.qualityLevel > 0 && Engine.csm?.update()
        if (this.usePostProcessing && Engine.effectComposer) {
          Engine.effectComposer.render(delta)
        } else {
          Engine.renderer.autoClear = true
          Engine.renderer.render(Engine.scene, Engine.camera)
        }
        // if on oculus, render one frame and freeze, just to create a preview of the scene
        if (Engine.isHMD) {
          this.rendereringEnabled = false
        }
      }
    }
  }

  calculateMovingAverage = (delta: number): number => {
    this.averageFrameTime =
      (this.averageFrameTime * this.timeSamples.length + delta - this.timeSamples[this.index]) / this.timeSamples.length

    this.timeSamples[this.index] = delta
    this.index = (this.index + 1) % this.timeSamples.length

    return this.averageFrameTime
  }

  /**
   * Change the quality of the renderer.
   */
  changeQualityLevel(): void {
    const time = nowMilliseconds()
    const delta = time - lastRenderTime
    lastRenderTime = time

    if (!this.automatic) return

    const averageDelta = this.calculateMovingAverage(delta)

    // dont downgrade when scene is still loading in
    if (useWorld().elapsedTime > 5) {
      if (averageDelta > this.minRenderDelta) {
        this.qualityLevel--
      }
      if (averageDelta < this.maxRenderDelta) {
        this.qualityLevel++
      }
    }
    this.qualityLevel = Math.round(MathUtils.clamp(this.qualityLevel, 1, this.maxQualityLevel))

    // set resolution scale
    if (this.prevQualityLevel !== this.qualityLevel) {
      this.prevQualityLevel = this.qualityLevel
      this.doAutomaticRenderQuality()
      this.dispatchSettingsChangeEvent()
    }
  }

  doAutomaticRenderQuality() {
    this.setShadowQuality(this.qualityLevel > 1)
    this.setResolution(this.qualityLevel / this.maxQualityLevel)
    this.setUsePostProcessing(this.qualityLevel > 2)
  }

  dispatchSettingsChangeEvent() {
    EngineEvents.instance.dispatchEvent({
      type: EngineRenderer.EVENTS.QUALITY_CHANGED,
      shadows: this.useShadows,
      resolution: this.scaleFactor,
      postProcessing: this.usePostProcessing,
      pbr: this.usePBR,
      automatic: this.automatic
    })
  }

  setUseAutomatic(automatic) {
    this.automatic = automatic
    if (this.automatic) {
      this.doAutomaticRenderQuality()
    }
    ClientStorage.set(databasePrefix + RENDERER_SETTINGS.AUTOMATIC, this.automatic)
  }

  setResolution(resolution) {
    this.scaleFactor = resolution
    Engine.renderer.setPixelRatio(window.devicePixelRatio * this.scaleFactor)
    this.needsResize = true
    ClientStorage.set(databasePrefix + RENDERER_SETTINGS.SCALE_FACTOR, this.scaleFactor)
  }

  setShadowQuality(useShadows) {
    if (this.useShadows === useShadows) return

    this.useShadows = useShadows
    Engine.renderer.shadowMap.enabled = useShadows
    ClientStorage.set(databasePrefix + RENDERER_SETTINGS.SHADOW_QUALITY, this.useShadows)
  }

  setUsePostProcessing(usePostProcessing) {
    if (this.usePostProcessing === usePostProcessing) return

    this.usePostProcessing = this.supportWebGL2 && usePostProcessing
    ClientStorage.set(databasePrefix + RENDERER_SETTINGS.POST_PROCESSING, this.usePostProcessing)
  }

  async loadGraphicsSettingsFromStorage() {
    this.automatic = ((await ClientStorage.get(databasePrefix + RENDERER_SETTINGS.AUTOMATIC)) as boolean) ?? true
    this.scaleFactor = ((await ClientStorage.get(databasePrefix + RENDERER_SETTINGS.SCALE_FACTOR)) as number) ?? 1
    this.useShadows = ((await ClientStorage.get(databasePrefix + RENDERER_SETTINGS.SHADOW_QUALITY)) as boolean) ?? true
    // this.usePBR = await ClientStorage.get(databasePrefix + RENDERER_SETTINGS.PBR) as boolean ?? true; // TODO: implement PBR setting
    this.usePostProcessing =
      ((await ClientStorage.get(databasePrefix + RENDERER_SETTINGS.POST_PROCESSING)) as boolean) ?? true
  }
}

export default async function WebGLRendererSystem(world: World, props: EngineRendererProps): Promise<System> {
  new EngineRenderer(props)

  await EngineRenderer.instance.loadGraphicsSettingsFromStorage()
  EngineRenderer.instance.dispatchSettingsChangeEvent()

  return () => {
    if (props.enabled) EngineRenderer.instance.execute(world.delta)
  }
}
