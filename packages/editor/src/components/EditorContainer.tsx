import { Archive, ProjectDiagram } from '@styled-icons/fa-solid'
import { withRouter } from 'react-router-dom'
import { SlidersH } from '@styled-icons/fa-solid/SlidersH'
import { LocationService } from '@xrengine/client-core/src/admin/state/LocationService'
import { DockLayout, DockMode, LayoutData } from 'rc-dock'
import 'rc-dock/dist/rc-dock.css'
import React, { Component } from 'react'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { withTranslation } from 'react-i18next'
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
import PerformanceCheckDialog from './dialogs/PerformanceCheckDialog'
import PublishDialog from './dialogs/PublishDialog'
import PublishedSceneDialog from './dialogs/PublishedSceneDialog'
import i18n from 'i18next'
import FileBrowserPanel from './assets/FileBrowserPanel'
import { cmdOrCtrlString } from '../functions/utils'
import configs from './configs'
import { accessLocationState } from '@xrengine/client-core/src/admin/state/LocationState'
import { accessSceneState } from '@xrengine/client-core/src/admin/state/SceneState'
import { SceneService } from '@xrengine/client-core/src/admin/state/SceneService'
import { CommandManager } from '../managers/CommandManager'
import EditorCommands from '../constants/EditorCommands'
import EditorEvents from '../constants/EditorEvents'
import { SceneManager } from '../managers/SceneManager'
import { ControlManager } from '../managers/ControlManager'
import { NodeManager, registerPredefinedNodes } from '../managers/NodeManager'
import { registerPredefinedSources, SourceManager } from '../managers/SourceManager'
import { CacheManager } from '../managers/CacheManager'
import { ProjectManager } from '../managers/ProjectManager'
import { SceneDetailInterface } from '@xrengine/common/src/interfaces/SceneInterface'
import { client } from '@xrengine/client-core/src/feathers'
import { upload } from '@xrengine/client-core/src/util/upload'
import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'

const maxUploadSize = 25

/**
 * getSceneUrl used to create url for the scene.
 *
 * @author Robert Long
 * @param  {any} sceneId
 * @return {string}         [url]
 */
export const getSceneUrl = (sceneId): string => `${configs.APP_URL}/scenes/${sceneId}`

/**
 * publishProject is used to publish project, firstly we save the project the publish.
 *
 * @author Robert Long
 * @param  {any}  project
 * @param  {any}  showDialog
 * @param  {any}  hideDialog
 * @return {Promise}            [returns published project data]
 */
