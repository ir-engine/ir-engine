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

export const updateProperty = (component: ComponentConstructor<any, any>, propName: string) => {
  return (value) => {
    CommandManager.instance.setPropertyOnSelectionEntities({
      component,
      properties: { [propName]: value }
    })
  }
}
