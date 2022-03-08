import { EntityTreeNode } from '@xrengine/engine/src/ecs/classes/EntityTree'
import { ComponentConstructor, ComponentType } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'

import { CommandManager } from '../../managers/CommandManager'

export type EditorPropType = {
  node: EntityTreeNode
  multiEdit?: boolean
}

export type EditorComponentType = React.FC<EditorPropType> & {
  iconComponent?: any
}

export const updateProperty = <C extends ComponentConstructor<any, any>, K extends keyof ComponentType<C>>(
  component: C,
  propName: K
) => {
  return (value: ComponentType<C>[K]) => {
    CommandManager.instance.setPropertyOnSelectionEntities({
      component,
      properties: { [propName]: value } as ComponentType<C>
    })
  }
}
