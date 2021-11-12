import TransformGizmo from '@xrengine/engine/src/scene/classes/TransformGizmo'
import { MultiError } from '@xrengine/client-core/src/util/errors'
import { loadEnvironmentMap } from '../components/EnvironmentMap'
import ErrorIcon from '../classes/ErrorIcon'
import EditorCommands from '../constants/EditorCommands'
import EditorEvents from '../constants/EditorEvents'
import { CacheManager } from './CacheManager'
import { CommandManager } from './CommandManager'
import { NodeManager } from './NodeManager'
import { SceneManager } from './SceneManager'
import { SceneJson } from '@xrengine/common/src/interfaces/SceneInterface'
import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'

export class ProjectManager {
  static instance: ProjectManager = new ProjectManager()

  project: any
  projectLoaded: boolean
  initializing: boolean
  initialized: boolean

  constructor() {
    this.project = null

    this.projectLoaded = false

    this.initializing = false
    this.initialized = false
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
  async loadProject(projectFile: SceneJson) {
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

    CommandManager.instance.executeCommand(EditorCommands.ADD_OBJECTS, Engine.scene)
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
    SceneManager.instance.dispose()
  }
}
