import { Component } from '../../ecs/classes/Component';
import { Types } from '../../ecs/types/Types';

export class TransformParentComponent extends Component<TransformParentComponent> {
  children: any[] = []
}
TransformParentComponent.schema = {
  children: { default: [], type: Types.Array }
};
