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

import { LoadingCircle } from '@etherealengine/client-core/src/components/LoadingCircle'
import config from '@etherealengine/common/src/config'
import { AssetType, scenePath } from '@etherealengine/common/src/schema.type.module'
import { getComponent } from '@etherealengine/ecs'
import { DialogState } from '@etherealengine/editor/src/components/dialogs/DialogState'
import ErrorDialog from '@etherealengine/editor/src/components/dialogs/ErrorDialog'
import { deleteScene, onNewScene, renameScene } from '@etherealengine/editor/src/functions/sceneFunctions'
import { EditorState } from '@etherealengine/editor/src/services/EditorServices'
import { getTextureAsync } from '@etherealengine/engine/src/assets/functions/resourceHooks'
import { GLTFModifiedState } from '@etherealengine/engine/src/gltf/GLTFDocumentState'
import { SceneState } from '@etherealengine/engine/src/scene/SceneState'
import { SourceComponent } from '@etherealengine/engine/src/scene/components/SourceComponent'
import { getMutableState, getState, useHookstate } from '@etherealengine/hyperflux'
import { useFind } from '@etherealengine/spatial/src/common/functions/FeathersHooks'
import createReadableTexture from '@etherealengine/spatial/src/renderer/functions/createReadableTexture'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { BsPlusCircle } from 'react-icons/bs'
import { HiDotsHorizontal } from 'react-icons/hi'
import Typography from '../../../../../primitives/mui/Typography'
import Button from '../../../../../primitives/tailwind/Button'
import StringInput from '../../../input/String'
import { InfoTooltip } from '../../../layout/Tooltip'
import DeleteDialog from '../dialog/delete'

