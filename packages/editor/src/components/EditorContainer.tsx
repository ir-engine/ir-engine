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

import { DockLayout, DockMode, LayoutData, TabData } from 'rc-dock'

import 'rc-dock/dist/rc-dock.css'

import React, { useEffect, useRef } from 'react'
import { useHotkeys } from 'react-hotkeys-hook'
import { useTranslation } from 'react-i18next'

import { RouterState } from '@etherealengine/client-core/src/common/services/RouterService'
import multiLogger from '@etherealengine/engine/src/common/functions/logger'
import { Engine } from '@etherealengine/engine/src/ecs/classes/Engine'
import { EngineState } from '@etherealengine/engine/src/ecs/classes/EngineState'
import { getMutableState, getState, useHookstate } from '@etherealengine/hyperflux'

import Inventory2Icon from '@mui/icons-material/Inventory2'
import Dialog from '@mui/material/Dialog'

import { useQuery } from '@etherealengine/engine/src/ecs/functions/ComponentFunctions'
import { SceneAssetPendingTagComponent } from '@etherealengine/engine/src/scene/components/SceneAssetPendingTagComponent'
import { LocalTransformComponent } from '@etherealengine/engine/src/transform/components/TransformComponent'
import CircularProgress from '@etherealengine/ui/src/primitives/mui/CircularProgress'
import { t } from 'i18next'
import { useDrop } from 'react-dnd'
import { Vector2, Vector3 } from 'three'
import { ItemTypes } from '../constants/AssetTypes'
import { EditorControlFunctions } from '../functions/EditorControlFunctions'
import { extractZip, uploadProjectFiles } from '../functions/assetFunctions'
import { loadProjectScene } from '../functions/projectFunctions'
import { createNewScene, getScene, saveScene } from '../functions/sceneFunctions'
import { getCursorSpawnPosition } from '../functions/screenSpaceFunctions'
import { takeScreenshot } from '../functions/takeScreenshot'
import { uploadSceneBakeToServer } from '../functions/uploadEnvMapBake'
import { cmdOrCtrlString } from '../functions/utils'
import { EditorErrorState } from '../services/EditorErrorServices'
import { EditorHelperState } from '../services/EditorHelperState'
import { EditorHistoryState } from '../services/EditorHistory'
import { EditorState } from '../services/EditorServices'
import './EditorContainer.css'
import AssetDropZone from './assets/AssetDropZone'
import ProjectBrowserPanel from './assets/ProjectBrowserPanel'
import ScenesPanel from './assets/ScenesPanel'
import { ControlText } from './controlText/ControlText'
import { DialogState } from './dialogs/DialogState'
import ErrorDialog from './dialogs/ErrorDialog'
import { ProgressDialog } from './dialogs/ProgressDialog'
import SaveNewSceneDialog from './dialogs/SaveNewSceneDialog'
import SaveSceneDialog from './dialogs/SaveSceneDialog'
import { DndWrapper } from './dnd/DndWrapper'
import DragLayer from './dnd/DragLayer'
import ElementList, { SceneElementType } from './element/ElementList'
import GraphPanel from './graph/GraphPanel'
import { GraphPanelTitle } from './graph/GraphPanelTitle'
import HierarchyPanelContainer from './hierarchy/HierarchyPanelContainer'
import { HierarchyPanelTitle } from './hierarchy/HierarchyPanelTitle'
import { PanelDragContainer, PanelIcon, PanelTitle } from './layout/Panel'
import MaterialLibraryPanel from './materials/MaterialLibraryPanel'
import { MaterialLibraryPanelTitle } from './materials/MaterialLibraryPanelTitle'
import PropertiesPanelContainer from './properties/PropertiesPanelContainer'
import { PropertiesPanelTitle } from './properties/PropertiesPanelTitle'
import * as styles from './styles.module.scss'
import ToolBar from './toolbar/ToolBar'

const logger = multiLogger.child({ component: 'editor:EditorContainer' })

/**
 *component used as dock container.
 */
export const DockContainer = ({ children, id = 'dock', dividerAlpha = 0 }) => {
  const dockContainerStyles = {
    '--dividerAlpha': dividerAlpha
  }

  return (
    <div id={id} className="dock-container" style={dockContainerStyles as React.CSSProperties}>
      {children}
    </div>
  )
}