export const publishProject = async (project, showDialog, hideDialog?): Promise<any> => {
  let screenshotUrl
  try {
    const scene = SceneManager.instance.scene

    const abortController = new AbortController()
    const signal = abortController.signal

    // Save the scene if it has been modified.
    if (SceneManager.instance.sceneModified) {
      showDialog(ProgressDialog, {
        title: i18n.t('editor:saving'),
        message: i18n.t('editor:savingMsg'),
        cancelable: true,
        onCancel: () => {
          abortController.abort()
        }
      })
      // saving project.
      project = await saveScene(project.scene_id, signal)

      if (signal.aborted) {
        const error = new Error(i18n.t('editor:errors.publishProjectAborted'))
        error['aborted'] = true
        throw error
      }
    }

    showDialog(ProgressDialog, {
      title: i18n.t('editor:generateScreenshot'),
      message: i18n.t('editor:generateScreenshotMsg')
    })

    // Wait for 5ms so that the ProgressDialog shows up.
    await new Promise((resolve) => setTimeout(resolve, 5))

    // Take a screenshot of the scene from the current camera position to use as the thumbnail
    const screenshot = await SceneManager.instance.takeScreenshot()
    console.log('Screenshot is')
    console.log(screenshot)
    const { blob: screenshotBlob, cameraTransform: screenshotCameraTransform } = screenshot
    console.log('screenshotBlob is')
    console.log(screenshotBlob)

    screenshotUrl = URL.createObjectURL(screenshotBlob)

    console.log('Screenshot url is', screenshotUrl)

    if (signal.aborted) {
      const error = new Error(i18n.t('editor:errors.publishProjectAborted'))
      error['aborted'] = true
      throw error
    }

    let { name } = scene.metadata

    name = (project.scene && project.scene.name) || name || SceneManager.instance.scene.name

    // Display the publish dialog and wait for the user to submit / cancel
    const publishParams: any = await new Promise((resolve) => {
      showDialog(PublishDialog, {
        screenshotUrl,
        initialSceneParams: {
          name
        },
        onCancel: () => resolve(null),
        onPublish: resolve
      })
    })

    // User clicked cancel
    if (!publishParams) {
      URL.revokeObjectURL(screenshotUrl)
      hideDialog()
      const error = new Error(i18n.t('editor:errors.publishProjectAborted'))
      error['aborted'] = true
      throw error
    }

    // Update the scene with the metadata from the publishDialog
    scene.setMetadata({
      name: publishParams.name,
      previewCameraTransform: screenshotCameraTransform
    })

    showDialog(ProgressDialog, {
      title: i18n.t('editor:publishingScene'),
      message: i18n.t('editor:publishingSceneMsg'),
      cancelable: true,
      onCancel: () => {
        abortController.abort()
      }
    })

    // Clone the existing scene, process it for exporting, and then export as a glb blob
    const { glbBlob, chunks } = await SceneManager.instance.exportScene({ scores: true })

    if (signal.aborted) {
      const error = new Error(i18n.t('editor:errors.publishProjectAborted'))
      error['aborted'] = true
      throw error
    }

    const performanceCheckResult = await new Promise((resolve) => {
      showDialog(PerformanceCheckDialog, {
        chunks,
        onCancel: () => resolve(false),
        onConfirm: () => resolve(true)
      })
    })

    if (!performanceCheckResult) {
      const error = new Error(i18n.t('editor:errors.publishProjectAborted'))
      error['aborted'] = true
      throw error
    }

    // Serialize Editor scene
    const serializedScene = await SceneManager.instance.scene.serialize(project.scene_id)
    const sceneBlob = new Blob([JSON.stringify(serializedScene)], { type: 'application/json' })

    showDialog(ProgressDialog, {
      title: i18n.t('editor:publishingScene'),
      message: i18n.t('editor:publishingSceneMsg'),
      cancelable: true,
      onCancel: () => {
        abortController.abort()
      }
    })

    const size = glbBlob.size / 1024 / 1024
    const maxSize = maxUploadSize
    if (size > maxSize) {
      throw new Error(i18n.t('editor:errors.sceneTooLarge', { size: size.toFixed(2), maxSize }))
    }

    showDialog(ProgressDialog, {
      title: i18n.t('editor:publishingScene'),
      message: i18n.t('editor:uploadingThumbnailMsg'),
      cancelable: true,
      onCancel: () => {
        abortController.abort()
      }
    })

    // Upload the screenshot file
    const {
      file_id: screenshotId,
      meta: { access_token: screenshotToken }
    } = (await upload(screenshotBlob, undefined, abortController.signal)) as any

    if (signal.aborted) {
      const error = new Error(i18n.t('editor:errors.publishProjectAborted'))
      error['aborted'] = true
      throw error
    }

    const {
      file_id: glbId,
      meta: { access_token: glbToken }
    }: any = await upload(glbBlob, (uploadProgress) => {
      showDialog(
        ProgressDialog,
        {
          title: i18n.t('editor:publishingScene'),
          message: i18n.t('editor:uploadingSceneMsg', { percentage: Math.floor(uploadProgress * 100) }),
          onCancel: () => {
            abortController.abort()
          }
        },
        abortController.signal
      )
    })

    if (signal.aborted) {
      const error = new Error(i18n.t('editor:errors.publishProjectAborted'))
      error['aborted'] = true
      throw error
    }

    const {
      file_id: sceneFileId,
      meta: { access_token: sceneFileToken }
    } = (await upload(sceneBlob, undefined, abortController.signal)) as any

    if (signal.aborted) {
      const error = new Error(i18n.t('editor:errors.publishProjectAborted'))
      error['aborted'] = true
      throw error
    }

    const sceneParams = {
      screenshot_file_id: screenshotId,
      screenshot_file_token: screenshotToken,
      model_file_id: glbId,
      model_file_token: glbToken,
      scene_file_id: sceneFileId,
      scene_file_token: sceneFileToken,
      name: publishParams.name
    }

    try {
      project = await client.service(`/publish-scene/${project.scene_id}`).create({ scene: sceneParams })
    } catch (error) {
      throw new Error(error)
    }

    showDialog(PublishedSceneDialog, {
      sceneName: sceneParams.name,
      screenshotUrl,
      sceneUrl: getSceneUrl(project.scene.scene_id),
      onConfirm: () => {
        hideDialog()
      }
    })
  } finally {
    if (screenshotUrl) {
      URL.revokeObjectURL(screenshotUrl)
    }
  }

  return project
}

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
  t: any
  match: any
  location: any
  history: any
}

