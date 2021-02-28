import {
  LinearEncoding, NearestFilter,
  PCFSoftShadowMap,
  PerspectiveCamera,
  RGBFormat,
  sRGBEncoding,
  WebGL1Renderer,
  WebGLRenderer,
  WebGLRenderTarget
} from 'three';
import { CSM } from '../assets/csm/CSM.js';
import { now } from '../common/functions/now';
import { Engine } from '../ecs/classes/Engine';
import { System, SystemAttributes } from '../ecs/classes/System';
import { DefaultPostProcessingSchema } from './postprocessing/DefaultPostProcessingSchema';
import { BlendFunction } from './postprocessing/blending/BlendFunction';
import { EffectComposer } from './postprocessing/core/EffectComposer';
import { DepthOfFieldEffect } from './postprocessing/DepthOfFieldEffect';
import { OutlineEffect } from './postprocessing/OutlineEffect';
import { DepthDownsamplingPass } from './postprocessing/passes/DepthDownsamplingPass';
import { EffectPass } from './postprocessing/passes/EffectPass';
import { NormalPass } from './postprocessing/passes/NormalPass';
import { RenderPass } from './postprocessing/passes/RenderPass';
import { SSAOEffect } from './postprocessing/SSAOEffect';
import { TextureEffect } from './postprocessing/TextureEffect';
import { PostProcessingSchema } from './postprocessing/PostProcessingSchema';

/** Handles rendering and post processing to WebGL canvas. */
export class WebGLRendererSystem extends System {
  /** Is system Initialized. */
  isInitialized: boolean
  static instance: WebGLRendererSystem;

  static composer: EffectComposer
  /** Is resize needed? */
  static needsResize: boolean

  static qualityLevelChangeListeners: any[] = [];
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

  static automatic = true;
  static usePBR = true;
  static usePostProcessing = true;
  static shadowQuality = 5; 
  /** Resoulion scale. **Default** value is 1. */
  static scaleFactor = 1;
  
  /** Constructs WebGL Renderer System. */
  constructor(attributes?: SystemAttributes) {
    super(attributes);

    WebGLRendererSystem.instance = this;

    this.onResize = this.onResize.bind(this);

    this.postProcessingSchema = attributes.postProcessingSchema ?? DefaultPostProcessingSchema;

    let context;
    const canvas = attributes.canvas;

    try {
      context = canvas.getContext("webgl2", { antialias: true });
    } catch (error) {
      context = canvas.getContext("webgl", { antialias: true });
    }
    const options = {
      canvas,
      context,
      antialias: true,
      preserveDrawingBuffer: true
    };
    
    const { safariWebBrowser } = window as any;
    
    const renderer = safariWebBrowser ? new WebGL1Renderer(options) : new WebGLRenderer(options);
    renderer.physicallyCorrectLights = true;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = PCFSoftShadowMap;
    renderer.outputEncoding = sRGBEncoding; // need this if postprocessing is not used

    Engine.renderer = renderer;

    // Cascaded shadow maps
    const csm = new CSM({
        cascades: 4,
        lightIntensity: 1,
        shadowMapSize: 4096,
        maxFar: 100,
        // maxFar: Engine.camera.far,
        camera: Engine.camera,
        parent: Engine.scene
    });
    csm.fade = true;

    Engine.csm = csm;

    window.addEventListener('resize', this.onResize, false);
    this.onResize();
    this.isInitialized = true;

    WebGLRendererSystem.needsResize = true;
    this.configurePostProcessing();
    loadGraphicsSettingsFromStorage();
    this.setUsePostProcessing(true);
    this.setShadowQuality(this.qualityLevel);
    this.setResolution(WebGLRendererSystem.scaleFactor);
    this.setUseAutomatic(WebGLRendererSystem.automatic);
  }

  /** Called on resize, sets resize flag. */
  onResize(): void {
    WebGLRendererSystem.needsResize = true;
  }

