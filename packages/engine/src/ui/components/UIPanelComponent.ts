import { Component } from '../../ecs/classes/Component';
import { Types } from '../../ecs/types/Types';

export class UIPanelComponent extends Component<UIPanelComponent> {

  panel: any;
  
  static _schema = {
    panel: { type: Types.Ref, default: null },
  }
}
