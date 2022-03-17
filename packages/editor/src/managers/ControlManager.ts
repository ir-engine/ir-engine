import { store } from '@xrengine/client-core/src/store'
import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { getComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { ObjectLayers } from '@xrengine/engine/src/scene/constants/ObjectLayers'
import { TransformMode } from '@xrengine/engine/src/scene/constants/transformConstants'

import { EditorControlComponent } from '../classes/EditorControlComponent'
import EditorCommands from '../constants/EditorCommands'
import { ActionSets, EditorMapping } from '../controls/input-mappings'
import InputManager from '../controls/InputManager'
import PlayModeControls from '../controls/PlayModeControls'
import { addInputActionMapping } from '../functions/parseInputActionMapping'
import { ModeAction } from '../services/ModeServices'
import { setTransformMode } from '../systems/EditorControlSystem'
import { CommandManager } from './CommandManager'
import { SceneManager } from './SceneManager'

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
      CommandManager.instance.executeCommandWithHistoryOnSelection(EditorCommands.REMOVE_OBJECTS, {
        deselectObject: true
      })
    }
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
  }

  /**
   *Function enterPlayMode used to enable play mode.
   *
   * @author Robert Long
   */
  enterPlayMode() {
    this.isInPlayMode = true
    CommandManager.instance.executeCommandWithHistory(EditorCommands.REPLACE_SELECTION, [])
    Engine.camera.layers.set(ObjectLayers.Scene)
    this.playModeControls.enable()
    store.dispatch(ModeAction.changedPlayMode())
  }

  /**
   *Function leavePlayMode used to disable play mode.
   *
   * @author Robert Long
   */
  leavePlayMode() {
    this.isInPlayMode = false
    Engine.camera.layers.enableAll()
    this.playModeControls.disable()
    store.dispatch(ModeAction.changedPlayMode())
  }

  dispose() {
    this.inputManager?.dispose()
    this.playModeControls?.dispose()
  }
}
