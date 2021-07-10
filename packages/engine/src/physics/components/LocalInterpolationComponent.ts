import { Vector3 } from 'three'
import { Component } from '../../ecs/classes/Component'
import { Types } from '../../ecs/types/Types'

/**
 * @author HydraFire <github.com/HydraFire>
 */

export class LocalInterpolationComponent extends Component<any> {
  correctionStart = true
  positionDiff: Vector3
  level0 = 0.0001
  level5 = 0.02
}

LocalInterpolationComponent._schema = {
  correctionStart: { type: Types.Boolean, default: true },
  positionDiff: { type: Types.Ref, default: new Vector3() }
}
