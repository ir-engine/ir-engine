import { Component, Types } from "../../ecs"

export class WebXRViewPoint extends Component<any> {
  static schema = {
    pose: { type: Types.Ref }
  }
}
