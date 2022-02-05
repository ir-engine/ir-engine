import { EntityTreeNode } from '@xrengine/engine/src/ecs/classes/EntityTree'
import { ComponentConstructor } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { CommandManager } from '../../managers/CommandManager'

export type EditorPropType = {
  node: EntityTreeNode
  multiEdit?: boolean
}

export type EditorComponentType = React.FC<EditorPropType> & {
  iconComponent?: any
}

export const updateProperty = <T>(component: ComponentConstructor<T, any>, propName: keyof T) => {
  return (value) => {
    CommandManager.instance.setPropertyOnSelectionEntities({
      component,
      properties: { [propName]: value }
    })
  }
}
