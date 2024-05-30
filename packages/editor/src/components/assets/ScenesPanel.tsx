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

import Inventory2Icon from '@mui/icons-material/Inventory2'
import MoreVert from '@mui/icons-material/MoreVert'
import { ClickAwayListener, IconButton, InputBase, Menu, MenuItem, Paper } from '@mui/material'
import { TabData } from 'rc-dock'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { LoadingCircle } from '@etherealengine/client-core/src/components/LoadingCircle'
import config from '@etherealengine/common/src/config'
import multiLogger from '@etherealengine/common/src/logger'
import { assetPath, AssetType } from '@etherealengine/common/src/schema.type.module'
import { getComponent } from '@etherealengine/ecs'
import { getTextureAsync } from '@etherealengine/engine/src/assets/functions/resourceLoaderHooks'
import { GLTFModifiedState } from '@etherealengine/engine/src/gltf/GLTFDocumentState'
import { getMutableState, getState, useMutableState } from '@etherealengine/hyperflux'
import { useFind } from '@etherealengine/spatial/src/common/functions/FeathersHooks'
import createReadableTexture from '@etherealengine/spatial/src/renderer/functions/createReadableTexture'
import { SourceComponent } from '@etherealengine/spatial/src/transform/components/SourceComponent'
import Typography from '@etherealengine/ui/src/primitives/mui/Typography'

import { deleteScene, onNewScene, renameScene } from '../../functions/sceneFunctions'
import { EditorState } from '../../services/EditorServices'
import { DialogState } from '../dialogs/DialogState'
import ErrorDialog from '../dialogs/ErrorDialog'
import { Button } from '../inputs/Button'
import { PanelDragContainer, PanelIcon, PanelTitle } from '../layout/Panel'
import { InfoTooltip } from '../layout/Tooltip'
import { DeleteDialog } from '../projects/DeleteDialog'
import styles from './styles.module.scss'

const logger = multiLogger.child({ component: 'editor:ScenesPanel' })

/**
 * Displays the scenes that exist in the current project.
 */
export default function ScenesPanel() {
  const { t } = useTranslation()
  const editorState = useMutableState(EditorState)
  const scenesQuery = useFind(assetPath, { query: { project: editorState.projectName.value } })
  const scenes = scenesQuery.data

  const [isContextMenuOpen, setContextMenuOpen] = useState(false)
  const [isDeleteOpen, setDeleteOpen] = useState(false)
  const [anchorEl, setAnchorEl] = useState(null)
  const [newName, setNewName] = useState('')
  const [isRenaming, setRenaming] = useState(false)
  const [loadedScene, setLoadedScene] = useState<AssetType | null>(null)
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
    const currentURL = loadedScene!.assetURL
    const newURL = currentURL.replace(currentURL.split('/').pop()!, newName + '.gltf')
    const newData = await renameScene(id, newURL, loadedScene!.projectName)
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
      <div id="file-browser-panel" className={styles.panelContainer}>
        <div className={styles.btnContainer}>
          <Button onClick={onCreateScene} className={styles.newBtn}>
            {t(`editor:newScene`)}
          </Button>
        </div>
        {scenesLoading ? (
          <div className={styles.loadingContainer}>
            <div>
              <LoadingCircle />
              <Typography className={styles.primaryText}>{t('editor:loadingScenes')}</Typography>
            </div>
          </div>
        ) : (
          <div className={styles.contentContainer + ' ' + styles.sceneGridContainer}>
            {scenes.map((scene: AssetType) => (
              <div className={styles.sceneContainer} key={scene.id}>
                <a onClick={(e) => onClickExisting(e, scene)}>
                  <div className={styles.thumbnailContainer}>
                    <img
                      style={{ height: 'auto', maxWidth: '100%' }}
                      src={config.client.fileServer + '/' + scene.thumbnailURL}
                      alt=""
                      crossOrigin="anonymous"
                    />
                  </div>
                  <div className={styles.detailBlock}>
                    {loadedScene === scene && isRenaming ? (
                      <Paper component="div" className={styles.inputContainer}>
                        <ClickAwayListener onClickAway={() => finishRenaming(scene.id)}>
                          <InputBase
                            className={styles.input}
                            name="name"
                            autoComplete="off"
                            autoFocus
                            value={newName}
                            onClick={(e) => {
                              e.stopPropagation()
                            }}
                            onChange={(e) => setNewName(e.target.value)}
                            onKeyPress={(e) => renameSceneToNewName(e, scene.id)}
                          />
                        </ClickAwayListener>
                      </Paper>
                    ) : (
                      <InfoTooltip
                        title={scene.assetURL.split('/').pop()!.replace('.gltf', '').replace('.scene.json', '')}
                      >
                        <span>{scene.assetURL.split('/').pop()!.replace('.gltf', '').replace('.scene.json', '')}</span>
                      </InfoTooltip>
                    )}
                    <IconButton onClick={(e) => openContextMenu(e, scene)}>
                      <MoreVert />
                    </IconButton>
                  </div>
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
      <Menu
        id="menu"
        MenuListProps={{ 'aria-labelledby': 'long-button' }}
        anchorEl={anchorEl}
        open={isContextMenuOpen}
        onClose={closeContextMenu}
        classes={{ paper: styles.sceneContextMenu }}
      >
        <MenuItem classes={{ root: styles.menuItem }} onClick={startRenaming}>
          {t('editor:hierarchy.lbl-rename')}
        </MenuItem>
        <MenuItem classes={{ root: styles.menuItem }} onClick={openDeleteDialog}>
          {t('editor:hierarchy.lbl-delete')}
        </MenuItem>
      </Menu>
      <DeleteDialog
        open={isDeleteOpen}
        onClose={closeDeleteDialog}
        onCancel={closeDeleteDialog}
        onConfirm={deleteActiveScene}
      />
    </>
  )
}

export const ScenePanelTab: TabData = {
  id: 'scenePanel',
  closable: true,
  cached: true,
  title: (
    <PanelDragContainer>
      <PanelIcon as={Inventory2Icon} size={12} />
      <PanelTitle>Scenes</PanelTitle>
    </PanelDragContainer>
  ),
  content: <ScenesPanel />
}
