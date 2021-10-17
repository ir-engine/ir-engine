import { Object3D } from 'three'
import { ComponentData } from '../../common/classes/ComponentData'
import { ComponentNames } from '../../common/constants/ComponentNames'
import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'

export type ShadowDataProps = {
  castShadow: boolean
  receiveShadow: boolean
}

export class ShadowData implements ComponentData {
  static legacyComponentName = ComponentNames.POINT_LIGHT

  constructor(obj3d: Object3D, props?: ShadowDataProps) {
    this.obj3d = obj3d

    if (props) {
      this.receiveShadow = props.receiveShadow
      this.castShadow = props.castShadow
    }
  }

  obj3d: Object3D

  get castShadow() {
    return this.obj3d.castShadow
  }

  set castShadow(castShadow: boolean) {
    this.obj3d.castShadow = castShadow
  }

  get receiveShadow() {
    return this.obj3d.receiveShadow
  }

  set receiveShadow(receiveShadow: boolean) {
    this.obj3d.receiveShadow = receiveShadow
  }

  serialize(): object {
    throw new Error('Method not implemented.')
  }
  serializeToJSON(): string {
    throw new Error('Method not implemented.')
  }
}

export const ShadowComponent = createMappedComponent<ShadowData>('ShadowComponent')
