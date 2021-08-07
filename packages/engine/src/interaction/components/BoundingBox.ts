import { Box3, Vector3 } from 'three'
import { Component } from '../../ecs/classes/Component'
import { Types } from '../../ecs/types/Types'

/**
 * @author HydraFire <github.com/HydraFire>
 */

export class BoundingBoxComponent extends Component<BoundingBoxComponent> {
  public box: Box3
  public dynamic: boolean

  static _schema = {
    box: { type: Types.Ref, default: null },
    dynamic: { type: Types.Boolean, default: false }
  }
}
