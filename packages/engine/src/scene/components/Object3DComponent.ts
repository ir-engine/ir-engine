import { Object3D, Group } from 'three'
import { ComponentData } from '../../common/classes/ComponentData'
import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'

export class Object3DData implements ComponentData {
  value: Object3D | Group

  constructor(obj3d: Object3D | Group) {
    this.value = obj3d
  }

  serialize(): object {
    return {}
  }

  serializeToJSON(): string {
    return JSON.stringify(this.serialize())
  }
}

export const Object3DComponent = createMappedComponent<Object3DData>('Object3DComponent')
