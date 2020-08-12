import { Component, Types } from "../../ecs"

export class WebXRButton extends Component<any> {}

WebXRButton.schema = {
  domEl: { type: Types.Ref },
  onVRSupportRequested: { type: Types.Ref }
}
