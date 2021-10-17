import { ComponentData } from '../../common/classes/ComponentData'
import { ComponentNames } from '../../common/constants/ComponentNames'
import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'

export class PersistTagData implements ComponentData {
  static legacyComponentName = ComponentNames.PERSIST

  serialize(): object {
    return {}
  }
  serializeToJSON(): string {
    return JSON.stringify(this.serialize())
  }
}

export const PersistTagComponent = createMappedComponent<PersistTagData>('PersistTagComponent')
