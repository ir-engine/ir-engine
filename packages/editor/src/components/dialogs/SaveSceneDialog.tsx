/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2023 
Infinite Reality Engine. All Rights Reserved.
*/
import { NotificationService } from '@ir-engine/client-core/src/common/services/NotificationService'
import { PopoverState } from '@ir-engine/client-core/src/common/services/PopoverState'
import isValidSceneName from '@ir-engine/common/src/utils/validateSceneName'
import { getComponent } from '@ir-engine/ecs'
import { GLTFModifiedState } from '@ir-engine/engine/src/gltf/GLTFDocumentState'
import { SourceComponent } from '@ir-engine/engine/src/scene/components/SourceComponent'
import { getMutableState, getState, none, useHookstate } from '@ir-engine/hyperflux'
import { Input } from '@ir-engine/ui'
import ConfirmDialog from '@ir-engine/ui/src/components/tailwind/ConfirmDialog'
import ErrorDialog from '@ir-engine/ui/src/components/tailwind/ErrorDialog'
import Modal from '@ir-engine/ui/src/primitives/tailwind/Modal'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { saveSceneGLTF } from '../../functions/sceneFunctions'
import { EditorState } from '../../services/EditorServices'

export const SaveSceneDialog = (props: { isExiting?: boolean; onConfirm?: () => void; onCancel?: () => void }) => {
  const { t } = useTranslation()
  const modalProcessing = useHookstate(false)

  const handleSubmit = async () => {
    modalProcessing.set(true)
    const { sceneAssetID, projectName, sceneName, rootEntity } = getState(EditorState)
    const sceneModified = EditorState.isModified()

    if (!projectName) {
      PopoverState.hidePopupover()
      if (props.onCancel) props.onCancel()
      return
    } else if (!sceneName) {
      PopoverState.hidePopupover()
      PopoverState.showPopupover(<SaveNewSceneDialog onConfirm={props.onConfirm} onCancel={props.onCancel} />)
      return
    } else if (!sceneModified) {
      PopoverState.hidePopupover()
      if (props.onCancel) props.onCancel()
      NotificationService.dispatchNotify(t('editor:dialog.saveScene.info-save-success'), { variant: 'success' })
      return
    }

    const abortController = new AbortController()

    try {
      await saveSceneGLTF(sceneAssetID!, projectName, sceneName, abortController.signal)
      NotificationService.dispatchNotify(t('editor:dialog.saveScene.info-save-success'), { variant: 'success' })
      const sourceID = getComponent(rootEntity, SourceComponent)
      getMutableState(GLTFModifiedState)[sourceID].set(none)

      PopoverState.hidePopupover()
      if (props.onConfirm) props.onConfirm()
    } catch (error) {
      console.error(error)
      PopoverState.showPopupover(
        <ErrorDialog title={t('editor:savingError')} description={error.message || t('editor:savingErrorMsg')} />
      )
      if (props.onCancel) props.onCancel()
    }
    modalProcessing.set(false)
  }

  return (
    <ConfirmDialog
      title={props.isExiting ? t('editor:dialog.saveScene.unsavedChanges.title') : t('editor:dialog.saveScene.title')}
      onSubmit={handleSubmit}
      onClose={() => {
        PopoverState.hidePopupover()
        if (props.onCancel) props.onCancel()
      }}
      text={props.isExiting ? t('editor:dialog.saveScene.info-question') : t('editor:dialog.saveScene.info-confirm')}
    />
  )
}

export const SaveNewSceneDialog = (props: { onConfirm?: () => void; onCancel?: () => void }) => {
  const { t } = useTranslation()
  const inputSceneName = useHookstate('New-Scene')
  const modalProcessing = useHookstate(false)
  const inputError = useHookstate('')

  const handleSubmit = async () => {
    if (!isValidSceneName(inputSceneName.value)) {
      inputError.set(t('editor:errors.invalidSceneName'))
      return
    }

    modalProcessing.set(true)
    const { projectName, sceneName, rootEntity, sceneAssetID } = getState(EditorState)
    const sceneModified = EditorState.isModified()
    const abortController = new AbortController()
    try {
      if (sceneName || sceneModified) {
        if (inputSceneName.value && projectName) {
          await saveSceneGLTF(sceneAssetID!, projectName, inputSceneName.value, abortController.signal, true)

          const sourceID = getComponent(rootEntity, SourceComponent)
          getMutableState(GLTFModifiedState)[sourceID].set(none)
        }
      }
      PopoverState.hidePopupover()
      if (props.onConfirm) props.onConfirm()
    } catch (error) {
      PopoverState.hidePopupover()
      if (props.onCancel) props.onCancel()
      console.error(error)
      PopoverState.showPopupover(
        <ErrorDialog title={t('editor:savingError')} description={error?.message || t('editor:savingErrorMsg')} />
      )
    }
    modalProcessing.set(false)
  }

  return (
    <Modal
      title={t('editor:dialog.saveNewScene.title')}
      onClose={() => {
        PopoverState.hidePopupover()
        if (props.onCancel) props.onCancel()
      }}
      onSubmit={handleSubmit}
      className="w-[50vw] max-w-2xl"
      submitLoading={modalProcessing.value}
      submitButtonDisabled={inputError.value.length > 0}
    >
      <Input
        value={inputSceneName.value}
        onChange={(event) => {
          inputError.set('')
          inputSceneName.set(event.target.value)
        }}
        labelProps={{
          text: t('editor:dialog.saveNewScene.lbl-name'),
          position: 'top'
        }}
        state={inputError.value ? 'error' : undefined}
        helperText={inputError.value}
      />
    </Modal>
  )
}
