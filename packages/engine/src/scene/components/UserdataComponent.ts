import { ComponentData } from '../../common/classes/ComponentData'
import { ComponentNames } from '../../common/constants/ComponentNames'
import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'

/**
 * @author HydraFire <github.com/HydraFire>
 */
export type UserdataProps = {
  data: any
}

export class Userdata implements ComponentData {
  static legacyComponentName  = ComponentNames.USER_DATA

  constructor(props?: UserdataProps) {
    if (props) {
      this.data = props.data
    }
  }

  data: any

  serialize(): object {
    return {
      data: this.data
    }
  }
  serializeToJSON(): string {
    return JSON.stringify(this.serialize())
  }
}

export const UserdataComponent = createMappedComponent<Userdata>('UserdataComponent')
