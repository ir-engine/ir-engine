import {
  BlendFunction,
  BloomEffect,
  BrightnessContrastEffect,
  ColorDepthEffect,
  DepthDownsamplingPass,
  DepthOfFieldEffect,
  EffectComposer,
  EffectPass,
  HueSaturationEffect,
  NormalPass,
  OutlineEffect,
  RenderPass,
  SSAOEffect,
  TextureEffect,
  ToneMappingEffect
} from 'postprocessing';
import {
  LinearToneMapping,
  NearestFilter,
  PCFSoftShadowMap,
  PerspectiveCamera,
  RGBFormat,
  sRGBEncoding,
  WebGL1Renderer,
  WebGLRenderer,
  WebGLRenderTarget
} from 'three';
import { CSM } from '../assets/csm/CSM';
import { ClientStorage } from '../common/classes/ClientStorage';
import { now } from '../common/functions/now';
import { Engine } from '../ecs/classes/Engine';
import { EngineEvents } from '../ecs/classes/EngineEvents';
import { System, SystemAttributes } from '../ecs/classes/System';
import { defaultPostProcessingSchema, effectType } from '../scene/classes/PostProcessing';
import { PostProcessingSchema } from './interfaces/PostProcessingSchema';
import { SystemUpdateType } from '../ecs/functions/SystemUpdateType';
import WebGL from "./THREE.WebGL";
import { FXAAEffect } from './effects/FXAAEffect';
import { LinearTosRGBEffect } from './effects/LinearTosRGBEffect';
import { isMobile } from '../common/functions/isMobile';

export enum RENDERER_SETTINGS {
  AUTOMATIC = 'automatic',
  PBR = 'usePBR',
  POST_PROCESSING = 'usePostProcessing',
  SHADOW_QUALITY = 'shadowQuality',
  SCALE_FACTOR = 'scaleFactor',
}

const databasePrefix = 'graphics-settings-';

interface EffectComposerWithSchema extends EffectComposer {
  // TODO: 'postprocessing' needs typing, we could create a '@types/postprocessing' package?
  renderer: WebGLRenderer;
  inputBuffer: WebGLRenderTarget;
  outputBuffer: WebGLRenderTarget;
  copyPass: any;
  depthTexture: any;
  passes: [];
  autoRenderToScreen: boolean;
	multisampling: number;
	getRenderer();
	replaceRenderer(renderer, updateDOM);
	createDepthTexture();
	deleteDepthTexture();
	createBuffer(depthBuffer, stencilBuffer, type, multisampling);
  addPass(renderPass: any);
  removePass();
  removeAllPasses();
  render(delta: number);
  setSize(width: number, height: number, arg2: boolean);
  reset();
  dispose();

  // this is what this is for, i just added the EffectComposer typings above
  OutlineEffect: OutlineEffect,
  FXAAEffect: FXAAEffect,
  SSAOEffect: SSAOEffect,
  DepthOfFieldEffect: DepthOfFieldEffect,
  BloomEffect: BloomEffect,
  ToneMappingEffect: ToneMappingEffect,
  BrightnessContrastEffect: BrightnessContrastEffect,
  HueSaturationEffect: HueSaturationEffect,
  ColorDepthEffect: ColorDepthEffect,
  LinearTosRGBEffect: LinearTosRGBEffect,
}

let lastRenderTime = 0
let renderTimeCounter = 0
let renderTimeAccumulator = 0

export class WebGLRendererSystem extends System {

  static EVENTS = {
    QUALITY_CHANGED: 'WEBGL_RENDERER_SYSTEM_EVENT_QUALITY_CHANGE',
    SET_RESOLUTION: 'WEBGL_RENDERER_SYSTEM_EVENT_SET_RESOLUTION',
    SET_SHADOW_QUALITY: 'WEBGL_RENDERER_SYSTEM_EVENT_SET_SHADOW_QUALITY',
    SET_POST_PROCESSING: 'WEBGL_RENDERER_SYSTEM_EVENT_SET_POST_PROCESSING',
    SET_USE_AUTOMATIC: 'WEBGL_RENDERER_SYSTEM_EVENT_SET_USE_AUTOMATIC',
  }

  updateType = SystemUpdateType.Free;

  /** Is system Initialized. */
  static instance: WebGLRendererSystem;
  csm: CSM;

