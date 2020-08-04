import { System, Entity, Component } from "ecsy"
import {
  WebXRRenderer,
  WebXRSession,
  WebXRSpace,
  WebXRViewPoint,
  WebXRPointer,
  WebXRMainController,
  WebXRSecondController,
  WebXRMainGamepad,
  WebXRSecondGamepad
} from "../components/WebXR"

export default class WebXRInputSystem extends System {
  mainControllerId = 0
  secondControllerId = 1

  init({ onVRSupportRequested }) {
    const { world } = this
    world
      .registerComponent(WebXRSession)
      .registerComponent(WebXRSpace)
      .registerComponent(WebXRViewPoint)
      .registerComponent(WebXRPointer)
      .registerComponent(WebXRMainController)
      .registerComponent(WebXRSecondController)
      .registerComponent(WebXRMainGamepad)
      .registerComponent(WebXRSecondGamepad)
    //.registerComponent(WebXRButtonComponent)
    const { xr } = navigator as any
    if (xr) {
      xr.isSessionSupported("immersive-vr").then(onVRSupportRequested)
      xr.requestSession("inline").then(session => world.createEntity("inline-session").addComponent(WebXRSession, { session }))
    } else console.log("WebXR isn't supported by this browser")
  }

  startVR(onStarted: Function, onEnded: Function) {
    let entity: Entity, session: XRSession, isImmersive: boolean, spaceType: string
    return (navigator as any).xr
      .requestSession("immersive-vr", { requiredFeatures: ["local-floor"] })
      .then(vrSession => {
        isImmersive = true
        session = vrSession
        session.addEventListener("end", onEnded)
        entity = this.world.createEntity("vr-session")
        entity.addComponent(WebXRSession, { session, isImmersive })
        spaceType = isImmersive ? "local-floor" : "viewer"
        return session.requestReferenceSpace(spaceType)
      })
      .then(space => {
        entity.addComponent(WebXRSpace, { space })
        onStarted && onStarted(session, space)
        console.log("XR refSpace", space)
      })
      .catch(console.warn)
  }

  static queries = {
    sessions: { components: [WebXRSession], listen: { added: true, removed: true } },
    renderer: { components: [WebXRRenderer] }
  }

  execute() {
    const { sessions, renderer } = this.queries
    const [rendererEntity] = renderer.results
    const webXRRenderer = rendererEntity && rendererEntity.getMutableComponent(WebXRRenderer)

    if (sessions.added)
      for (const entity of sessions.added) {
        const { session, isImmersive } = entity.getComponent(WebXRSession)
        session.addEventListener("end", () => {
          entity.remove()
          webXRRenderer.requestAnimationFrame = WebXRRenderer.schema.requestAnimationFrame.default
        })
        console.log("XR session added to", entity.name, "isImmersive", isImmersive)
        if (entity.name == "vr-session") {
          session.updateRenderState({ baseLayer: new XRWebGLLayer(session, webXRRenderer.context) })

          webXRRenderer.requestAnimationFrame = session.requestAnimationFrame.bind(session)

          // const refSpaceType = isImmersive ? 'local-floor' : 'viewer'
          // session.requestReferenceSpace(refSpaceType).then( refSpace => {
          //     sessionStore.refSpace = refSpace
          //     onStarted && onStarted(session, refSpace)
          //     console.log('XR refSpace', refSpace)
          // })
        }
        console.log("XR session started", session)
      }

    if (sessions.results)
      for (const entity of sessions.results) {
        const { session, isImmersive } = entity.getComponent(WebXRSession)
        if (isImmersive) {
          console.log("requesting animation frame", session)
          const { space, spaceType } = entity.getComponent(WebXRSpace)
          session.requestAnimationFrame((time, frame) => {
            console.log(time, "XRFrame", frame)
            //TODO:
            // let refSpace = session.isImmersive ?
            //     xrImmersiveRefSpace :
            //     inlineViewerHelper.referenceSpace;

            if (space)
              setComponent(entity, WebXRViewPoint, {
                pose: frame.getViewerPose(space)
              })

            const controllers = space ? this.updateInputSources(session, frame, space) : []

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
              if (second.gamepad)
                setComponent(entity, WebXRSecondGamepad, {
                  gamepad: second.gamepad
                })
            } else return
            setComponent(entity, WebXRMainController, {
              pose: main.gripPose,
              handId: main.handedness
            })
            if (main.gamepad)
              setComponent(entity, WebXRMainGamepad, {
                gamepad: main.gamepad
              })
            if (main.targetRayPose)
              setComponent(entity, WebXRPointer, {
                pose: main.targetRayPose,
                pointMode: main.targetRayMode
              })
            //webXRRenderer.drawFrame(viewerPose, controllers, session)
          })
        }
      }
  }

  updateInputSources({ inputSources = [] }, frame: XRFrame, refSpace: XRReferenceSpace) {
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
}

function setComponent(entity: Entity, Class: Component, data = {}) {
  if (entity.hasComponent(Class)) {
    const mutate = entity.getMutableComponent(Class)
    for (const property in data) mutate[property] = data[property]
  } else {
    entity.addComponent(Class, data)
  }
}
