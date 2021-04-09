import { Group, sRGBEncoding, Vector3 } from 'three';
import { BinaryValue } from '../common/enums/BinaryValue';
import { LifecycleValue } from '../common/enums/LifecycleValue';
import { isWebWorker } from '../common/functions/getEnvironment';
import { Engine } from '../ecs/classes/Engine';
import { EngineEvents } from '../ecs/classes/EngineEvents';
import { System, SystemAttributes } from '../ecs/classes/System';
import { getMutableComponent } from '../ecs/functions/EntityFunctions';
import { gamepadMapping } from '../input/behaviors/GamepadInputBehaviors';
import { InputType } from '../input/enums/InputType';
import { XRFrame, XRReferenceSpace, XRReferenceSpaceType, XRWebGLLayer } from '../input/types/WebXR';
import { Network } from '../networking/classes/Network';
import { CharacterComponent } from '../templates/character/components/CharacterComponent';
import { endXR, startXR } from '../xr/functions/WebXRFunctions';
// import { EngineEvents } from '../ecs/classes/EngineEvents';
// import { isWebWorker } from '../common/functions/getEnvironment';
// import { OFFSCREEN_XR_EVENTS } from '../worker/MessageQueue';
// import { WebXRInputManager } from '../worker/webxr/WebXRInputManager';
// import { WebXROffscreenManager } from '../worker/webxr/WebXROffscreenManager';
// import { WebGLRendererSystem } from './WebGLRendererSystem';

export class WebXRRendererSystem extends System {

  static EVENTS = {
    // centralise all xr api to engine
    XR_START: 'WEBXR_RENDERER_SYSTEM_XR_START',
    XR_SESSION: 'WEBXR_RENDERER_SYSTEM_XR_SESSION',
    XR_END: 'WEBXR_RENDERER_SYSTEM_XR_END',
    // CONTROLLER_DATA: 'OFFSCREEN_XR_EVENTS_CONTROLLER_DATA',
    // FRAME_DATA: 'OFFSCREEN_XR_EVENTS_FRAME_DATA',
  }

  offscreen: boolean;
  static xrFrame: XRFrame;

  isRenderering = false;
  baseLayer: XRWebGLLayer;
  context: any;
  renderbuffer: WebGLRenderbuffer;

  controllerUpdateHook: any;

  referenceSpaceType: XRReferenceSpaceType = 'local-floor';
  referenceSpace: XRReferenceSpace;
  playerPosition: Vector3 = new Vector3();
  cameraDolly: Group;
  static instance: WebXRRendererSystem;

