import { Component, Types } from "ecsy"

export class WebXRPointer extends Component<any> {
  static schema = {
    pose: { type: Types.Ref },
    pointerMode: { type: Types.String }
  }
}
