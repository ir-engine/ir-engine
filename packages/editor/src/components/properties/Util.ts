import { EntityTreeNode } from '@xrengine/engine/src/ecs/classes/EntityTree'
import { ComponentConstructor, ComponentType } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'

import { setPropertyOnSelectionEntities } from '../../classes/History'

export type EditorPropType = {
  node: EntityTreeNode
  multiEdit?: boolean
}

export type EditorComponentType = React.FC<EditorPropType> & {
  iconComponent?: any
}

export const updateProperty = <C extends ComponentConstructor<any, any>, K extends keyof ComponentType<C>>(
  component: C,
  propName: K,
  ...args: any
) => {
  return (value: ComponentType<C>[K]) => {
    setPropertyOnSelectionEntities({
      component,
      properties: { [propName]: value, ...args } as ComponentType<C>
    })
  }
}
