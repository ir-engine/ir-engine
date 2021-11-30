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
import { ControlManager } from './ControlManager'
import { dispatchLocal } from '@xrengine/engine/src/networking/functions/dispatchFrom'
import { EditorActions } from '../functions/EditorActions'

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
    // this.dispose()

    await ProjectManager.instance.init()

    ControlManager.instance.dispose()
    const errors = await SceneManager.instance.initializeScene(projectFile)

    CommandManager.instance.executeCommand(EditorCommands.ADD_OBJECTS, Engine.scene)
    CommandManager.instance.executeCommand(EditorCommands.REPLACE_SELECTION, [])
    CommandManager.instance.history.clear()

    CommandManager.instance.emitEvent(EditorEvents.PROJECT_LOADED)
    dispatchLocal(EditorActions.sceneGraphChanged.action({}) as any)

    CommandManager.instance.addListener(
      EditorEvents.OBJECTS_CHANGED.toString(),
      SceneManager.instance.onEmitSceneModified
    )
    EditorActions.sceneGraphChanged.callbackFunctions.add(SceneManager.instance.onEmitSceneModified)
    if (errors && errors.length > 0) {
      const error = new MultiError('Errors loading project', errors)
      CommandManager.instance.emitEvent(EditorEvents.ERROR, error)
      throw error
    }
  }

  dispose() {
    CommandManager.instance.removeListener(
      EditorEvents.OBJECTS_CHANGED.toString(),
      SceneManager.instance.onEmitSceneModified
    )
    EditorActions.sceneGraphChanged.callbackFunctions.delete(SceneManager.instance.onEmitSceneModified)

    CacheManager.clearCaches()
    SceneManager.instance.dispose()
    ControlManager.instance.dispose()
  }
}
