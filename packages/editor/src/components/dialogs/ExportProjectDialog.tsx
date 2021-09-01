import React, { useState, useCallback } from 'react'
import BooleanInput from '../inputs/BooleanInput'
import FormField from '../inputs/FormField'
import Dialog from './Dialog'
import styled from 'styled-components'
import { useTranslation } from 'react-i18next'

/**
 * FormContainer used as a wrapper element for FormFields.
 *
 * @author Robert Long
 * @type {Styled Component}
 */
const FormContainer = (styled as any).div`
  display: flex;
  flex-direction: column;
  flex: 1;
`

/**
 * ExportProjectDialog used to provide view containing FormFields.
 *
 * @author Robert Long
 * @param       {Object} defaultOptions
 * @param       {function} onConfirm
 * @param       {function} onCancel
 * @constructor
 */
export function ExportProjectDialog({ defaultOptions, onConfirm, onCancel }) {
  const { t } = useTranslation()

  // initializing options using defaultOptions
  const [options, setOptions] = useState(defaultOptions)

  //callback function used to handle changes in options.combinedMesh property
  const onChangeCombineMeshes = useCallback(
    (combineMeshes) => {
      setOptions({ ...options, combineMeshes })
    },
    [options, setOptions]
  )

  // callback function used to handle change in options.removeUnusedObjects property
  const onChangeRemoveUnusedObjects = useCallback(
    (removeUnusedObjects) => {
      setOptions({ ...options, removeUnusedObjects })
    },
    [options, setOptions]
  )

  // callback function used to handle confirmation on dialog.
  const onConfirmCallback = useCallback(
    (e) => {
      e.preventDefault()
      onConfirm(options)
    },
    [options, onConfirm]
  )

  // callback functionto handle cancel of confirmation dialog.
  const onCancelCallback = useCallback(
    (e) => {
      e.preventDefault()
      onCancel()
    },
    [onCancel]
  )

  // returning view containing FormFields
  return (
    <Dialog
      title={t('editor:dialog.exportProject.title')}
      onConfirm={onConfirmCallback}
      onCancel={onCancelCallback}
      confirmLabel={t('editor:dialog.exportProject.lbl-confirm')}
    >
      <FormContainer>
        <FormField>
          <label htmlFor="combineMeshes">{t('editor:dialog.exportProject.lbl-combineMesh')}</label>
          <BooleanInput id="combineMeshes" value={options.combineMeshes} onChange={onChangeCombineMeshes} />
        </FormField>
        <FormField>
          <label htmlFor="removeUnusedObjects">{t('editor:dialog.exportProject.lbl-removeUnused')}</label>
          <BooleanInput
            id="removeUnusedObjects"
            value={options.removeUnusedObjects}
            onChange={onChangeRemoveUnusedObjects}
          />
        </FormField>
      </FormContainer>
    </Dialog>
  )
}

export default ExportProjectDialog
