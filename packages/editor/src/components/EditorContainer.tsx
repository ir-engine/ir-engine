import { Archive, ProjectDiagram } from '@styled-icons/fa-solid'
import { RouteComponentProps, withRouter } from 'react-router-dom'
import { SlidersH } from '@styled-icons/fa-solid/SlidersH'
import { LocationService } from '@xrengine/client-core/src/admin/services/LocationService'
import { DockLayout, DockMode, LayoutData } from 'rc-dock'
import 'rc-dock/dist/rc-dock.css'
import React, { useEffect, useRef, useState } from 'react'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { useTranslation, withTranslation } from 'react-i18next'
import Modal from 'react-modal'
import styled from 'styled-components'
import { createScene, getScene, saveScene } from '../functions/sceneFunctions'
import AssetsPanel from './assets/AssetsPanel'
import { DialogContextProvider } from './contexts/DialogContext'
import { defaultSettings, SettingsContextProvider } from './contexts/SettingsContext'
import ConfirmDialog from './dialogs/ConfirmDialog'
import ErrorDialog from './dialogs/ErrorDialog'
import ExportProjectDialog from './dialogs/ExportProjectDialog'
import { ProgressDialog } from './dialogs/ProgressDialog'
import SaveNewProjectDialog from './dialogs/SaveNewProjectDialog'
import DragLayer from './dnd/DragLayer'
import HierarchyPanelContainer from './hierarchy/HierarchyPanelContainer'
import { PanelDragContainer, PanelIcon, PanelTitle } from './layout/Panel'
import PropertiesPanelContainer from './properties/PropertiesPanelContainer'
import defaultTemplateUrl from './templates/crater.json'
import tutorialTemplateUrl from './templates/tutorial.json'
import ToolBar from './toolbar/ToolBar'
import ViewportPanelContainer from './viewport/ViewportPanelContainer'
import ProjectBrowserPanel from './assets/ProjectBrowserPanel'
import { cmdOrCtrlString } from '../functions/utils'
import { CommandManager } from '../managers/CommandManager'
import EditorCommands from '../constants/EditorCommands'
import EditorEvents from '../constants/EditorEvents'
import { SceneManager } from '../managers/SceneManager'
import { registerPredefinedNodes } from '../managers/NodeManager'
import { registerPredefinedSources } from '../managers/SourceManager'
import { CacheManager } from '../managers/CacheManager'
import { ProjectManager } from '../managers/ProjectManager'
import { SceneDetailInterface } from '@xrengine/common/src/interfaces/SceneInterface'
import { client } from '@xrengine/client-core/src/feathers'
import ScenesPanel from './assets/ScenesPanel'

/**
 * StyledEditorContainer component is used as root element of new project page.
 * On this page we have an editor to create a new or modifing an existing project.
 *
 * @author Robert Long
 * @type {Styled component}
 */
const StyledEditorContainer = (styled as any).div`
  display: flex;
  flex: 1;
  flex-direction: column;
  height: 100%;
  width: 100%;
  position: fixed;
`

/**
 *Styled component used as workspace container.
 *
 * @author Robert Long
 * @type {type}
 */
