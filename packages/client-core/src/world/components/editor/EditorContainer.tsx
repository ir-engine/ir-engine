import { cmdOrCtrlString, objectToMap } from '@xrengine/engine/src/editor/functions/utils'
import { useLocation, withRouter } from 'react-router-dom'
import PropTypes from 'prop-types'
import React, { Component, Fragment } from 'react'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import Modal from 'react-modal'
import styled from 'styled-components'
import defaultTemplateUrl from './templates/crater.json'
import tutorialTemplateUrl from './templates/tutorial.json'
import Api from './Api'
import { withApi } from './contexts/ApiContext'
import { DialogContextProvider } from './contexts/DialogContext'
import { EditorContextProvider } from './contexts/EditorContext'
import { defaultSettings, SettingsContextProvider } from './contexts/SettingsContext'
import ConfirmDialog from './dialogs/ConfirmDialog'
import ErrorDialog from './dialogs/ErrorDialog'
import ExportProjectDialog from './dialogs/ExportProjectDialog'
import { ProgressDialog } from './dialogs/ProgressDialog'
import SaveNewProjectDialog from './dialogs/SaveNewProjectDialog'
import DragLayer from './dnd/DragLayer'
import Editor from './Editor'
import HierarchyPanelContainer from './hierarchy/HierarchyPanelContainer'
// import BrowserPrompt from "./router/BrowserPrompt";
import { createEditor } from './Nodes'
import PropertiesPanelContainer from './properties/PropertiesPanelContainer'
import ToolBar from './toolbar/ToolBar'
import ViewportPanelContainer from './viewport/ViewportPanelContainer'
import AssetsPanel from './assets/AssetsPanel'
import { selectAdminState } from '../../../admin/reducers/admin/selector'
import { connect } from 'react-redux'
import { bindActionCreators, Dispatch } from 'redux'
import { fetchAdminScenes, fetchLocationTypes } from '../../../admin/reducers/admin/service'
import { fetchAdminLocations } from '../../../admin/reducers/admin/location/service'
import { withTranslation } from 'react-i18next'
import { DockLayout, DockMode } from 'rc-dock'
import 'rc-dock/dist/rc-dock.css'
import { SlidersH } from '@styled-icons/fa-solid/SlidersH'
import { PanelDragContainer, PanelIcon, PanelTitle } from './layout/Panel'
import { ProjectDiagram } from '@styled-icons/fa-solid'

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
  margin: 6px;
