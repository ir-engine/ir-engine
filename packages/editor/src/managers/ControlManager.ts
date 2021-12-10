import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { getComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { TransformMode } from '@xrengine/engine/src/scene/constants/transformConstants'
import { EditorControlComponent } from '../classes/EditorControlComponent'
import EditorCommands from '../constants/EditorCommands'
import EditorEvents from '../constants/EditorEvents'
import { ActionSets, EditorMapping } from '../controls/input-mappings'
import InputManager from '../controls/InputManager'
import PlayModeControls from '../controls/PlayModeControls'
import { addInputActionMapping } from '../functions/parseInputActionMapping'
import { CommandManager } from './CommandManager'
import { SceneManager } from './SceneManager'
import { setTransformMode } from '../systems/EditorControlSystem'
import { ObjectLayers } from '@xrengine/engine/src/scene/constants/ObjectLayers'

export class ControlManager {
  static instance: ControlManager = new ControlManager()

  inputManager: InputManager
  playModeControls: PlayModeControls
  isInPlayMode: boolean

  constructor() {
    this.inputManager = null!
    this.playModeControls = null!
    this.isInPlayMode = false
  }

  onBeforeSelectionChanged = () => {
    const editorControlComponent = getComponent(SceneManager.instance.editorEntity, EditorControlComponent)
    if (editorControlComponent.transformMode === TransformMode.Grab) {
      const checkpoint = editorControlComponent.grabHistoryCheckpoint
      setTransformMode(editorControlComponent.transformModeOnCancel, false, editorControlComponent)
      CommandManager.instance.revert(checkpoint)
    } else if (editorControlComponent.transformMode === TransformMode.Placement) {
      setTransformMode(editorControlComponent.transformModeOnCancel, false, editorControlComponent)
      CommandManager.instance.executeCommandWithHistoryOnSelection(EditorCommands.REMOVE_OBJECTS)
    }
  }

  onSelectionChanged = () => {
    const editorControlComponent = getComponent(SceneManager.instance.editorEntity, EditorControlComponent)
    editorControlComponent.selectionChanged = true
  }

  onObjectsChanged = (_objects, property) => {
    const editorControlComponent = getComponent(SceneManager.instance.editorEntity, EditorControlComponent)
    if (property === 'position' || property === 'rotation' || property === 'scale' || property === 'matrix') {
      editorControlComponent.transformPropertyChanged = true
    }
  }

  initControls() {
    this.inputManager = new InputManager(Engine.renderer.domElement)
    this.playModeControls = new PlayModeControls(this.inputManager)

    const editorControlComponent = getComponent(SceneManager.instance.editorEntity, EditorControlComponent)
    editorControlComponent.enable = true
    addInputActionMapping(ActionSets.EDITOR, EditorMapping)

    CommandManager.instance.addListener(EditorEvents.BEFORE_SELECTION_CHANGED.toString(), this.onBeforeSelectionChanged)
    CommandManager.instance.addListener(EditorEvents.SELECTION_CHANGED.toString(), this.onSelectionChanged)
    CommandManager.instance.addListener(EditorEvents.OBJECTS_CHANGED.toString(), this.onObjectsChanged)
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
    Engine.camera.layers.enable(ObjectLayers.Scene)
    this.playModeControls.disable()
    Engine.scene.traverse((node: any) => {
      if (node.isNode) {
        node.onPause()
      }
    })
    CommandManager.instance.emitEvent(EditorEvents.PLAY_MODE_CHANGED)
  }

  dispose() {
    this.inputManager?.dispose()
    this.playModeControls?.dispose()

    CommandManager.instance.removeListener(
      EditorEvents.BEFORE_SELECTION_CHANGED.toString(),
      this.onBeforeSelectionChanged
    )
    CommandManager.instance.removeListener(EditorEvents.SELECTION_CHANGED.toString(), this.onSelectionChanged)
    CommandManager.instance.removeListener(EditorEvents.OBJECTS_CHANGED.toString(), this.onObjectsChanged)
  }
}
