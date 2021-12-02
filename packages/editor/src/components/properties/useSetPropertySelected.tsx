import { ComponentConstructor } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { useCallback } from 'react'
import { CommandManager } from '../../managers/CommandManager'

//function used to setting changes in editor properties
export default function useSetPropertySelected(propName) {
  return useCallback((value) => CommandManager.instance.setPropertyOnSelection(propName, value), [propName])
}

//function used to setting changes in editor properties
export function useSetPropertyOnSelectedEntities(component: ComponentConstructor<any, any>, propName: string) {
  return useCallback(
    (value) => CommandManager.instance.setPropertyOnSelectionEntities(component, propName, value),
    [component, propName]
  )
}
