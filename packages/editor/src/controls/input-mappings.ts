import { getInput } from '../functions/parseInputActionMapping'

/** Mouse Button key codes */
export const MouseButtons = [
  'left' as const,
  'middle' as const,
  'right' as const,
  'button4' as const,
  'button5' as const
]

/** Special keyboard button codes */
export const SpecialAliases = {
  option: 'alt' as const,
  command: 'meta' as const,
  return: 'enter' as const,
  escape: 'esc' as const,
  plus: '+' as const
}

/** Supported Action sets */
export enum ActionSets {
  FLY,
  EDITOR
}

/** Fly Action set. Defines actions in flying mode */
export const FlyActionSet = {
  moveLeft: 'moveLeft' as const,
  moveRight: 'moveRight' as const,
  moveX: 'moveX' as const,
  moveForward: 'moveForward' as const,
  moveBackward: 'moveBackward' as const,
  moveZ: 'moveZ' as const,
  lookX: 'lookX' as const,
  lookY: 'lookY' as const,
  moveDown: 'moveDown' as const,
  moveUp: 'moveUp' as const,
  moveY: 'moveY' as const,
  boost: 'boost' as const
}

/** Editor Action set. Defines all the editor action. */
export const EditorActionSet = {
  grab: 'grab' as const,
  focus: 'focus' as const,
  focusPosition: 'focusPosition' as const,
  focusSelection: 'focusSelection' as const,
  zoomDelta: 'zoomDelta' as const,
  enableFlyMode: 'enableFlyMode' as const,
  disableFlyMode: 'disableFlyMode' as const,
  flying: 'flying' as const,
  selecting: 'selecting' as const,
  selectStart: 'selectStart' as const,
  selectStartPosition: 'selectStartPosition' as const,
  selectEnd: 'selectEnd' as const,
  selectEndPosition: 'selectEndPosition' as const,
  cursorPosition: 'cursorPosition' as const,
  cursorDeltaX: 'cursorDeltaX' as const,
  cursorDeltaY: 'cursorDeltaY' as const,
  panning: 'panning' as const,
  setTranslateMode: 'setTranslateMode' as const,
  setRotateMode: 'setRotateMode' as const,
  setScaleMode: 'setScaleMode' as const,
  toggleSnapMode: 'toggleSnapMode' as const,
  toggleTransformPivot: 'toggleTransformPivot' as const,
  modifier: 'modifier' as const,
  shift: 'shift' as const,
  toggleTransformSpace: 'toggleTransformSpace' as const,
  deleteSelected: 'deleteSelected' as const,
  undo: 'undo' as const,
  redo: 'redo' as const,
  duplicateSelected: 'duplicateSelected' as const,
  groupSelected: 'groupSelected' as const,
  saveProject: 'saveProject' as const,
  cancel: 'cancel' as const,
  rotateLeft: 'rotateLeft' as const,
  rotateRight: 'rotateRight' as const,
  incrementGridHeight: 'incrementGridHeight' as const,
  decrementGridHeight: 'decrementGridHeight' as const
}

export type FlyActionType = typeof FlyActionSet
export type EditorActionType = typeof EditorActionSet
export type ActionType = FlyActionType | EditorActionType

export type FlyActionKey = keyof FlyActionType
export type EditorActionKey = keyof EditorActionType
export type ActionKey = FlyActionKey | EditorActionKey

export enum MouseInput {
  position = 'position',
  movementX = 'movementX',
  movementY = 'movementY',
  normalizedMovementX = 'normalizedMovementX',
  normalizedMovementY = 'normalizedMovementY',
  deltaX = 'deltaX',
  deltaY = 'deltaY',
  normalizedDeltaX = 'normalizedDeltaX',
  normalizedDeltaY = 'normalizedDeltaY'
}

export type Action = {
  callback?: (event: any, input: any) => any
  key: ActionKey
  defaultValue?: any
  preventReset?: boolean
}

export type InputMapping = { [key: string | MouseInput]: Action }
export type ComputedInputMapping = {
  transform: () => any
  action: ActionKey
  defaultValue?: any
  preventReset?: boolean
}

export type KeyboardMapping = {
  pressed?: InputMapping
  keyup?: InputMapping
  keydown?: InputMapping
  hotkeys?: InputMapping
  globalHotkeys?: InputMapping
}
export type MouseMapping = {
  click?: InputMapping
  dblclick?: InputMapping
  move?: InputMapping
  wheel?: InputMapping
  pressed?: InputMapping
  mouseup?: InputMapping
  mousedown?: InputMapping
}
export type ComputedMapping = ComputedInputMapping[]
export type InputActionMapping = {
  keyboard: KeyboardMapping
  mouse: MouseMapping
  computed?: ComputedMapping
}

export type ActionState = {
  [key in ActionKey]: any
}

