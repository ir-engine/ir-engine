import { Component, Types } from "ecsy"

export class WebXRViewPoint extends Component<any> {
  static schema = {
    pose: { type: Types.Ref }
  }
}
