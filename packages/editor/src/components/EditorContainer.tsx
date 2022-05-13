import { DockLayout, DockMode, LayoutData, TabData } from 'rc-dock'

import 'rc-dock/dist/rc-dock.css'

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useHistory } from 'react-router-dom'
import styled from 'styled-components'

import { useDispatch } from '@xrengine/client-core/src/store'
import { SceneJson } from '@xrengine/common/src/interfaces/SceneInterface'
import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { getEngineState, useEngineState } from '@xrengine/engine/src/ecs/classes/EngineState'
import { useWorld } from '@xrengine/engine/src/ecs/functions/SystemHooks'
import { gltfToSceneJson, sceneToGLTF } from '@xrengine/engine/src/scene/functions/GLTFConversion'
import { useHookEffect } from '@xrengine/hyperflux'

import AccountTreeIcon from '@mui/icons-material/AccountTree'
import Inventory2Icon from '@mui/icons-material/Inventory2'
import TuneIcon from '@mui/icons-material/Tune'
import Dialog from '@mui/material/Dialog'

import { extractZip, uploadProjectFile } from '../functions/assetFunctions'
import { disposeProject, loadProjectScene, runPreprojectLoadTasks } from '../functions/projectFunctions'
import { createNewScene, getScene, saveScene } from '../functions/sceneFunctions'
import { initializeRenderer } from '../functions/sceneRenderFunctions'
import { takeScreenshot } from '../functions/takeScreenshot'
import { uploadBakeToServer } from '../functions/uploadCubemapBake'
import { cmdOrCtrlString } from '../functions/utils'
import { useEditorErrorState } from '../services/EditorErrorServices'
import { EditorAction, useEditorState } from '../services/EditorServices'
import AssetDropZone from './assets/AssetDropZone'
import ProjectBrowserPanel from './assets/ProjectBrowserPanel'
import ScenesPanel from './assets/ScenesPanel'
import { ControlText } from './controlText/ControlText'
import ConfirmDialog from './dialogs/ConfirmDialog'
import ErrorDialog from './dialogs/ErrorDialog'
import { ProgressDialog } from './dialogs/ProgressDialog'
import SaveNewProjectDialog from './dialogs/SaveNewProjectDialog'
import { DndWrapper } from './dnd/DndWrapper'
import DragLayer from './dnd/DragLayer'
import ElementList from './element/ElementList'
import HierarchyPanelContainer from './hierarchy/HierarchyPanelContainer'
import { DialogContext } from './hooks/useDialog'
import { PanelDragContainer, PanelIcon, PanelTitle } from './layout/Panel'
import PropertiesPanelContainer from './properties/PropertiesPanelContainer'
import { AppContext } from './Search/context'
import Search from './Search/Search'
import * as styles from './styles.module.scss'
import ToolBar from './toolbar/ToolBar'

/**
 *Styled component used as dock container.
 *
 * @author Hanzla Mateen
 * @author Abhishek Pathak
 * @type {type}
 */
export const DockContainer = (styled as any).div`
  .dock-panel {
    background: transparent;
    pointer-events: auto;
    border: none;
  }
  .dock-panel:first-child {
    position: relative;
    z-index: 99;
  }
  .dock-panel[data-dockid="+5"] {
    pointer-events: none;
  }
  .dock-panel[data-dockid="+5"] .dock-bar { display: none; }
  .dock-panel[data-dockid="+5"] .dock { background: transparent; }
  .dock-divider {
    pointer-events: auto;
    background:rgba(1,1,1,${(props) => props.dividerAlpha});
  }
  .dock {
    border-radius: 4px;
    background: var(--dockBackground);
  }
  .dock-top .dock-bar {
    font-size: 12px;
    border-bottom: 1px solid rgba(0,0,0,0.2);
    background: transparent;
  }
  .dock-tab {
    background: transparent;
    border-bottom: none;
  }
  .dock-tab:hover, .dock-tab-active, .dock-tab-active:hover {
    border-bottom: 1px solid #ddd;
  }
  .dock-tab:hover div, .dock-tab:hover svg { color: var(--textColor); }
  .dock-tab > div { padding: 2px 12px; }
  .dock-tab-active {
    color: var(--textColor);
  }
  .dock-ink-bar {
    background-color: var(--textColor);
  }
  .dock-panel-max-btn:before {
    border-color: var(--iconButtonColor);
  }
`
/**
 * @author Abhishek Pathak
 */
DockContainer.defaultProps = {
  dividerAlpha: 0
}

