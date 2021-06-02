import { Box3 } from "three";
import { Component } from "../../ecs/classes/Component";
import { Types } from "../../ecs/types/Types";

/**
* @author HydraFire <github.com/HydraFire>
 */

export class BoundingBox extends Component<BoundingBox> {
  public box: Box3 =  new Box3();
  public boxArray: any[];
  public dynamic: boolean;

  static _schema = {
    box: { type: Types.Ref, default: null },
    boxArray: { type: Types.Array, default: [] },
    dynamic: { type: Types.Boolean, default: false },
  }
}
