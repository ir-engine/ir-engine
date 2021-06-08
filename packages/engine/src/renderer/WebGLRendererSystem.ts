import {
  BlendFunction,
  DepthDownsamplingPass,
  DepthOfFieldEffect,
  EffectComposer,
  EffectPass,
  NormalPass,
  OutlineEffect,
  RenderPass,
  SSAOEffect,
  TextureEffect
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
import { WebXRManager } from '../xr/WebXRManager.js'
import { SystemUpdateType } from '../ecs/functions/SystemUpdateType';

export enum RENDERER_SETTINGS {
  AUTOMATIC = 'automatic',
  PBR = 'usePBR',
  POST_PROCESSING = 'usePostProcessing',
  SHADOW_QUALITY = 'shadowQuality',
  SCALE_FACTOR = 'scaleFactor',
}

const databasePrefix = 'graphics-settings-';

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

  composer: EffectComposer
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
  /** point at which we upgrade quality level (small delta) */
  maxRenderDelta = 1000 / 25 // 25 fps
  /** point at which we downgrade quality level (large delta) */
  minRenderDelta = 1000 / 50 // 50 fps

  automatic = true;
  usePBR = true;
  usePostProcessing = true;
  shadowQuality = 5;
  /** Resoulion scale. **Default** value is 1. */
  scaleFactor = 1;

  renderPass: RenderPass;
  normalPass: NormalPass;
  renderContext: WebGLRenderingContext;

  forcePostProcessing = false;
  readonly _supportWebGL2: boolean;

  /** Constructs WebGL Renderer System. */
  constructor(attributes: SystemAttributes = {}) {
    super(attributes);

    WebGLRendererSystem.instance = this;

    this.onResize = this.onResize.bind(this);

    this._supportWebGL2 = !((window as any).iOS || (window as any).safariWebBrowser);

    let context;
    const canvas = attributes.canvas;

    try {
      context = canvas.getContext("webgl2", { antialias: true });
      this._supportWebGL2 = true;
    } catch (error) {
      context = canvas.getContext("webgl", { antialias: true });
      this._supportWebGL2 = false;
    }

    this.renderContext = context;
    const options = {
      canvas,
      context,
      antialias: true,
      preserveDrawingBuffer: true
    };

    const renderer = this._supportWebGL2 ? new WebGLRenderer(options) : new WebGL1Renderer(options);
    renderer.physicallyCorrectLights = true;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = PCFSoftShadowMap;
    renderer.outputEncoding = sRGBEncoding;
    renderer.toneMapping = LinearToneMapping;
    renderer.toneMappingExposure = 0.8;
    Engine.renderer = renderer;
    Engine.viewportElement = renderer.domElement;
    Engine.xrRenderer = new WebXRManager(renderer, context);
    Engine.xrRenderer.enabled = Engine.xrSupported;

    // Cascaded shadow maps
    const csm = new CSM({
      cascades: Engine.xrSupported ? 2 : 4,
      lightIntensity: 1,
      shadowMapSize: Engine.xrSupported ? 256 : 4096,
      maxFar: 100,
      camera: Engine.camera,
      parent: Engine.scene
    });
    csm.fade = true;

    this.csm = csm;

    window.addEventListener('resize', this.onResize, false);
    this.onResize();

    this.needsResize = true;
    Engine.renderer.autoClear = true;

    // if we turn PostPro off, don't turn it back on, if we turn it on, let engine manage it
    if (!this._supportWebGL2) {
      this.setUsePostProcessing(false);
    }

    this.composer = new EffectComposer(Engine.renderer);

    EngineEvents.instance.addEventListener(WebGLRendererSystem.EVENTS.SET_POST_PROCESSING, (ev: any) => {
      this.setUsePostProcessing(ev.payload);
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
      this.enabled = ev.renderer;
    });
    this.enabled = false;
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
          passes.push(new effect(Engine.camera, this.normalPass.texture, { ...pass, normalDepthBuffer }));
        }
        else if (effect === DepthOfFieldEffect)
          passes.push(new effect(Engine.camera, pass))
        else if (effect === OutlineEffect) {
          const eff = new effect(Engine.scene, Engine.camera, pass)
          passes.push(eff);
          this.composer.outlineEffect = eff;
        }
        else passes.push(new effect(pass))
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
    const startTime = now();

    if (Engine.xrRenderer.isPresenting) {

      // this.csm.update();

      // override default threejs behavior, use our own WebXRManager
      // we still need to apply the WebXR camera array

      Engine.xrRenderer.updateCamera(Engine.camera);
      const camera = Engine.xrRenderer.getCamera();
      Engine.renderer.render(Engine.scene, camera);

    } else {

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

        this.csm.updateFrustums();
        Engine.renderer.setSize(width, height, false);
        this.composer.setSize(width, height, false);
        this.needsResize = false;
      }

      this.csm.update();
      if (this.usePostProcessing && this.postProcessingSchema) {
        // TODO: support webxr, requires changes to postprocessing package
        // if(Engine.xrRenderer.isPresenting) {
        //   const xrCam = Engine.xrRenderer.getCamera(Engine.camera);
        //   this.composer.passes.forEach((pass) => {
        //     pass.camera = xrCam;
        //   })
        // }
        this.composer.render(delta);
      } else {
        Engine.renderer.autoClear = true;
        Engine.renderer.render(Engine.scene, Engine.camera);
      }
    }

    const lastTime = now();
    const deltaRender = (lastTime - startTime);

    if (this.automatic) {
      this.changeQualityLevel(deltaRender);
    }
  }


  /**
   * Change the quality of the renderer.
   * @param delta Time since last frame.
   */
  changeQualityLevel(delta: number): void {
    if (delta >= this.maxRenderDelta) {
      this.downgradeTimer += delta;
      this.upgradeTimer = 0;
    } else if (delta <= this.minRenderDelta) {
      this.upgradeTimer += delta;
      this.downgradeTimer = 0;
    } else {
      this.upgradeTimer = 0;
      this.downgradeTimer = 0;
      return
    }

    // change quality level
    if (this.downgradeTimer > 2000 && this.qualityLevel > 0) {
      this.qualityLevel--;
      this.downgradeTimer = 0;
    } else if (this.upgradeTimer > 1000 && this.qualityLevel < this.maxQualityLevel) {
      this.qualityLevel++;
      this.upgradeTimer = 0;
    }

    // set resolution scale
    if (this.prevQualityLevel !== this.qualityLevel) {
      this.setShadowQuality(this.qualityLevel);
      this.setResolution((this.qualityLevel) / 5);
      if (this.forcePostProcessing)
        this.setUsePostProcessing(this.qualityLevel > 1);
      this.prevQualityLevel = this.qualityLevel;
    }
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
      this.prevQualityLevel = -1;
      this.setShadowQuality(this.qualityLevel);
      this.setResolution((this.qualityLevel) / 5);
      if (this.forcePostProcessing)
        this.setUsePostProcessing(this.qualityLevel > 1);
    }
    ClientStorage.set(databasePrefix + RENDERER_SETTINGS.AUTOMATIC, this.automatic);
  }

  setResolution(resolution) {
    this.scaleFactor = resolution;
    Engine.renderer.setPixelRatio(window.devicePixelRatio * this.scaleFactor);
    this.needsResize = true;
    ClientStorage.set(databasePrefix + RENDERER_SETTINGS.SCALE_FACTOR, this.scaleFactor);
  }

  setShadowQuality(shadowSize) {
    this.shadowQuality = shadowSize;
    let mapSize = 512;
    switch (this.shadowQuality) {
      default: break;
      case this.maxQualityLevel - 2: mapSize = 1024; break;
      case this.maxQualityLevel - 1: mapSize = 2048; break;
      case this.maxQualityLevel: mapSize = Engine.xrRenderer.isPresenting ? 2048 : 4096; break;
    }
    this.csm.setShadowMapSize(mapSize);
    ClientStorage.set(databasePrefix + RENDERER_SETTINGS.SHADOW_QUALITY, this.shadowQuality);
  }

  setUsePostProcessing(usePostProcessing) {
    if (!this._supportWebGL2) return;
    if (Engine.xrRenderer?.isPresenting) return;
    this.usePostProcessing = usePostProcessing;
    Engine.renderer.outputEncoding = this.usePostProcessing ? sRGBEncoding : sRGBEncoding;
    Engine.renderer.toneMapping = this.usePostProcessing ? LinearToneMapping : LinearToneMapping;
    Engine.renderer.toneMappingExposure = this.usePostProcessing ? 1 : 1;
    ClientStorage.set(databasePrefix + RENDERER_SETTINGS.POST_PROCESSING, this.usePostProcessing);
  }
  async loadGraphicsSettingsFromStorage() {
    this.automatic = await ClientStorage.get(databasePrefix + RENDERER_SETTINGS.AUTOMATIC) as boolean ?? true;
    this.scaleFactor = await ClientStorage.get(databasePrefix + RENDERER_SETTINGS.SCALE_FACTOR) as number ?? 1;
    this.shadowQuality = await ClientStorage.get(databasePrefix + RENDERER_SETTINGS.SHADOW_QUALITY) as number ?? 5;
    // this.usePBR = await ClientStorage.get(databasePrefix + RENDERER_SETTINGS.PBR) as boolean ?? true; // TODO: implement PBR setting
    this.usePostProcessing = await ClientStorage.get(databasePrefix + RENDERER_SETTINGS.POST_PROCESSING) as boolean ?? false;
  }
}

WebGLRendererSystem.queries = {};
