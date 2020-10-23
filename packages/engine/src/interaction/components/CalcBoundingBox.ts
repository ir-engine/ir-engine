import { Box3 } from "three";
import { Component } from "../../ecs/classes/Component";
import { Types } from "../../ecs/types/Types";
import { Behavior } from "../../common/interfaces/Behavior";
import { InteractionCheckHandler } from "../types";

export class CalcBoundingBox extends Component<CalcBoundingBox> {
  static schema = {
    box: { type:  Types.Ref },
    boxArray: { type: Types.Array },
    dynamic: { type: Types.Boolean, default: false },
  }
  public box: Box3 | null = null
  public boxArray: Array = []
}