type EditorContainerState = {
  project: SceneDetailInterface
  parentSceneId: null
  // templateUrl: any;
  settingsContext: any
  // error: null;
  creatingProject: any
  DialogComponent: any
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
  constructor(props) {
    super(props)
    let settings = defaultSettings
    const storedSettings = localStorage.getItem('editor-settings')
    if (storedSettings) {
      settings = JSON.parse(storedSettings)
    }

    ProjectManager.buildProjectManager(settings)
    CommandManager.buildCommandManager()
    SceneManager.buildSceneManager()
    ControlManager.buildControlManager()
    NodeManager.buildNodeManager(SceneManager.instance.scene)
    SourceManager.buildSourceManager()
    CacheManager.init()

    registerPredefinedNodes()
    registerPredefinedSources()

    // ProjectManager.instance.initializeFeathersClient(getToken())

    CommandManager.instance.addListener(EditorEvents.RENDERER_INITIALIZED.toString(), this.setDebuginfo)
    CommandManager.instance.addListener(EditorEvents.PROJECT_LOADED.toString(), this.onProjectLoaded)
    CommandManager.instance.addListener(EditorEvents.ERROR.toString(), this.onEditorError)
    CommandManager.instance.addListener(EditorEvents.SAVE_PROJECT.toString(), this.onSaveProject)

    this.state = {
      // error: null,
      project: null,
      parentSceneId: null,
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
    if (accessLocationState().locations.updateNeeded.value === true) {
      LocationService.fetchAdminLocations()
    }
    if (accessSceneState().scenes.updateNeeded.value === true) {
      SceneService.fetchAdminScenes()
    }
    if (accessLocationState().locationTypes.updateNeeded.value === true) {
      LocationService.fetchLocationTypes()
    }
    const pathParams = this.state.pathParams
    const queryParams = this.state.queryParams
    const sceneId = pathParams.get('sceneId')

    if (sceneId === 'new') {
      if (queryParams.has('template')) {
        this.loadProjectTemplate(queryParams.get('template'))
      } else if (queryParams.has('sceneId')) {
        this.loadScene(queryParams.get('sceneId'))
      } else {
        this.loadProjectTemplate(defaultTemplateUrl)
      }
    } else if (sceneId === 'tutorial') {
      this.loadProjectTemplate(tutorialTemplateUrl)
    } else {
      this.loadProject(sceneId)
    }
  }

  componentDidUpdate(prevProps: EditorContainerProps) {
    if (this.props.location.pathname !== prevProps.location.pathname && !this.state.creatingProject) {
      const prevSceneId = prevProps.match.params.sceneId
      const queryParams = new Map(new URLSearchParams(window.location.search).entries())
      this.setState({
        queryParams
      })
      const pathParams = this.state.pathParams
      const sceneId = pathParams.get('sceneId')
      let templateUrl = null

      if (sceneId === 'new' && !queryParams.has('sceneId')) {
        templateUrl = queryParams.get('template') || defaultTemplateUrl
      } else if (sceneId === 'tutorial') {
        templateUrl = tutorialTemplateUrl
      }

      if (sceneId === 'new' || sceneId === 'tutorial') {
        this.loadProjectTemplate(templateUrl)
      } else if (prevSceneId !== 'tutorial' && prevSceneId !== 'new') {
        this.loadProject(sceneId)
      }
    }
  }

  componentWillUnmount() {
    CommandManager.instance.removeListener(EditorEvents.SAVE_PROJECT.toString(), this.onSaveProject)
    CommandManager.instance.removeListener(EditorEvents.ERROR.toString(), this.onEditorError)
    CommandManager.instance.removeListener(EditorEvents.PROJECT_LOADED.toString(), this.onProjectLoaded)
    ProjectManager.instance.dispose()
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

    try {
      if (templateFile.metadata) {
        delete templateFile.metadata.sceneUrl
        delete templateFile.metadata.sceneId
      }

      await ProjectManager.instance.loadProject(templateFile)

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

    try {
      const scene: any = await getScene(sceneId)
      console.warn('loadScene:scene', scene)
      const projectFile = scene.data

      await ProjectManager.instance.loadProject(projectFile)

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

    try {
      await ProjectManager.instance.loadProject(projectFile)

      SceneManager.instance.sceneModified = true
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

  async loadProject(sceneId) {
    this.setState({
      project: null,
      parentSceneId: null
    })

    this.showDialog(ProgressDialog, {
      title: this.t('editor:loading'),
      message: this.t('editor:loadingMsg')
    })

    let project: SceneDetailInterface

    try {
      project = await getScene(sceneId)
      ProjectManager.instance.ownedFileIds = JSON.parse(project.ownedFileIds)
      globalThis.currentSceneID = project.scene_id

      const projectIndex = project.scene_url.split('collection/')[1]
      const projectFile = await client.service(`collection`).get(projectIndex, {
        headers: {
          'content-type': 'application/json'
        }
      })

      await ProjectManager.instance.loadProject(projectFile)

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
    const nextModified = SceneManager.instance.sceneModified && !this.state.creatingProject

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

  setDebuginfo = () => {
    const gl = Engine.renderer.getContext()

    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info')

    let webglVendor = 'Unknown'
    let webglRenderer = 'Unknown'

    if (debugInfo) {
      webglVendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL)
      webglRenderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)
    }

    CommandManager.instance.removeListener(EditorEvents.RENDERER_INITIALIZED.toString(), this.setDebuginfo)
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

  onProjectLoaded = () => {
    this.updateModifiedState()
  }

  updateSetting(key, value) {
    const settings = Object.assign(this.state.settingsContext.settings, { [key]: value })
    localStorage.setItem('editor-settings', JSON.stringify(settings))
    ProjectManager.instance.settings = settings
    CommandManager.instance.emitEvent(EditorEvents.SETTINGS_CHANGED)
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
    const { parentSceneId } = this.state as any
    this.showDialog(ProgressDialog, {
      title: this.t('editor:generateScreenshot'),
      message: this.t('editor:generateScreenshotMsg')
    })

    // Wait for 5ms so that the ProgressDialog shows up.
    await new Promise((resolve) => setTimeout(resolve, 5))

    const blob = await SceneManager.instance.takeScreenshot(512, 320)

    const result: any = (await new Promise((resolve) => {
      this.showDialog(SaveNewProjectDialog, {
        thumbnailUrl: URL.createObjectURL(blob),
        initialName: SceneManager.instance.scene.name,
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

    CommandManager.instance.executeCommand(EditorCommands.MODIFY_PROPERTY, SceneManager.instance.scene, {
      properties: { name: result.name }
    })
    SceneManager.instance.scene.setMetadata({ name: result.name })

    const project = await createScene(
      SceneManager.instance.scene,
      parentSceneId,
      blob,
      abortController.signal,
      this.showDialog,
      this.hideDialog
    )

    SceneManager.instance.sceneModified = false
    globalThis.currentSceneID = project.scene_id

    const pathParams = this.state.pathParams
    pathParams.set('sceneId', project.scene_id)
    this.updateModifiedState(() => {
      this.setState({ creatingProject: true, project, pathParams }, () => {
        this.props.history.replace(`/editor/${project.scene_id}`)
        this.setState({ creatingProject: false })
      })
    })

    return project
  }

  onNewProject = async () => {
    this.props.history.push('/editor/new')
  }

  onOpenProject = () => {
    this.props.history.push('/editor')
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
      const newProject = await this.createProject()
      SceneManager.instance.sceneModified = false
      this.updateModifiedState()

      this.hideDialog()
      const pathParams = this.state.pathParams
      pathParams.set('sceneId', newProject.scene_id)
      this.setState({ pathParams: pathParams })
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
        defaultOptions: Object.assign({}, SceneManager.DefaultExportOptions),
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
      const { glbBlob } = await SceneManager.instance.exportScene(options)

      this.hideDialog()

      const el = document.createElement('a')
      el.download = SceneManager.instance.scene.name + '.glb'
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
    const { project } = this.state
    const projectFile = await SceneManager.instance.scene.serialize(project.scene_id)

    if (projectFile.metadata) {
      delete projectFile.metadata.sceneUrl
      delete projectFile.metadata.sceneId
    }

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
      const { project } = this.state
      if (project) {
        const newProject = await saveScene(project.scene_id, abortController.signal)

        this.setState({ project: newProject })
        const pathParams = this.state.pathParams
        pathParams.set('sceneId', newProject.scene_id)
        this.setState({ pathParams: pathParams })
      } else {
        await this.createProject()
      }

      SceneManager.instance.sceneModified = false
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
      let project = this.state.project

      if (!project) {
        project = await this.createProject()
      }

      if (!project) {
        return
      }

      project = await publishProject(project, this.showDialog, this.hideDialog)

      if (!project) {
        return
      }

      SceneManager.instance.sceneModified = false
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
    const { project } = this.state as any
    return (
      (project && project.scene && project.scene.scene_id) ||
      (SceneManager.instance.scene &&
        SceneManager.instance.scene.metadata &&
        SceneManager.instance.scene.metadata.sceneId)
    )
  }

  onOpenScene = () => {
    const sceneId = this.getSceneId()

    if (sceneId) {
      const url = getSceneUrl(sceneId)
      window.open(url)
    }
  }

  render() {
    const { DialogComponent, dialogProps, settingsContext } = this.state
    const toolbarMenu = this.generateToolbarMenu()
    // const isPublishedScene = !!this.getSceneId()
    // const locations = useLocationState().locations.locations.value
    // let assigneeScene
    // if (locations) {
    //   locations.forEach((element) => {
    //     if (element.sceneId === this.state.queryParams.get('sceneId')) {
    //       assigneeScene = element
    //     }
    //   })
    // }

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
                    id: 'fileBrowserPanel',
                    title: (
                      <PanelDragContainer>
                        <PanelIcon as={Archive} size={12} />
                        <PanelTitle>File Browser</PanelTitle>
                      </PanelDragContainer>
                    ),
                    content: <FileBrowserPanel />
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
          <DialogContextProvider value={this.dialogContext}>
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
        </SettingsContextProvider>
      </StyledEditorContainer>
    )
  }
}

export default withTranslation()(withRouter(EditorContainer))
