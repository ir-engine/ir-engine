import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import FormField from '../inputs/FormField'
import StringInput from '../inputs/StringInput'
import PreviewDialog from './PreviewDialog'

/**
 * PublishDialog used to show the dialog when we are going to publish scene.
 *
 * @author Robert Long
 * @type {class component}
 */
export const PublishDialog = (props: any) => {
  const { t } = useTranslation()

  const [name, setName] = useState('')

  //setting state when there is change in name.
  const onChangeName = (value) => setName(value)

  //function to handle the confirmation of publishDialog
  const onConfirm = () => {
    const publishState = { ...props.initialSceneParams }
    publishState.name = publishState.name.trim()
    props.onPublish(publishState)
  }

  // creating and rendering PreviewDialog view.
  const { onCancel, screenshotUrl } = props
  return (
    <PreviewDialog
      imageSrc={screenshotUrl}
      title={t('editor:dialog.publish.title')}
      onConfirm={onConfirm}
      onCancel={onCancel}
      confirmLabel={t('editor:dialog.publish.lbl-confirm')}
    >
      <FormField>
        <label htmlFor="sceneName">{t('editor:dialog.publish.lbl-name')}</label>
        <StringInput
          id="sceneName"
          required
          pattern={'[A-Za-z0-9-\':"!@#$%^&*(),.?~ ]{4,64}'}
          title={t('editor:dialog.publish.info-name')}
          value={name}
          onChange={onChangeName}
        />
      </FormField>
    </PreviewDialog>
  )
}

export default PublishDialog
