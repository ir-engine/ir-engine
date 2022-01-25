import { useHistory, withRouter } from 'react-router-dom'
import Inventory2Icon from '@mui/icons-material/Inventory2'
import AccountTreeIcon from '@mui/icons-material/AccountTree'
import TuneIcon from '@mui/icons-material/Tune'
import { DockLayout, DockMode, LayoutData } from 'rc-dock'
import 'rc-dock/dist/rc-dock.css'
import React, { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import Dialog from '@mui/material/Dialog'
import styled from 'styled-components'
import { createNewScene, getScene, saveScene } from '../functions/sceneFunctions'
import AssetsPanel from './assets/AssetsPanel'
import ConfirmDialog from './dialogs/ConfirmDialog'
import ErrorDialog from './dialogs/ErrorDialog'
import ExportProjectDialog from './dialogs/ExportProjectDialog'
import { ProgressDialog } from './dialogs/ProgressDialog'
import DragLayer from './dnd/DragLayer'
import HierarchyPanelContainer from './hierarchy/HierarchyPanelContainer'
import { PanelDragContainer, PanelIcon, PanelTitle } from './layout/Panel'
import PropertiesPanelContainer from './properties/PropertiesPanelContainer'
import ToolBar from './toolbar/ToolBar'
import ViewportPanelContainer from './viewport/ViewportPanelContainer'
import ProjectBrowserPanel from './assets/ProjectBrowserPanel'
import { cmdOrCtrlString } from '../functions/utils'
import { CommandManager } from '../managers/CommandManager'
import EditorEvents from '../constants/EditorEvents'
import { DefaultExportOptionsType, SceneManager } from '../managers/SceneManager'
import { CacheManager } from '../managers/CacheManager'
import { ProjectManager } from '../managers/ProjectManager'
import ScenesPanel from './assets/ScenesPanel'
import SaveNewProjectDialog from './dialogs/SaveNewProjectDialog'
import { DialogContext } from './hooks/useDialog'
import { saveProject } from '../functions/projectFunctions'
import { EditorAction, useEditorState } from '../services/EditorServices'
import { useDispatch } from '@xrengine/client-core/src/store'
import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import Search from './Search/Search'
import { AppContext } from './Search/context'
import * as styles from './styles.module.scss'
import { unloadScene } from '@xrengine/engine/src/ecs/functions/EngineFunctions'
import { DndWrapper } from './dnd/DndWrapper'

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
    opacity: 0.8;
    border: none;
  }
  .dock-panel:first-child {
    position: relative;
    z-index: 99;
  }
  .dock-panel[data-dockid="+5"] {
    visibility: hidden;
    pointer-events: none;
  }
  .dock-divider {
    pointer-events: auto;
    background:rgba(1,1,1,${(props) => props.dividerAlpha});
  }
  .dock {
    border-radius: 4px;
    background: #282C31;
  }
  .dock-top .dock-bar {
    font-size: 12px;
    border-bottom: 1px solid rgba(0,0,0,0.2);
    background: #282C31;
  }
  .dock-tab {
    background: #282C31; 
    border-bottom: none;
  }
  .dock-tab:hover, .dock-tab-active, .dock-tab-active:hover {
    color: #ffffff; 
  }
  .dock-ink-bar {
    background-color: #ffffff; 
  }
