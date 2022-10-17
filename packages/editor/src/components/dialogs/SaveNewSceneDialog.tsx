import React, { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'

import FormField from '../inputs/FormField'
import StringInput from '../inputs/StringInput'
import PreviewDialog from './PreviewDialog'

/**
 * SaveNewSceneDialog used to show dialog when to save new scene.
 *
 * @param       {string} thumbnailUrl
 * @param       {string} initialName
 * @param       {function} onConfirm
 * @param       {function} onCancel
 * @constructor
 */
export function SaveNewSceneDialog({ thumbnailUrl, initialName, onConfirm, onCancel }) {
  const [name, setName] = useState(initialName)
  const { t } = useTranslation()

  const onChangeName = useCallback(
    (value) => {
      setName(value)
    },
    [setName]
  )

  /**
   * onConfirmCallback callback function is used handle confirm dialog.
   *
   * @type {function}
   */
  const onConfirmCallback = useCallback(
    (e) => {
      e.preventDefault()
      onConfirm({ name })
    },
    [name, onConfirm]
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
    <PreviewDialog
      imageSrc={thumbnailUrl}
      title={t('editor:dialog.saveNewScene.title')}
      onConfirm={onConfirmCallback}
      onCancel={onCancelCallback}
      confirmLabel={t('editor:dialog.saveNewScene.lbl-confirm')}
    >
      <FormField>
        <label htmlFor="name">{t('editor:dialog.saveNewScene.lbl-name')}</label>
        <StringInput
          id="name"
          required
          pattern={'[A-Za-z0-9-\':"!@#$%^&*(),.?~ ]{4,64}'}
          title={t('editor:dialog.saveNewScene.info-name')}
          value={name}
          onChange={onChangeName}
        />
      </FormField>
    </PreviewDialog>
  )
}

export default SaveNewSceneDialog
