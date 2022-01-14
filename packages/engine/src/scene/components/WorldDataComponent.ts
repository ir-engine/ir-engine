import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'

export type WorldDataComponentType = {
  data: string
}

export const WorldDataComponent = createMappedComponent<WorldDataComponentType>('WorldDataComponent')
