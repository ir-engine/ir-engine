import { getComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import Mousetrap from 'mousetrap'
import { InputComponent } from '../classes/InputComponent'
import { ActionKey, ActionSets, InputActionMapping, InputMapping, ActionState } from '../controls/input-mappings'
import { SceneManager } from '../managers/SceneManager'

const _globalCallbacks = {}
const _originalStopCallback = Mousetrap.prototype.stopCallback

Mousetrap.prototype.stopCallback = function (e, element, combo, sequence) {
  const self = this
  if (self.paused) {
    return true
  }
  if (_globalCallbacks[combo] || _globalCallbacks[sequence]) {
    return false
  }
  return _originalStopCallback.call(self, e, element, combo)
}

Mousetrap.prototype.bindGlobal = function (keys, callback, action) {
  const self = this
  self.bind(keys, callback, action)
  if (keys instanceof Array) {
    for (let i = 0; i < keys.length; i++) {
      _globalCallbacks[keys[i]] = true
    }
    return
  }
  _globalCallbacks[keys] = true
}

Mousetrap.prototype.unbindGlobal = function (keys, callback, action) {
  const self = this
  self.unbind(keys, callback, action)
  if (keys instanceof Array) {
    for (let i = 0; i < keys.length; i++) {
      delete _globalCallbacks[keys[i]]
    }
    return
  }
  delete _globalCallbacks[keys]
}

Mousetrap.init()

function mergeMappings(mappings: Map<ActionSets, InputActionMapping>): InputActionMapping {
  const output = {
    keyboard: {
      pressed: {},
      keyup: {},
      keydown: {},
      hotkeys: {},
      globalHotkeys: {}
    },
    mouse: {
      click: {},
      dblclick: {},
      move: {},
      wheel: {},
      pressed: {},
      mouseup: {},
      mousedown: {}
    },
    computed: []
  } as InputActionMapping

  for (const mapping of mappings.values()) {
    const { keyboard, mouse, computed } = mapping
    if (keyboard) {
      if (keyboard.pressed) Object.assign(output.keyboard.pressed, keyboard.pressed)
      if (keyboard.keyup) Object.assign(output.keyboard.keyup, keyboard.keyup)
      if (keyboard.keydown) Object.assign(output.keyboard.keydown, keyboard.keydown)
      if (keyboard.hotkeys) Object.assign(output.keyboard.hotkeys, keyboard.hotkeys)
      if (keyboard.globalHotkeys) Object.assign(output.keyboard.globalHotkeys, keyboard.globalHotkeys)
    }
    if (mouse) {
      if (mouse.click) Object.assign(output.mouse.click, mouse.click)
      if (mouse.dblclick) Object.assign(output.mouse.dblclick, mouse.dblclick)
      if (mouse.move) Object.assign(output.mouse.move, mouse.move)
      if (mouse.wheel) Object.assign(output.mouse.wheel, mouse.wheel)
      if (mouse.pressed) Object.assign(output.mouse.pressed, mouse.pressed)
      if (mouse.mouseup) Object.assign(output.mouse.mouseup, mouse.mouseup)
      if (mouse.mousedown) Object.assign(output.mouse.mousedown, mouse.mousedown)
    }
    if (computed) {
      for (const obj of computed) {
        output.computed.push(obj)
      }
    }
  }

  return output
}

const initializeValue = (
  state: ActionState,
  source: InputMapping,
  defualtValues: ActionState,
  resetKeys: Set<ActionKey>,
  bindMouseTrap?: boolean
): void => {
  if (!source) return

  for (const input in source) {
    if (!Object.prototype.hasOwnProperty.call(source, input)) continue

    const key = source[input].key
    defualtValues[key] = source[input].defaultValue
    state[key] = state[key] !== undefined ? state[key] : source[input].defaultValue

    if (!source[input].preventReset) {
      resetKeys.add(key)
    }

    if (bindMouseTrap) {
      Mousetrap.bind(input, () => {
        state[key] = true
        return false
      })
    }
  }
}

const deleteValues = (state: ActionState, mappingObj: InputMapping): void => {
  for (const actionName in mappingObj) {
    if (!Object.prototype.hasOwnProperty.call(mappingObj, actionName)) continue

    delete state[mappingObj[actionName].key]
  }
}

export const parseInputActionMapping = (inputMapping: InputActionMapping) => {
  const actionState = {} as ActionState
  const defaultValues = {} as ActionState
  const resetKeys = new Set<ActionKey>()

  const keyboard = inputMapping.keyboard
  if (keyboard) {
    initializeValue(actionState, keyboard.pressed, defaultValues, resetKeys)
    initializeValue(actionState, keyboard.keydown, defaultValues, resetKeys)
    initializeValue(actionState, keyboard.keyup, defaultValues, resetKeys)
    initializeValue(actionState, keyboard.hotkeys, defaultValues, resetKeys, true)
    initializeValue(actionState, keyboard.globalHotkeys, defaultValues, resetKeys, true)
  }

  const mouse = inputMapping.mouse
  if (mouse) {
    initializeValue(actionState, mouse.click, defaultValues, resetKeys)
    initializeValue(actionState, mouse.dblclick, defaultValues, resetKeys)
    initializeValue(actionState, mouse.move, defaultValues, resetKeys)
    initializeValue(actionState, mouse.wheel, defaultValues, resetKeys)
    initializeValue(actionState, mouse.pressed, defaultValues, resetKeys)
    initializeValue(actionState, mouse.mousedown, defaultValues, resetKeys)
    initializeValue(actionState, mouse.mouseup, defaultValues, resetKeys)
  }

  const computed = inputMapping.computed
  if (computed) {
    for (const computedProp of computed) {
      defaultValues[computedProp.action] = actionState[computedProp.action] = computedProp.defaultValue
      if (!computedProp.preventReset) resetKeys.add(computedProp.action)
    }
  }

  return {
    defaultValues,
    state: actionState,
    resetKeys
  }
}

export const updateInputActionMapping = () => {
  const inputComponent = getComponent(SceneManager.instance.editorEntity, InputComponent)
  const mappings = mergeMappings(inputComponent.mappings)

  const parsedMapping = parseInputActionMapping(mappings)

  inputComponent.activeMapping = mappings
  inputComponent.actionState = parsedMapping.state
  inputComponent.resetKeys = parsedMapping.resetKeys
  inputComponent.defaultState = parsedMapping.defaultValues
}

export const addInputActionMapping = (inputSet: ActionSets, mapping: InputActionMapping): void => {
  const inputComponent = getComponent(SceneManager.instance.editorEntity, InputComponent)
  inputComponent.mappings.set(inputSet, mapping)
  updateInputActionMapping()
}

export const removeInputActionMapping = (inputSet: ActionSets): void => {
  const inputComponent = getComponent(SceneManager.instance.editorEntity, InputComponent)

  const mapping = inputComponent.mappings.get(inputSet)
  if (!mapping) return

  const { keyboard, mouse, computed } = mapping

  if (keyboard) {
    if (keyboard.pressed) deleteValues(inputComponent.actionState, keyboard.pressed)
    if (keyboard.keyup) deleteValues(inputComponent.actionState, keyboard.keyup)
    if (keyboard.keydown) deleteValues(inputComponent.actionState, keyboard.keydown)
    if (keyboard.hotkeys) {
      for (const binding in keyboard.hotkeys) {
        if (Object.prototype.hasOwnProperty.call(keyboard.hotkeys, binding)) {
          Mousetrap.unbind(binding)
        }
      }
      deleteValues(inputComponent.actionState, keyboard.hotkeys)
    }
    if (keyboard.globalHotkeys) {
      for (const binding in keyboard.globalHotkeys) {
        if (Object.prototype.hasOwnProperty.call(keyboard.globalHotkeys, binding)) {
          Mousetrap.unbindGlobal(binding)
        }
      }
      deleteValues(inputComponent.actionState, keyboard.globalHotkeys)
    }
  }

  if (mouse) {
    if (mouse.click) deleteValues(inputComponent.actionState, mouse.click)
    if (mouse.dblclick) deleteValues(inputComponent.actionState, mouse.dblclick)
    if (mouse.move) deleteValues(inputComponent.actionState, mouse.move)
    if (mouse.wheel) deleteValues(inputComponent.actionState, mouse.wheel)
    if (mouse.pressed) deleteValues(inputComponent.actionState, mouse.pressed)
    if (mouse.mouseup) deleteValues(inputComponent.actionState, mouse.mouseup)
    if (mouse.mousedown) deleteValues(inputComponent.actionState, mouse.mousedown)
  }

  if (computed) {
    for (const obj of computed) {
      delete inputComponent.actionState[obj.action]
    }
  }

  inputComponent.mappings.delete(inputSet)
  updateInputActionMapping()
}

export const getInput = (key: ActionKey) => {
  const inputComponent = getComponent(SceneManager.instance.editorEntity, InputComponent)
  return inputComponent.actionState[key] ?? 0
}