const ViewportDnD = () => {
  const [{ isDragging, isOver }, dropRef] = useDrop({
    accept: [ItemTypes.Component],
    collect: (monitor) => ({
      isDragging: monitor.getItem() !== null && monitor.canDrop(),
      isOver: monitor.isOver()
    }),
    drop(item: SceneElementType, monitor) {
      const vec3 = new Vector3()
      getCursorSpawnPosition(monitor.getClientOffset() as Vector2, vec3)
      EditorControlFunctions.createObjectFromSceneElement([
        { name: item!.componentJsonID },
        { name: LocalTransformComponent.jsonID, props: { position: vec3 } }
      ])
    }
  })

  return (
    <div
      id="viewport-panel"
      ref={dropRef}
      style={{
        pointerEvents: isDragging ? 'all' : 'none',
        border: isDragging && isOver ? '5px solid white' : 'none',
        width: '100%',
        height: '100%'
      }}
    />
  )
}
const ViewPortPanelContent = () => {
  const { t } = useTranslation()
  const sceneName = useHookstate(getMutableState(EditorState).sceneName).value
  return sceneName ? (
    <ViewportDnD />
  ) : (
    <div className={styles.bgImageBlock}>
      <img src="/static/etherealengine.png" alt="" />
      <h2>{t('editor:selectSceneMsg')}</h2>
    </div>
  )
}

const SceneLoadingProgress = () => {
  const sceneAssetPendingTagQuery = useQuery([SceneAssetPendingTagComponent])
  const loadingProgress = useHookstate(getMutableState(EngineState).loadingProgress).value
  return (
    <div style={{ top: '50px', position: 'relative' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          height: '100%',
          width: '100%',
          flexDirection: 'column'
        }}
      >
        <div
          style={{
            // default values will be overridden by theme
            fontFamily: 'Lato',
            fontSize: '12px',
            color: 'white',
            padding: '16px'
          }}
        >
          {`Scene Loading... ${loadingProgress}% - ${sceneAssetPendingTagQuery.length} assets left`}
        </div>
        <CircularProgress />
      </div>
    </div>
  )
}

const reRouteToLoadScene = async (newSceneName: string) => {
  const { projectName, sceneName } = getState(EditorState)
  if (sceneName === newSceneName) return
  if (!projectName || !newSceneName) return
  RouterState.navigate(`/studio/${projectName}/${newSceneName}`)
}

const loadScene = async (sceneName: string) => {
  const { projectName } = getState(EditorState)
  try {
    if (!projectName) {
      return
    }
    const project = await getScene(projectName, sceneName, false)

    if (!project.scene) {
      return
    }
    loadProjectScene(project)
  } catch (error) {
    logger.error(error)
  }
}

const onNewScene = async () => {
  const { projectName } = getState(EditorState)
  if (!projectName) return

  try {
    const sceneData = await createNewScene(projectName)
    if (!sceneData) return

    reRouteToLoadScene(sceneData.name)
  } catch (error) {
    logger.error(error)
  }
}

/**
 * Scene Event Handlers
 */

const onEditorError = (error) => {
  logger.error(error)
  if (error['aborted']) {
    DialogState.setDialog(null)
    return
  }

  DialogState.setDialog(
    <ErrorDialog
      title={error.title || t('editor:error')}
      message={error.message || t('editor:errorMsg')}
      error={error}
    />
  )
}

const onCloseProject = () => {
  const editorState = getMutableState(EditorState)
  editorState.sceneModified.set(false)
  editorState.projectName.set(null)
  editorState.sceneName.set(null)
  EditorHistoryState.unloadScene()
  RouterState.navigate('/studio')
}

const onSaveAs = async () => {
  const { projectName, sceneName } = getState(EditorState)
  const editorState = getMutableState(EditorState)
  const sceneLoaded = getState(EngineState).sceneLoaded

  // Do not save scene if scene is not loaded or some error occured while loading the scene to prevent data lose
  if (!sceneLoaded) {
    DialogState.setDialog(<ErrorDialog title={t('editor:savingError')} message={t('editor:savingSceneErrorMsg')} />)
    return
  }

  const abortController = new AbortController()
  try {
    if (sceneName || editorState.sceneModified.value) {
      const blob = await takeScreenshot(512, 320, 'ktx2')
      const file = new File([blob!], editorState.sceneName + '.thumbnail.ktx2')
      const result: { name: string } | void = await new Promise((resolve) => {
        DialogState.setDialog(
          <SaveNewSceneDialog
            thumbnailUrl={URL.createObjectURL(blob!)}
            initialName={Engine.instance.scene.name}
            onConfirm={resolve}
            onCancel={resolve}
          />
        )
      })
      if (result?.name && projectName) {
        await saveScene(projectName, result.name, file, abortController.signal)
        editorState.sceneModified.set(false)
        RouterState.navigate(`/studio/${projectName}/${result.name}`)
      }
    }
    DialogState.setDialog(null)
  } catch (error) {
    logger.error(error)
    DialogState.setDialog(
      <ErrorDialog title={t('editor:savingError')} message={error?.message || t('editor:savingErrorMsg')} />
    )
  }
}

