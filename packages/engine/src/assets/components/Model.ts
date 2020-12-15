import { Component } from '../../ecs/classes/Component';
import { Types } from '../../ecs/types/Types';
export class Model extends Component<Model> {}

Model._schema = {
  value: { default: null, type: Types.Ref }
};
