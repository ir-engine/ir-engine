import { addActionReceptor, removeActionReceptor } from '@etherealengine/hyperflux'

import { EditorHelperServiceReceptor } from './EditorHelperState'
import { EditorServiceReceptor } from './EditorServices'

export const registerEditorReceptors = () => {
  addActionReceptor(EditorHelperServiceReceptor)
  addActionReceptor(EditorServiceReceptor)
}

export const unregisterEditorReceptors = () => {
  removeActionReceptor(EditorHelperServiceReceptor)
  removeActionReceptor(EditorServiceReceptor)
}
