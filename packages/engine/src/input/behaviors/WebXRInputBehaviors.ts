import { Behavior } from '../../common/interfaces/Behavior';
import { Entity } from '../../ecs/classes/Entity';
import { WebXRMainController } from '../components/WebXRMainController';
import { WebXRMainGamepad } from '../components/WebXRMainGamepad';
import { WebXRPointer } from '../components/WebXRPointer';
import { WebXRRenderer } from '../components/WebXRRenderer';
import { WebXRSecondController } from '../components/WebXRSecondController';
import { WebXRSecondGamepad } from '../components/WebXRSecondGamepad';
import { WebXRSession } from '../components/WebXRSession';
import { WebXRSpace } from '../components/WebXRSpace';
import { WebXRViewPoint } from '../components/WebXRViewPoint';
import { getInputSources } from '../functions/WebXRFunctions';
import { getComponent, hasComponent, getMutableComponent, addComponent, removeEntity } from '../../ecs/functions/EntityFunctions';
import { XRWebGLLayerOptions, XRWebGLLayer, XRSession } from '../types/WebXR';
import { ComponentConstructor } from '../../ecs/interfaces/ComponentInterfaces';

declare let XRWebGLLayerClass: {
  prototype: XRWebGLLayer;
  new(session: XRSession, context: WebGLRenderingContext | undefined, options?: XRWebGLLayerOptions): XRWebGLLayer;
};

let mainControllerId: any;
let secondControllerId: any;

/**
 * Process session
 * 
 * @param {Entity} entity The entity
 */
export const processSession: Behavior = (entity: Entity) => {
  // Getting session and is immersive properties from the component
  const { session, isImmersive } = getComponent(entity, WebXRSession) as any;
  // If true then requesting animation frame
  if (isImmersive) {
    session.requestAnimationFrame((time, frame) => {
      console.log(time, 'XRFrame', frame);
      // TODO:
      // let refSpace = session.isImmersive ?
      //     xrImmersiveRefSpace :
      //     inlineViewerHelper.referenceSpace;
      // Getting session and is immersive properties from the component
      const { space } = getComponent(entity, WebXRSpace) as any;
      if (space) setComponent(entity, WebXRViewPoint, { pose: frame.getViewerPose(space) });

      const controllers = space ? getInputSources(session, frame, space) : [];
      let main, second;
      if (controllers.length == 1) {
        main = controllers[0];
      } else if (controllers.length == 2) {
        main = controllers[mainControllerId];
        second = controllers[secondControllerId];
        setComponent(entity, WebXRSecondController, { pose: second.gripPose, handId: second.handedness });
        const { gamepad } = second;
        if (gamepad) setComponent(entity, WebXRSecondGamepad, { gamepad });
      } else return;
      if (main.targetRayPose) { setComponent(entity, WebXRPointer, { pose: main.targetRayPose, pointMode: main.targetRayMode }); }
      setComponent(entity, WebXRMainController, { pose: main.gripPose, handId: main.handedness });
      const { gamepad } = main;
      if (gamepad) setComponent(entity, WebXRMainGamepad, { gamepad });
    });
  }
};

/**
 * Tracking
 * 
 * @param {Entity} entity The entity
 */
export const tracking: Behavior = (entity: Entity) => {
  // Get a components from the entity
  const viewPoint = getComponent<WebXRViewPoint>(entity, WebXRViewPoint);
  const pointer = getComponent(entity, WebXRPointer);
  const mainController = getComponent(entity, WebXRMainController);
  const secondController = getComponent(entity, WebXRSecondController);
};

/**
 * Initialization session
 * 
 * @param {Entity} entity The entity
 * @param args is argument object
 */
export const initializeSession: Behavior = (entity: Entity, args: { webXRRenderer: any }) => {
  // Getting session and is immersive properties from the component
  const { session, isImmersive } = getComponent(entity, WebXRSession) as any;
  session.addEventListener('end', () => {
    removeEntity(entity);
    args.webXRRenderer.requestAnimationFrame = WebXRRenderer.schema.requestAnimationFrame.default;
  });
  // console.log("XR session added to", entity, "isImmersive", isImmersive)
  if (isImmersive /* entity.name == "vr-session" */) {
    args.webXRRenderer.context.makeXRCompatible().then(() =>
      session.updateRenderState({
        baseLayer: new XRWebGLLayerClass(session, args.webXRRenderer.context)
      })
    );
    args.webXRRenderer.requestAnimationFrame = session.requestAnimationFrame.bind(session);
  }
  console.log('XR session started', session);
};

/**
 * 
 * @param {Entity} entity The entity
 * @param Class Interface for defining new component
 * @param {Object} data 
 */
function setComponent(entity: Entity, Class: ComponentConstructor<any>, data: object) {
  if (hasComponent(entity, Class)) {
    // Get immutable reference to Class
    const mutate = getMutableComponent(entity, Class);
    for (const property in data) mutate[property] = data[property];
  } else {
    addComponent(entity, Class, data);
  }
}