const onImportAsset = async () => {
  const { projectName } = getState(EditorState)

  const el = document.createElement('input')
  el.type = 'file'
  el.multiple = true
  el.accept = '.bin,.gltf,.glb,.fbx,.vrm,.tga,.png,.jpg,.jpeg,.mp3,.aac,.ogg,.m4a,.zip,.mp4,.mkv,.avi,.m3u8,.usdz,.vrm'
  el.style.display = 'none'
  el.onchange = async () => {
    if (el.files && el.files.length > 0 && projectName) {
      const fList = el.files
      const files = [...Array(el.files.length).keys()].map((i) => fList[i])
      const nuUrl = (await Promise.all(uploadProjectFiles(projectName, files, true).promises)).map((url) => url[0])

      //process zipped files
      const zipFiles = nuUrl.filter((url) => /\.zip$/.test(url))
      const extractPromises = [...zipFiles.map((zipped) => extractZip(zipped))]
      Promise.all(extractPromises).then(() => {
        logger.info('extraction complete')
      })
    }
  }
  el.click()
  el.remove()
}

const onSaveScene = async () => {
  const { projectName, sceneName } = getState(EditorState)
  const { sceneModified } = getState(EditorState)
  const { sceneLoaded } = getState(EngineState)
  console.log('onSaveScene')

  // Do not save scene if scene is not loaded or some error occured while loading the scene to prevent data lose
  if (!sceneLoaded) {
    DialogState.setDialog(<ErrorDialog title={t('editor:savingError')} message={t('editor:savingSceneErrorMsg')} />)
    return
  }

  if (!sceneName) {
    if (sceneModified) {
      onSaveAs()
    }
    return
  }

  const result = (await new Promise((resolve) => {
    DialogState.setDialog(<SaveSceneDialog onConfirm={resolve} onCancel={resolve} />)
  })) as any

  if (!result) {
    DialogState.setDialog(null)
    return
  }

  const abortController = new AbortController()

  DialogState.setDialog(
    <ProgressDialog
      message={t('editor:saving')}
      cancelable={true}
      onCancel={() => {
        abortController.abort()
        DialogState.setDialog(null)
      }}
    />
  )

  // Wait for 5ms so that the ProgressDialog shows up.
  await new Promise((resolve) => setTimeout(resolve, 5))

  try {
    if (projectName) {
      const isGenerateThumbnailsEnabled = getState(EditorHelperState).isGenerateThumbnailsEnabled
      if (isGenerateThumbnailsEnabled) {
        const blob = await takeScreenshot(512, 320, 'ktx2')
        const file = new File([blob!], sceneName + '.thumbnail.ktx2')

        await uploadSceneBakeToServer()
        await saveScene(projectName, sceneName, file, abortController.signal)
      } else {
        await saveScene(projectName, sceneName, null, abortController.signal)
      }
    }

    getMutableState(EditorState).sceneModified.set(false)

    DialogState.setDialog(null)
  } catch (error) {
    logger.error(error)

    DialogState.setDialog(
      <ErrorDialog title={t('editor:savingError')} message={error.message || t('editor:savingErrorMsg')} />
    )
  }
}

const generateToolbarMenu = () => {
  return [
    {
      name: t('editor:menubar.newScene'),
      action: onNewScene
    },
    {
      name: t('editor:menubar.saveScene'),
      hotkey: `${cmdOrCtrlString}+s`,
      action: onSaveScene
    },
    {
      name: t('editor:menubar.saveAs'),
      action: onSaveAs
    },
    {
      name: t('editor:menubar.importAsset'),
      action: onImportAsset
    },
    {
      name: t('editor:menubar.quit'),
      action: onCloseProject
    }
  ]
}

const toolbarMenu = generateToolbarMenu()

