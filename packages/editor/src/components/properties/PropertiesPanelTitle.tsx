/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

import React from 'react'

import { EntityUUID } from '@etherealengine/common/src/interfaces/EntityUUID'
import { getComponent } from '@etherealengine/engine/src/ecs/functions/ComponentFunctions'
import { UUIDComponent } from '@etherealengine/engine/src/scene/components/UUIDComponent'
import { dispatchAction, getMutableState, useHookstate } from '@etherealengine/hyperflux'

import LockIcon from '@mui/icons-material/Lock'
import UnlockIcon from '@mui/icons-material/LockOpen'
import TuneIcon from '@mui/icons-material/Tune'

import { EditorAction, EditorState } from '../../services/EditorServices'
import { SelectionState } from '../../services/SelectionServices'
import { PanelDragContainer, PanelIcon, PanelTitle } from '../layout/Panel'
import styles from '../styles.module.scss'

export const PropertiesPanelTitle = () => {
  const selectionState = useHookstate(getMutableState(SelectionState))
  const editorState = useHookstate(getMutableState(EditorState))
  return (
    <div className={styles.dockableTab}>
      <PanelDragContainer>
        <PanelIcon as={TuneIcon} size={12} />
        <PanelTitle>Properties</PanelTitle>
        <div className={styles.dockableTabButtons}>
          {editorState.advancedMode.value && (
            <button
              onClick={() => {
                const currentEntity = selectionState.selectedEntities.value[0]
                const currentState = editorState.lockPropertiesPanel.value
                if (currentState) {
                  dispatchAction(
                    EditorAction.lockPropertiesPanel({
                      lockPropertiesPanel: '' as EntityUUID
                    })
                  )
                } else {
                  if (currentEntity) {
                    dispatchAction(
                      EditorAction.lockPropertiesPanel({
                        lockPropertiesPanel:
                          typeof currentEntity === 'string'
                            ? (currentEntity as EntityUUID)
                            : getComponent(currentEntity, UUIDComponent)
                      })
                    )
                  }
                }
              }}
            >
              <PanelIcon as={editorState.lockPropertiesPanel.value ? LockIcon : UnlockIcon} size={10} />
              <PanelTitle>{editorState.lockPropertiesPanel.value ? 'Unlock' : 'Lock'}</PanelTitle>
            </button>
          )}
        </div>
      </PanelDragContainer>
    </div>
  )
}
