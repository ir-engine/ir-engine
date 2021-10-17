import { ComponentData } from '../../common/classes/ComponentData'
import { ComponentNames } from '../../common/constants/ComponentNames'
import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'
import { InteractionData } from '../types/InteractionTypes'

export type InteractableDataProps = {
  data: InteractionData
}

export class InteractableData implements ComponentData {
  static legacyComponentName  = ComponentNames.INTERACT

  constructor(props?: InteractableDataProps) {
    if (props) {
      this.data = props.data
    }
  }

  data: InteractionData

  serialize(): object {
    return {
      data: this.data
    }
  }

  serializeToJSON(): string {
    return JSON.stringify(this.serialize())
  }
}

export const InteractableComponent = createMappedComponent<InteractableData>('InteractableComponent')
