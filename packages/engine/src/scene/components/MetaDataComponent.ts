import { ComponentData } from '../../common/classes/ComponentData'
import { ComponentNames } from '../../common/constants/ComponentNames'
import { Engine } from '../../ecs/classes/Engine'
import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'
import { Sky } from '../classes/Sky'

export type MetaDataProps = {
  meta_data?: string
}

export class MetaData implements ComponentData {
  static legacyComponentName = ComponentNames.MT_DATA

  constructor(props: MetaDataProps) {
    this.meta_data = props.meta_data
  }

  get meta_data(): string | undefined {
    return Engine.defaultWorld.sceneMetadata
  }

  set meta_data(data: string | undefined) {
    Engine.defaultWorld.sceneMetadata = data
  }

  serialize(): object {
    return {
      meta_data: this.meta_data
    }
  }

  serializeToJSON(): string {
    return JSON.stringify(this.serialize())
  }

  obj3d: Sky
}

export const MetaDataComponent = createMappedComponent<MetaData>(ComponentNames.MT_DATA)