const defaultLayout: LayoutData = {
  dockbox: {
    mode: 'horizontal' as DockMode,
    children: [
      {
        mode: 'vertical' as DockMode,
        size: 2,
        children: [
          {
            tabs: [
              {
                id: 'scenePanel',
                title: (
                  <PanelDragContainer>
                    <PanelIcon as={Inventory2Icon} size={12} />
                    <PanelTitle>Scenes</PanelTitle>
                  </PanelDragContainer>
                ),
                content: <ScenesPanel newScene={onNewScene} loadScene={reRouteToLoadScene} />
              },
              {
                id: 'filesPanel',
                title: (
                  <PanelDragContainer>
                    <PanelIcon as={Inventory2Icon} size={12} />
                    <PanelTitle>Files</PanelTitle>
                  </PanelDragContainer>
                ),
                content: <ProjectBrowserPanel />
              }
            ]
          }
        ]
      },
      {
        mode: 'vertical' as DockMode,
        size: 8,
        children: [
          {
            id: '+5',
            tabs: [
              {
                id: 'viewPanel',
                title: 'Viewport',
                content: <ViewPortPanelContent />
              }
            ],
            size: 1
          }
        ]
      },
      {
        mode: 'vertical' as DockMode,
        size: 2,
        children: [
          {
            tabs: [
              {
                id: 'hierarchyPanel',
                title: <HierarchyPanelTitle />,
                content: <HierarchyPanelContainer />
              },
              {
                id: 'materialLibraryPanel',
                title: <MaterialLibraryPanelTitle />,
                content: <MaterialLibraryPanel />
              }
            ]
          },
          {
            tabs: [
              {
                id: 'propertiesPanel',
                title: <PropertiesPanelTitle />,
                content: <PropertiesPanelContainer />
              },
              {
                id: 'graphPanel',
                title: <GraphPanelTitle />,
                content: <GraphPanel />
              }
            ]
          }
        ]
      }
    ]
  }
}
/**
 * EditorContainer class used for creating container for Editor
 */
const EditorContainer = () => {
  const editorState = useHookstate(getMutableState(EditorState))
  const sceneName = editorState.sceneName
  const sceneLoaded = useHookstate(getMutableState(EngineState)).sceneLoaded

  const sceneLoading = sceneName.value && !sceneLoaded.value

  const errorState = useHookstate(getMutableState(EditorErrorState).error)

  const { t } = useTranslation()
  const dialogComponent = useHookstate(getMutableState(DialogState).dialog).value
  const dockPanelRef = useRef<DockLayout>(null)

  useHotkeys(`${cmdOrCtrlString}+s`, () => onSaveScene() as any)

  useEffect(() => {
    if (!editorState.sceneModified.value) return
    const onBeforeUnload = (e) => {
      alert('You have unsaved changes. Please save before leaving.')
      e.preventDefault()
      e.returnValue = ''
    }

    window.addEventListener('beforeunload', onBeforeUnload)

    return () => {
      window.removeEventListener('beforeunload', onBeforeUnload)
    }
  }, [editorState.sceneModified])

  useEffect(() => {
    if (sceneName.value) {
      logger.info(`Loading scene ${sceneName.value} via given url`)
      loadScene(sceneName.value)
    }
  }, [sceneName])

  useEffect(() => {
    if (!dockPanelRef.current) return
    const activePanel = sceneLoaded.value ? 'filesPanel' : 'scenePanel'
    dockPanelRef.current.updateTab(activePanel, dockPanelRef.current.find(activePanel) as TabData, true)
  }, [sceneLoaded])

  useEffect(() => {
    if (errorState.value) {
      onEditorError(errorState.value)
    }
  }, [errorState])

  return (
    <>
      <div
        id="editor-container"
        className={styles.editorContainer}
        style={sceneName.value ? { background: 'transparent' } : {}}
      >
        <DndWrapper id="editor-container">
          <DragLayer />
          <ToolBar menu={toolbarMenu} />
          <ElementList />
          <ControlText />
          {sceneLoading && <SceneLoadingProgress />}
          <div className={styles.workspaceContainer}>
            <AssetDropZone />
            <DockContainer>
              <DockLayout
                ref={dockPanelRef}
                defaultLayout={defaultLayout}
                style={{ position: 'absolute', left: 5, top: 55, right: 130, bottom: 5 }}
              />
            </DockContainer>
          </div>
          <Dialog
            open={!!dialogComponent}
            onClose={() => DialogState.setDialog(null)}
            classes={{ root: styles.dialogRoot, paper: styles.dialogPaper }}
          >
            {getState(DialogState).dialog}
          </Dialog>
        </DndWrapper>
      </div>
    </>
  )
}

export default EditorContainer
