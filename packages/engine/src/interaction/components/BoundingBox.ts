import { Box3 } from "three";
import { Component } from "../../ecs/classes/Component";
import { Types } from "../../ecs/types/Types";
import { Behavior } from "../../common/interfaces/Behavior";
import { InteractionCheckHandler } from "../types";

export class BoundingBox extends Component<CalcBoundingBox> {
  static schema = {
    box: { type:  Types.Ref, default: new Box3() },
    boxArray: { type: Types.Array, default: [] },
    dynamic: { type: Types.Boolean, default: false },
  }
}