  /** Removes resize listener. */
  dispose(): void {
    super.dispose();
    WebGLRendererSystem.composer?.dispose();
    window.removeEventListener('resize', this.onResize);
    document.body.removeChild(Engine.renderer.domElement);
    this.isInitialized = false;
  }

  /**
    * Configure post processing.
    * Note: Post processing effects are set in the PostProcessingSchema provided to the system.
    * @param entity The Entity holding renderer component.
    */
  private configurePostProcessing(): void {
    WebGLRendererSystem.composer = new EffectComposer(Engine.renderer);
    const renderPass = new RenderPass(Engine.scene, Engine.camera);
    renderPass.scene = Engine.scene;
    renderPass.camera = Engine.camera;
    WebGLRendererSystem.composer.addPass(renderPass);
    // This sets up the render
    const passes: any[] = [];
    const normalPass = new NormalPass(renderPass.scene, renderPass.camera, { renderTarget: new WebGLRenderTarget(1, 1, {
      minFilter: NearestFilter,
      magFilter: NearestFilter,
      format: RGBFormat,
      stencilBuffer: false
    }) });
    const depthDownsamplingPass = new DepthDownsamplingPass({
      normalBuffer: normalPass.texture,
      resolutionScale: 0.5
    });
    const normalDepthBuffer =	depthDownsamplingPass.texture;

    this.postProcessingSchema.effects.forEach((pass: any) => {
      if ( pass.effect === SSAOEffect){
        passes.push(new pass.effect(Engine.camera, normalPass.texture, {...pass.options, normalDepthBuffer }));
      }
      else if ( pass.effect === DepthOfFieldEffect)
        passes.push(new pass.effect(Engine.camera, pass.options))
      else if ( pass.effect === OutlineEffect){
        const effect = new pass.effect(Engine.scene, Engine.camera, pass.options)
        passes.push(effect)
        WebGLRendererSystem.composer.outlineEffect = effect
      }
      else passes.push(new pass.effect(pass.options))
    })
    const textureEffect = new TextureEffect({
			blendFunction: BlendFunction.SKIP,
			texture: depthDownsamplingPass.texture
		});
    if (passes.length) {
      WebGLRendererSystem.composer.addPass(depthDownsamplingPass);
      WebGLRendererSystem.composer.addPass(new EffectPass(Engine.camera, ...passes, textureEffect));
    }
  }

  /**
   * Executes the system. Called each frame by default from the Engine.
   * @param delta Time since last frame.
   */
  execute(delta: number): void {
    const startTime = now();
    
    if(this.isInitialized)
    {
      // Handle resize
      if (WebGLRendererSystem.needsResize) {
        const curPixelRatio = Engine.renderer.getPixelRatio();
        const scaledPixelRatio = window.devicePixelRatio * WebGLRendererSystem.scaleFactor;
    
        if (curPixelRatio !== scaledPixelRatio) Engine.renderer.setPixelRatio(scaledPixelRatio);
    
        const width = window.innerWidth;
        const height = window.innerHeight;
        console.log(width, height, window)
    
        if ((Engine.camera as PerspectiveCamera).isPerspectiveCamera) {
          const cam = Engine.camera as PerspectiveCamera;
          cam.aspect = width / height;
          cam.updateProjectionMatrix();
        }
    
        Engine.csm.updateFrustums();
    
        Engine.renderer.setSize(width, height, false);
        WebGLRendererSystem.composer.setSize(width, height, false);
        WebGLRendererSystem.needsResize = false;
      }

      Engine.csm.update();
      
      if (WebGLRendererSystem.usePostProcessing) {
        WebGLRendererSystem.composer.render(delta);
      } else {
        Engine.renderer.render(Engine.scene, Engine.camera);
      }
    }

    const lastTime = now();
    const deltaRender = (lastTime - startTime);

    if(WebGLRendererSystem.automatic) {
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
      this.setUsePostProcessing(this.qualityLevel > 1);
      WebGLRendererSystem.qualityLevelChangeListeners.forEach((callback) => {
        callback({
          shadows: WebGLRendererSystem.shadowQuality,
          resolution: WebGLRendererSystem.scaleFactor,
          postProcessing: WebGLRendererSystem.usePostProcessing,
          pbr: WebGLRendererSystem.usePBR,
          automatic: true
        })
      })
      saveGraphicsSettingsToStorage();
      this.prevQualityLevel = this.qualityLevel;
    }
  }