  composer: EffectComposerWithSchema
  /** Is resize needed? */
  needsResize: boolean

  /** Postprocessing schema. */
  postProcessingSchema: PostProcessingSchema

  downgradeTimer = 0
  upgradeTimer = 0
  /** Maximum Quality level of the rendered. **Default** value is 4. */
  maxQualityLevel = 5
  /** Current quality level. */
  qualityLevel: number = this.maxQualityLevel
  /** Previous Quality leve. */
  prevQualityLevel: number = this.qualityLevel
  /** point at which we downgrade quality level (large delta) */
  maxRenderDelta = 1000 / 30 // 30 fps = 33 ms
  /** point at which we upgrade quality level (small delta) */
  minRenderDelta = 1000 / 60 // 60 fps = 16 ms

  automatic = true;
  usePBR = true;
  usePostProcessing = true;
  shadowQuality = 5;
  /** Resoulion scale. **Default** value is 1. */
  scaleFactor = 1;

  renderPass: RenderPass;
  normalPass: NormalPass;
  renderContext: WebGLRenderingContext;

  supportWebGL2: boolean = WebGL.isWebGL2Available();
  rendereringEnabled: boolean;

  /** Constructs WebGL Renderer System. */
  constructor(attributes: SystemAttributes = {}) {
    super(attributes);
    WebGLRendererSystem.instance = this;

    this.onResize = this.onResize.bind(this);

    const canvas: HTMLCanvasElement = attributes.canvas;
    const context = this.supportWebGL2 ? canvas.getContext('webgl2') : canvas.getContext('webgl');

    this.renderContext = context;
    const options = {
      canvas,
      context,
      antialias: !Engine.isHMD,
      preserveDrawingBuffer: !Engine.isHMD
    };

    const renderer = this.supportWebGL2 ? new WebGLRenderer(options) : new WebGL1Renderer(options);
    Engine.renderer = renderer;
    Engine.renderer.physicallyCorrectLights = true
    Engine.renderer.outputEncoding = sRGBEncoding

    Engine.viewportElement = renderer.domElement;
    Engine.xrRenderer = renderer.xr;
    Engine.xrRenderer.enabled = true;

    window.addEventListener('resize', this.onResize, false);
    this.onResize();

    this.needsResize = true;
    Engine.renderer.autoClear = true;

    this.composer = new EffectComposer(Engine.renderer);

    EngineEvents.instance.addEventListener(WebGLRendererSystem.EVENTS.SET_POST_PROCESSING, (ev: any) => {
      this.setUsePostProcessing(this.supportWebGL2 && ev.payload);
    });
    EngineEvents.instance.addEventListener(WebGLRendererSystem.EVENTS.SET_RESOLUTION, (ev: any) => {
      this.setResolution(ev.payload);
    });
    EngineEvents.instance.addEventListener(WebGLRendererSystem.EVENTS.SET_SHADOW_QUALITY, (ev: any) => {
      this.setShadowQuality(ev.payload);
    });
    EngineEvents.instance.addEventListener(WebGLRendererSystem.EVENTS.SET_USE_AUTOMATIC, (ev: any) => {
      this.setUseAutomatic(ev.payload);
    });
    EngineEvents.instance.addEventListener(EngineEvents.EVENTS.ENABLE_SCENE, (ev: any) => {
      if(typeof ev.renderer !== 'undefined') {
        this.rendereringEnabled = ev.renderer;
      }
    });
    this.rendereringEnabled = attributes.rendereringEnabled ?? true;
  }

  async initialize() {
    super.initialize();
    await this.loadGraphicsSettingsFromStorage();
    this.dispatchSettingsChangeEvent();
  }

  /** Called on resize, sets resize flag. */
  onResize(): void {
    this.needsResize = true;
  }

  /** Removes resize listener. */
  dispose(): void {
    super.dispose();
    this.composer?.dispose();
    window.removeEventListener('resize', this.onResize);
    EngineEvents.instance.removeAllListenersForEvent(WebGLRendererSystem.EVENTS.SET_POST_PROCESSING);
    EngineEvents.instance.removeAllListenersForEvent(WebGLRendererSystem.EVENTS.SET_RESOLUTION);
    EngineEvents.instance.removeAllListenersForEvent(WebGLRendererSystem.EVENTS.SET_SHADOW_QUALITY);
    EngineEvents.instance.removeAllListenersForEvent(WebGLRendererSystem.EVENTS.SET_USE_AUTOMATIC);
    EngineEvents.instance.removeAllListenersForEvent(EngineEvents.EVENTS.ENABLE_SCENE);
  }

