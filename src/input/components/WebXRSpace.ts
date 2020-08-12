import { Component, Types } from "../../ecs"

export class WebXRSpace extends Component<any> {
  static schema = {
    space: { type: Types.Ref },
    spaceType: { type: Types.String }
  }
}
