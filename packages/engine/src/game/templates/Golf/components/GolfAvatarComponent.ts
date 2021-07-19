import { Group, Mesh, Vector3 } from 'three'
import { Body, RaycastQuery } from 'three-physx'
import { Component } from '../../../../ecs/classes/Component'
import { Types } from '../../../../ecs/types/Types'

export class GolfAvatarComponent extends Component<GolfAvatarComponent> {
  headModel: Group
  leftHandModel: Group
  rightHandModel: Group
  torsoModel: Group

  static _schema = {
    headModel: { default: null, type: Types.Ref },
    leftHandModel: { default: null, type: Types.Ref },
    rightHandModel: { default: null, type: Types.Ref },
    torsoModel: { default: null, type: Types.Ref }
  }
}