export default function ScenesPanel() {
  const { t } = useTranslation()
  const editorState = useHookstate(getMutableState(EditorState))
  const scenesQuery = useFind(scenePath, { query: { project: editorState.projectName.value } })
  const scenes = scenesQuery.data

  const [isContextMenuOpen, setContextMenuOpen] = useState(false)
  const [isDeleteOpen, setDeleteOpen] = useState(false)
  const [anchorEl, setAnchorEl] = useState(null)
  const [newName, setNewName] = useState('')
  const [isRenaming, setRenaming] = useState(false)
  const [loadedScene, setLoadedScene] = useState<AssetType | null>(null)
  const sceneState = useHookstate(getMutableState(SceneState))
  const scenesLoading = scenesQuery.status === 'pending'
  const onCreateScene = async () => {
    await onNewScene()
  }

  const onClickExisting = async (e, scene: AssetType) => {
    e.preventDefault()
    getMutableState(EditorState).scenePath.set(scene.assetURL)
  }

  const openDeleteDialog = () => {
    setContextMenuOpen(false)
    setAnchorEl(null)
    setDeleteOpen(true)
  }

  const closeDeleteDialog = () => {
    setLoadedScene(null)
    setDeleteOpen(false)
  }
  const deleteActiveScene = async () => {
    if (loadedScene) {
      await deleteScene(loadedScene.id)
      if (editorState.sceneAssetID.value === loadedScene.id) {
        editorState.sceneName.set(null)
        editorState.sceneAssetID.set(null)
      }
    }

    closeDeleteDialog()
  }

  const openContextMenu = (e, scene) => {
    e.stopPropagation()
    setLoadedScene(scene)
    setContextMenuOpen(true)
    setAnchorEl(e.target)
  }

  const closeContextMenu = () => {
    setContextMenuOpen(false)
    setAnchorEl(null)
    setLoadedScene(null)
  }

  const startRenaming = () => {
    const rootEntity = getState(EditorState).rootEntity
    if (rootEntity) {
      const modified = getState(GLTFModifiedState)[getComponent(rootEntity, SourceComponent)]
      if (modified) {
        DialogState.setDialog(
          <ErrorDialog title={t('editor:errors.unsavedChanges')} message={t('editor:errors.unsavedChangesMsg')} />
        )
        return
      }
    }
    setContextMenuOpen(false)
    setAnchorEl(null)
    setRenaming(true)
    setNewName(loadedScene!.assetURL.split('/').pop()!.replace('.gltf', '').replace('.scene.json', ''))
  }

  const finishRenaming = async (id: string) => {
    setRenaming(false)
    const newData = await renameScene(id, newName)
    if (loadedScene) getMutableState(EditorState).scenePath.set(newData.assetURL)
    setNewName('')
  }

  const renameSceneToNewName = async (e, id: string) => {
    if (e.key == 'Enter' && loadedScene) finishRenaming(id)
  }

  const getSceneURL = async (url) => {
    const [texture, unload] = await getTextureAsync(url)
    if (texture) {
      const outUrl = (await createReadableTexture(texture, { url: true })) as string
      unload()
      return outUrl
    }
  }

  return (
    <>
      <div className="flex h-full flex-col gap-2 overflow-y-auto rounded-[5px] bg-neutral-900 ">
        <div className="ml-auto flex h-8 bg-zinc-900">
          <Button
            textContainerClassName="mx-0"
            startIcon={<BsPlusCircle />}
            className="mr-0 inline-flex h-8 w-[136px] items-center justify-start gap-2 bg-neutral-800 px-2 py-[7px] text-center font-['Figtree'] text-xs font-normal leading-[18px] text-neutral-200"
            onClick={onCreateScene}
          >
            {t(`editor:newScene`)}
          </Button>
        </div>

        {scenesLoading ? (
          <div>
            <div>
              <LoadingCircle />
              <Typography>{t('editor:loadingScenes')}</Typography>
            </div>
          </div>
        ) : (
          <div className="relative grid grid-cols-4 gap-6 p-5">
            {scenes.map((scene: AssetType) => (
              <div
                key={scene.assetURL}
                onClick={(e) => {
                  onClickExisting(e, scene)
                }}
                className="relative flex h-[100%] w-[100%] flex-col items-center pb-[3px]"
              >
                <div className="flex h-[100%] w-[100%] items-center justify-center rounded-tl-lg rounded-tr-lg bg-white">
                  <div className="h-[100%] w-auto rounded bg-neutral-900">
                    <img
                      className="h-[100%] w-[100%] rounded-bl-[5px] rounded-br-[5px] object-contain"
                      src={config.client.fileServer + '/' + scene.thumbnailURL}
                      alt=""
                      crossOrigin="anonymous"
                    />
                  </div>
                </div>
                <div className="flex w-[100%] flex-row items-center justify-between rounded-bl-lg rounded-br-lg bg-zinc-900 px-4 py-2">
                  <div className="truncate font-['Figtree'] text-sm font-normal leading-[21px] text-neutral-400">
                    {loadedScene === scene && isRenaming ? (
                      <StringInput
                        value={newName}
                        onChange={(name) => setNewName(name)}
                        onBlur={() => finishRenaming(scene.id)}
                      />
                    ) : (
                      <InfoTooltip
                        title={scene.assetURL.split('/').pop()!.replace('.gltf', '').replace('.scene.json', '')}
                      >
                        <span>{scene.assetURL.split('/').pop()!.replace('.gltf', '').replace('.scene.json', '')}</span>
                      </InfoTooltip>
                    )}
                  </div>
                  <button
                    className="truncate p-2"
                    onClick={(e) => {
                      setRenaming(false)
                      openContextMenu(e, scene)
                    }}
                  >
                    <HiDotsHorizontal className="truncate text-white" />
                  </button>
                  {isContextMenuOpen && loadedScene && loadedScene?.assetURL === scene.assetURL && (
                    <div className="absolute right-0 z-10 mt-2 w-24 rounded-md bg-neutral-900 shadow-lg">
                      <div className="flex flex-col py-1">
                        <button
                          className="truncate px-4 py-2 text-sm text-white hover:bg-zinc-800"
                          onClick={startRenaming}
                        >
                          {t('editor:hierarchy.lbl-rename')}
                        </button>
                        <button
                          className="truncate px-4 py-2 text-sm text-white hover:bg-zinc-800"
                          onClick={openDeleteDialog}
                        >
                          {t('editor:hierarchy.lbl-delete')}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
        <DeleteDialog
          open={isDeleteOpen}
          onClose={closeDeleteDialog}
          onCancel={closeDeleteDialog}
          onConfirm={deleteActiveScene}
        />
      </div>
      {/*<Menu
            id="menu"
            MenuListProps={{ 'aria-labelledby': 'long-button' }}
            anchorEl={anchorEl}
            open={isContextMenuOpen}
            onClose={closeContextMenu}
            classes={{ paper:  'bg-neutral-900' }}
          >
            <MenuItem classes={{ root: "text-sm text-white" }} onClick={startRenaming}>
              {t('editor:hierarchy.lbl-rename')}
            </MenuItem>
            <MenuItem classes={{ root: "text-sm text-white" }} onClick={openDeleteDialog}>
              {t('editor:hierarchy.lbl-delete')}
            </MenuItem>
        </Menu>
        */}
    </>
  )
}
