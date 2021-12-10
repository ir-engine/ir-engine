import { ComponentName } from '../../common/constants/ComponentNames'
import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'

export type MetaDataComponentType = {
  meta_data: string
}

export const MetaDataComponent = createMappedComponent<MetaDataComponentType>(ComponentName.MT_DATA)
