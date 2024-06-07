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
import { PopoverState } from '@etherealengine/client-core/src/common/services/PopoverState'
import { getComponent } from '@etherealengine/ecs'
import { GLTFModifiedState } from '@etherealengine/engine/src/gltf/GLTFDocumentState'
import { SourceComponent } from '@etherealengine/engine/src/scene/components/SourceComponent'
import { getMutableState, getState, none, useHookstate } from '@etherealengine/hyperflux'
import ConfirmDialog from '@etherealengine/ui/src/components/tailwind/ConfirmDialog'
import ErrorDialog from '@etherealengine/ui/src/components/tailwind/ErrorDialog'
import Input from '@etherealengine/ui/src/primitives/tailwind/Input'
import Modal from '@etherealengine/ui/src/primitives/tailwind/Modal'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { saveSceneGLTF } from '../../functions/sceneFunctions'
import { EditorState } from '../../services/EditorServices'

export const SaveSceneDialog = () => {
  const { t } = useTranslation()
  const modalProcessing = useHookstate(false)

  const handleSubmit = async () => {
    modalProcessing.set(true)
    const { sceneAssetID, projectName, sceneName, rootEntity } = getState(EditorState)
    const sceneModified = EditorState.isModified()

    if (!projectName) {
      PopoverState.hidePopupover()
      return
    } else if (!sceneName) {
      PopoverState.hidePopupover()
      PopoverState.showPopupover(<SaveNewSceneDialog />)
      return
    } else if (!sceneModified) {
      PopoverState.hidePopupover()
      return
    }

    const abortController = new AbortController()

    try {
      await saveSceneGLTF(sceneAssetID, projectName, sceneName, abortController.signal)
      const sourceID = getComponent(rootEntity, SourceComponent)
      getMutableState(GLTFModifiedState)[sourceID].set(none)

      PopoverState.hidePopupover()
    } catch (error) {
      console.error(error)
      PopoverState.showPopupover(
        <ErrorDialog title={t('editor:savingError')} description={error.message || t('editor:savingErrorMsg')} />
      )
    }
    modalProcessing.set(false)
  }

  return <ConfirmDialog onSubmit={handleSubmit} text={t('editor:dialog.saveScene.info-confirm')} />
}

export const SaveNewSceneDialog = () => {
  const { t } = useTranslation()
  const inputSceneName = useHookstate('New Scene')
  const modalProcessing = useHookstate(false)
  const inputError = useHookstate('')

  const handleSubmit = async () => {
    if (
      !(
        inputSceneName.value.length >= 3 &&
        inputSceneName.value.length <= 64 &&
        inputSceneName.value.indexOf('_') === -1
      )
    ) {
      inputError.set(t('editor:errors.invalidSceneName'))
      return
    }

    modalProcessing.set(true)
    const { projectName, sceneName, rootEntity } = getState(EditorState)
    const sceneModified = EditorState.isModified()
    const abortController = new AbortController()
    try {
      if (sceneName || sceneModified) {
        if (inputSceneName.value && projectName) {
          await saveSceneGLTF(null, projectName, inputSceneName.value, abortController.signal)

          const sourceID = getComponent(rootEntity, SourceComponent)
          getMutableState(GLTFModifiedState)[sourceID].set(none)
        }
      }
      PopoverState.hidePopupover()
    } catch (error) {
      PopoverState.hidePopupover()
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
      onClose={PopoverState.hidePopupover}
      onSubmit={handleSubmit}
      className="w-[50vw] max-w-2xl"
      submitLoading={modalProcessing.value}
    >
      <Input
        value={inputSceneName.value}
        onChange={(event) => inputSceneName.set(event.target.value)}
        label={t('editor:dialog.saveNewScene.lbl-name')}
        description={t('editor:dialog.saveNewScene.info-name')}
        error={inputError.value}
      />
    </Modal>
  )
}
