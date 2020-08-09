import { System } from "ecsy"
import { WebXRRenderer } from "../components/WebXRRenderer"
import { WebXRSession } from "../components/WebXRSession"
import { initVR, initializeSession, processSession } from "../behaviors/WebXRInputBehaviors"

export class WebXRInputSystem extends System {
  readonly mainControllerId = 0
  readonly secondControllerId = 1

  init({ onVRSupportRequested }): void {
    if (onVRSupportRequested) initVR(onVRSupportRequested)
  }

  static queries = {
    renderer: { components: [WebXRRenderer] },
    sessions: { components: [WebXRSession], listen: { added: true } }
  }

  execute() {
    const { sessions, renderer } = this.queries
    const [rendererEntity] = renderer.results
    const webXRRenderer = rendererEntity && rendererEntity.getMutableComponent(WebXRRenderer)

    if (sessions.added)
      for (const entity of sessions.added) {
        initializeSession(entity, { webXRRenderer })
      }

    if (sessions.results)
      for (const entity of sessions.results) {
        processSession(entity)
      }
  }
}
