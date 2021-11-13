import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { PerspectiveCamera } from 'three'
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
    this.inputManager = new InputManager(SceneManager.instance.canvas)
    this.flyControls = new FlyControls(Engine.camera as PerspectiveCamera, this.inputManager)
    this.editorControls = new EditorControls(Engine.camera, this.inputManager, this.flyControls)
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
    Engine.camera.layers.disable(1)
    this.playModeControls.enable()
    Engine.scene.traverse((node: any) => {
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
    Engine.camera.layers.enable(1)
    this.playModeControls.disable()
    Engine.scene.traverse((node: any) => {
      if (node.isNode) {
        node.onPause()
      }
    })
    CommandManager.instance.emitEvent(EditorEvents.PLAY_MODE_CHANGED)
  }

  update(delta: number, time: number) {
    this.inputManager.update(delta, time)
    this.flyControls.update(delta)
    this.editorControls.update()
    this.inputManager.reset()
  }

  dispose() {
    this.inputManager?.dispose()
    this.editorControls?.dispose()
    this.flyControls?.dispose()
    this.playModeControls?.dispose()
  }
}