  constructor(attributes?: SystemAttributes) {
    super(attributes);

    WebXRRendererSystem.instance = this;

    EngineEvents.instance.addEventListener(WebXRRendererSystem.EVENTS.XR_START, async (ev: any) => {
      Engine.renderer.outputEncoding = sRGBEncoding;
      const sessionInit = { optionalFeatures: [this.referenceSpaceType] };
      try {
        const session = await (navigator as any).xr.requestSession("immersive-vr", sessionInit)
        
        Engine.xrSession = session;
        Engine.renderer.xr.setReferenceSpaceType(this.referenceSpaceType);
        Engine.renderer.xr.setSession(session);
        if(!isWebWorker) { 
          EngineEvents.instance.dispatchEvent({ type: WebXRRendererSystem.EVENTS.XR_SESSION });
        }

        const actor = getMutableComponent<CharacterComponent>(Network.instance.localClientEntity, CharacterComponent);
        actor.modelContainer.visible = false;

        await startXR()

      } catch(e) { console.log(e) }
    });

    EngineEvents.instance.addEventListener(WebXRRendererSystem.EVENTS.XR_END, async (ev: any) => {
      endXR();
    });

    this.offscreen = attributes.offscreen;

    if(this.offscreen) {
    /*
      if(isWebWorker)  {
        if(isWebWorker) {
          Engine.renderer.xr = new WebXROffscreenManager()
          Engine.renderer.xr.setReferenceSpaceType(this.referenceSpace);
          EngineEvents.instance.addEventListener(WebXRRendererSystem.EVENTS.XR_SESSION, () => {
            this.isRenderering = true;
            console.log('WebXRRendererSystem.EVENTS.XR_SESSION', Engine.xrSession, Engine.renderer.xr)
          });
        }    

      } else {
        document.addEventListener(OFFSCREEN_XR_EVENTS.SESSION_CREATED, async (ev: any) => {
          console.log(ev.detail)
          const { baseLayer, context, session, canvas } = ev.detail;
          this.isRenderering = true;
          this.baseLayer = baseLayer;
          this.context = context;
          this.renderbuffer = context.createRenderbuffer();
          // @ts-ignore
          Engine.renderer = new WebGLRenderer({ canvas, context });
          Engine.renderer.xr = new WebXRInputManager(Engine.renderer, context);
          Engine.renderer.xr.setReferenceSpaceType(this.referenceSpace);
          EngineEvents.instance.dispatchEvent({ type: WebXRRendererSystem.EVENTS.XR_SESSION });
          await (Engine.renderer.xr as WebXRInputManager).setSession(session);
        })

        EngineEvents.instance.addEventListener(WebXRRendererSystem.EVENTS.FRAME_DATA, ({ data }) => {
          // console.log(data)
          // https://stackoverflow.com/questions/16287481/webgl-display-framebuffer
          const gl = this.context as WebGLRenderingContext;
          // gl.bindFramebuffer(gl.FRAMEBUFFER, this.baseLayer.framebuffer);
          Engine.renderer.render(scene, camera);
          console.log('hmm')
        })
      }
    */
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
    
    const session = WebXRRendererSystem.xrFrame.session;
  
    session.inputSources.forEach((source) => {
      if(source.gamepad) {
        const mapping = gamepadMapping[source.gamepad.mapping || 'xr-standard'][source.handedness];
        source.gamepad.buttons.forEach((button, index) => {
          // TODO : support button.touched and button.value
          Engine.inputState.set(mapping.buttons[index], {
            type: InputType.BUTTON,
            value: button.pressed ? BinaryValue.ON : BinaryValue.OFF,
            lifecycleState: button.pressed ? LifecycleValue.STARTED : LifecycleValue.ENDED
          })
        })
        if(source.gamepad.axes.length > 2) {
          Engine.inputState.set(mapping.axes, {
            type: InputType.TWODIM,
            value: [source.gamepad.axes[2], source.gamepad.axes[3]]
          })
        } else {
          Engine.inputState.set(mapping.axes, {
            type: InputType.TWODIM,
            value: [source.gamepad.axes[0], source.gamepad.axes[1]]
          })
        }
      }
    })
      /*
      if(this.isRenderering) {

        if(isWebWorker) {
          //@ts-ignore
          const data = Engine.renderer.domElement.transferToImageBitmap();
          // const gl = WebGLRendererSystem.instance.renderContext;
          // const pixels = new Uint8Array(gl.drawingBufferWidth * gl.drawingBufferHeight * 4);
          // gl.readPixels(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
          // const data = pixels.buffer;
          EngineEvents.instance.dispatchEvent({ type: WebXRRendererSystem.EVENTS.FRAME_DATA, data }, false, [data])
          
        } else {
            // const controllerData = {}
            // EngineEvents.instance.dispatchEvent({ type: WebXRRendererSystem.EVENTS.CONTROLLER_DATA, controllerData })
          }
        }
        */
  }
}

// https://github.com/immersive-web/webxr-samples/blob/main/controller-state.html
// we have to do it here unless we refactor systems to take an XRFrame, which might not be a bad idea, or set it globally maybe? 'Engine.xrFrame'?

WebXRRendererSystem.queries = {
};
