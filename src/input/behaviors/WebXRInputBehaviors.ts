import { Entity } from "ecsy"
import { WebXRMainController } from "../components/WebXRMainController"
import { WebXRMainGamepad } from "../components/WebXRMainGamepad"
import { WebXRPointer } from "../components/WebXRPointer"
import { WebXRRenderer } from "../components/WebXRRenderer"
import { WebXRSecondController } from "../components/WebXRSecondController"
import { WebXRSecondGamepad } from "../components/WebXRSecondGamepad"
import { WebXRSession } from "../components/WebXRSession"
import { WebXRSpace } from "../components/WebXRSpace"
import { WebXRViewPoint } from "../components/WebXRViewPoint"
import { Behavior } from "../../common/interfaces/Behavior"
import { WorldComponent } from "../../common/components/WorldComponent"

export const startVR = (onStarted = Function(), onEnded = Function()) => {
  let entity: Entity, session: XRSession, isImmersive: boolean, spaceType: any
  const onSpaceCreated = space => {
    entity.addComponent(WebXRSpace, { space, spaceType })
    onStarted && onStarted(session, space)
    console.log("XR refSpace", space, spaceType)
  }
  return (navigator as any).xr
    .requestSession("immersive-vr", { optionalFeatures: ["local-floor"] })
    .then(vrSession => {
      session = vrSession
      session.addEventListener("end", onEnded)
      isImmersive = true
      entity = this.world.createEntity("vr-session")
      entity.addComponent(WebXRSession, { session, isImmersive })
      spaceType = "local-floor"
      return session.requestReferenceSpace(spaceType)
    })
    .then(onSpaceCreated)
    .catch(error => {
      console.log("XR space", spaceType, error)
      isImmersive = true
      spaceType = "local"
      session
        .requestReferenceSpace(spaceType)
        .then(onSpaceCreated)
        .catch(error => {
          console.log("XR space", spaceType, error)
          isImmersive = false
          spaceType = "viewer"
          session
            .requestReferenceSpace(spaceType)
            .then(onSpaceCreated)
            .catch(console.warn)
        })
    })
    .catch(console.warn)
}

export const initVR = (onVRSupportRequested?: any) => {
  const { xr } = navigator as any
  if (xr) {
    xr.isSessionSupported("immersive-vr").then(() => {
      if (onVRSupportRequested) onVRSupportRequested
    })
    xr.requestSession("inline").then(session => WorldComponent.instance.world.createEntity("inline-session").addComponent(WebXRSession, { session }))
  } else console.warn("WebXR isn't supported by this browser")
}

export const processSession: Behavior = (entity: Entity) => {
  const { session, isImmersive } = entity.getComponent(WebXRSession)
  if (isImmersive) {
    console.log("requesting animation frame", session)
    session.requestAnimationFrame((time, frame) => {
      console.log(time, "XRFrame", frame)
      //TODO:
      // let refSpace = session.isImmersive ?
      //     xrImmersiveRefSpace :
      //     inlineViewerHelper.referenceSpace;
      const { space, spaceType } = entity.getComponent(WebXRSpace)
      if (space)
        setComponent(entity, WebXRViewPoint, {
          pose: frame.getViewerPose(space)
        })

      const controllers = space ? this.getInputSources(session, frame, space) : []
      let main, second
      if (controllers.length == 1) {
        main = controllers[0]
      } else if (controllers.length == 2) {
        main = controllers[this.mainControllerId]
        second = controllers[this.secondControllerId]
        setComponent(entity, WebXRSecondController, {
          pose: second.gripPose,
          handId: second.handedness
        })
        const { gamepad } = second
        if (gamepad) setComponent(entity, WebXRSecondGamepad, { gamepad })
      } else return
      if (main.targetRayPose)
        setComponent(entity, WebXRPointer, {
          pose: main.targetRayPose,
          pointMode: main.targetRayMode
        })
      setComponent(entity, WebXRMainController, {
        pose: main.gripPose,
        handId: main.handedness
      })
      const { gamepad } = main
      if (gamepad) setComponent(entity, WebXRMainGamepad, { gamepad })
    })
  }
}

export const tracking: Behavior = (entity: Entity) => {
  const viewPoint = entity.getComponent(WebXRViewPoint)
  const pointer = entity.getComponent(WebXRPointer)
  const mainController = entity.getComponent(WebXRMainController)
  const secondController = entity.getComponent(WebXRSecondController)
  const poses = [viewPoint, pointer, mainController, secondController].map(({ pose }) => pose)
  console.log(poses)
}

export function getInputSources({ inputSources = [] }, frame: XRFrame, refSpace: XRReferenceSpace) {
  return inputSources.map((inputSource: XRInputSource) => {
    const { targetRaySpace, targetRayMode, handedness, gripSpace, gamepad } = inputSource
    const targetRayPose = frame.getPose(targetRaySpace, refSpace)
    // We may not get a pose back in cases where the input source has lost
    // tracking or does not know where it is relative to the given frame
    // of reference.
    if (!targetRayPose) return null
    const gripPose = gripSpace && frame.getPose(gripSpace, refSpace)
    return { targetRayPose, targetRayMode, gripPose, handedness, gamepad }
  })
}

export function initializeSession(entity: Entity, args: { webXRRenderer: any }) {
  const { session, isImmersive } = entity.getComponent(WebXRSession)
  session.addEventListener("end", () => {
    entity.remove()
    args.webXRRenderer.requestAnimationFrame = WebXRRenderer.schema.requestAnimationFrame.default
  })
  this.debug("XR session added to", entity, "isImmersive", isImmersive)
  if (isImmersive /*entity.name == "vr-session"*/) {
    args.webXRRenderer.context.makeXRCompatible().then(() =>
      session.updateRenderState({
        baseLayer: new XRWebGLLayer(session, args.webXRRenderer.context)
      })
    )
    args.webXRRenderer.requestAnimationFrame = session.requestAnimationFrame.bind(session)
  }
  this.debug("XR session started", session)
}

export function setComponent(entity: Entity, Class, data = {}) {
  if (entity.hasComponent(Class)) {
    const mutate = entity.getMutableComponent(Class)
    for (const property in data) mutate[property] = data[property]
  } else {
    entity.addComponent(Class, data)
  }
}
