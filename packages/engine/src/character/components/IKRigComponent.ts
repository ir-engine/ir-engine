import { Component } from "../../ecs/classes/Component";
import { Types } from "../../ecs/types/Types";
import { Avatar } from "../../xr/classes/IKAvatar";

export class IKRigComponent extends Component<IKRigComponent> {
  public avatarIKRig: Avatar;
}

IKRigComponent._schema = {
	avatarIKRig: { type: Types.Ref, default: null },
};
