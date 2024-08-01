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

import { SceneItem } from '@etherealengine/client-core/src/admin/components/scene/SceneItem'
import { PopoverState } from '@etherealengine/client-core/src/common/services/PopoverState'
import { StaticResourceType, fileBrowserPath, staticResourcePath } from '@etherealengine/common/src/schema.type.module'
import CreateSceneDialog from '@etherealengine/editor/src/components/dialogs/CreateScenePanelDialog'
import { onNewScene } from '@etherealengine/editor/src/functions/sceneFunctions'
import { EditorState } from '@etherealengine/editor/src/services/EditorServices'
import { getMutableState, useHookstate, useMutableState } from '@etherealengine/hyperflux'
import { useFind, useRealtime } from '@etherealengine/spatial/src/common/functions/FeathersHooks'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { HiOutlinePlusCircle } from 'react-icons/hi2'
import Button from '../../../../../primitives/tailwind/Button'
import LoadingView from '../../../../../primitives/tailwind/LoadingView'

export default function ScenesPanel() {
  const { t } = useTranslation()
  const editorState = useMutableState(EditorState)
  const scenesQuery = useFind(staticResourcePath, {
    query: { project: editorState.projectName.value, type: 'scene', paginate: false }
  })
  const scenes = scenesQuery.data

  const scenesLoading = scenesQuery.status === 'pending'

  const onClickScene = (scene: StaticResourceType) => {
    const sceneName = scene.key.split('/').pop()

    getMutableState(EditorState).merge({
      sceneName,
      scenePath: scene.key,
      sceneAssetID: scene.id
    })
  }

  useRealtime(fileBrowserPath, scenesQuery.refetch)

  const isCreatingScene = useHookstate(false)
  const handleCreateScene = async () => {
    isCreatingScene.set(true)
    const newSceneUIAddons = editorState.uiAddons.newScene.value
    if (Object.keys(newSceneUIAddons).length > 0) {
      PopoverState.showPopupover(<CreateSceneDialog />)
    } else {
      await onNewScene()
    }
    isCreatingScene.set(false)
  }

  return (
    <div className="h-full bg-theme-primary">
      <div className="mb-4 w-full bg-theme-surface-main">
        <Button
          startIcon={<HiOutlinePlusCircle />}
          endIcon={isCreatingScene.value && <LoadingView spinnerOnly className="h-4 w-4" />}
          disabled={isCreatingScene.value}
          variant="transparent"
          rounded="none"
          className="ml-auto bg-theme-highlight px-2"
          size="small"
          onClick={handleCreateScene}
        >
          {t('editor:newScene')}
        </Button>
      </div>
      <div className="h-full bg-theme-primary">
        {scenesLoading ? (
          <LoadingView title={t('editor:loadingScenes')} className="h-5 w-5" />
        ) : (
          <div className="relative h-full flex-1 overflow-y-auto px-4 py-3 pb-8">
            <div className="flex flex-wrap gap-4 pb-8">
              {scenes.map((scene) => (
                <SceneItem
                  key={scene.id}
                  scene={scene}
                  updateEditorState
                  handleOpenScene={() => onClickScene(scene)}
                  refetchProjectsData={scenesQuery.refetch}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
