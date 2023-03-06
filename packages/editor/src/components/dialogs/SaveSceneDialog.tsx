import React, { useCallback } from 'react'
import { useTranslation } from 'react-i18next'

import { dispatchAction, useState } from '@etherealengine/hyperflux'

import Box from '@mui/material/Box'

import { EditorHelperAction, useEditorHelperState } from '../../services/EditorHelperState'
import BooleanInput from '../inputs/BooleanInput'
import { InfoTooltip } from '../layout/Tooltip'
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
  const editorHelperState = useEditorHelperState()
  const state = useState({
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
