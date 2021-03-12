import { isWebWorker } from '../common/functions/getEnvironment';
import { Engine } from '../ecs/classes/Engine';
import { EngineEvents } from '../ecs/classes/EngineEvents';
import { System, SystemAttributes } from '../ecs/classes/System';
import { XRReferenceSpaceType, XRWebGLLayer } from '../input/types/WebXR';
import { OFFSCREEN_XR_EVENTS } from '../worker/MessageQueue';
import { WebXRInputManager } from '../worker/WebXRInputManager';
import { WebXROffscreenManager } from '../worker/WebXROffscreenManager';

export class WebXRRendererSystem extends System {

  static EVENTS = {
    // centralise all xr api to engine
    XR_SUPPORTED: 'WEBXR_RENDERER_SYSTEM_XR_SUPPORTED',
    XR_START: 'WEBXR_RENDERER_SYSTEM_XR_START',
    XR_SESSION: 'WEBXR_RENDERER_SYSTEM_XR_SESSION',
    XR_END: 'WEBXR_RENDERER_SYSTEM_XR_END',
    CONTROLLER_DATA: 'OFFSCREEN_XR_EVENTS_CONTROLLER_DATA',
  }

  offscreen: boolean;

  isRenderering: boolean = false;
  baseLayer: XRWebGLLayer;
  context: any;

  controllerUpdateHook: any;

  referenceSpace: XRReferenceSpaceType = 'local';

  constructor(attributes?: SystemAttributes) {
    super(attributes);

    this.offscreen = attributes.offscreen;

    if(this.offscreen) {

      if(isWebWorker)  {
        if(isWebWorker) {
          Engine.renderer.xr = new WebXROffscreenManager()
          Engine.renderer.xr.setReferenceSpaceType(this.referenceSpace);
        }    

      } else {
        document.addEventListener(OFFSCREEN_XR_EVENTS.SESSION_CREATED, async (ev: any) => {
          const { baseLayer, context, session } = ev.detail;
          this.isRenderering = true;
          this.baseLayer = baseLayer;
          this.context = context;
          // @ts-ignore
          Engine.renderer = {
            xr: new WebXRInputManager(Engine.renderer, context),
          }
          Engine.renderer.xr.setReferenceSpaceType(this.referenceSpace);
          EngineEvents.instance.dispatchEvent({ type: WebXRRendererSystem.EVENTS.XR_SESSION });
          await (Engine.renderer.xr as WebXRInputManager).setSession(session);
        })
      }
    } else {
      
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
    if(this.offscreen) {
      if(isWebWorker) {
        
      } else {
        if(this.isRenderering) {

          console.log('rendering')

          // const controllerData = {}
          // EngineEvents.instance.dispatchEvent({ type: WebXRRendererSystem.EVENTS.CONTROLLER_DATA, controllerData })
        }
      }
    } else {
      // Post processing is not currently supported in xr // https://github.com/mrdoob/three.js/pull/18846
      // webaverse already has support for it https://github.com/webaverse/app/pull/906
      Engine.renderer.render(Engine.scene, Engine.camera);
    }
  }
}

WebXRRendererSystem.queries = {
};
