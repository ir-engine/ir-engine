import { Component } from '../../ecs/classes/Component'
import { Types } from '../../ecs/types/Types'
import { Entity } from '../../ecs/classes/Entity'
import { Path } from 'yuka'

/**
 * @author xiani_zp <github.com/xiani>
 */

export class AutoPilotComponent extends Component<AutoPilotComponent> {
  public navEntity: Entity
  public path: Path

  static _schema = {
    navEntity: { type: Types.Ref, default: null },
    path: { type: Types.Ref, default: null }
  }
}
