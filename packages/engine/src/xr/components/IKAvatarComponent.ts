import { Component } from "../../ecs/classes/Component";
import { Avatar } from "../classes/IKAvatar";


export class IKAvatarComponent extends Component<IKAvatarComponent> {

  avatarIKRig: Avatar;

	dispose(): void {
    super.dispose();
  }

}

IKAvatarComponent._schema = {
  
};
