import { TransformComponent } from './TransformComponent';
import { Component } from '../../ecs/classes/Component';
import { Types } from '../../ecs/types/Types';

export class TransformChildComponent extends Component<TransformChildComponent> {
  parent: any
}
TransformChildComponent.schema = {
  parent: { default: [], type: Types.Ref }
};
