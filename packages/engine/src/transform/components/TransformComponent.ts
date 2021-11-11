import { Vector3, Quaternion, Object3D, Euler } from 'three'
import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'
import { ComponentData } from '../../common/classes/ComponentData'
import { ComponentNames } from '../../common/constants/ComponentNames'

export type TransformDataProps = {
  position: Vector3
  rotation: Quaternion
  scale: Vector3
}

export class TransformData implements ComponentData {
  static legacyComponentName = ComponentNames.TRANSFORM

  constructor(obj3d: Object3D, props?: TransformDataProps) {
    this.obj3d = obj3d

    if (props) {
      this.position = props.position
      this.rotation = props.rotation
      this.scale = props.scale
    }
  }

  obj3d: Object3D

  get position() {
    return this.obj3d.position
  }

  set position(pos: Vector3) {
    this.obj3d.position.copy(pos)
  }

  get rotation() {
    return this.obj3d.quaternion
  }

  set rotation(quaternion: Quaternion) {
    this.obj3d.quaternion.copy(quaternion)
  }

  get eulerRotation() {
    return this.obj3d.rotation
  }

  set eulerRotation(rotation: Euler) {
    this.obj3d.rotation.copy(rotation)
  }

  get scale() {
    return this.obj3d.scale
  }

  set scale(pos: Vector3) {
    this.obj3d.scale.copy(pos)
  }

  serialize(): object {
    return {
      position: this.position,
      rotation: this.rotation,
      scale: this.scale
    }
  }

  serializeToJSON(): string {
    return JSON.stringify(this.serialize())
  }

  deserialize(props: TransformDataProps): TransformData {
    this.position = props.position
    this.rotation = props.rotation
    this.scale = props.scale

    return this
  }

  deserializeFromJSON(json: string): TransformData {
    return this.deserialize(JSON.parse(json))
  }
}

export const TransformComponent = createMappedComponent<TransformData>(ComponentNames.TRANSFORM)
