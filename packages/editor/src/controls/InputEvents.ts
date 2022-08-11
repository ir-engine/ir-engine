import { getComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { EngineRenderer } from '@xrengine/engine/src/renderer/WebGLRendererSystem'

import { EditorInputComponent, EditorInputComponentType } from '../classes/InputComponent'
import isInputSelected from '../functions/isInputSelected'
import { SceneState } from '../functions/sceneRenderFunctions'
import { Action, ActionKey, ActionState, InputMapping, MouseButtons, SpecialAliases } from './input-mappings'

type InputDataType = {
  mouseDownTarget: EventTarget | null
}

const InputData: InputDataType = {
  mouseDownTarget: null
} as InputDataType

let inputComponent: EditorInputComponentType

export function initInputEvents() {
  const canvas = EngineRenderer.instance.renderer.domElement
  window.addEventListener('keydown', onKeyDown)
  window.addEventListener('keyup', onKeyUp)
  canvas.addEventListener('wheel', onWheel)
  canvas.addEventListener('mousemove', onMouseMove)
  canvas.addEventListener('mousedown', onMouseDown)
  canvas.addEventListener('mouseup', onMouseUp)
  canvas.addEventListener('dblclick', onDoubleClick)
  canvas.addEventListener('click', onClick)
  canvas.addEventListener('contextmenu', onContextMenu)
  window.addEventListener('blur', onWindowBlur)
  window.addEventListener('mousedown', onWindowMouseDown)
  window.addEventListener('mouseup', onWindowMouseUp)
}

function handleActionCallback(action: Action, event: Event): void {
  if (typeof action.callback === 'function') action.callback(event)
}

function handleKeyMappings(state: ActionState, inputMapping: InputMapping, event: KeyboardEvent, value: any): boolean {
  let eventKey = (event.key ?? String.fromCharCode(event.which || parseInt(event.code))).toLowerCase()
  let preventDefault = false

  const actionNames = Object.keys(inputMapping)
  for (const actionName of actionNames) {
    if (typeof inputMapping[actionName] === 'undefined') continue

    const key = inputMapping[actionName].key
    handleActionCallback(inputMapping[actionName], event)

    if (eventKey === actionName || eventKey === SpecialAliases[actionName]) {
      state[key] = value
      preventDefault = true
    }
  }

  return preventDefault
}

function handlePosition(state: ActionState, positionAction: ActionKey, event: MouseEvent): void {
  const rect = EngineRenderer.instance.renderer.domElement.getBoundingClientRect()

  if (!state[positionAction]) state[positionAction] = {}

  state[positionAction].x = ((event.clientX - rect.left) / rect.width) * 2 - 1
  state[positionAction].y = ((event.clientY - rect.top) / rect.height) * -2 + 1
}

// ------------- Keyboard Events ------------- //

function onKeyDown(event: KeyboardEvent): void {
  // Skip actions if input field is active
  if (isInputSelected()) return

  inputComponent = getComponent(SceneState.editorEntity, EditorInputComponent)
  const keyboardMapping = inputComponent.activeMapping.keyboard
  if (!keyboardMapping) return

  let preventDefault = false

  if (keyboardMapping.pressed)
    preventDefault = handleKeyMappings(inputComponent.actionState, keyboardMapping.pressed, event, 1)
  if (keyboardMapping.keydown)
    preventDefault = handleKeyMappings(inputComponent.actionState, keyboardMapping.keydown, event, 1)

  if (preventDefault) event.preventDefault()
}

function onKeyUp(event: KeyboardEvent): void {
  // Skip actions if input field is active
  if (isInputSelected()) return

  inputComponent = getComponent(SceneState.editorEntity, EditorInputComponent)
  const keyboardMapping = inputComponent.activeMapping.keyboard
  if (!keyboardMapping) return

  let preventDefault = false

  if (keyboardMapping.pressed)
    preventDefault = handleKeyMappings(inputComponent.actionState, keyboardMapping.pressed, event, 0)
  if (keyboardMapping.keyup)
    preventDefault = handleKeyMappings(inputComponent.actionState, keyboardMapping.keyup, event, 0)

  if (preventDefault) event.preventDefault()
}

// ------------- Keyboard Events ------------- //

// ------------- Mouse Events ------------- //

function onWindowMouseDown(event: MouseEvent): void {
  InputData.mouseDownTarget = event.target
}

function onWindowMouseUp(event: MouseEvent): void {
  if (
    event.target !== EngineRenderer.instance.renderer.domElement &&
    InputData.mouseDownTarget === EngineRenderer.instance.renderer.domElement
  ) {
    onMouseUp(event)
  }

  InputData.mouseDownTarget = null
}

function onMouseDown(event: MouseEvent): void {
  inputComponent = getComponent(SceneState.editorEntity, EditorInputComponent)
  const mouseMapping = inputComponent.activeMapping.mouse
  if (!mouseMapping) return

  const buttonKey = MouseButtons[event.button]
  if (mouseMapping.pressed && mouseMapping.pressed[buttonKey]) {
    inputComponent.actionState[mouseMapping.pressed[buttonKey].key] = 1
    handleActionCallback(mouseMapping.pressed[buttonKey], event)
  }

  const mouseDown = mouseMapping.mousedown
  if (mouseDown) {
    let action = mouseDown[buttonKey]
    if (action) {
      inputComponent.actionState[action.key] = 1
      handleActionCallback(action, event)
    }

    if (mouseDown.position) handlePosition(inputComponent.actionState, mouseDown.position.key, event)
  }
}

function onMouseUp(event: MouseEvent): void {
  inputComponent = getComponent(SceneState.editorEntity, EditorInputComponent)
  const mouseMapping = inputComponent.activeMapping.mouse
  if (!mouseMapping) return

  const buttonKey = MouseButtons[event.button]
  if (mouseMapping.pressed && mouseMapping.pressed[buttonKey]) {
    inputComponent.actionState[mouseMapping.pressed[buttonKey].key] = 0
    handleActionCallback(mouseMapping.pressed[buttonKey], event)
  }

  const mouseUp = mouseMapping.mouseup
  if (mouseUp) {
    const action = mouseUp[buttonKey]

    if (action) {
      inputComponent.actionState[action.key] = 1
      handleActionCallback(action, event)
    }

    if (mouseUp.position) handlePosition(inputComponent.actionState, mouseUp.position.key, event)
  }
}

function onMouseMove(event: MouseEvent): void {
  inputComponent = getComponent(SceneState.editorEntity, EditorInputComponent)
  const mouseMapping = inputComponent.activeMapping.mouse
  if (!mouseMapping) return

  const mouseMove = mouseMapping.move
  if (!mouseMove) return

  const actionNames = Object.keys(mouseMove)
  for (const actionName of actionNames) {
    if (typeof mouseMove[actionName] === 'undefined') continue

    const key = mouseMove[actionName].key

    if (actionName === 'movementX' || actionName === 'movementY') {
      inputComponent.actionState[key] += event[actionName]
    } else if (actionName === 'normalizedMovementX') {
      inputComponent.actionState[key] += -event.movementX / EngineRenderer.instance.renderer.domElement.clientWidth
    } else if (actionName === 'normalizedMovementY') {
      inputComponent.actionState[key] += -event.movementY / EngineRenderer.instance.renderer.domElement.clientHeight
    } else if (actionName === 'position') {
      handlePosition(inputComponent.actionState, key, event)
    } else {
      inputComponent.actionState[key] = event[actionName]
    }

    handleActionCallback(mouseMove[actionName], event)
  }
}

function onWheel(event: WheelEvent): boolean {
  event.preventDefault()

  inputComponent = getComponent(SceneState.editorEntity, EditorInputComponent)
  const mouseMapping = inputComponent.activeMapping.mouse
  if (!mouseMapping) return false

  const mouseWheel = mouseMapping.wheel
  if (!mouseWheel) return false

  const actionNames = Object.keys(mouseWheel)
  for (const actionName of actionNames) {
    if (typeof mouseWheel[actionName] === 'undefined') continue
    const key = mouseWheel[actionName].key

    if (actionName === 'deltaX' || actionName === 'deltaY') {
      inputComponent.actionState[key] += event[actionName]
    } else if (actionName === 'normalizedDeltaX') {
      inputComponent.actionState[key] = Math.sign(event.deltaX)
    } else if (actionName === 'normalizedDeltaY') {
      inputComponent.actionState[key] = Math.sign(event.deltaY)
    } else {
      inputComponent.actionState[key] = event[actionName]
    }

    handleActionCallback(mouseWheel[actionName], event)
  }
  return false
}

function onClick(event: MouseEvent): void {
  inputComponent = getComponent(SceneState.editorEntity, EditorInputComponent)
  const mouseMapping = inputComponent.activeMapping.mouse
  if (!mouseMapping) return

  const mouseClick = mouseMapping.click
  if (mouseClick && mouseClick.position) {
    handlePosition(inputComponent.actionState, mouseClick.position.key, event)
    handleActionCallback(mouseClick.position, event)
  }
}

function onDoubleClick(event: MouseEvent): void {
  inputComponent = getComponent(SceneState.editorEntity, EditorInputComponent)
  const mouseMapping = inputComponent.activeMapping.mouse
  if (!mouseMapping) return

  const mouseDblclick = mouseMapping.dblclick
  if (mouseDblclick && mouseDblclick.position) {
    handlePosition(inputComponent.actionState, mouseDblclick.position.key, event)
    handleActionCallback(mouseDblclick.position, event)
  }
}

// ------------- Mouse Events ------------- //

function onContextMenu(event: Event): void {
  event.preventDefault()
}

function onWindowBlur(): void {
  inputComponent = getComponent(SceneState.editorEntity, EditorInputComponent)
  const defaultState = inputComponent.defaultState

  const keys = Object.keys(defaultState)
  for (const key of keys) {
    if (typeof defaultState[key] !== 'undefined') {
      inputComponent.actionState[key] = defaultState[key]
    }
  }
}

export function removeInputEvents(): void {
  const canvas = EngineRenderer.instance.renderer.domElement
  window.removeEventListener('keydown', onKeyDown)
  window.removeEventListener('keyup', onKeyUp)
  canvas.removeEventListener('wheel', onWheel)
  canvas.removeEventListener('mousemove', onMouseMove)
  canvas.removeEventListener('mousedown', onMouseDown)
  canvas.removeEventListener('mouseup', onMouseUp)
  canvas.removeEventListener('dblclick', onDoubleClick)
  canvas.removeEventListener('click', onClick)
  canvas.removeEventListener('contextmenu', onContextMenu)
  window.removeEventListener('blur', onWindowBlur)
  window.removeEventListener('mousedown', onWindowMouseDown)
  window.removeEventListener('mouseup', onWindowMouseUp)
}