  /**
    * Configure post processing.
    * Note: Post processing effects are set in the PostProcessingSchema provided to the system.
    * @param entity The Entity holding renderer component.
    */
  public configurePostProcessing(postProcessingSchema: PostProcessingSchema = defaultPostProcessingSchema): void {
    this.postProcessingSchema = postProcessingSchema;
    this.renderPass = new RenderPass(Engine.scene, Engine.camera);
    this.renderPass.scene = Engine.scene;
    this.renderPass.camera = Engine.camera;
    this.composer.addPass(this.renderPass);
    // This sets up the render
    const passes: any[] = [];
    this.normalPass = new NormalPass(this.renderPass.scene, this.renderPass.camera, {
      renderTarget: new WebGLRenderTarget(1, 1, {
        minFilter: NearestFilter,
        magFilter: NearestFilter,
        format: RGBFormat,
        stencilBuffer: false
      })
    });
    const depthDownsamplingPass = new DepthDownsamplingPass({
      normalBuffer: this.normalPass.texture,
      resolutionScale: 0.5
    });
    const normalDepthBuffer = depthDownsamplingPass.texture;
    let pass;
    Object.keys(this.postProcessingSchema).forEach((key: any) => {
      pass = this.postProcessingSchema[key];
      const effect = effectType[key].effect;
      if (pass.isActive)
        if (effect === SSAOEffect) {
          const eff = new effect(Engine.camera, this.normalPass.texture, { ...pass, normalDepthBuffer })
          this.composer[key] = eff;
          passes.push(eff);
        } else if (effect === DepthOfFieldEffect) {
          const eff = new effect(Engine.camera, pass)
          this.composer[key] = eff;
          passes.push(eff)
        } else if (effect === OutlineEffect) {
          const eff = new effect(Engine.scene, Engine.camera, pass)
          this.composer[key] = eff;
          passes.push(eff);
        } else {
          const eff = new effect(pass)
          this.composer[key] = eff;
          passes.push(eff)
        }
    })
    const textureEffect = new TextureEffect({
      blendFunction: BlendFunction.SKIP,
      texture: depthDownsamplingPass.texture
    });
    if (passes.length) {
      this.composer.addPass(depthDownsamplingPass);
      this.composer.addPass(new EffectPass(Engine.camera, ...passes, textureEffect));
    }
    // const gammaCorrectionPass = new ShaderPass(GammaCorrectionShader);
    // this.composer.addPass(gammaCorrectionPass);
  }

  /**
   * Executes the system. Called each frame by default from the Engine.
   * @param delta Time since last frame.
   */
  execute(delta: number): void {
    if (Engine.xrRenderer.isPresenting) {

      this.csm?.update();
      Engine.renderer.render(Engine.scene, Engine.camera);

    } else {

      if(this.rendereringEnabled) {
        if (this.needsResize) {
          const curPixelRatio = Engine.renderer.getPixelRatio();
          const scaledPixelRatio = window.devicePixelRatio * this.scaleFactor;

          if (curPixelRatio !== scaledPixelRatio) Engine.renderer.setPixelRatio(scaledPixelRatio);

          const width = window.innerWidth;
          const height = window.innerHeight;

          if ((Engine.camera as PerspectiveCamera).isPerspectiveCamera) {
            const cam = Engine.camera as PerspectiveCamera;
            cam.aspect = width / height;
            cam.updateProjectionMatrix();
          }

          this.csm?.updateFrustums();
          Engine.renderer.setSize(width, height, false);
          this.composer.setSize(width, height, false);
          this.needsResize = false;
        }

        this.csm?.update();
        if (this.usePostProcessing && this.postProcessingSchema) {
          this.composer.render(delta);
        } else {
          Engine.renderer.autoClear = true;
          Engine.renderer.render(Engine.scene, Engine.camera);
        }
      }
      this.changeQualityLevel();
    }
  }


