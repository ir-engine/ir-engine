import { useCallback } from 'react'
import { CommandManager } from '../../managers/CommandManager'

//function used to setting changes in editor properties
export default function useSetPropertySelected(propName) {
  return useCallback((value) => CommandManager.instance.setPropertyOnSelection(propName, value), [propName])
}
