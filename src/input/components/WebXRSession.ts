import { Component, Types } from "ecsy"

export class WebXRSession extends Component<any> {
  static schema = {
    session: { type: Types.Ref },
    isImmersive: { type: Types.Boolean, default: false }
    // onStarted: { type: Ref },
    // onEnded: { type: Ref }
  }
}
