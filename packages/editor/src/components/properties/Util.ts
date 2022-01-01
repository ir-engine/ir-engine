import { ComponentUpdateFunction } from '@xrengine/engine/src/common/constants/PrefabFunctionType'
import { EntityTreeNode } from '@xrengine/engine/src/ecs/classes/EntityTree'
import { ComponentConstructor } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { useCallback } from 'react'
import { CommandManager } from '../../managers/CommandManager'

export type EditorPropType = {
  node: EntityTreeNode
  multiEdit?: boolean
}

export type EditorComponentType = React.FC<EditorPropType> & {
  iconComponent?: any
}

//function used to setting changes in editor properties
export default function useSetPropertySelected(propName) {
  return useCallback((value) => CommandManager.instance.setPropertyOnSelection(propName, value), [propName])
}

//function used to setting changes in editor properties
export function useSetPropertyOnSelectedEntities(
  component: ComponentConstructor<any, any>,
  updateFunction: ComponentUpdateFunction,
  propName: string
) {
  return useCallback(
    (value) =>
      CommandManager.instance.setPropertyOnSelectionEntities({
        component,
        updateFunction,
        properties: { [propName]: value }
      }),
    [component, propName]
  )
}