export const FlyMapping: InputActionMapping = {
  keyboard: {
    pressed: {
      w: { key: FlyActionSet.moveForward, preventReset: true, defaultValue: 0 },
      a: { key: FlyActionSet.moveLeft, preventReset: true, defaultValue: 0 },
      s: { key: FlyActionSet.moveBackward, preventReset: true, defaultValue: 0 },
      d: { key: FlyActionSet.moveRight, preventReset: true, defaultValue: 0 },
      r: { key: FlyActionSet.moveDown, preventReset: true, defaultValue: 0 },
      t: { key: FlyActionSet.moveUp, preventReset: true, defaultValue: 0 },
      shift: { key: FlyActionSet.boost, preventReset: true, defaultValue: 0 }
    }
  },
  mouse: {
    move: {
      normalizedMovementX: { key: FlyActionSet.lookX, defaultValue: 0 },
      normalizedMovementY: { key: FlyActionSet.lookY, defaultValue: 0 }
    }
  },
  computed: [
    {
      transform: () => getInput(FlyActionSet.moveRight) - getInput(FlyActionSet.moveLeft),
      action: FlyActionSet.moveX,
      preventReset: true,
      defaultValue: 0
    },
    {
      transform: () => getInput(FlyActionSet.moveUp) - getInput(FlyActionSet.moveDown),
      action: FlyActionSet.moveY,
      preventReset: true,
      defaultValue: 0
    },
    {
      transform: () => getInput(FlyActionSet.moveBackward) - getInput(FlyActionSet.moveForward),
      action: FlyActionSet.moveZ,
      preventReset: true,
      defaultValue: 0
    }
  ]
}

export const EditorMapping: InputActionMapping = {
  mouse: {
    dblclick: {
      position: { key: EditorActionSet.focusPosition, defaultValue: { x: 0, y: 0 } }
    },
    wheel: {
      normalizedDeltaY: { key: EditorActionSet.zoomDelta, defaultValue: 0 }
    },
    pressed: {
      left: { key: EditorActionSet.selecting, preventReset: true, defaultValue: 0 },
      middle: { key: EditorActionSet.panning, preventReset: true, defaultValue: 0 },
      right: { key: EditorActionSet.flying, preventReset: true, defaultValue: 0 }
    },
    mousedown: {
      left: { key: EditorActionSet.selectStart, defaultValue: 0 },
      position: { key: EditorActionSet.selectStartPosition, defaultValue: 0 },
      right: {
        callback: (event, input) => input.canvas.requestPointerLock(),
        key: EditorActionSet.enableFlyMode,
        defaultValue: 0
      }
    },
    mouseup: {
      left: { key: EditorActionSet.selectEnd, defaultValue: 0 },
      position: { key: EditorActionSet.selectEndPosition, defaultValue: 0 },
      right: {
        callback: (event, input) => {
          if (document.pointerLockElement === input.canvas) {
            document.exitPointerLock()
          }
        },
        key: EditorActionSet.disableFlyMode,
        defaultValue: 0
      }
    },
    move: {
      position: { key: EditorActionSet.cursorPosition, defaultValue: 0 },
      normalizedMovementX: { key: EditorActionSet.cursorDeltaX, defaultValue: 0 },
      normalizedMovementY: { key: EditorActionSet.cursorDeltaY, defaultValue: 0 }
    }
  },
  keyboard: {
    pressed: {
      mod: { key: EditorActionSet.modifier, preventReset: true, defaultValue: 0 },
      shift: { key: EditorActionSet.shift, preventReset: true, defaultValue: 0 }
    },
    hotkeys: {
      '=': { key: EditorActionSet.incrementGridHeight, defaultValue: false },
      '-': { key: EditorActionSet.decrementGridHeight, defaultValue: false },
      f: { key: EditorActionSet.focusSelection, defaultValue: false },
      t: { key: EditorActionSet.setTranslateMode, defaultValue: false },
      r: { key: EditorActionSet.setRotateMode, defaultValue: false },
      y: { key: EditorActionSet.setScaleMode, defaultValue: false },
      q: { key: EditorActionSet.rotateLeft, defaultValue: false },
      e: { key: EditorActionSet.rotateRight, defaultValue: false },
      g: { key: EditorActionSet.grab, defaultValue: false },
      z: { key: EditorActionSet.toggleTransformSpace, defaultValue: false },
      x: { key: EditorActionSet.toggleTransformPivot, defaultValue: false },
      c: { key: EditorActionSet.toggleSnapMode, defaultValue: false },
      backspace: { key: EditorActionSet.deleteSelected, defaultValue: false },
      del: { key: EditorActionSet.deleteSelected, defaultValue: false },
      'mod+z': { key: EditorActionSet.undo, defaultValue: false },
      'mod+shift+z': { key: EditorActionSet.redo, defaultValue: false },
      'mod+d': { key: EditorActionSet.duplicateSelected, defaultValue: false },
      'mod+g': { key: EditorActionSet.groupSelected, defaultValue: false },
      esc: { key: EditorActionSet.cancel, defaultValue: false }
    },
    globalHotkeys: {
      'mod+s': { key: EditorActionSet.saveProject, defaultValue: false }
    }
  }
}
