import { Box3 } from "three";
import { Component } from "../../ecs/classes/Component";
import { Types } from "../../ecs/types/Types";

export class BoundingBox extends Component<BoundingBox> {
  box = new Box3();
  boxArray = [];
  dynamic = false;
  static schema = {
    box: { type:  Types.Ref, default: new Box3() },
    boxArray: { type: Types.Array, default: [] },
    dynamic: { type: Types.Boolean, default: false },
  }
}
