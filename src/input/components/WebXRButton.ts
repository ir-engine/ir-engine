import { Component, Types } from "ecsy"

export class WebXRButton extends Component<any> {}

WebXRButton.schema = {
  domEl: { type: Types.Ref },
  onVRSupportRequested: { type: Types.Ref }
}
