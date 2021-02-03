import { Component } from '../../../ecs/classes/Component';
import { Types } from '../../../ecs/types/Types';

export class CharacterAvatarComponent extends Component<CharacterAvatarComponent> {
  avatarId:string
}

CharacterAvatarComponent._schema = {
  avatarId: { type: Types.String }
};