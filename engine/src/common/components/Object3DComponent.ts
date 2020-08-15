import { Object3D } from "three"
import { Component } from "../../ecs/classes/Component"
import { RefPropType } from "../../ecs/types/Types"

export class Object3DComponent extends Component<Object3DComponent> {
  value?: Object3D

  static schema: {
    value: { type: RefPropType<Object3D> }
  }
}
