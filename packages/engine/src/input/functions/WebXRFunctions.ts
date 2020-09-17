import { Entity } from '../../ecs/classes/Entity';
import { createEntity, addComponent } from '../../ecs/functions/EntityFunctions';
import { WebXRSession } from '../components/WebXRSession';
import { WebXRSpace } from '../components/WebXRSpace';
import { XRSession, XRFrame, XRReferenceSpace, XRInputSource } from '../types/WebXR';

export const startVR = (onStarted = Function(), onEnded = Function()) => {
  let entity: Entity, session: XRSession, isImmersive: boolean, spaceType: any;
  const onSpaceCreated = space => {
    addComponent(entity, WebXRSpace, { space, spaceType });
    onStarted && onStarted(session, space);
    console.log('XR refSpace', space, spaceType);
  };
  return (navigator as any).xr
    .requestSession('immersive-vr', { optionalFeatures: ['local-floor'] })
    .then(vrSession => {
      session = vrSession;
      session.addEventListener('end', onEnded);
      isImmersive = true;
      entity = createEntity();
      addComponent(entity, WebXRSession, { session, isImmersive });
      spaceType = 'local-floor';
      return session.requestReferenceSpace(spaceType);
    })
    .then(onSpaceCreated)
    .catch(error => {
      console.log('XR space', spaceType, error);
      isImmersive = true;
      spaceType = 'local';
      session
        .requestReferenceSpace(spaceType)
        .then(onSpaceCreated)
        .catch(error => {
          console.log('XR space', spaceType, error);
          isImmersive = false;
          spaceType = 'viewer';
          session
            .requestReferenceSpace(spaceType)
            .then(onSpaceCreated)
            .catch(console.warn);
        });
    })
    .catch(console.warn);
};

export const initVR = (onVRSupportRequested?: any) => {
  const { xr } = navigator as any;
  console.log("INITING XR")
  if (xr) {
    xr.isSessionSupported('immersive-vr').then(() => {
      if (onVRSupportRequested) onVRSupportRequested;
    });
    xr.requestSession('inline').then(session => 
      {
        addComponent(createEntity(), WebXRSession, { session }) 
        console.log("XR Session Requested")
      });
  } else console.warn("WebXR isn't supported by this browser");
};

export function getInputSources ({ inputSources = [] }, frame: XRFrame, refSpace: XRReferenceSpace) {
  return inputSources.map((inputSource: XRInputSource) => {
    const { targetRaySpace, targetRayMode, handedness, gripSpace, gamepad } = inputSource;
    const targetRayPose = frame.getPose(targetRaySpace, refSpace);
    // We may not get a pose back in cases where the input source has lost
    // tracking or does not know where it is relative to the given frame
    // of reference.
    if (!targetRayPose) return null;
    const gripPose = gripSpace && frame.getPose(gripSpace, refSpace);
    return { targetRayPose, targetRayMode, gripPose, handedness, gamepad };
  });
}