/**
 * EditorContainer class used for creating container for Editor
 *
 *  @author Robert Long
 */
const EditorContainer = () => {
  const editorState = useEditorState()
  const projectName = editorState.projectName
  const sceneName = editorState.sceneName
  const modified = editorState.sceneModified
  const sceneLoaded = useEngineState().sceneLoaded

  const errorState = useEditorErrorState()
  const editorError = errorState.error

  const [searchElement, setSearchElement] = React.useState('')
  const [searchHierarchy, setSearchHierarchy] = React.useState('')

  const { t } = useTranslation()
  const [editorReady, setEditorReady] = useState(false)
  const [DialogComponent, setDialogComponent] = useState<JSX.Element | null>(null)
  const [toggleRefetchScenes, setToggleRefetchScenes] = useState(false)
  const dispatch = useDispatch()
  const history = useHistory()
  const dockPanelRef = useRef<DockLayout>(null)

  const importScene = async (sceneFile: SceneJson) => {
    setDialogComponent(<ProgressDialog title={t('editor:loading')} message={t('editor:loadingMsg')} />)
    try {
      await loadProjectScene(sceneFile)
      dispatch(EditorAction.sceneModified(true))
      setDialogComponent(null)
    } catch (error) {
      console.error(error)
      setDialogComponent(
        <ErrorDialog
          title={t('editor:loadingError')}
          message={error.message || t('editor:loadingErrorMsg')}
          error={error}
        />
      )
    }
  }

  const handleInputChangeHierarchy = (searchInput) => {
    setSearchHierarchy(searchInput)
  }
  const handleInputChangeElement = (searchInput) => {
    setSearchElement(searchInput)
  }

  useHookEffect(() => {
    if (sceneName.value && editorReady) {
      console.log(`Loading scene ${sceneName.value} via given url`)
      loadScene(sceneName.value)
    }
  }, [editorReady, sceneName])

  const reRouteToLoadScene = async (newSceneName: string) => {
    if (sceneName.value === newSceneName) return
    if (!projectName.value || !newSceneName) return
    history.push(`/editor/${projectName.value}/${newSceneName}`)
  }

  const loadScene = async (sceneName: string) => {
    setDialogComponent(<ProgressDialog title={t('editor:loading')} message={t('editor:loadingMsg')} />)
    try {
      if (!projectName.value) return
      const project = await getScene(projectName.value, sceneName, false)

      if (!project.scene) return
      await loadProjectScene(project.scene)

      setDialogComponent(null)
    } catch (error) {
      console.error(error)

      setDialogComponent(
        <ErrorDialog
          title={t('editor:loadingError')}
          message={error.message || t('editor:loadingErrorMsg')}
          error={error}
        />
      )
    }
  }

  const onNewScene = async () => {
    if (!projectName.value) return

    setDialogComponent(<ProgressDialog title={t('editor:loading')} message={t('editor:loadingMsg')} />)

    try {
      const sceneData = await createNewScene(projectName.value)
      if (!sceneData) return

      reRouteToLoadScene(sceneData.sceneName)
      setDialogComponent(null)
    } catch (error) {
      console.error(error)

      setDialogComponent(
        <ErrorDialog
          title={t('editor:loadingError')}
          message={error.message || t('editor:loadingErrorMsg')}
          error={error}
        />
      )
    }
  }

  /**
   * Scene Event Handlers
   */

  const onEditorError = (error) => {
    console.log(error)
    if (error['aborted']) {
      setDialogComponent(null)
      return
    }

    console.error(error)

    setDialogComponent(
      <ErrorDialog
        title={error.title || t('editor:error')}
        message={error.message || t('editor:errorMsg')}
        error={error}
      />
    )
  }

  const onCloseProject = () => {
    history.push('/editor')
  }

  const onSaveAs = async () => {
    const sceneLoaded = getEngineState().sceneLoaded.value

    // Do not save scene if scene is not loaded or some error occured while loading the scene to prevent data lose
    if (!sceneLoaded) {
      setDialogComponent(<ErrorDialog title={t('editor:savingError')} message={t('editor:savingSceneErrorMsg')} />)
      return
    }

    const abortController = new AbortController()
    try {
      if (sceneName.value || modified.value) {
        const blob = await takeScreenshot(512, 320)
        const result: { name: string } = (await new Promise((resolve) => {
          setDialogComponent(
            <SaveNewProjectDialog
              thumbnailUrl={URL.createObjectURL(blob!)}
              initialName={Engine.instance.scene.name}
              onConfirm={resolve}
              onCancel={resolve}
            />
          )
        })) as any
        if (result && projectName.value) {
          await uploadBakeToServer(useWorld().entityTree.rootNode.entity)
          await saveScene(projectName.value, result.name, blob, abortController.signal)
          dispatch(EditorAction.sceneModified(false))
        }
      }
      setDialogComponent(null)
    } catch (error) {
      console.error(error)
      setDialogComponent(
        <ErrorDialog title={t('editor:savingError')} message={error.message || t('editor:savingErrorMsg')} />
      )
    }
    setToggleRefetchScenes(!toggleRefetchScenes)
  }

  const onImportAsset = async () => {
    const el = document.createElement('input')
    el.type = 'file'
    el.multiple = true
    el.accept = '.gltf,.glb,.fbx,.vrm,.tga,.png,.jpg,.jpeg,.mp3,.aac,.ogg,.m4a,.zip'
    el.style.display = 'none'
    el.onchange = async () => {
      const pName = projectName.value
      if (el.files && el.files.length > 0 && pName) {
        const fList = el.files
        const files = [...Array(el.files.length).keys()].map((i) => fList[i])
        const nuUrl = (await uploadProjectFile(pName, files, true)).map((url) => url.url)

        //process zipped files
        const zipFiles = nuUrl.filter((url) => /\.zip$/.test(url))
        const extractPromises = [...zipFiles.map((zipped) => extractZip(zipped))]
        Promise.all(extractPromises).then(() => {
          console.log('extraction complete')
        })
      }
    }
    el.click()
    el.remove()
  }

  const onImportScene = async () => {
    const confirm = await new Promise((resolve) => {
      setDialogComponent(
        <ConfirmDialog
          title={t('editor:importLegacy')}
          message={t('editor:importLegacyMsg')}
          confirmLabel="Yes, Continue"
          onConfirm={() => resolve(true)}
          onCancel={() => resolve(false)}
        />
      )
    })
    setDialogComponent(null)
    if (!confirm) return
    const el = document.createElement('input')
    el.type = 'file'
    el.accept = '.gltf'
    el.style.display = 'none'
    el.onchange = () => {
      if (el.files && el.files.length > 0) {
        const fileReader: any = new FileReader()
        fileReader.onload = () => {
          const json = JSON.parse(fileReader.result)
          importScene(gltfToSceneJson(json))
        }
        fileReader.readAsText(el.files[0])
      }
    }
    el.click()
    el.remove()
  }

  const onExportScene = async () => {
    const projectFile = await sceneToGLTF([Engine.instance.scene as any])
    const projectJson = JSON.stringify(projectFile)
    const projectBlob = new Blob([projectJson])
    const el = document.createElement('a')
    const fileName = Engine.instance.scene.name.toLowerCase().replace(/\s+/g, '-')
    el.download = fileName + '.xre.gltf'
    el.href = URL.createObjectURL(projectBlob)
    document.body.appendChild(el)
    el.click()
    document.body.removeChild(el)
  }

  const onSaveScene = async () => {
    const sceneLoaded = getEngineState().sceneLoaded.value

    // Do not save scene if scene is not loaded or some error occured while loading the scene to prevent data lose
    if (!sceneLoaded) {
      setDialogComponent(<ErrorDialog title={t('editor:savingError')} message={t('editor:savingSceneErrorMsg')} />)
      return
    }

    if (!sceneName.value) {
      if (modified.value) {
        onSaveAs()
      }
      return
    }
    const abortController = new AbortController()

    setDialogComponent(
      <ProgressDialog
        title={t('editor:saving')}
        message={t('editor:savingMsg')}
        cancelable={true}
        onCancel={() => {
          abortController.abort()
          setDialogComponent(null)
        }}
      />
    )

    // Wait for 5ms so that the ProgressDialog shows up.
    await new Promise((resolve) => setTimeout(resolve, 5))

    const blob = await takeScreenshot(512, 320)

    try {
      if (projectName.value) {
        await uploadBakeToServer(useWorld().entityTree.rootNode.entity)
        await saveScene(projectName.value, sceneName.value, blob, abortController.signal)
      }

      dispatch(EditorAction.sceneModified(false))

      setDialogComponent(null)
    } catch (error) {
      console.error(error)

      setDialogComponent(
        <ErrorDialog title={t('editor:savingError')} message={error.message || t('editor:savingErrorMsg')} />
      )
    }
    setToggleRefetchScenes(!toggleRefetchScenes)
  }

  useEffect(() => {
    dockPanelRef.current &&
      dockPanelRef.current.updateTab('scenePanel', {
        id: 'scenePanel',
        title: (
          <PanelDragContainer>
            <PanelIcon as={Inventory2Icon} size={12} />
            <PanelTitle>Scenes</PanelTitle>
          </PanelDragContainer>
        ),
        content: (
          <ScenesPanel newScene={onNewScene} toggleRefetchScenes={toggleRefetchScenes} loadScene={reRouteToLoadScene} />
        )
      })
  }, [toggleRefetchScenes])

  useEffect(() => {
    if (!dockPanelRef.current) return

    dockPanelRef.current.updateTab('viewPanel', {
      id: 'viewPanel',
      title: 'Viewport',
      content: viewPortPanelContent(!sceneLoaded.value)
    })

    const activePanel = sceneLoaded.value ? 'filesPanel' : 'scenePanel'
    dockPanelRef.current.updateTab(activePanel, dockPanelRef.current.find(activePanel) as TabData, true)
  }, [sceneLoaded])

  useEffect(() => {
    runPreprojectLoadTasks().then(() => {
      setEditorReady(true)
    })
  }, [])

  useHookEffect(() => {
    if (editorError) {
      onEditorError(editorError.value)
    }
  }, [editorError])

  useEffect(() => {
    return () => {
      setEditorReady(false)
      disposeProject()
    }
  }, [])

  useEffect(() => {
    if (editorState.projectLoaded.value === true) {
      initializeRenderer()
    }
  }, [editorState.projectLoaded.value])

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
        name: t('editor:menubar.importScene'),
        action: onImportScene
      },
      {
        name: t('editor:menubar.exportScene'),
        action: onExportScene
      },
      {
        name: t('editor:menubar.quit'),
        action: onCloseProject
      }
    ]
  }

  const viewPortPanelContent = useCallback((shouldDisplay) => {
    return shouldDisplay ? (
      <div className={styles.bgImageBlock}>
        <img src="/static/xrengine.png" />
        <h2>{t('editor:selectSceneMsg')}</h2>
      </div>
    ) : (
      <div />
    )
  }, [])

  const toolbarMenu = generateToolbarMenu()
  if (!editorReady) return <></>

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
                  content: (
                    <ScenesPanel
                      newScene={onNewScene}
                      toggleRefetchScenes={toggleRefetchScenes}
                      loadScene={reRouteToLoadScene}
                    />
                  )
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
                  content: viewPortPanelContent(true)
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
                  title: (
                    <PanelDragContainer>
                      <PanelIcon as={AccountTreeIcon} size={12} />
                      <PanelTitle>Hierarchy</PanelTitle>
                      <Search elementsName="hierarchy" handleInputChange={handleInputChangeHierarchy} />
                    </PanelDragContainer>
                  ),
                  content: <HierarchyPanelContainer />
                }
              ]
            },
            {
              tabs: [
                {
                  id: 'propertiesPanel',
                  title: (
                    <PanelDragContainer>
                      <PanelIcon as={TuneIcon} size={12} />
                      <PanelTitle>Properties</PanelTitle>
                    </PanelDragContainer>
                  ),
                  content: <PropertiesPanelContainer />
                }
              ]
            }
          ]
        }
      ]
    }
  }
  return (
    <div
      id="editor-container"
      className={styles.editorContainer}
      style={sceneLoaded.value ? { background: 'transparent' } : {}}
    >
      <DialogContext.Provider value={[DialogComponent, setDialogComponent]}>
        <DndWrapper id="editor-container">
          <DragLayer />
          <ToolBar editorReady={editorReady} menu={toolbarMenu} />
          <ElementList />
          <ControlText />
          <div className={styles.workspaceContainer}>
            <AssetDropZone />
            <AppContext.Provider value={{ searchElement, searchHierarchy }}>
              <DockContainer>
                <DockLayout
                  ref={dockPanelRef}
                  defaultLayout={defaultLayout}
                  style={{ position: 'absolute', left: 5, top: 55, right: 115, bottom: 35 }}
                />
              </DockContainer>
            </AppContext.Provider>
          </div>
          <Dialog
            open={!!DialogComponent}
            onClose={() => setDialogComponent(null)}
            classes={{ root: styles.dialogRoot, paper: styles.dialogPaper }}
          >
            {DialogComponent}
          </Dialog>
        </DndWrapper>
      </DialogContext.Provider>
    </div>
  )
}

export default EditorContainer
