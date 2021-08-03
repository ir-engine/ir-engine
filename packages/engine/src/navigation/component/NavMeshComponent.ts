import { Component } from '../../ecs/classes/Component'
import { Types } from '../../ecs/types/Types'
import { NavMesh } from 'yuka'

/**
 * @author xiani_zp <github.com/xiani>
 */

export class NavMeshComponent extends Component<NavMeshComponent> {
  public yukaNavMesh: NavMesh

  static _schema = {
    yukaNavMesh: { type: Types.Ref, default: null }
  }
}
