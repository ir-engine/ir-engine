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
  readonly mainControllerId = 0
  readonly secondControllerId = 1
  debug = Function()

  init({ onVRSupportRequested, debug }) {
    if(debug) this.debug = console.log
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
      
    const { xr } = navigator as any
    if (xr) {
      xr.isSessionSupported("immersive-vr").then(onVRSupportRequested)
      xr.requestSession("inline").then(session => 
        world.createEntity("inline-session")
        .addComponent(WebXRSession, { session })
      )
    } else this.debug("WebXR isn't supported by this browser")
  }

  startVR(onStarted = Function(), onEnded = Function() ) {
    let entity: Entity, session: XRSession, isImmersive: boolean, spaceType: any
    const onSpaceCreated = space => {
        entity.addComponent(WebXRSpace, { space, spaceType })
        onStarted && onStarted(session, space)
        this.debug("XR refSpace", space, spaceType)
    }
    return (navigator as any).xr
      .requestSession("immersive-vr", {optionalFeatures: ["local-floor"]})
      .then( vrSession => {
        session = vrSession
        session.addEventListener("end", onEnded)
        isImmersive = true
        entity = this.world.createEntity("vr-session")
        entity.addComponent(WebXRSession, { session, isImmersive })
        spaceType = "local-floor"
        return session.requestReferenceSpace(spaceType)
      })
      .then( onSpaceCreated )
      .catch( error => {
        this.debug("XR space", spaceType, error)
        isImmersive = true
        spaceType = "local"
        session.requestReferenceSpace(spaceType)
            .then( onSpaceCreated )
            .catch( error => {
                this.debug("XR space", spaceType, error)
                isImmersive = false
                spaceType = "viewer"
                session.requestReferenceSpace(spaceType)
                    .then( onSpaceCreated )
                    .catch( console.warn )
            })
      })
      .catch( console.warn )
  }

  static queries = {
    renderer: { components: [WebXRRenderer] },
    sessions: { components: [WebXRSession], listen: { added: true } },
  }

  execute() {
    const { sessions, renderer } = this.queries
    const [rendererEntity] = renderer.results
    const webXRRenderer = rendererEntity && rendererEntity.getMutableComponent(WebXRRenderer)

    if (sessions.added) for (const entity of sessions.added) {
        const { session, isImmersive } = entity.getComponent(WebXRSession)
        session.addEventListener("end", () => {
          entity.remove()
          webXRRenderer.requestAnimationFrame = WebXRRenderer.schema.requestAnimationFrame.default
        })
        this.debug("XR session added to", entity, "isImmersive", isImmersive)
        if (isImmersive/*entity.name == "vr-session"*/) {
          webXRRenderer.context.makeXRCompatible()
            .then(() => session.updateRenderState({ 
                baseLayer: new XRWebGLLayer(session, webXRRenderer.context) 
            })
          )
          webXRRenderer.requestAnimationFrame = session.requestAnimationFrame.bind(session)
        }
        this.debug("XR session started", session)
    }

    if (sessions.results) for (const entity of sessions.results) {
        const { session, isImmersive } = entity.getComponent(WebXRSession)
        if (isImmersive) {
          this.debug("requesting animation frame", session)
          session.requestAnimationFrame((time, frame) => {
            this.debug(time, "XRFrame", frame)
            //TODO:
            // let refSpace = session.isImmersive ?
            //     xrImmersiveRefSpace :
            //     inlineViewerHelper.referenceSpace;
            const { space, spaceType } = entity.getComponent(WebXRSpace)
            if (space) setComponent(entity, WebXRViewPoint, {
                pose: frame.getViewerPose(space)
            })

            const controllers = space ? this.getInputSources(session, frame, space) : []
            let main, second;
            if (controllers.length == 1) {
              main = controllers[0]
            } else if (controllers.length == 2) {
              main = controllers[this.mainControllerId]
              second = controllers[this.secondControllerId]
              setComponent(entity, WebXRSecondController, {
                pose: second.gripPose,
                handId: second.handedness
              })
              const {gamepad} = second
              if (gamepad) setComponent(entity, WebXRSecondGamepad, {gamepad})
            } else return;
            if (main.targetRayPose) setComponent(entity, WebXRPointer, {
                pose: main.targetRayPose,
                pointMode: main.targetRayMode
            })
            setComponent(entity, WebXRMainController, {
              pose: main.gripPose,
              handId: main.handedness
            })
            const {gamepad} = main
            if (gamepad) setComponent(entity, WebXRMainGamepad, {gamepad})
            //webXRRenderer.drawFrame(viewerPose, controllers, session)
          })
        }
      }
  }

  getInputSources({ inputSources = [] }, frame: XRFrame, refSpace: XRReferenceSpace) {
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

function setComponent(entity: Entity, Class, data = {}) {
  if (entity.hasComponent(Class)) {
    const mutate = entity.getMutableComponent(Class)
    for (let property in data) mutate[property] = data[property]
  } else {
    entity.addComponent(Class, data)
  }
}
