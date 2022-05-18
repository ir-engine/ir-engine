import React, { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'

import FormField from '../inputs/FormField'
import StringInput from '../inputs/StringInput'
import PreviewDialog from './PreviewDialog'

/**
 * SaveNewProjectDialog used to show dialog when to save new project.
 *
 * @author Robert Long
 * @param       {string} thumbnailUrl
 * @param       {string} initialName
 * @param       {function} onConfirm
 * @param       {function} onCancel
 * @constructor
 */
export function SaveNewProjectDialog({ thumbnailUrl, initialName, onConfirm, onCancel }) {
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
   * @author Robert Long
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
   * @author Robert Long
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
      title={t('editor:dialog.saveNewProject.title')}
      onConfirm={onConfirmCallback}
      onCancel={onCancelCallback}
      confirmLabel={t('editor:dialog.saveNewProject.lbl-confirm')}
    >
      <FormField>
        <label htmlFor="name">{t('editor:dialog.saveNewProject.lbl-name')}</label>
        <StringInput
          id="name"
          required
          pattern={'[A-Za-z0-9-\':"!@#$%^&*(),.?~ ]{4,64}'}
          title={t('editor:dialog.saveNewProject.info-name')}
          value={name}
          onChange={onChangeName}
        />
      </FormField>
    </PreviewDialog>
  )
}

export default SaveNewProjectDialog
