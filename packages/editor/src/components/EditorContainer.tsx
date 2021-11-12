import { Archive, ProjectDiagram } from '@styled-icons/fa-solid'
import { RouteComponentProps, withRouter } from 'react-router-dom'
import { SlidersH } from '@styled-icons/fa-solid/SlidersH'
import { DockLayout, DockMode, LayoutData } from 'rc-dock'
import 'rc-dock/dist/rc-dock.css'
import React, { useEffect, useState } from 'react'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { useTranslation, withTranslation } from 'react-i18next'
import Modal from 'react-modal'
import styled from 'styled-components'
import { getScene, saveScene } from '../functions/sceneFunctions'
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
import { SceneManager } from '../managers/SceneManager'
import { registerPredefinedNodes } from '../managers/NodeManager'
import { CacheManager } from '../managers/CacheManager'
import { ProjectManager } from '../managers/ProjectManager'
import ScenesPanel from './assets/ScenesPanel'
import SaveNewProjectDialog from './dialogs/SaveNewProjectDialog'
import { DialogContext, useDialog } from './hooks/useDialog'
import { saveProject } from '../functions/projectFunctions'
import { EditorAction, useEditorState } from '../services/EditorServices'
import { useDispatch } from '@xrengine/client-core/src/store'
import { isDev } from '@xrengine/common/src/utils/isDev'

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
const EditorContainer = () => {
  const projectName = useEditorState().projectName.value
  const sceneName = useEditorState().sceneName.value

  const { t } = useTranslation()
  const [editorReady, setEditorReady] = useState(false)
  const [DialogComponent, setDialogComponent] = useState(null)
  const [modified, setModified] = useState(false)
  const [sceneLoaded, setSceneLoaded] = useState(false)
  const dispatch = useDispatch()

  const initializeEditor = async () => {
    await Promise.all([ProjectManager.instance.init()])
  }

  useEffect(() => {
    CacheManager.init()

    registerPredefinedNodes()

    initializeEditor().then(() => {
      setEditorReady(true)
      CommandManager.instance.addListener(EditorEvents.RENDERER_INITIALIZED.toString(), setDebuginfo)
      CommandManager.instance.addListener(EditorEvents.PROJECT_LOADED.toString(), onProjectLoaded)
      CommandManager.instance.addListener(EditorEvents.ERROR.toString(), onEditorError)
      CommandManager.instance.addListener(EditorEvents.SAVE_PROJECT.toString(), onSaveScene)
    })
  }, [])

  useEffect(() => {
    return () => {
      CommandManager.instance.removeListener(EditorEvents.SAVE_PROJECT.toString(), onSaveScene)
      CommandManager.instance.removeListener(EditorEvents.ERROR.toString(), onEditorError)
      CommandManager.instance.removeListener(EditorEvents.PROJECT_LOADED.toString(), onProjectLoaded)
      ProjectManager.instance.dispose()
    }
  }, [])

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

  useEffect(() => {
    if (editorReady && !sceneLoaded && sceneName) {
      console.log(`Loading scene ${sceneName} via given url`)
      loadScene(sceneName)
    }
  }, [editorReady, sceneLoaded])

  const loadScene = async (sceneName) => {
    setDialogComponent(<ProgressDialog title={t('editor:loading')} message={t('editor:loadingMsg')} />)
    dispatch(EditorAction.sceneLoaded(null))
    setSceneLoaded(false)
    try {
      const project = await getScene(projectName, sceneName, false)
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
    setDialogComponent(<ProgressDialog title={t('editor:loading')} message={t('editor:loadingMsg')} />)
    dispatch(EditorAction.sceneLoaded(null))
    setSceneLoaded(false)
    try {
      // TODO: replace with better template functionality
      const project = await getScene('default-project', 'default', false)
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
    SceneManager.instance.sceneModified = true
    updateModifiedState()
    setSceneLoaded(true)
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

  const generateToolbarMenu = () => {
    return [
      {
        name: t('editor:menubar.newProject'),
        action: newScene
      },
      {
        name: t('editor:menubar.saveProject'),
        hotkey: `${cmdOrCtrlString} + S`,
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
              thumbnailUrl={URL.createObjectURL(blob)}
              initialName={SceneManager.instance.scene.name}
              onConfirm={resolve}
              onCancel={resolve}
            />
          )
        })) as any
        if (result) {
          await saveScene(projectName, result.name, blob, abortController.signal)
          SceneManager.instance.sceneModified = false
        } else {
          saveProjectFlag = false
        }
      }
      if (saveProjectFlag) {
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
  }

  const onExportProject = async () => {
    if (!sceneName) return
    const options = await new Promise((resolve) => {
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
      el.download = SceneManager.instance.scene.name + '.glb'
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
      if (el.files.length > 0) {
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
    const projectFile = await SceneManager.instance.scene.serialize(sceneName)
    const projectJson = JSON.stringify(projectFile)
    const projectBlob = new Blob([projectJson])
    const el = document.createElement('a')
    const fileName = SceneManager.instance.scene.name.toLowerCase().replace(/\s+/g, '-')
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
      if (isDev && projectName === 'default-project')
        await new Promise((resolve) => {
          setDialogComponent(<ErrorDialog title={t('editor:warnDefault')} message={t('editor:warnDefaultMsg')} />)
        })
      await saveScene(projectName, sceneName, blob, abortController.signal)
      await saveProject(projectName)
      SceneManager.instance.sceneModified = false
      updateModifiedState()

      setDialogComponent(null)
    } catch (error) {
      console.error(error)

      setDialogComponent(
        <ErrorDialog title={t('editor:savingError')} message={error.message || t('editor:savingErrorMsg')} />
      )
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
                  content: <ScenesPanel newScene={newScene} loadScene={loadScene} projectName={projectName} />
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
                  title: (
                    <PanelDragContainer>
                      <PanelTitle>Elements</PanelTitle>
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
    <StyledEditorContainer id="editor-container">
      <DialogContext.Provider value={[DialogComponent, setDialogComponent]}>
        <DndProvider backend={HTML5Backend}>
          <DragLayer />
          <ToolBar editorReady={editorReady} menu={toolbarMenu} />
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
            onRequestClose={() => setDialogComponent(null)}
            shouldCloseOnOverlayClick={true}
            className="Modal"
            overlayClassName="Overlay"
          >
            {DialogComponent}
          </Modal>
        </DndProvider>
      </DialogContext.Provider>
    </StyledEditorContainer>
  )
}

export default withTranslation()(withRouter(EditorContainer))
