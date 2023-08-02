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

import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { CompressedTexture } from 'three'

import { useRouter } from '@etherealengine/client-core/src/common/services/RouterService'
import { SceneData } from '@etherealengine/common/src/interfaces/SceneInterface'
import multiLogger from '@etherealengine/common/src/logger'
import { AssetLoader } from '@etherealengine/engine/src/assets/classes/AssetLoader'
import createReadableTexture from '@etherealengine/engine/src/assets/functions/createReadableTexture'
import { EngineActions } from '@etherealengine/engine/src/ecs/classes/EngineState'
import { dispatchAction, getMutableState, useHookstate } from '@etherealengine/hyperflux'

import { MoreVert } from '@mui/icons-material'
import { ClickAwayListener, IconButton, InputBase, Menu, MenuItem, Paper } from '@mui/material'

import { deleteScene, getScenes, renameScene } from '../../functions/sceneFunctions'
import { EditorAction, EditorState } from '../../services/EditorServices'
import ErrorDialog from '../dialogs/ErrorDialog'
import { useDialog } from '../hooks/useDialog'
import { Button } from '../inputs/Button'
import { InfoTooltip } from '../layout/Tooltip'
import { DeleteDialog } from '../projects/DeleteDialog'
import styles from './styles.module.scss'

const logger = multiLogger.child({ component: 'editor:ScenesPanel' })

/**
 * Displays the scenes that exist in the current project.
 */
export default function ScenesPanel({ loadScene, newScene, toggleRefetchScenes }) {
  const { t } = useTranslation()
  const [scenes, setScenes] = useState<SceneData[]>([])
  const [isContextMenuOpen, setContextMenuOpen] = useState(false)
  const [isDeleteOpen, setDeleteOpen] = useState(false)
  const [anchorEl, setAnchorEl] = useState(null)
  const [newName, setNewName] = useState('')
  const [isRenaming, setRenaming] = useState(false)
  const [activeScene, setActiveScene] = useState<SceneData | null>(null)
  const route = useRouter()
  const editorState = useHookstate(getMutableState(EditorState))
  const [DialogComponent, setDialogComponent] = useDialog()
  const [fetched, setFetch] = useState(false)

  const [thumbnails, setThumbnails] = useState<Map<string, string>>(new Map<string, string>())
  const fetchItems = async () => {
    try {
      const data = await getScenes(editorState.projectName.value!)
      for (let i = 0; i < data.length; i++) {
        const ktx2url = await getSceneURL(data[i].thumbnailUrl)
        thumbnails.set(data[i].name, ktx2url)
      }
      setScenes(data ?? [])
      console.log(data)
    } catch (error) {
      logger.error(error, 'Error fetching scenes')
    }
  }

  useEffect(() => {
    fetchItems()
  }, [toggleRefetchScenes])

  const onCreateScene = async () => {
    await newScene()
    fetchItems()
  }

  const onClickExisting = async (e, scene) => {
    e.preventDefault()
    loadScene(scene.name)
    fetchItems()
  }

  const openDeleteDialog = () => {
    setContextMenuOpen(false)
    setAnchorEl(null)
    setDeleteOpen(true)
  }

  const closeDeleteDialog = () => {
    setActiveScene(null)
    setDeleteOpen(false)
  }

  const deleteActiveScene = async () => {
    if (activeScene) {
      await deleteScene(editorState.projectName.value, activeScene.name)
      if (editorState.sceneName.value === activeScene.name) {
        dispatchAction(EditorAction.sceneChanged({ sceneName: null }))
        dispatchAction(EngineActions.sceneUnloaded({}))
        route(`/studio/${editorState.projectName.value}`)
      }

      fetchItems()
    }

    closeDeleteDialog()
  }

  const openContextMenu = (e, scene) => {
    e.stopPropagation()
    setActiveScene(scene)
    setContextMenuOpen(true)
    setAnchorEl(e.target)
  }

  const closeContextMenu = () => {
    setContextMenuOpen(false)
    setAnchorEl(null)
    setActiveScene(null)
  }

  const startRenaming = () => {
    if (editorState.sceneModified.value) {
      setDialogComponent(
        <ErrorDialog title={t('editor:errors.unsavedChanges')} message={t('editor:errors.unsavedChangesMsg')} />
      )
      return
    }
    setContextMenuOpen(false)
    setAnchorEl(null)
    setRenaming(true)
    setNewName(activeScene!.name)
  }

  const finishRenaming = async () => {
    setRenaming(false)
    await renameScene(editorState.projectName.value as string, newName, activeScene!.name)
    dispatchAction(EditorAction.sceneChanged({ sceneName: newName }))
    route(`/studio/${editorState.projectName.value}/${newName}`)
    setNewName('')
    fetchItems()
  }

  const renameSceneToNewName = async (e) => {
    if (e.key == 'Enter' && activeScene) finishRenaming()
  }

  const getSceneURL = async (url) => {
    const texture = (await AssetLoader.loadAsync(url)) as CompressedTexture
    return (await createReadableTexture(texture, { url: true })) as string
  }

  return (
    <>
      <div id="file-browser-panel" className={styles.panelContainer}>
        <div className={styles.btnContainer}>
          <Button onClick={onCreateScene} className={styles.newBtn}>
            {t(`editor:newScene`)}
          </Button>
        </div>
        <div className={styles.contentContainer + ' ' + styles.sceneGridContainer}>
          {scenes.map((scene, i) => {
            return (
              <div className={styles.sceneContainer} key={i}>
                <a onClick={(e) => onClickExisting(e, scene)}>
                  <div className={styles.thumbnailContainer}>
                    <img src={thumbnails.get(scene.name)} alt="" crossOrigin="anonymous" />
                  </div>
                  <div className={styles.detailBlock}>
                    {activeScene === scene && isRenaming ? (
                      <Paper component="div" className={styles.inputContainer}>
                        <ClickAwayListener onClickAway={finishRenaming}>
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
                            onKeyPress={renameSceneToNewName}
                          />
                        </ClickAwayListener>
                      </Paper>
                    ) : (
                      <InfoTooltip title={scene.name}>
                        <span>{scene.name}</span>
                      </InfoTooltip>
                    )}
                    <IconButton onClick={(e) => openContextMenu(e, scene)}>
                      <MoreVert />
                    </IconButton>
                  </div>
                </a>
              </div>
            )
          })}
        </div>
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
