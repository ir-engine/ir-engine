import { Component } from "../../ecs/classes/Component";
import { Types } from "../../ecs/types/Types";
import { IKAvatarRig } from "../../xr/classes/IKAvatarRig";

export class IKComponent extends Component<IKComponent> {
  public avatarIKRig: IKAvatarRig;
}

IKComponent._schema = {
	avatarIKRig: { type: Types.Ref, default: null },
};
