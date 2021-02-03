import { Component } from '../../ecs/classes/Component';
import { Types } from '../../ecs/types/Types';

export class WebXRButton extends Component<any> {}

WebXRButton._schema = {
  domEl: { type: Types.Ref },
  onVRSupportRequested: { type: Types.Ref }
};