  /**
   * Change the quality of the renderer.
   */
  changeQualityLevel(): void {

    const time = now();
    const deltaRender = (time - lastRenderTime);
    lastRenderTime = time;
    renderTimeAccumulator += deltaRender;
    renderTimeCounter++;

    if (renderTimeCounter < 60) return;

    const delta = renderTimeAccumulator / 60;

    renderTimeCounter = 0;
    renderTimeAccumulator = 0;

    if(!this.automatic) return;

    if (delta >= this.maxRenderDelta && this.qualityLevel > 1) {

      this.downgradeTimer++;

      if(this.downgradeTimer > 3) {
        this.qualityLevel--;
        console.log('quality automatically scaled down', this.qualityLevel)
      } else {
        return
      }

    } else if (delta <= this.minRenderDelta && this.qualityLevel < this.maxQualityLevel) {

      this.upgradeTimer++;

      if(this.upgradeTimer > 3) {
        this.qualityLevel++;

        console.log('quality automatically scaled up', this.qualityLevel)
      } else {
        return
      }

    } else {
      return
    }
    this.downgradeTimer = 0;
    this.upgradeTimer = 0;

    // set resolution scale
    if (this.prevQualityLevel !== this.qualityLevel) {
      this.prevQualityLevel = this.qualityLevel;
      this.doAutomaticRenderQuality();
      this.dispatchSettingsChangeEvent();
    }
  }

  doAutomaticRenderQuality() {
    this.setShadowQuality(this.qualityLevel);
    this.setResolution(this.qualityLevel / this.maxQualityLevel);
    this.setUsePostProcessing(this.qualityLevel > 2);
  }

  dispatchSettingsChangeEvent() {
    EngineEvents.instance.dispatchEvent({
      type: WebGLRendererSystem.EVENTS.QUALITY_CHANGED,
      shadows: this.shadowQuality,
      resolution: this.scaleFactor,
      postProcessing: this.usePostProcessing,
      pbr: this.usePBR,
      automatic: this.automatic
    });
  }

  setUseAutomatic(automatic) {
    this.automatic = automatic;
    if (this.automatic) {
      this.doAutomaticRenderQuality();
    }
    ClientStorage.set(databasePrefix + RENDERER_SETTINGS.AUTOMATIC, this.automatic);
  }

  setResolution(resolution) {
    this.scaleFactor = resolution;
    console.log('setResolution',resolution)
    Engine.renderer.setPixelRatio(window.devicePixelRatio * this.scaleFactor);
    this.needsResize = true;
    ClientStorage.set(databasePrefix + RENDERER_SETTINGS.SCALE_FACTOR, this.scaleFactor);
  }

  setShadowQuality(shadowSize) {
    // hardcode mobile to always be 512
    if(isMobile) return;
    this.shadowQuality = shadowSize;
    let mapSize = 512;
    switch (this.shadowQuality) {
      case this.maxQualityLevel - 2: mapSize = 1024; break;
      case this.maxQualityLevel - 1: mapSize = 2048; break;
      case this.maxQualityLevel: mapSize = 2048; break;
      default: break;
    }
    this.csm?.setShadowMapSize(mapSize);
    ClientStorage.set(databasePrefix + RENDERER_SETTINGS.SHADOW_QUALITY, this.shadowQuality);
  }

  setUsePostProcessing(usePostProcessing) {
    this.usePostProcessing = this.supportWebGL2 && usePostProcessing;
    ClientStorage.set(databasePrefix + RENDERER_SETTINGS.POST_PROCESSING, this.usePostProcessing);
  }

  async loadGraphicsSettingsFromStorage() {
    this.automatic = await ClientStorage.get(databasePrefix + RENDERER_SETTINGS.AUTOMATIC) as boolean ?? true;
    this.scaleFactor = await ClientStorage.get(databasePrefix + RENDERER_SETTINGS.SCALE_FACTOR) as number ?? 1;
    this.shadowQuality = await ClientStorage.get(databasePrefix + RENDERER_SETTINGS.SHADOW_QUALITY) as number ?? 5;
    // this.usePBR = await ClientStorage.get(databasePrefix + RENDERER_SETTINGS.PBR) as boolean ?? true; // TODO: implement PBR setting
    this.usePostProcessing = await ClientStorage.get(databasePrefix + RENDERER_SETTINGS.POST_PROCESSING) as boolean ?? true;
  }
}

WebGLRendererSystem.queries = {};
