import { getComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { EditorControlComponent } from '../classes/EditorControlComponent'
import { FlyControlComponent } from '../classes/FlyControlComponent'
import InputManager from '../controls/InputManager'
import { addInputActionMapping, removeInputActionMapping } from '../functions/parseInputActionMapping'
import { SceneManager } from '../managers/SceneManager'
import { ActionSets, EditorMapping, FlyMapping } from './input-mappings'

export default class PlayModeControls {
  inputManager: InputManager
  enabled: boolean

  constructor(inputManager) {
    this.inputManager = inputManager
    this.enabled = false
  }

  enable() {
    this.enabled = true
    this.inputManager.canvas.addEventListener('click', this.onClickCanvas)
    document.addEventListener('pointerlockchange', this.onPointerLockChange)
  }

  disable() {
    this.enabled = false

    const editorControlComponent = getComponent(SceneManager.instance.editorEntity, EditorControlComponent)
    editorControlComponent.enable = true
    addInputActionMapping(ActionSets.EDITOR, EditorMapping)

    const flyControlComponent = getComponent(SceneManager.instance.editorEntity, FlyControlComponent)
    flyControlComponent.enable = false
    removeInputActionMapping(ActionSets.FLY)

    this.inputManager.canvas.removeEventListener('click', this.onClickCanvas)
    document.removeEventListener('pointerlockchange', this.onPointerLockChange)
    document.exitPointerLock()
  }

  onClickCanvas = () => {
    this.inputManager.canvas.requestPointerLock()
  }

  onPointerLockChange = () => {
    const flyControlComponent = getComponent(SceneManager.instance.editorEntity, FlyControlComponent)
    const editorControlComponent = getComponent(SceneManager.instance.editorEntity, EditorControlComponent)

    if (document.pointerLockElement === this.inputManager.canvas) {
      flyControlComponent.enable = true
      addInputActionMapping(ActionSets.FLY, FlyMapping)

      editorControlComponent.enable = false
      removeInputActionMapping(ActionSets.EDITOR)
    } else {
      editorControlComponent.enable = true
      addInputActionMapping(ActionSets.EDITOR, EditorMapping)

      flyControlComponent.enable = false
      removeInputActionMapping(ActionSets.FLY)
    }
  }

  dispose() {
    this.inputManager.canvas.removeEventListener('click', this.onClickCanvas)
    document.removeEventListener('pointerlockchange', this.onPointerLockChange)
  }
}