`

/**
 *Styled component used as dock container.
 *
 * @author Hanzla Mateen
 * @type {type}
 */
const DockContainer = (styled as any).div`
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
  .dock-panel[data-dockid="+3"] {
    visibility: hidden;
    pointer-events: none;
  }
  .dock-divider {
    pointer-events: auto;
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

type EditorContainerProps = {
  api: Api
  adminState: any
  fetchAdminLocations?: any
  fetchAdminScenes?: any
  fetchLocationTypes?: any
  t: any
  Engine: any
  match: any
  location: any
  history: any
}
type EditorContainerState = {
  project: any
  parentSceneId: null
  // templateUrl: any;
  settingsContext: any
  // error: null;
  editor: Editor
  creatingProject: any
  DialogComponent: null
  pathParams: Map<string, unknown>
  queryParams: Map<string, string>
  dialogProps: {}
  modified: boolean
}

/**
 * EditorContainer class used for creating container for Editor
 *
 *  @author Robert Long
 */
class EditorContainer extends Component<EditorContainerProps, EditorContainerState> {
  static propTypes = {
    api: PropTypes.object.isRequired,
    adminState: PropTypes.object
  }

  constructor(props) {
    super(props)
    const { Engine } = props
    let settings = defaultSettings
    const storedSettings = localStorage.getItem('editor-settings')
    if (storedSettings) {
      settings = JSON.parse(storedSettings)
    }

    const editor = createEditor(props.api, settings, Engine)
    ;(window as any).editor = editor
    editor.init()
    editor.addListener('initialized', this.onEditorInitialized)

    this.state = {
      // error: null,
      project: null,
      parentSceneId: null,
      editor,
      pathParams: new Map(Object.entries(props.match.params)),
      queryParams: new Map(new URLSearchParams(window.location.search).entries()),
      settingsContext: {
        settings,
        updateSetting: this.updateSetting
      },
      creatingProject: null,
      // templateUrl: defaultTemplateUrl,
      DialogComponent: null,
      dialogProps: {},
      modified: false
    }

    this.t = this.props.t
  }

  componentDidMount() {
    if (this.props.adminState.get('locations').get('updateNeeded') === true) {
      this.props.fetchAdminLocations()
    }
    if (this.props.adminState.get('scenes').get('updateNeeded') === true) {
      this.props.fetchAdminScenes()
    }
    if (this.props.adminState.get('locationTypes').get('updateNeeded') === true) {
      this.props.fetchLocationTypes()
    }
    const pathParams = this.state.pathParams
    const queryParams = this.state.queryParams
    const projectId = pathParams.get('projectId')

    if (projectId === 'new') {
      if (queryParams.has('template')) {
        this.loadProjectTemplate(queryParams.get('template'))
      } else if (queryParams.has('sceneId')) {
        this.loadScene(queryParams.get('sceneId'))
      } else {
        this.loadProjectTemplate(defaultTemplateUrl)
      }
    } else if (projectId === 'tutorial') {
      this.loadProjectTemplate(tutorialTemplateUrl)
    } else {
      this.loadProject(projectId)
    }
  }

  componentDidUpdate(prevProps: EditorContainerProps) {
    if (this.props.location.pathname !== prevProps.location.pathname && !this.state.creatingProject) {
      // const { projectId } = this.props.match.params;
      const prevProjectId = prevProps.match.params.projectId
      const queryParams = new Map(new URLSearchParams(window.location.search).entries())
      this.setState({
        queryParams
      })
      const projectId = queryParams.get('projectId')
      let templateUrl = null

      if (projectId === 'new' && !queryParams.has('sceneId')) {
        templateUrl = queryParams.get('template') || defaultTemplateUrl
      } else if (projectId === 'tutorial') {
        templateUrl = tutorialTemplateUrl
      }

      if (projectId === 'new' || projectId === 'tutorial') {
        this.loadProjectTemplate(templateUrl)
      } else if (prevProjectId !== 'tutorial' && prevProjectId !== 'new') {
        this.loadProject(projectId)
      }
    }
  }

  componentWillUnmount() {
    const editor = this.state.editor
    editor.removeListener('sceneModified', this.onSceneModified)
    editor.removeListener('saveProject', this.onSaveProject)
    editor.removeListener('initialized', this.onEditorInitialized)
    editor.removeListener('error', this.onEditorError)
    editor.removeListener('projectLoaded', this.onProjectLoaded)
    editor.dispose()
  }

  t: Function

  async loadProjectTemplate(templateFile) {
    this.setState({
      project: null,
      parentSceneId: null
      // templateUrl
    })

    this.showDialog(ProgressDialog, {
      title: this.t('editor:loading'), // "Loading Project",
      message: this.t('editor:loadingMsg')
    })

    const editor = this.state.editor

    try {
      // const templateFile = await this.props.api.fetchUrl(templateUrl).then(response => response.json());

      await editor.init()

      if (templateFile.metadata) {
        delete templateFile.metadata.sceneUrl
        delete templateFile.metadata.sceneId
      }

      await editor.loadProject(templateFile)

      this.hideDialog()
    } catch (error) {
      console.error(error)

      this.showDialog(ErrorDialog, {
        title: this.t('editor:loadingError'),
        message: error.message || this.t('editor:loadingErrorMsg'),
        error
      })
    }
  }

  async loadScene(sceneId) {
    this.setState({
      project: null,
      parentSceneId: sceneId
      // templateUrl: null,
    })

    this.showDialog(ProgressDialog, {
      title: this.t('editor:loading'),
      message: this.t('editor:loadingMsg')
    })

    const editor = this.state.editor

    try {
      const scene: any = await this.props.api.getScene(sceneId)
      console.warn('loadScene:scene', scene)
      const projectFile = scene.data

      await editor.init()

      await editor.loadProject(projectFile)

      this.hideDialog()
    } catch (error) {
      console.error(error)

      this.showDialog(ErrorDialog, {
        title: this.t('editor:loadingError'),
        message: error.message || this.t('editor:loadingErrorMsg'),
        error
      })
    }
  }

  async importProject(projectFile) {
    const project = this.state.project

    this.setState({
      project: null,
      parentSceneId: null
      // templateUrl: null,
    })

    this.showDialog(ProgressDialog, {
      title: this.t('editor:loading'),
      message: this.t('editor:loadingMsg')
    })

    const editor = this.state.editor

    try {
      await editor.init()

      await editor.loadProject(projectFile)

      editor.sceneModified = true
      this.updateModifiedState()

      this.hideDialog()
    } catch (error) {
      console.error(error)

      this.showDialog(ErrorDialog, {
        title: this.t('editor:loadingError'),
        message: error.message || this.t('editor:loadingErrorMsg'),
        error
      })
    } finally {
      if (project) {
        this.setState({
          project
        })
      }
    }
  }

  async loadProject(projectId) {
    this.setState({
      project: null,
      parentSceneId: null
    })

    this.showDialog(ProgressDialog, {
      title: this.t('editor:loading'),
      message: this.t('editor:loadingMsg')
    })

    const editor = this.state.editor

    let project

    try {
      project = await this.props.api.getProject(projectId)

      const projectFile = await this.props.api.fetchUrl(project.project_url).then((response) => response.json())

      await editor.init()

      await editor.loadProject(projectFile)

      this.hideDialog()
    } catch (error) {
      console.error(error)

      this.showDialog(ErrorDialog, {
        title: this.t('editor:loadingError'),
        message: error.message || this.t('editor:loadingErrorMsg'),
        error
      })
    } finally {
      if (project) {
        this.setState({
          project
        })
      }
    }
  }

  updateModifiedState(then?) {
    const nextModified = this.state.editor.sceneModified && !this.state.creatingProject

    if (nextModified !== this.state.modified) {
      this.setState({ modified: nextModified }, then)
    } else if (then) {
      then()
    }
  }

  generateToolbarMenu = () => {
    return [
      {
        name: this.t('editor:menubar.newProject'),
        action: this.onNewProject
      },
      {
        name: this.t('editor:menubar.saveProject'),
        hotkey: `${cmdOrCtrlString} + S`,
        action: this.onSaveProject
      },
      {
        name: this.t('editor:menubar.saveAs'),
        action: this.onDuplicateProject
      },
      {
        name: this.t('editor:menubar.exportGLB'), // TODO: Disabled temporarily till workers are working
        action: this.onExportProject
      },
      {
        name: this.t('editor:menubar.importProject'),
        action: this.onImportLegacyProject
      },
      {
        name: this.t('editor:menubar.exportProject'),
        action: this.onExportLegacyProject
      },
      {
        name: this.t('editor:menubar.quit'),
        action: this.onOpenProject
      }
    ]
  }

  onEditorInitialized = () => {
    const editor = this.state.editor

    const gl = this.state.editor.renderer.renderer.getContext()

    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info')

    let webglVendor = 'Unknown'
    let webglRenderer = 'Unknown'

    if (debugInfo) {
      webglVendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL)
      webglRenderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)
    }

    editor.addListener('projectLoaded', this.onProjectLoaded)
    editor.addListener('error', this.onEditorError)
    editor.addListener('sceneModified', this.onSceneModified)
    editor.addListener('saveProject', this.onSaveProject)
  }

  /**
   *  Dialog Context
   */

  showDialog = (DialogComponent, dialogProps = {}) => {
    this.setState({
      DialogComponent,
      dialogProps
    })
  }

  hideDialog = () => {
    this.setState({
      DialogComponent: null,
      dialogProps: {}
    })
  }

  dialogContext = {
    showDialog: this.showDialog,
    hideDialog: this.hideDialog
  }

  /**
   * Scene Event Handlers
   */

  onEditorError = (error) => {
    if (error['aborted']) {
      this.hideDialog()
      return
    }

    console.error(error)

    this.showDialog(ErrorDialog, {
      title: error.title || this.t('editor:error'),
      message: error.message || this.t('editor:errorMsg'),
      error
    })
  }

  onSceneModified = () => {
    this.updateModifiedState()
  }

  onProjectLoaded = () => {
    this.updateModifiedState()
  }

  updateSetting(key, value) {
    const settings = Object.assign(this.state.settingsContext.settings, { [key]: value })
    localStorage.setItem('editor-settings', JSON.stringify(settings))
    const editor = this.state.editor
    editor.settings = settings
    editor.emit('settingsChanged')
    this.setState({
      settingsContext: {
        ...this.state.settingsContext,
        settings
      }
    })
  }

  /**
   *  Project Actions
   */

  createProject = async () => {
    const { editor, parentSceneId } = this.state as any
    this.showDialog(ProgressDialog, {
      title: this.t('editor:generateScreenshot'),
      message: this.t('editor:generateScreenshotMsg')
    })

    // Wait for 5ms so that the ProgressDialog shows up.
    await new Promise((resolve) => setTimeout(resolve, 5))

    const blob = await editor.takeScreenshot(512, 320)

    const result: any = (await new Promise((resolve) => {
      this.showDialog(SaveNewProjectDialog, {
        thumbnailUrl: URL.createObjectURL(blob),
        initialName: editor.scene.name,
        onConfirm: resolve,
        onCancel: resolve
      })
    })) as any

    if (!result) {
      this.hideDialog()
      return null
    }

    const abortController = new AbortController()

    this.showDialog(ProgressDialog, {
      title: this.t('editor:saving'),
      message: this.t('editor:savingMsg'),
      cancelable: true,
      onCancel: () => {
        abortController.abort()
        this.hideDialog()
      }
    })

    editor.setProperty(editor.scene, 'name', result.name, false)
    editor.scene.setMetadata({ name: result.name })

    const project = await this.props.api.createProject(
      editor.scene,
      parentSceneId,
      blob,
      abortController.signal,
      this.showDialog,
      this.hideDialog
    )

    editor.sceneModified = false
    this.props.api.currentProjectID = project.project_id
    this.updateModifiedState(() => {
      this.setState({ creatingProject: true, project }, () => {
        this.props.history.replace(`/editor/projects/${project.project_id}`)
        this.setState({ creatingProject: false })
      })
    })

    return project
  }

  onNewProject = async () => {
    this.props.history.push('/editor/projects/new')
  }

  onOpenProject = () => {
    this.props.history.push('/editor/projects')
  }

  onDuplicateProject = async () => {
    const abortController = new AbortController()
    this.showDialog(ProgressDialog, {
      title: this.t('editor:duplicating'),
      message: this.t('editor:duplicatingMsg'),
      cancelable: true,
      onCancel: () => {
        abortController.abort()
        this.hideDialog()
      }
    })
    await new Promise((resolve) => setTimeout(resolve, 5))
    try {
      const editor = this.state.editor
      await this.createProject()
      editor.sceneModified = false
      this.updateModifiedState()

      this.hideDialog()
    } catch (error) {
      console.error(error)

      this.showDialog(ErrorDialog, {
        title: this.t('editor:savingError'),
        message: error.message || this.t('editor:savingErrorMsg')
      })
    }
  }

  onExportProject = async () => {
    const options = await new Promise((resolve) => {
      this.showDialog(ExportProjectDialog, {
        defaultOptions: Object.assign({}, Editor.DefaultExportOptions),
        onConfirm: resolve,
        onCancel: resolve
      })
    })

    if (!options) {
      this.hideDialog()
      return
    }

    const abortController = new AbortController()

    this.showDialog(ProgressDialog, {
      title: this.t('editor:exporting'),
      message: this.t('editor:exportingMsg'),
      cancelable: true,
      onCancel: () => abortController.abort()
    })

    try {
      const editor = this.state.editor

      const { glbBlob } = await editor.exportScene(abortController.signal, options)

      this.hideDialog()

      const el = document.createElement('a')
      el.download = editor.scene.name + '.glb'
      el.href = URL.createObjectURL(glbBlob)
      document.body.appendChild(el)
      el.click()
      document.body.removeChild(el)
    } catch (error) {
      if (error['aborted']) {
        this.hideDialog()
        return
      }

      console.error(error)

      this.showDialog(ErrorDialog, {
        title: this.t('editor:exportingError'),
        message: error.message || this.t('editor:exportingErrorMsg'),
        error
      })
    }
  }

  onImportLegacyProject = async () => {
    const confirm = await new Promise((resolve) => {
      this.showDialog(ConfirmDialog, {
        title: this.t('editor:importLegacy'),
        message: this.t('editor:importLegacyMsg'),
        onConfirm: () => resolve(true),
        onCancel: () => resolve(false)
      })
    })

    this.hideDialog()

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

          if (json.metadata) {
            delete json.metadata.sceneUrl
            delete json.metadata.sceneId
          }

          this.importProject(json)
        }
        fileReader.readAsText(el.files[0])
      }
    }
    el.click()
  }

  onExportLegacyProject = async () => {
    const { editor, project } = this.state
    const projectFile = await editor.scene.serialize(project.project_id)

    if (projectFile.metadata) {
      delete projectFile.metadata.sceneUrl
      delete projectFile.metadata.sceneId
    }

    const projectJson = JSON.stringify(projectFile)
    const projectBlob = new Blob([projectJson])
    const el = document.createElement('a')
    const fileName = this.state.editor.scene.name.toLowerCase().replace(/\s+/g, '-')
    el.download = fileName + '.world'
    el.href = URL.createObjectURL(projectBlob)
    document.body.appendChild(el)
    el.click()
    document.body.removeChild(el)
  }

  onSaveProject = async () => {
    const abortController = new AbortController()

    this.showDialog(ProgressDialog, {
      title: this.t('editor:saving'),
      message: this.t('editor:savingMsg'),
      cancelable: true,
      onCancel: () => {
        abortController.abort()
        this.hideDialog()
      }
    })

    // Wait for 5ms so that the ProgressDialog shows up.
    await new Promise((resolve) => setTimeout(resolve, 5))

    try {
      const { editor, project } = this.state
      if (project) {
        const newProject = await this.props.api.saveProject(
          project.project_id,
          editor,
          abortController.signal,
          this.showDialog,
          this.hideDialog
        )

        this.setState({ project: newProject })
      } else {
        await this.createProject()
      }

      editor.sceneModified = false
      this.updateModifiedState()

      this.hideDialog()
    } catch (error) {
      console.error(error)

      this.showDialog(ErrorDialog, {
        title: this.t('editor:savingError'),
        message: error.message || this.t('editor:savingErrorMsg')
      })
    }
  }

  // Currently doesn't work
  onPublishProject = async (): Promise<void> => {
    try {
      const editor = this.state.editor
      let project = this.state.project

      if (!project) {
        project = await this.createProject()
      }

      if (!project) {
        return
      }

      project = await this.props.api.publishProject(project, editor, this.showDialog, this.hideDialog)

      if (!project) {
        return
      }

      editor.sceneModified = false
      this.updateModifiedState()

      this.setState({ project })
    } catch (error) {
      if (error['abortedsettingsContext']) {
        this.hideDialog()
        return
      }

      console.error(error)
      this.showDialog(ErrorDialog, {
        title: this.t('editor:publishingError'),
        message: error.message || this.t('editor:publishingErrorMsg'),
        error
      })
    }
  }

  getSceneId() {
    const { editor, project } = this.state as any
    return (
      (project && project.scene && project.scene.scene_id) || (editor.scene.metadata && editor.scene.metadata.sceneId)
    )
  }

  onOpenScene = () => {
    const sceneId = this.getSceneId()

    if (sceneId) {
      const url = this.props.api.getSceneUrl(sceneId)
      window.open(url)
    }
  }

  render() {
    const { DialogComponent, dialogProps, modified, settingsContext, editor } = this.state
    const toolbarMenu = this.generateToolbarMenu()
    const isPublishedScene = !!this.getSceneId()
    const locations = this.props.adminState.get('locations').get('locations')
    let assigneeScene
    if (locations) {
      locations.forEach((element) => {
        if (element.sceneId === this.state.queryParams.get('projectId')) {
          assigneeScene = element
        }
      })
    }

    let defaultLayout = {
      dockbox: {
        mode: 'horizontal' as DockMode,
        children: [
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
          <EditorContextProvider value={editor}>
            <DialogContextProvider value={this.dialogContext}>
              <DndProvider backend={HTML5Backend}>
                <DragLayer />
                {toolbarMenu && (
                  <ToolBar
                    menu={toolbarMenu}
                    editor={editor}
                    onPublish={this.onPublishProject}
                    isPublishedScene={isPublishedScene}
                    onOpenScene={this.onOpenScene}
                    queryParams={assigneeScene}
                  />
                )}
                <WorkspaceContainer>
                  <ViewportPanelContainer />
                  <DockContainer>
                    <DockLayout
                      defaultLayout={defaultLayout}
                      style={{ pointerEvents: 'none', position: 'absolute', left: 6, top: 74, right: 6, bottom: 6 }}
                    />
                  </DockContainer>
                </WorkspaceContainer>
                <Modal
                  ariaHideApp={false}
                  isOpen={!!DialogComponent}
                  onRequestClose={this.hideDialog}
                  shouldCloseOnOverlayClick={false}
                  className="Modal"
                  overlayClassName="Overlay"
                >
                  {DialogComponent && (
                    <DialogComponent onConfirm={this.hideDialog} onCancel={this.hideDialog} {...dialogProps} />
                  )}
                </Modal>
              </DndProvider>
            </DialogContextProvider>
          </EditorContextProvider>
        </SettingsContextProvider>
      </StyledEditorContainer>
    )
  }
}

const mapStateToProps = (state: any): any => {
  return {
    adminState: selectAdminState(state)
  }
}

const mapDispatchToProps = (dispatch: Dispatch): any => ({
  fetchAdminLocations: bindActionCreators(fetchAdminLocations, dispatch),
  fetchAdminScenes: bindActionCreators(fetchAdminScenes, dispatch),
  fetchLocationTypes: bindActionCreators(fetchLocationTypes, dispatch)
})

export default withTranslation()(
  withRouter(withApi(connect(mapStateToProps, mapDispatchToProps)(EditorContainer as any)))
)
