import { Component, Types } from "ecsy"

export abstract class WebXRTrackingDevice extends Component<any> {
  static schema = {
    pose: { type: Types.Ref },
    handId: { type: Types.Number }
  }
}
