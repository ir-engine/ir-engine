import { AssetType, scenePath } from '@etherealengine/common/src/schema.type.module'
import { DialogState } from '@etherealengine/editor/src/components/dialogs/DialogState'
import ErrorDialog from '@etherealengine/editor/src/components/dialogs/ErrorDialog'
import { deleteScene, onNewScene, renameScene } from '@etherealengine/editor/src/functions/sceneFunctions'
import { EditorState } from '@etherealengine/editor/src/services/EditorServices'
import { getTextureAsync } from '@etherealengine/engine/src/assets/functions/resourceHooks'
import { SceneState } from '@etherealengine/engine/src/scene/SceneState'
import { getMutableState, useHookstate } from '@etherealengine/hyperflux'
import { useFind } from '@etherealengine/spatial/src/common/functions/FeathersHooks'
import createReadableTexture from '@etherealengine/spatial/src/renderer/functions/createReadableTexture'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'

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
        getMutableState(SceneState).sceneLoaded.set(false)
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
    if (sceneState.sceneModified.value) {
      DialogState.setDialog(
        <ErrorDialog title={t('editor:errors.unsavedChanges')} message={t('editor:errors.unsavedChangesMsg')} />
      )
      return
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
      {/*<div id="file-browser-panel" className={styles.panelContainer}>
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
              <div className={styles.sceneContainer} key={scene.assetURL}>
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
      />*/}
    </>
  )
}
