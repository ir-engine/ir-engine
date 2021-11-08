import EditorCommands from '../constants/EditorCommands'
import EditorEvents from '../constants/EditorEvents'
import EditorControls from '../controls/EditorControls'
import FlyControls from '../controls/FlyControls'
import InputManager from '../controls/InputManager'
import PlayModeControls from '../controls/PlayModeControls'
import { CommandManager } from './CommandManager'
import { SceneManager } from './SceneManager'

export class ControlManager {
  static instance: ControlManager = new ControlManager()

  inputManager: InputManager
  editorControls: EditorControls
  flyControls: FlyControls
  playModeControls: PlayModeControls
  isInPlayMode: boolean

  constructor() {
    this.inputManager = null
    this.editorControls = null
    this.flyControls = null
    this.playModeControls = null
    this.isInPlayMode = false
  }

  initControls() {
    this.inputManager = new InputManager(SceneManager.instance.renderer.canvas)
    this.flyControls = new FlyControls(SceneManager.instance.camera as any, this.inputManager)
    this.editorControls = new EditorControls(SceneManager.instance.camera, this.inputManager, this.flyControls)
    this.playModeControls = new PlayModeControls(this.inputManager, this.editorControls, this.flyControls)

    this.editorControls.center.set(0, 0, 0)
    this.editorControls.enable()
  }

  /**
   *Function enterPlayMode used to enable play mode.
   *
   * @author Robert Long
   */
  enterPlayMode() {
    this.isInPlayMode = true
    CommandManager.instance.executeCommandWithHistory(EditorCommands.REPLACE_SELECTION, [])
    SceneManager.instance.camera.layers.disable(1)
    this.playModeControls.enable()
    SceneManager.instance.scene.traverse((node) => {
      if (node.isNode) {
        node.onPlay()
      }
    })
    CommandManager.instance.emitEvent(EditorEvents.PLAY_MODE_CHANGED)
  }

  /**
   *Function leavePlayMode used to disable play mode.
   *
   * @author Robert Long
   */
  leavePlayMode() {
    this.isInPlayMode = false
    SceneManager.instance.camera.layers.enable(1)
    this.playModeControls.disable()
    SceneManager.instance.scene.traverse((node) => {
      if (node.isNode) {
        node.onPause()
      }
    })
    CommandManager.instance.emitEvent(EditorEvents.PLAY_MODE_CHANGED)
  }
}
