import { addActionReceptor, removeActionReceptor } from '@etherealengine/hyperflux'

import { EditorErrorServiceReceptor } from './EditorErrorServices'
import { EditorHelperServiceReceptor } from './EditorHelperState'
import { EditorServiceReceptor } from './EditorServices'

export const registerEditorReceptors = () => {
  addActionReceptor(EditorErrorServiceReceptor)
  addActionReceptor(EditorHelperServiceReceptor)
  addActionReceptor(EditorServiceReceptor)
}

export const deregisterEditorReceptors = () => {
  removeActionReceptor(EditorErrorServiceReceptor)
  removeActionReceptor(EditorHelperServiceReceptor)
  removeActionReceptor(EditorServiceReceptor)
}
