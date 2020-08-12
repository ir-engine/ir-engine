import { Object3D } from "three"
import { Component } from "../../ecs/Component"
import { RefPropType } from "../../ecs/Types"

export class Object3DComponent extends Component<Object3DComponent> {
  value?: Object3D

  static schema: {
    value: { type: RefPropType<Object3D> }
  }
}
