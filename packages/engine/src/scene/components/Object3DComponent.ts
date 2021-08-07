import { Object3D } from 'three'
import { Component } from '../../ecs/classes/Component'
import { Types } from '../../ecs/types/Types'

/** Component Class for Object3D type from three.js.  */
export class Object3DComponent extends Component<Object3DComponent> {
  value: Object3D
}

Object3DComponent._schema = {
  value: { type: Types.Ref, default: null }
}
