import { Component } from '../../ecs/classes/Component';
import { Types } from '../../ecs/types/Types';
import { Entity } from "../../ecs/classes/Entity";

export class CopyTransformComponent extends Component<CopyTransformComponent> {
  input: Entity
}
CopyTransformComponent.schema = {
  input: { default: [], type: Types.Ref }
};
