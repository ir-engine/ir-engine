import { Component, Types } from "../../ecs"

export class WebXRPointer extends Component<any> {
  static schema = {
    pose: { type: Types.Ref },
    pointerMode: { type: Types.String }
  }
}
