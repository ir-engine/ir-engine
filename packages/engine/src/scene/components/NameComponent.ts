import { ComponentData } from '../../common/classes/ComponentData'
import { ComponentNames } from '../../common/constants/ComponentNames'
import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'

export class NameData implements ComponentData {
  name: string

  constructor(name: string) {
    this.name = name
  }

  serialize(): object {
    return {
      name: this.name
    }
  }

  serializeToJSON(): string {
    return JSON.stringify(this.serialize())
  }
}

export const NameComponent = createMappedComponent<NameData>(ComponentNames.NAME)
