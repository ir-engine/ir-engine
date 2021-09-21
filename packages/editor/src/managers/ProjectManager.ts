import { Vector3 } from 'three'
import { Application, feathers } from '@feathersjs/feathers'
import rest from '@feathersjs/rest-client'
import { Config } from '@xrengine/common/src/config'
import TransformGizmo from '@xrengine/engine/src/scene/classes/TransformGizmo'
import { MultiError } from '@xrengine/engine/src/scene/functions/errors'
import { loadEnvironmentMap } from '../components/EnvironmentMap'
import ErrorIcon from '../classes/ErrorIcon'
import EditorCommands from '../constants/EditorCommands'
import EditorEvents from '../constants/EditorEvents'
import SceneNode from '../nodes/SceneNode'
import { CacheManager } from './CacheManager'
import { CommandManager } from './CommandManager'
import { ControlManager } from './ControlManager'
import { NodeManager } from './NodeManager'
import { SceneManager } from './SceneManager'

export class ProjectManager {
  static instance: ProjectManager

  settings: any
  project: any
  projectLoaded: boolean
  initializing: boolean
  initialized: boolean

  feathersClient: Application<any, any>
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
  }

  /**
   * A Function to Initialize the FeathersClient with the auth token
   * @author Abhishek Pathak
   */
  initializeFeathersClient(token) {
    this.feathersClient = feathers()
    const headers = {
      authorization: `Bearer ${token}`
    }
    const restClient = rest(Config.publicRuntimeConfig.apiServer).fetch(window.fetch.bind(window), { headers })
    this.feathersClient.configure(restClient)
  }

  /**
   * init called when component get initialized.
   *
   * @author Robert Long
   * @return {Promise}         [void]
   */
  async init(): Promise<void> {
    // check if component is already initialized then return
    if (this.initialized) return

    // check if component is initializing
    if (this.initializing) {
      return new Promise((resolve, reject) => {
        let cleanup = null

        const onInitialize = () => {
          resolve()
          cleanup()
        }

        const onError = (err) => {
          reject(err)
          cleanup()
        }
        // removing listeners
        cleanup = () => {
          CommandManager.instance.removeListener(EditorEvents.INITIALIZED.toString(), onInitialize)
          CommandManager.instance.removeListener(EditorEvents.ERROR.toString(), onError)
        }
        // adding listeners
        CommandManager.instance.addListener(EditorEvents.INITIALIZED.toString(), onInitialize)
        CommandManager.instance.addListener(EditorEvents.ERROR.toString(), onError)
      })
    }

    this.initializing = true

    const tasks = [loadEnvironmentMap(), ErrorIcon.load(), TransformGizmo.load()]

    for (const NodeConstructor of NodeManager.instance.nodeTypes) {
      tasks.push(NodeConstructor.load())
    }

    await Promise.all(tasks)

    ControlManager.instance.initControls()

    globalThis.renderer = SceneManager.instance.renderer as any

    requestAnimationFrame(SceneManager.instance.update)

    this.initialized = true

    CommandManager.instance.emitEvent(EditorEvents.INITIALIZED)
  }

  /**
   * Function loadProject used to load the scene.
   *
   * @author Robert Long
   * @param  {any}  projectFile [contains scene data]
   * @return {Promise}             [scene to render]
   */
  async loadProject(projectFile) {
    CommandManager.instance.removeListener(
      EditorEvents.OBJECTS_CHANGED.toString(),
      SceneManager.instance.onEmitSceneModified
    )
    CommandManager.instance.removeListener(
      EditorEvents.SCENE_GRAPH_CHANGED.toString(),
      SceneManager.instance.onEmitSceneModified
    )

    CacheManager.clearCaches()

    // remove existing scene
    CommandManager.instance.executeCommandWithHistory(EditorCommands.REMOVE_OBJECTS, SceneManager.instance.scene)
    CommandManager.instance.sceneLoading = true

    SceneManager.instance.disableUpdate = true

    // getting scene data
    const [scene, errors] = await SceneNode.loadProject(projectFile)
    if (scene === null) throw new Error('Scene data is null, please create a new scene.')

    CommandManager.instance.sceneLoading = false

    SceneManager.instance.disableUpdate = false
    SceneManager.instance.scene = scene
    SceneManager.instance.camera.position.set(0, 5, 10)
    SceneManager.instance.camera.lookAt(new Vector3())
    SceneManager.instance.scene.add(SceneManager.instance.camera)

    ControlManager.instance.editorControls.center.set(0, 0, 0)
    ControlManager.instance.editorControls.onSceneSet(scene)

    SceneManager.instance.renderer.onSceneSet()

    CommandManager.instance.executeCommandWithHistory(EditorCommands.ADD_OBJECTS, SceneManager.instance.scene)
    CommandManager.instance.executeCommandWithHistory(EditorCommands.REPLACE_SELECTION, [])
    CommandManager.instance.history.clear()
    SceneManager.instance.sceneModified = false

    SceneManager.instance.scene.traverse((node) => {
      if (node.isNode) {
        node.onRendererChanged()
      }
    })

    if (errors.length === 0) CommandManager.instance.emitEvent(EditorEvents.PROJECT_LOADED)
    CommandManager.instance.emitEvent(EditorEvents.SCENE_GRAPH_CHANGED)
    CommandManager.instance.addListener(
      EditorEvents.OBJECTS_CHANGED.toString(),
      SceneManager.instance.onEmitSceneModified
    )
    CommandManager.instance.addListener(
      EditorEvents.SCENE_GRAPH_CHANGED.toString(),
      SceneManager.instance.onEmitSceneModified
    )

    if (errors.length > 0) {
      const error = new MultiError('Errors loading project', errors)
      CommandManager.instance.emitEvent(EditorEvents.ERROR, error)
      throw error
    }

    return scene
  }

  dispose() {
    CacheManager.clearCaches()

    if (SceneManager.instance.renderer) {
      SceneManager.instance.renderer.dispose()
    }
  }
}