`
/**
 * @author Abhishek Pathak
 */
DockContainer.defaultProps = {
  dividerAlpha: 0
}

type EditorContainerProps = {
  projectName: string
  sceneName: string
}

/**
 * EditorContainer class used for creating container for Editor
 *
 *  @author Robert Long
 */
const EditorContainer = (props) => {
  const projectName = useEditorState().projectName.value
  const sceneName = useEditorState().sceneName.value
  const [searchElement, setSearchElement] = React.useState('')
  const [searchHierarchy, setSearchHierarchy] = React.useState('')

  const { t } = useTranslation()
  const [editorReady, setEditorReady] = useState(false)
  const [DialogComponent, setDialogComponent] = useState<JSX.Element | null>(null)
  const [modified, setModified] = useState(false)
  const [sceneLoaded, setSceneLoaded] = useState(false)
  const [toggleRefetchScenes, setToggleRefetchScenes] = useState(false)
  const dispatch = useDispatch()
  const history = useHistory()
  const dockPanelRef = useRef<DockLayout>(null)

  const importScene = async (projectFile) => {
    setDialogComponent(<ProgressDialog title={t('editor:loading')} message={t('editor:loadingMsg')} />)
    dispatch(EditorAction.sceneLoaded(null))
    setSceneLoaded(false)
    try {
      await ProjectManager.instance.loadProject(projectFile)
      setSceneLoaded(true)
      SceneManager.instance.sceneModified = true
      updateModifiedState()
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

  useEffect(() => {
    const locationSceneName = props?.match?.params?.sceneName
    const locationProjectName = props?.match?.params?.projectName

    if (projectName !== locationProjectName) {
      locationProjectName && dispatch(EditorAction.projectLoaded(locationProjectName))
    }

    if (sceneName !== locationSceneName) {
      locationSceneName && dispatch(EditorAction.sceneLoaded(locationSceneName))
    }

    if (!projectName && !locationProjectName && !sceneName) {
      dispatch(EditorAction.projectLoaded(projectName))
      history.push(`/editor/${projectName}`)
    }
  }, [])

  useEffect(() => {
    if (editorReady && !sceneLoaded && sceneName) {
      console.log(`Loading scene ${sceneName} via given url`)
      loadScene(sceneName)
    }
  }, [editorReady, sceneLoaded])

  const reRouteToLoadScene = async (newSceneName) => {
    if (sceneName === newSceneName) return

    await uploadCurrentScene()

    projectName && newSceneName && history.push(`/editor/${projectName}/${newSceneName}`)
  }

  const uploadCurrentScene = async () => {
    if (!Engine.sceneLoaded) return

    ProjectManager.instance.dispose()

    return unloadScene({
      removePersisted: true,
      keepSystems: true
    })
  }

  const loadScene = async (sceneName) => {
    setDialogComponent(<ProgressDialog title={t('editor:loading')} message={t('editor:loadingMsg')} />)
    dispatch(EditorAction.sceneLoaded(null))
    setSceneLoaded(false)
    try {
      if (!projectName) return
      const project = await getScene(projectName, sceneName, false)

      if (!project.scene) return
      await ProjectManager.instance.loadProject(project.scene)

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
    dispatch(EditorAction.sceneLoaded(sceneName))
    setSceneLoaded(true)
  }

  const newScene = async () => {
    if (!projectName) return

    setDialogComponent(<ProgressDialog title={t('editor:loading')} message={t('editor:loadingMsg')} />)
    dispatch(EditorAction.sceneLoaded(null))
    setSceneLoaded(false)

    try {
      const newProject = await createNewScene(projectName)
      if (!newProject) return

      reRouteToLoadScene(newProject.sceneName)
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

  const updateModifiedState = (then?) => {
    const nextModified = SceneManager.instance.sceneModified

    if (nextModified !== modified) {
      setModified(nextModified)
      then && then()
    } else if (then) {
      then()
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

  const onProjectLoaded = () => {
    updateModifiedState()
  }

  const onCloseProject = () => {
    history.push('/editor')
    dispatch(EditorAction.projectLoaded(null))
  }

  const onSaveAs = async () => {
    const abortController = new AbortController()
    try {
      let saveProjectFlag = true
      if (sceneName || modified) {
        const blob = await SceneManager.instance.takeScreenshot(512, 320)
        const result: { name: string } = (await new Promise((resolve) => {
          setDialogComponent(
            <SaveNewProjectDialog
              thumbnailUrl={URL.createObjectURL(blob!)}
              initialName={Engine.scene.name}
              onConfirm={resolve}
              onCancel={resolve}
            />
          )
        })) as any
        if (result && projectName) {
          await saveScene(projectName, result.name, blob, abortController.signal)
          SceneManager.instance.sceneModified = false
        } else {
          saveProjectFlag = false
        }
      }
      if (saveProjectFlag && projectName) {
        await saveProject(projectName)
        updateModifiedState()
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

  const onExportProject = async () => {
    if (!sceneName) return
    const options = await new Promise<DefaultExportOptionsType>((resolve) => {
      setDialogComponent(
        <ExportProjectDialog
          defaultOptions={Object.assign({}, SceneManager.DefaultExportOptions)}
          onConfirm={resolve}
          onCancel={resolve}
        />
      )
    })

    if (!options) {
      setDialogComponent(null)
      return
    }

    const abortController = new AbortController()

    setDialogComponent(
      <ProgressDialog
        title={t('editor:exporting')}
        message={t('editor:exportingMsg')}
        cancelable={true}
        onCancel={() => abortController.abort()}
      />
    )

    try {
      const { glbBlob } = await SceneManager.instance.exportScene(options)

      setDialogComponent(null)

      const el = document.createElement('a')
      el.download = Engine.scene.name + '.glb'
      el.href = URL.createObjectURL(glbBlob)
      document.body.appendChild(el)
      el.click()
      document.body.removeChild(el)
    } catch (error) {
      if (error['aborted']) {
        setDialogComponent(null)
        return
      }

      console.error(error)

      setDialogComponent(
        <ErrorDialog
          title={t('editor:exportingError')}
          message={error.message || t('editor:exportingErrorMsg')}
          error={error}
        />
      )
    }
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
    el.accept = '.world'
    el.style.display = 'none'
    el.onchange = () => {
      if (el.files && el.files.length > 0) {
        const fileReader: any = new FileReader()
        fileReader.onload = () => {
          const json = JSON.parse((fileReader as any).result)
          importScene(json)
        }
        fileReader.readAsText(el.files[0])
      }
    }
    el.click()
  }

  const onExportScene = async () => {
    const projectFile = await (Engine.scene as any).serialize(sceneName)
    const projectJson = JSON.stringify(projectFile)
    const projectBlob = new Blob([projectJson])
    const el = document.createElement('a')
    const fileName = Engine.scene.name.toLowerCase().replace(/\s+/g, '-')
    el.download = fileName + '.world'
    el.href = URL.createObjectURL(projectBlob)
    document.body.appendChild(el)
    el.click()
    document.body.removeChild(el)
  }

  const onSaveScene = async () => {
    if (!sceneName) {
      if (modified) {
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

    const blob = await SceneManager.instance.takeScreenshot(512, 320)

    try {
      if (projectName) {
        await saveScene(projectName, sceneName, blob, abortController.signal)
        await saveProject(projectName)
      }

      SceneManager.instance.sceneModified = false
      updateModifiedState()
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
    console.log('toggleRefetchScenes')
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
          <ScenesPanel
            newScene={newScene}
            toggleRefetchScenes={toggleRefetchScenes}
            projectName={projectName}
            loadScene={reRouteToLoadScene}
          />
        )
      })
  }, [toggleRefetchScenes])

  useEffect(() => {
    CacheManager.init()

    ProjectManager.instance.init().then(() => {
      setEditorReady(true)
      CommandManager.instance.addListener(EditorEvents.PROJECT_LOADED.toString(), onProjectLoaded)
      CommandManager.instance.addListener(EditorEvents.ERROR.toString(), onEditorError)
    })
  }, [])

  useEffect(() => {
    return () => {
      CommandManager.instance.removeListener(EditorEvents.ERROR.toString(), onEditorError)
      CommandManager.instance.removeListener(EditorEvents.PROJECT_LOADED.toString(), onProjectLoaded)
      ProjectManager.instance.dispose()
    }
  }, [])

  const generateToolbarMenu = () => {
    return [
      {
        name: t('editor:menubar.newProject'),
        action: newScene
      },
      {
        name: t('editor:menubar.saveProject'),
        hotkey: `${cmdOrCtrlString}+s`,
        action: onSaveScene
      },
      {
        name: t('editor:menubar.saveAs'),
        action: onSaveAs
      },
      // {
      //   name: t('editor:menubar.exportGLB'), // TODO: Disabled temporarily till workers are working
      //   action: onExportProject
      // },
      {
        name: t('editor:menubar.importProject'),
        action: onImportScene
      },
      {
        name: t('editor:menubar.exportProject'),
        action: onExportScene
      },
      {
        name: t('editor:menubar.quit'),
        action: onCloseProject
      }
    ]
  }

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
                      newScene={newScene}
                      projectName={projectName}
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
              tabs: [{ id: 'viewPanel', title: 'Viewport', content: <div /> }],
              size: 1
            }
          ]
        },
        {
          mode: 'vertical' as DockMode,
          size: 3,
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
                },
                {
                  id: 'assetsPanel',
                  title: (
                    <PanelDragContainer>
                      <PanelTitle>
                        Elements
                        <Search elementsName="element" handleInputChange={handleInputChangeElement} />
                      </PanelTitle>
                    </PanelDragContainer>
                  ),
                  content: <AssetsPanel />
                }
              ]
            }
          ]
        }
      ]
    }
  }
  return (
    <div className={styles.editorContainer} id="editor-container">
      <DialogContext.Provider value={[DialogComponent, setDialogComponent]}>
        <DndWrapper id="editor-container">
          <DragLayer />
          <ToolBar editorReady={editorReady} menu={toolbarMenu} />
          <div className={styles.workspaceContainer}>
            <ViewportPanelContainer />
            <AppContext.Provider value={{ searchElement, searchHierarchy }}>
              <DockContainer>
                <DockLayout
                  ref={dockPanelRef}
                  defaultLayout={defaultLayout}
                  style={{ position: 'absolute', left: 5, top: 55, right: 5, bottom: 5 }}
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

export default withRouter(EditorContainer)