  setUseAutomatic(automatic) {
    WebGLRendererSystem.automatic = automatic;
    if(WebGLRendererSystem.automatic) {
      this.prevQualityLevel = -1;
      this.setShadowQuality(this.qualityLevel);
      this.setResolution((this.qualityLevel) / 5);
      this.setUsePostProcessing(this.qualityLevel > 1);
    }
    saveGraphicsSettingsToStorage();
  }

  setResolution(resolution) {
    WebGLRendererSystem.scaleFactor = resolution;
    Engine.renderer.setPixelRatio(window.devicePixelRatio * WebGLRendererSystem.scaleFactor);
    WebGLRendererSystem.needsResize = true;
    saveGraphicsSettingsToStorage();
  }

  setShadowQuality(shadowSize) {
    WebGLRendererSystem.shadowQuality = shadowSize;
    let mapSize = 512;
    switch(WebGLRendererSystem.shadowQuality) {
      default: break;
      case this.maxQualityLevel - 2: mapSize = 1024; break;
      case this.maxQualityLevel - 1: mapSize = 2048; break;
      case this.maxQualityLevel: mapSize = 4096; break;
    }
    Engine.csm.setShadowMapSize(mapSize);
    saveGraphicsSettingsToStorage();
  }

  setUsePostProcessing(usePostProcessing) {
    WebGLRendererSystem.usePostProcessing = usePostProcessing;
    Engine.renderer.outputEncoding = WebGLRendererSystem.usePostProcessing ? LinearEncoding : sRGBEncoding;
    saveGraphicsSettingsToStorage();
  }
}

export const saveGraphicsSettingsToStorage = () =>{
  // localStorage.setItem('graphics-settings', JSON.stringify({
  //   resolution: WebGLRendererSystem.scaleFactor,
  //   shadows: WebGLRendererSystem.shadowQuality,
  //   automatic: WebGLRendererSystem.automatic,
  //   pbr: WebGLRendererSystem.usePBR,
  //   postProcessing: WebGLRendererSystem.usePostProcessing,
  // }))
}

export const getGraphicsSettingsFromStorage = () => {
  // we don't want people potentially having code injected from local storage, so let's default and verify
  // const loadedGraphicsSettings = JSON.parse(localStorage.getItem('graphics-settings') || '{}');
  // const verifiedGraphicsSettings = {
  //   resolution: WebGLRendererSystem.scaleFactor,
  //   shadows: WebGLRendererSystem.shadowQuality,
  //   automatic: WebGLRendererSystem.automatic,
  //   pbr: WebGLRendererSystem.usePBR,
  //   postProcessing: WebGLRendererSystem.usePostProcessing,
  // };
  // Object.keys(verifiedGraphicsSettings).forEach((key) => {
  //   if(typeof loadedGraphicsSettings[key] === typeof verifiedGraphicsSettings[key]) {
  //     verifiedGraphicsSettings[key] = loadedGraphicsSettings[key];
  //   }
  // })
  // return verifiedGraphicsSettings;
}

export const loadGraphicsSettingsFromStorage = () => {
  // const verifiedGraphicsSettings = getGraphicsSettingsFromStorage();
  // WebGLRendererSystem.scaleFactor = verifiedGraphicsSettings.resolution;
  // WebGLRendererSystem.shadowQuality = verifiedGraphicsSettings.shadows;
  // WebGLRendererSystem.automatic = verifiedGraphicsSettings.automatic;
  // WebGLRendererSystem.usePBR = verifiedGraphicsSettings.pbr;
  // WebGLRendererSystem.usePostProcessing = verifiedGraphicsSettings.postProcessing;
}

WebGLRendererSystem.queries = {
};
