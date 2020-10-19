import { Component } from "../../ecs/classes/Component";
import { Types } from "../../ecs/types/Types";
import { Entity } from "../../ecs/classes/Entity";

export class SubFocused extends Component<SubFocused> {
  subInteracts:Entity

  static schema = {
    subInteracts: { type: Types.Ref }
  }
}
