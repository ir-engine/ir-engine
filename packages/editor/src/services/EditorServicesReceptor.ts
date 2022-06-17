import { addActionReceptor, removeActionReceptor } from '@xrengine/hyperflux'

import { EditorErrorServiceReceptor } from './EditorErrorServices'
import { EditorHelperServiceReceptor } from './EditorHelperState'
import { EditorServiceReceptor } from './EditorServices'
import { EditorSelectionServiceReceptor } from './SelectionServices'

export const registerEditorReceptors = () => {
  addActionReceptor(EditorSelectionServiceReceptor)
  addActionReceptor(EditorErrorServiceReceptor)
  addActionReceptor(EditorHelperServiceReceptor)
  addActionReceptor(EditorServiceReceptor)
}

export const deregisterEditorReceptors = () => {
  removeActionReceptor(EditorSelectionServiceReceptor)
  removeActionReceptor(EditorErrorServiceReceptor)
  removeActionReceptor(EditorHelperServiceReceptor)
  removeActionReceptor(EditorServiceReceptor)
}
