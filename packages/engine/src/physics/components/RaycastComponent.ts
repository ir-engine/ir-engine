import { Component } from '../../ecs/classes/Component'
import { Types } from '../../ecs/types/Types'
import type { RaycastQuery } from 'three-physx'

export class RaycastComponent extends Component<RaycastComponent> {
  raycastQuery: RaycastQuery

  static _schema = {
    raycastQuery: { type: Types.Ref }
  }
}
