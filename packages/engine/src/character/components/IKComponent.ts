import { Component } from '../../ecs/classes/Component';
import { Types } from '../../ecs/types/Types';
import { Avatar } from '../../xr/classes/IKAvatar';

export class IKComponent extends Component<IKComponent> {
  public avatarIKRig: Avatar;
}

IKComponent._schema = {
	avatarIKRig: { type: Types.Ref, default: null },

};
