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
import config from '@etherealengine/common/src/config'
import { AssetType, assetPath } from '@etherealengine/common/src/schema.type.module'
import { useClickOutside } from '@etherealengine/common/src/utils/useClickOutside'
import { deleteScene, onNewScene } from '@etherealengine/editor/src/functions/sceneFunctions'
import { EditorState } from '@etherealengine/editor/src/services/EditorServices'
import { getMutableState, useHookstate } from '@etherealengine/hyperflux'
import { useFind } from '@etherealengine/spatial/src/common/functions/FeathersHooks'
import React, { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { HiDotsHorizontal } from 'react-icons/hi'
import { HiOutlinePlusCircle } from 'react-icons/hi2'
import Button from '../../../../../primitives/tailwind/Button'
import LoadingView from '../../../../../primitives/tailwind/LoadingView'
import Text from '../../../../../primitives/tailwind/Text'
import ConfirmDialog from '../../../../tailwind/ConfirmDialog'
import RenameSceneModal from '../modals/RenameScene'

export default function ScenesPanel() {
  const { t } = useTranslation()
  const editorState = useHookstate(getMutableState(EditorState))
  const scenesQuery = useFind(assetPath, { query: { project: editorState.projectName.value } })
  const scenes = scenesQuery.data

  const contextMenuRef = useRef(null)
  const isContextMenuOpen = useHookstate<AssetType['id']>('')
  const scenesLoading = scenesQuery.status === 'pending'
  const onCreateScene = async () => onNewScene()

  const onClickScene = (scene: AssetType) => {
    getMutableState(EditorState).scenePath.set(scene.assetURL)
  }

  const deleteSelectedScene = async (scene: AssetType) => {
    if (scene) {
      await deleteScene(scene.id)
      if (editorState.sceneAssetID.value === scene.id) {
        editorState.sceneName.set(null)
        editorState.sceneAssetID.set(null)
      }
    }
    PopoverState.hidePopupover()
  }

  const getSceneName = (scene: AssetType) =>
    scene.assetURL.split('/').pop()!.replace('.gltf', '').replace('.scene.json', '')

  useClickOutside(contextMenuRef, () => isContextMenuOpen.set(''))

  return (
    <div className="bg-theme-primary">
      <div className="bg-theme-surface-main mb-4 w-full">
        <Button
          startIcon={<HiOutlinePlusCircle />}
          variant="transparent"
          rounded="none"
          className="bg-theme-highlight ml-auto w-32 px-2"
          size="small"
          onClick={onCreateScene}
        >
          {t('editor:newScene')}
        </Button>
      </div>
      <div className="bg-theme-primary mx-5">
        {scenesLoading ? (
          <LoadingView title={t('editor:loadingScenes')} className="h-5 w-5" />
        ) : (
          <div className="flex flex-wrap gap-4">
            {scenes.map((scene: AssetType) => (
              <div key={scene.id} className="bg-theme-surface-main my-2 h-40 w-56 rounded">
                <img
                  src={config.client.fileServer + '/' + scene.thumbnailURL}
                  alt={scene.assetURL}
                  onError={(e) => {
                    e.currentTarget.src = 'static/etherealengine_logo.png'
                  }}
                  crossOrigin="anonymous"
                  className="h-full w-full cursor-pointer object-contain"
                  onClick={() => onClickScene(scene)}
                />
                <div className="flex items-center justify-between px-4 py-2">
                  <Text>{getSceneName(scene)}</Text>
                  <div className="relative">
                    <Button
                      variant="transparent"
                      startIcon={<HiDotsHorizontal />}
                      iconContainerClassName="mx-0"
                      onClick={() => isContextMenuOpen.set(scene.id)}
                    />
                    {isContextMenuOpen.value === scene.id ? (
                      <div className={'absolute top-1 flex flex-col'} ref={contextMenuRef}>
                        <Button
                          variant="outline"
                          size="small"
                          fullWidth
                          onClick={() =>
                            PopoverState.showPopupover(
                              <RenameSceneModal sceneName={getSceneName(scene)} scene={scene} />
                            )
                          }
                        >
                          {t('editor:hierarchy.lbl-rename')}
                        </Button>
                        <Button
                          variant="outline"
                          size="small"
                          fullWidth
                          onClick={() => {
                            PopoverState.showPopupover(
                              <ConfirmDialog
                                text={t('editor:hierarchy.lbl-deleteScene')}
                                onSubmit={async () => deleteSelectedScene(scene)}
                              />
                            )
                          }}
                        >
                          {t('editor:hierarchy.lbl-delete')}
                        </Button>
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
