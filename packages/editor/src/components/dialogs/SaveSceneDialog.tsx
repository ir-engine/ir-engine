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

import React, { useCallback } from 'react'
import { useTranslation } from 'react-i18next'

import { dispatchAction, getMutableState, useHookstate } from '@etherealengine/hyperflux'

import Box from '@mui/material/Box'

import { EditorHelperAction, EditorHelperState } from '../../services/EditorHelperState'
import BooleanInput from '../inputs/BooleanInput'
import Dialog from './Dialog'

/**
 * SaveSceneDialog used to show dialog when to save scene.
 *
 * @param       {function} onConfirm
 * @param       {function} onCancel
 * @constructor
 */
export function SaveSceneDialog({ onConfirm, onCancel }) {
  const { t } = useTranslation()
  const editorHelperState = useHookstate(getMutableState(EditorHelperState))
  const state = useHookstate({
    isGenerateThumbnailsEnabled: editorHelperState.isGenerateThumbnailsEnabled.value
  })

  const onChangeGenerateThumbnails = (value) => {
    state.isGenerateThumbnailsEnabled.set(value)
  }

  /**
   * onConfirmCallback callback function is used handle confirm dialog.
   *
   * @type {function}
   */
  const onConfirmCallback = useCallback(
    (e) => {
      e.preventDefault()

      if (state.isGenerateThumbnailsEnabled.value !== editorHelperState.isGenerateThumbnailsEnabled.value) {
        dispatchAction(
          EditorHelperAction.changedGenerateThumbnails({
            isGenerateThumbnailsEnabled: state.isGenerateThumbnailsEnabled.value
          })
        )
      }

      onConfirm({ generateThumbnails: state.isGenerateThumbnailsEnabled.value })
    },
    [onConfirm]
  )

  /**
   * onCancelCallback callback function used to handle cancel of dialog.
   *
   * @type {function}
   */
  const onCancelCallback = useCallback(
    (e) => {
      e.preventDefault()
      onCancel()
    },
    [onCancel]
  )

  //returning view for dialog view.
  return (
    <Dialog
      title={t('editor:dialog.saveScene.title')}
      onConfirm={onConfirmCallback}
      onCancel={onCancelCallback}
      confirmLabel={t('editor:dialog.saveScene.lbl-confirm')}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', margin: '10px' }}>
        <BooleanInput value={state.isGenerateThumbnailsEnabled.value} onChange={onChangeGenerateThumbnails} />
        <label style={{ marginLeft: '10px' }}>{t('editor:dialog.saveScene.lbl-thumbnail')}</label>
      </Box>
    </Dialog>
  )
}

export default SaveSceneDialog
