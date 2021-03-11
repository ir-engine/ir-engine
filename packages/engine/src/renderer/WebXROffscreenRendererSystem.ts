import { isWebWorker } from '../common/functions/getEnvironment';
import { Engine } from '../ecs/classes/Engine';
import { System, SystemAttributes } from '../ecs/classes/System';
import { XRWebGLLayer } from '../input/types/WebXR';
import { OFFSCREEN_XR_EVENTS } from '../worker/MessageQueue';
import { WebXRManager } from '../worker/WebXRManager';

export class WebXROffscreenRendererSystem extends System {

  isRenderering: boolean = false;
  baseLayer: XRWebGLLayer;
  context: any;
  constructor(attributes?: SystemAttributes) {
    super(attributes);

    if(isWebWorker)  {

    } else {
      document.addEventListener(OFFSCREEN_XR_EVENTS.SESSION_CREATED, (ev: any) => {
        const { baseLayer, context, session } = ev.detail;
        this.isRenderering = true;
        this.baseLayer = baseLayer;
        this.context = context;
        // @ts-ignore
        Engine.renderer = {
          setFramebuffer: () => {},
          xr: new WebXRManager(Engine.renderer, context),
          setRenderTarget: () => {},
          // @ts-ignore
          getRenderTarget: () => {},
        }
        Engine.renderer.xr.setSession(session);
        console.log(baseLayer, context, Engine.renderer);
      })
    }
  }

  /** Removes resize listener. */
  dispose(): void {
    super.dispose();
  }

  /**
   * Executes the system. Called each frame by default from the Engine.
   * @param delta Time since last frame.
   */
  execute(delta: number): void {
    if(!Engine.renderer?.xr?.isPresenting) return;
    if(isWebWorker) {
      
    } else {
      if(this.isRenderering) {
        this.context.bindFrameBuffer(this.context.FRAMEBUFFER, this.baseLayer.framebuffer);
      }
    }
  }
}

WebXROffscreenRendererSystem.queries = {
};