const WorkspaceContainer = (styled as any).div`
  display: flex;
  flex: 1;
  overflow: hidden;
  margin: 0px;
`

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
const EditorContainer = (props: RouteComponentProps<any>) => {
  const { projectName } = props.match.params

  const { t } = useTranslation()
  const [editorReady, setEditorReady] = useState(false)
  const [settingsContext, setSettingsContext] = useState({
    settings: defaultSettings,
    updateSetting: (...props) => {}
  })
  const [creatingProject, setCreatingProject] = useState(null)
  const [DialogComponent, setDialogComponent] = useState(null)
  const [dialogProps, setDialogProps] = useState<any>({})
  const [modified, setModified] = useState(false)
  const [sceneName, setSceneName] = useState(null)

  const initializeEditor = async () => {
    await Promise.all([ProjectManager.instance.init()])
  }

  useEffect(() => {
    let settings = defaultSettings
    const storedSettings = localStorage.getItem('editor-settings')
    if (storedSettings) {
      settings = JSON.parse(storedSettings)
    }

    ProjectManager.instance.settings = settings
    CacheManager.init()

    registerPredefinedNodes()
    registerPredefinedSources()

    initializeEditor().then(() => {
      setEditorReady(true)

      CommandManager.instance.addListener(EditorEvents.RENDERER_INITIALIZED.toString(), setDebuginfo)
      CommandManager.instance.addListener(EditorEvents.PROJECT_LOADED.toString(), onProjectLoaded)
      CommandManager.instance.addListener(EditorEvents.ERROR.toString(), onEditorError)
      CommandManager.instance.addListener(EditorEvents.SAVE_PROJECT.toString(), onSaveProject)

      setSettingsContext({
        settings,
        updateSetting
      })
    })
  }, [])

  useEffect(() => {
    return () => {
      CommandManager.instance.removeListener(EditorEvents.SAVE_PROJECT.toString(), onSaveProject)
      CommandManager.instance.removeListener(EditorEvents.ERROR.toString(), onEditorError)
      CommandManager.instance.removeListener(EditorEvents.PROJECT_LOADED.toString(), onProjectLoaded)
      ProjectManager.instance.dispose()
    }
  }, [])

  const importProject = async (projectFile) => {
    // TODO
    // setProject(null)
    // setParentSceneId(null)
    // showDialog(ProgressDialog, {
    //   title: t('editor:loading'),
    //   message: t('editor:loadingMsg')
    // })
    // try {
    //   await ProjectManager.instance.loadProject(projectFile)
    //   SceneManager.instance.sceneModified = true
    //   updateModifiedState()
    //   hideDialog()
    // } catch (error) {
    //   console.error(error)
    //   showDialog(ErrorDialog, {
    //     title: t('editor:loadingError'),
    //     message: error.message || t('editor:loadingErrorMsg'),
    //     error
    //   })
    // } finally {
    //   if (project) {
    //     setProject(project)
    //   }
    // }
  }

  const loadScene = async (sceneName) => {
    showDialog(ProgressDialog, {
      title: t('editor:loading'),
      message: t('editor:loadingMsg')
    })
    setSceneName(null)
    try {
      const project = (await getScene(projectName, sceneName, false)) as SceneDetailInterface
      console.log(project)
      await ProjectManager.instance.loadProject(project.scene)
      setSceneName(sceneName)
      hideDialog()
    } catch (error) {
      console.error(error)

      showDialog(ErrorDialog, {
        title: t('editor:loadingError'),
        message: error.message || t('editor:loadingErrorMsg'),
        error
      })
    }
  }

  const updateModifiedState = (then?) => {
    const nextModified = SceneManager.instance.sceneModified && !creatingProject

    if (nextModified !== modified) {
      setModified(nextModified)
      then && then()
    } else if (then) {
      then()
    }
  }

  const generateToolbarMenu = () => {
    return [
      {
        name: t('editor:menubar.newProject'),
        action: onNewProject
      },
      {
        name: t('editor:menubar.saveProject'),
        hotkey: `${cmdOrCtrlString} + S`,
        action: onSaveProject
      },
      {
        name: t('editor:menubar.saveAs'),
        action: onDuplicateProject
      },
      {
        name: t('editor:menubar.exportGLB'), // TODO: Disabled temporarily till workers are working
        action: onExportProject
      },
      {
        name: t('editor:menubar.importProject'),
        action: onImportLegacyProject
      },
      {
        name: t('editor:menubar.exportProject'),
        action: onExportLegacyProject
      },
      {
        name: t('editor:menubar.quit'),
        action: onOpenProject
      }
    ]
  }

  const setDebuginfo = () => {
    const gl = SceneManager.instance.renderer.webglRenderer.getContext()

    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info')

    let webglVendor = 'Unknown'
    let webglRenderer = 'Unknown'

    if (debugInfo) {
      webglVendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL)
      webglRenderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)
    }

    CommandManager.instance.removeListener(EditorEvents.RENDERER_INITIALIZED.toString(), setDebuginfo)
  }

  /**
   *  Dialog Context
   */

  const showDialog = (DialogComponent, newDialogProps) => {
    setDialogComponent(DialogComponent)
    setDialogProps(newDialogProps)
  }

  const hideDialog = () => {
    setDialogComponent(null)
    setDialogProps({})
  }

  const dialogContext = {
    showDialog: showDialog,
    hideDialog: hideDialog
  }

  /**
   * Scene Event Handlers
   */

  const onEditorError = (error) => {
    if (error['aborted']) {
      hideDialog()
      return
    }

    console.error(error)

    showDialog(ErrorDialog, {
      title: error.title || t('editor:error'),
      message: error.message || t('editor:errorMsg'),
      error
    })
  }

  const onProjectLoaded = () => {
    updateModifiedState()
  }

  const updateSetting = (key, value) => {
    const newSettings = Object.assign(settingsContext.settings, { [key]: value })
    localStorage.setItem('editor-settings', JSON.stringify(newSettings))
    ProjectManager.instance.settings = newSettings
    CommandManager.instance.emitEvent(EditorEvents.SETTINGS_CHANGED)

    setDialogComponent(DialogComponent)
    // setDialogProps(dialogProps)

    setSettingsContext({
      settings: newSettings,
      updateSetting
    })
  }

  /**
   *  Project Actions
   */

  const createProject = async () => {
    // showDialog(ProgressDialog, {
    //   title: t('editor:generateScreenshot'),
    //   message: t('editor:generateScreenshotMsg')
    // })
    // // Wait for 5ms so that the ProgressDialog shows up.
    // await new Promise((resolve) => setTimeout(resolve, 5))
    // const blob = await SceneManager.instance.takeScreenshot(512, 320)
    // const result: any = (await new Promise((resolve) => {
    //   showDialog(SaveNewProjectDialog, {
    //     thumbnailUrl: URL.createObjectURL(blob),
    //     initialName: SceneManager.instance.scene.name,
    //     onConfirm: resolve,
    //     onCancel: resolve
    //   })
    // })) as any
    // if (!result) {
    //   hideDialog()
    //   return null
    // }
    // const abortController = new AbortController()
    // showDialog(ProgressDialog, {
    //   title: t('editor:saving'),
    //   message: t('editor:savingMsg'),
    //   cancelable: true,
    //   onCancel: () => {
    //     abortController.abort()
    //     hideDialog()
    //   }
    // })
    // CommandManager.instance.executeCommand(EditorCommands.MODIFY_PROPERTY, SceneManager.instance.scene, {
    //   properties: { name: result.name }
    // })
    // SceneManager.instance.scene.setMetadata({ name: result.name })
    // const project = await createScene(
    //   SceneManager.instance.scene,
    //   parentSceneId,
    //   blob,
    //   abortController.signal,
    //   showDialog,
    //   hideDialog
    // )
    // SceneManager.instance.sceneModified = false
    // setSceneId(project.scene_id)
    // updateModifiedState(() => {
    //   setCreatingProject(true)
    //   setProject(project)
    // })
    // return project
  }

  // useEffect(() => {
  //   if (creatingProject) {
  //     props.history.replace(`/editor/${project.scene_id}`)
  //     setCreatingProject(false)
  //   }
  // }, [creatingProject, project])

  const onNewProject = async () => {
    // props.history.push('/editor/new')
  }

  const onOpenProject = () => {
    // props.history.push('/editor')
  }

  const onDuplicateProject = async () => {
    // const abortController = new AbortController()
    // showDialog(ProgressDialog, {
    //   title: t('editor:duplicating'),
    //   message: t('editor:duplicatingMsg'),
    //   cancelable: true,
    //   onCancel: () => {
    //     abortController.abort()
    //     hideDialog()
    //   }
    // })
    // await new Promise((resolve) => setTimeout(resolve, 5))
    // try {
    //   const newProject = await createProject()
    //   SceneManager.instance.sceneModified = false
    //   updateModifiedState()
    //   hideDialog()
    //   setSceneId(newProject.scene_id)
    // } catch (error) {
    //   console.error(error)
    //   showDialog(ErrorDialog, {
    //     title: t('editor:savingError'),
    //     message: error.message || t('editor:savingErrorMsg')
    //   })
    // }
  }

  const onExportProject = async () => {
    const options = await new Promise((resolve) => {
      showDialog(ExportProjectDialog, {
        defaultOptions: Object.assign({}, SceneManager.DefaultExportOptions),
        onConfirm: resolve,
        onCancel: resolve
      })
    })

    if (!options) {
      hideDialog()
      return
    }

    const abortController = new AbortController()

    showDialog(ProgressDialog, {
      title: t('editor:exporting'),
      message: t('editor:exportingMsg'),
      cancelable: true,
      onCancel: () => abortController.abort()
    })

    try {
      const { glbBlob } = await SceneManager.instance.exportScene(options)

      hideDialog()

      const el = document.createElement('a')
      el.download = SceneManager.instance.scene.name + '.glb'
      el.href = URL.createObjectURL(glbBlob)
      document.body.appendChild(el)
      el.click()
      document.body.removeChild(el)
    } catch (error) {
      if (error['aborted']) {
        hideDialog()
        return
      }

      console.error(error)

      showDialog(ErrorDialog, {
        title: t('editor:exportingError'),
        message: error.message || t('editor:exportingErrorMsg'),
        error
      })
    }
  }

  const onImportLegacyProject = async () => {
    // const confirm = await new Promise((resolve) => {
    //   showDialog(ConfirmDialog, {
    //     title: t('editor:importLegacy'),
    //     message: t('editor:importLegacyMsg'),
    //     onConfirm: () => resolve(true),
    //     onCancel: () => resolve(false)
    //   })
    // })
    // hideDialog()
    // if (!confirm) return
    // const el = document.createElement('input')
    // el.type = 'file'
    // el.accept = '.world'
    // el.style.display = 'none'
    // el.onchange = () => {
    //   if (el.files.length > 0) {
    //     const fileReader: any = new FileReader()
    //     fileReader.onload = () => {
    //       const json = JSON.parse((fileReader as any).result)
    //       if (json.metadata) {
    //         delete json.metadata.sceneUrl
    //         delete json.metadata.sceneId
    //       }
    //       importProject(json)
    //     }
    //     fileReader.readAsText(el.files[0])
    //   }
    // }
    // el.click()
  }

  const onExportLegacyProject = async () => {
    // const projectFile = await SceneManager.instance.scene.serialize(project.scene_id)
    // if (projectFile.metadata) {
    //   delete projectFile.metadata.sceneUrl
    //   delete projectFile.metadata.sceneId
    // }
    // const projectJson = JSON.stringify(projectFile)
    // const projectBlob = new Blob([projectJson])
    // const el = document.createElement('a')
    // const fileName = SceneManager.instance.scene.name.toLowerCase().replace(/\s+/g, '-')
    // el.download = fileName + '.world'
    // el.href = URL.createObjectURL(projectBlob)
    // document.body.appendChild(el)
    // el.click()
    // document.body.removeChild(el)
  }

  const onSaveProject = async () => {
    if (!sceneName) return
    const abortController = new AbortController()

    showDialog(ProgressDialog, {
      title: t('editor:saving'),
      message: t('editor:savingMsg'),
      cancelable: true,
      onCancel: () => {
        abortController.abort()
        hideDialog()
      }
    })

    // Wait for 5ms so that the ProgressDialog shows up.
    await new Promise((resolve) => setTimeout(resolve, 5))

    try {
      await saveScene(projectName, sceneName, abortController.signal)

      await new Promise((resolve) => setTimeout(resolve, 500))
      SceneManager.instance.sceneModified = false
      updateModifiedState()

      hideDialog()
    } catch (error) {
      console.error(error)

      showDialog(ErrorDialog, {
        title: t('editor:savingError'),
        message: error.message || t('editor:savingErrorMsg')
      })
    }
  }

  const toolbarMenu = generateToolbarMenu()

  if (!editorReady) return <></>

  let defaultLayout: LayoutData = {
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
                      <PanelIcon as={Archive} size={12} />
                      <PanelTitle>Scenes</PanelTitle>
                    </PanelDragContainer>
                  ),
                  content: <ScenesPanel loadScene={loadScene} projectName={projectName} />
                },
                {
                  id: 'filesPanel',
                  title: (
                    <PanelDragContainer>
                      <PanelIcon as={Archive} size={12} />
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
              tabs: [{ id: 'viewPanel', title: 'Viewport', content: <div /> }],
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
                      <PanelIcon as={ProjectDiagram} size={12} />
                      <PanelTitle>Hierarchy</PanelTitle>
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
                      <PanelIcon as={SlidersH} size={12} />
                      <PanelTitle>Properties</PanelTitle>
                    </PanelDragContainer>
                  ),
                  content: <PropertiesPanelContainer />
                },
                {
                  id: 'assetsPanel',
                  title: 'Elements',
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
    <StyledEditorContainer id="editor-container">
      <SettingsContextProvider value={settingsContext}>
        <DialogContextProvider value={dialogContext}>
          <DndProvider backend={HTML5Backend}>
            <DragLayer />
            {toolbarMenu && <ToolBar menu={toolbarMenu} />}
            <WorkspaceContainer>
              <ViewportPanelContainer />
              <DockContainer>
                <DockLayout
                  defaultLayout={defaultLayout}
                  style={{ pointerEvents: 'none', position: 'absolute', left: 5, top: 55, right: 5, bottom: 5 }}
                />
              </DockContainer>
            </WorkspaceContainer>
            <Modal
              ariaHideApp={false}
              isOpen={!!DialogComponent}
              onRequestClose={hideDialog}
              shouldCloseOnOverlayClick={false}
              className="Modal"
              overlayClassName="Overlay"
            >
              {DialogComponent && dialogProps && (
                <DialogComponent onConfirm={hideDialog} onCancel={hideDialog} {...dialogProps} />
              )}
            </Modal>
          </DndProvider>
        </DialogContextProvider>
      </SettingsContextProvider>
    </StyledEditorContainer>
  )
}

export default withTranslation()(withRouter(EditorContainer))
