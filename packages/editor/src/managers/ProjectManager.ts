import { MultiError } from '@xrengine/client-core/src/util/errors'
import { SceneJson } from '@xrengine/common/src/interfaces/SceneInterface'
import { AnimationManager } from '@xrengine/engine/src/avatar/AnimationManager'
import { unloadScene } from '@xrengine/engine/src/ecs/functions/EngineFunctions'
import { useWorld } from '@xrengine/engine/src/ecs/functions/SystemHooks'
import TransformGizmo from '@xrengine/engine/src/scene/classes/TransformGizmo'

import ErrorIcon from '../classes/ErrorIcon'
import EditorCommands from '../constants/EditorCommands'
import EditorEvents from '../constants/EditorEvents'
import { CacheManager } from './CacheManager'
import { CommandManager } from './CommandManager'
import { ControlManager } from './ControlManager'
import { SceneManager } from './SceneManager'

export class ProjectManager {
  static instance: ProjectManager = new ProjectManager()

  initializing: boolean
  initialized: boolean

  constructor() {
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

    const tasks = [ErrorIcon.load(), TransformGizmo.load(), AnimationManager.instance.getAnimations()]

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
  async loadProjectScene(projectFile: SceneJson) {
    this.dispose()

    await ProjectManager.instance.init()

    ControlManager.instance.dispose()
    const errors = await SceneManager.instance.initializeScene(projectFile)

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
    CommandManager.instance.removeListener(
      EditorEvents.OBJECTS_CHANGED.toString(),
      SceneManager.instance.onEmitSceneModified
    )
    CommandManager.instance.removeListener(
      EditorEvents.SCENE_GRAPH_CHANGED.toString(),
      SceneManager.instance.onEmitSceneModified
    )

    CacheManager.clearCaches()
    SceneManager.instance.dispose()
    ControlManager.instance.dispose()
  }
}
