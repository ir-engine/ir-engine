import { Component, Types } from "../../ecs"

export class WebXRRenderer extends Component<any> {
  static schema = {
    context: { type: Types.Ref },
    // TODO: window refs will break our server, so let's be aware (or we can exclude this?)
    requestAnimationFrame: {
      type: Types.Ref,
      default: typeof window !== "undefined" ? window.requestAnimationFrame : null
    }
  }
}
