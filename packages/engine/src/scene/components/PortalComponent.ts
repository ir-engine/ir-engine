import { Component } from '../../ecs/classes/Component';
import { Types } from '../../ecs/types/Types';

export class PortalComponent extends Component<PortalComponent> {
  location: string;
}

PortalComponent._schema = {
  location: { type: Types.String, default: '' }
};
