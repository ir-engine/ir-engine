import { getComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'

import { InputComponent, InputComponentType } from '../classes/InputComponent'
import isInputSelected from '../functions/isInputSelected'
import { SceneManager } from '../managers/SceneManager'
import { Action, ActionKey, ActionState, InputMapping, MouseButtons, SpecialAliases } from './input-mappings'

export default class InputManager {
  canvas: HTMLCanvasElement
  boundingClientRect: DOMRect
  inputComponent: InputComponentType
  // mouseDownTarget: any

  constructor(canvas) {
    this.canvas = canvas
    this.boundingClientRect = this.canvas.getBoundingClientRect()
    window.addEventListener('keydown', this.onKeyDown)
    window.addEventListener('keyup', this.onKeyUp)
    canvas.addEventListener('wheel', this.onWheel)
    canvas.addEventListener('mousemove', this.onMouseMove)
    canvas.addEventListener('mousedown', this.onMouseDown)
    canvas.addEventListener('mouseup', this.onMouseUp)
    canvas.addEventListener('dblclick', this.onDoubleClick)
    canvas.addEventListener('click', this.onClick)
    canvas.addEventListener('contextmenu', this.onContextMenu)
    window.addEventListener('blur', this.onWindowBlur)

    // this.mouseDownTarget = null
    // window.addEventListener('mousedown', this.onWindowMouseDown)
    // window.addEventListener('mouseup', this.onWindowMouseUp)
  }

  handleActionCallback = (action: Action, event: Event) => {
    if (typeof action.callback === 'function') action.callback(event, this)
  }

  handleKeyMappings(state: ActionState, inputMapping: InputMapping, event: KeyboardEvent, value: any): boolean {
    let eventKey = (event.key ?? String.fromCharCode(event.which || parseInt(event.code))).toLowerCase()
    let preventDefault = false

    for (const actionName in inputMapping) {
      if (!Object.prototype.hasOwnProperty.call(inputMapping, actionName)) continue

      const key = inputMapping[actionName].key
      this.handleActionCallback(inputMapping[actionName], event)

      if (eventKey === actionName || eventKey === SpecialAliases[actionName]) {
        state[key] = value
        preventDefault = true
      }
    }

    return preventDefault
  }

  handlePosition(state: ActionState, positionAction: ActionKey, event: MouseEvent): void {
    const rect = this.boundingClientRect

    if (!state[positionAction]) state[positionAction] = {}

    state[positionAction].x = ((event.clientX - rect.left) / rect.width) * 2 - 1
    state[positionAction].y = ((event.clientY - rect.top) / rect.height) * -2 + 1
  }

  // ------------- Keyboard Events ------------- //

  onKeyDown = (event: KeyboardEvent): void => {
    // Skip actions if input field is active
    if (isInputSelected()) return

    this.inputComponent = getComponent(SceneManager.instance.editorEntity, InputComponent)
    const keyboardMapping = this.inputComponent.activeMapping.keyboard
    if (!keyboardMapping) return

    let preventDefault = false

    if (keyboardMapping.pressed)
      preventDefault = this.handleKeyMappings(this.inputComponent.actionState, keyboardMapping.pressed, event, 1)
    if (keyboardMapping.keydown)
      preventDefault = this.handleKeyMappings(this.inputComponent.actionState, keyboardMapping.keydown, event, 1)

    if (preventDefault) event.preventDefault()
  }

  onKeyUp = (event: KeyboardEvent): void => {
    // Skip actions if input field is active
    if (isInputSelected()) return

    this.inputComponent = getComponent(SceneManager.instance.editorEntity, InputComponent)
    const keyboardMapping = this.inputComponent.activeMapping.keyboard
    if (!keyboardMapping) return

    let preventDefault = false

    if (keyboardMapping.pressed)
      preventDefault = this.handleKeyMappings(this.inputComponent.actionState, keyboardMapping.pressed, event, 0)
    if (keyboardMapping.keyup)
      preventDefault = this.handleKeyMappings(this.inputComponent.actionState, keyboardMapping.keyup, event, 0)

    if (preventDefault) event.preventDefault()
  }

  // ------------- Keyboard Events ------------- //

  // ------------- Mouse Events ------------- //

  // onWindowMouseDown = (event: MouseEvent) => {
  //   this.mouseDownTarget = event.target
  // }

  onMouseDown = (event: MouseEvent): void => {
    // this.mouseDownTarget = event.target

    this.inputComponent = getComponent(SceneManager.instance.editorEntity, InputComponent)
    const mouseMapping = this.inputComponent.activeMapping.mouse
    if (!mouseMapping) return

    const buttonKey = MouseButtons[event.button]
    if (mouseMapping.pressed && mouseMapping.pressed[buttonKey]) {
      this.inputComponent.actionState[mouseMapping.pressed[buttonKey].key] = 1
      this.handleActionCallback(mouseMapping.pressed[buttonKey], event)
    }

    const mouseDown = mouseMapping.mousedown
    if (mouseDown) {
      let action = mouseDown[buttonKey]
      if (action) {
        this.inputComponent.actionState[action.key] = 1
        this.handleActionCallback(action, event)
      }

      if (mouseDown.position) this.handlePosition(this.inputComponent.actionState, mouseDown.position.key, event)
    }
  }

  // onWindowMouseUp = (event: MouseEvent) => {
  //   const canvas = this.canvas
  //   const mouseDownTarget = this.mouseDownTarget
  //   this.mouseDownTarget = null
  //   if (event.target === canvas || mouseDownTarget !== canvas) {
  //     return
  //   }
  //   this.onMouseUp(event)
  // }

  onMouseUp = (event: MouseEvent): void => {
    this.inputComponent = getComponent(SceneManager.instance.editorEntity, InputComponent)
    const mouseMapping = this.inputComponent.activeMapping.mouse
    if (!mouseMapping) return

    const buttonKey = MouseButtons[event.button]
    if (mouseMapping.pressed && mouseMapping.pressed[buttonKey]) {
      this.inputComponent.actionState[mouseMapping.pressed[buttonKey].key] = 0
      this.handleActionCallback(mouseMapping.pressed[buttonKey], event)
    }

    const mouseUp = mouseMapping.mouseup
    if (mouseUp) {
      const action = mouseUp[buttonKey]

      if (action) {
        this.inputComponent.actionState[action.key] = 1
        this.handleActionCallback(action, event)
      }

      if (mouseUp.position) this.handlePosition(this.inputComponent.actionState, mouseUp.position.key, event)
    }
  }

  onMouseMove = (event: MouseEvent): void => {
    this.inputComponent = getComponent(SceneManager.instance.editorEntity, InputComponent)
    const mouseMapping = this.inputComponent.activeMapping.mouse
    if (!mouseMapping) return

    const mouseMove = mouseMapping.move
    if (!mouseMove) return

    for (const actionName in mouseMove) {
      if (!Object.prototype.hasOwnProperty.call(mouseMove, actionName)) continue

      const key = mouseMove[actionName].key

      if (actionName === 'movementX' || actionName === 'movementY') {
        this.inputComponent.actionState[key] += event[actionName]
      } else if (actionName === 'normalizedMovementX') {
        this.inputComponent.actionState[key] += -event.movementX / this.canvas.clientWidth
      } else if (actionName === 'normalizedMovementY') {
        this.inputComponent.actionState[key] += -event.movementY / this.canvas.clientHeight
      } else if (actionName === 'position') {
        this.handlePosition(this.inputComponent.actionState, key, event)
      } else {
        this.inputComponent.actionState[key] = event[actionName]
      }

      this.handleActionCallback(mouseMove[actionName], event)
    }
  }

  onWheel = (event: WheelEvent): boolean => {
    event.preventDefault()

    this.inputComponent = getComponent(SceneManager.instance.editorEntity, InputComponent)
    const mouseMapping = this.inputComponent.activeMapping.mouse
    if (!mouseMapping) return false

    const mouseWheel = mouseMapping.wheel
    if (!mouseWheel) return false

    for (const actionName in mouseWheel) {
      if (!Object.prototype.hasOwnProperty.call(mouseWheel, actionName)) continue

      const key = mouseWheel[actionName].key

      if (actionName === 'deltaX' || actionName === 'deltaY') {
        this.inputComponent.actionState[key] += event[actionName]
      } else if (actionName === 'normalizedDeltaX') {
        this.inputComponent.actionState[key] = Math.sign(event.deltaX)
      } else if (actionName === 'normalizedDeltaY') {
        this.inputComponent.actionState[key] = Math.sign(event.deltaY)
      } else {
        this.inputComponent.actionState[key] = event[actionName]
      }

      this.handleActionCallback(mouseWheel[actionName], event)
    }
    return false
  }

  onClick = (event: MouseEvent): void => {
    this.inputComponent = getComponent(SceneManager.instance.editorEntity, InputComponent)
    const mouseMapping = this.inputComponent.activeMapping.mouse
    if (!mouseMapping) return

    const mouseClick = mouseMapping.click
    if (mouseClick && mouseClick.position) {
      this.handlePosition(this.inputComponent.actionState, mouseClick.position.key, event)
      this.handleActionCallback(mouseClick.position, event)
    }
  }

  onDoubleClick = (event: MouseEvent): void => {
    this.inputComponent = getComponent(SceneManager.instance.editorEntity, InputComponent)
    const mouseMapping = this.inputComponent.activeMapping.mouse
    if (!mouseMapping) return

    const mouseDblclick = mouseMapping.dblclick
    if (mouseDblclick && mouseDblclick.position) {
      this.handlePosition(this.inputComponent.actionState, mouseDblclick.position.key, event)
      this.handleActionCallback(mouseDblclick.position, event)
    }
  }

  // ------------- Mouse Events ------------- //

  onContextMenu = (event: Event): void => event.preventDefault()

  onResize = (): void => {
    this.boundingClientRect = this.canvas.getBoundingClientRect()
  }

  onWindowBlur = (): void => {
    this.inputComponent = getComponent(SceneManager.instance.editorEntity, InputComponent)
    const defaultState = this.inputComponent.defaultState

    for (const key in defaultState) {
      if (Object.prototype.hasOwnProperty.call(defaultState, key)) {
        this.inputComponent.actionState[key] = defaultState[key]
      }
    }
  }

  dispose(): void {
    const canvas = this.canvas
    window.removeEventListener('keydown', this.onKeyDown)
    window.removeEventListener('keyup', this.onKeyUp)
    canvas.removeEventListener('wheel', this.onWheel)
    canvas.removeEventListener('mousemove', this.onMouseMove)
    canvas.removeEventListener('mousedown', this.onMouseDown)
    canvas.removeEventListener('mouseup', this.onMouseUp)
    canvas.removeEventListener('dblclick', this.onDoubleClick)
    canvas.removeEventListener('click', this.onClick)
    canvas.removeEventListener('contextmenu', this.onContextMenu)
    window.removeEventListener('blur', this.onWindowBlur)
    // window.removeEventListener('mousedown', this.onWindowMouseDown)
    // window.removeEventListener('mouseup', this.onWindowMouseUp)
  }
}
