import Input from "../components/Input"
import { Component, Types as t } from "ecsy"
const { Ref } = t

export class WebXRRenderer extends Component<any> {
  static schema = {
    context: { type: Ref },
    requestAnimationFrame: { type: Ref, default: window.requestAnimationFrame }
  }
}

export class WebXRButton {
    static schema = {
        domEl: { type: Ref },
        onVRSupportRequested: { type: Ref }
    }
}

export class WebXRSession extends Component<any> {
  static schema = {
    session: { type: Ref },
    isImmersive: { type: t.Boolean, default: false },
    // onStarted: { type: Ref },
    // onEnded: { type: Ref }
  }
}

export class WebXRSpace extends Component<any> {
  static schema = {
    space: { type: Ref },
    spaceType: { type: t.String }
  }
}

export class WebXRViewPoint extends Component<any> {
  static schema = {
    pose: { type: Ref }
  }
}

abstract class WebXRTrackingDevice extends Component<any> {
  static schema = {
    pose: { type: Ref },
    handId: { type: t.Number }
  }
}
export class WebXRPointer extends Component<any> {
  static schema = {
    pose: { type: Ref },
    pointerMode: { type: t.String }
  }
}
export class WebXRMainController extends WebXRTrackingDevice {}
export class WebXRSecondController extends WebXRTrackingDevice {}

export class WebXRMainGamepad extends Input {}
export class WebXRSecondGamepad extends Input {}
