import { Component } from "../../ecs/classes/Component";
import { Types } from "../../ecs/types/Types";
import { Entity } from "../../ecs/classes/Entity";

export class InteractiveFocused extends Component<InteractiveFocused> {
  interacts: Entity

  static schema = {
    interacts: { type: Types.Ref }
  }
}