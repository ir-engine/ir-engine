import TransformGizmo from '@xrengine/engine/src/scene/classes/TransformGizmo'
import { MultiError } from '../functions/errors'
import { loadEnvironmentMap } from '../components/EnvironmentMap'
import ErrorIcon from '../classes/ErrorIcon'
import EditorCommands from '../constants/EditorCommands'
import EditorEvents from '../constants/EditorEvents'
import { CacheManager } from './CacheManager'
import { CommandManager } from './CommandManager'
import { NodeManager } from './NodeManager'
import { SceneManager } from './SceneManager'
import { SystemUpdateType } from '@xrengine/engine/src/ecs/functions/SystemUpdateType'
import { InitializeOptions, EngineSystemPresets } from '@xrengine/engine/src/initializationOptions'
import { initializeEngine } from '@xrengine/engine/src/initializeEngine'

export class ProjectManager {
  static instance: ProjectManager

  settings: any
  project: any
  projectLoaded: boolean
  initializing: boolean
  initialized: boolean

  ownedFileIds: {} //contain file ids of the files that are also stored in Db as ownedFiles
  currentOwnedFileIds: {}

  static buildProjectManager(settings?: any) {
    this.instance = new ProjectManager(settings)
  }

  constructor(settings = {}) {
    this.settings = settings
    this.project = null

    this.projectLoaded = false

    this.initializing = false
    this.initialized = false

    this.ownedFileIds = {}
    this.currentOwnedFileIds = {}

    const initializationOptions: InitializeOptions = {
      type: EngineSystemPresets.EDITOR,
      publicPath: location.origin,
      systems: [
        {
          systemModulePromise: import('../renderer/Renderer'),
          type: SystemUpdateType.PRE_RENDER,
          args: { enabled: true }
        }
      ]
    }

    // Engine will be initialized
    initializeEngine(initializationOptions).then(() => {})
  }

  /**
   * init called when component get initialized.
   *
   * @author Robert Long
   * @return {Promise}         [void]
   */
  async init(): Promise<void> {
    // check if component is already initialized then return
    if (this.initialized || this.initializing) return

    this.initializing = true

    const tasks = [loadEnvironmentMap(), ErrorIcon.load(), TransformGizmo.load()]

    for (const NodeConstructor of NodeManager.instance.nodeTypes) {
      tasks.push(NodeConstructor.load())
    }

    await Promise.all(tasks)

    this.initialized = true
  }

  /**
   * Function loadProject used to load the scene.
   *
   * @author Robert Long
   * @param  {any}  projectFile [contains scene data]
   * @return {Promise}             [scene to render]
   */
  async loadProject(projectFile) {
    await ProjectManager.instance.init()
    CommandManager.instance.removeListener(
      EditorEvents.OBJECTS_CHANGED.toString(),
      SceneManager.instance.onEmitSceneModified
    )
    CommandManager.instance.removeListener(
      EditorEvents.SCENE_GRAPH_CHANGED.toString(),
      SceneManager.instance.onEmitSceneModified
    )

    CacheManager.clearCaches()

    const errors = await SceneManager.instance.initializeScene(projectFile)

    // TODO: Change Commands to be competible with ECS change
    // CommandManager.instance.executeCommand(EditorCommands.ADD_OBJECTS, SceneManager.instance.scene)
    CommandManager.instance.executeCommand(EditorCommands.REPLACE_SELECTION, [])
    CommandManager.instance.history.clear()

    CommandManager.instance.emitEvent(EditorEvents.PROJECT_LOADED)
    CommandManager.instance.emitEvent(EditorEvents.SCENE_GRAPH_CHANGED)

    CommandManager.instance.addListener(
      EditorEvents.OBJECTS_CHANGED.toString(),
      SceneManager.instance.onEmitSceneModified
    )
    CommandManager.instance.addListener(
      EditorEvents.SCENE_GRAPH_CHANGED.toString(),
      SceneManager.instance.onEmitSceneModified
    )

    if (errors && errors.length > 0) {
      const error = new MultiError('Errors loading project', errors)
      CommandManager.instance.emitEvent(EditorEvents.ERROR, error)
      throw error
    }
  }

  dispose() {
    CacheManager.clearCaches()

    if (SceneManager.instance.renderer) {
      SceneManager.instance.renderer.dispose()
    }
  }
}
