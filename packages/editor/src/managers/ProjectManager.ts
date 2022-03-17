import { store } from '@xrengine/client-core/src/store'
import { MultiError } from '@xrengine/client-core/src/util/errors'
import { SceneJson } from '@xrengine/common/src/interfaces/SceneInterface'
import { AnimationManager } from '@xrengine/engine/src/avatar/AnimationManager'
import TransformGizmo from '@xrengine/engine/src/scene/classes/TransformGizmo'

import ErrorIcon from '../classes/ErrorIcon'
import EditorCommands from '../constants/EditorCommands'
import { EditorErrorAction } from '../services/EditorErrorServices'
import { EditorAction } from '../services/EditorServices'
import { SelectionAction } from '../services/SelectionServices'
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

    const tasks = [ErrorIcon.load(), TransformGizmo.load(), AnimationManager.instance.getDefaultAnimations()]

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

    store.dispatch(EditorAction.projectLoaded(true))
    store.dispatch(SelectionAction.changedSceneGraph())

    if (errors && errors.length > 0) {
      const error = new MultiError('Errors loading project', errors)
      store.dispatch(EditorErrorAction.throwError(error))
      throw error
    }
  }

  dispose() {
    CacheManager.clearCaches()
    SceneManager.instance.dispose()
    ControlManager.instance.dispose()
    store.dispatch(EditorAction.projectLoaded(false))
  }
}
