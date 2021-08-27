function requestPointerLockHandler(filter) {
  return {
    handler: (event, input) => {
      const shouldRequest = filter ? filter(event, input) : true
      if (shouldRequest) {
        input.canvas.requestPointerLock()
      }
    }
  }
}
function exitPointerLockHandler(filter) {
  return {
    handler: (event, input) => {
      const shouldExit = filter ? filter(event, input) : true
      if (shouldExit && document.pointerLockElement === input.canvas) {
        document.exitPointerLock()
      }
    }
  }
}
function booleanEventHandler(outputAction) {
  return {
    reset: true,
    defaultValue: false,
    handler: () => true,
    action: outputAction
  }
}
export const Fly = {
  moveLeft: 'moveLeft',
  moveRight: 'moveRight',
  moveX: 'moveX',
  moveForward: 'moveForward',
  moveBackward: 'moveBackward',
  moveZ: 'moveZ',
  lookX: 'lookX',
  lookY: 'lookY',
  moveDown: 'moveDown',
  moveUp: 'moveUp',
  moveY: 'moveY',
  boost: 'boost'
}
export const EditorInputs = {
  grab: 'grab',
  focus: 'focus',
  focusPosition: 'focusPosition',
  focusSelection: 'focusSelection',
  zoomDelta: 'zoomDelta',
  enableFlyMode: 'enableFlyMode',
  disableFlyMode: 'disableFlyMode',
  flying: 'flying',
  selecting: 'selecting',
  selectStart: 'selectStart',
  selectStartPosition: 'selectStartPosition',
  selectEnd: 'selectEnd',
  selectEndPosition: 'selectEndPosition',
  cursorPosition: 'cursorPosition',
  cursorDeltaX: 'cursorDeltaX',
  cursorDeltaY: 'cursorDeltaY',
  panning: 'panning',
  setTranslateMode: 'setTranslateMode',
  setRotateMode: 'setRotateMode',
  setScaleMode: 'setScaleMode',
  toggleSnapMode: 'toggleSnapMode',
  toggleTransformPivot: 'toggleTransformPivot',
  modifier: 'modifier',
  shift: 'shift',
  toggleTransformSpace: 'toggleTransformSpace',
  deleteSelected: 'deleteSelected',
  undo: 'undo',
  redo: 'redo',
  duplicateSelected: 'duplicateSelected',
  groupSelected: 'groupSelected',
  saveProject: 'saveProject',
  cancel: 'cancel',
  rotateLeft: 'rotateLeft',
  rotateRight: 'rotateRight',
  incrementGridHeight: 'incrementGridHeight',
  decrementGridHeight: 'decrementGridHeight'
}
export const FlyMapping = {
  keyboard: {
    pressed: {
      w: Fly.moveForward,
      a: Fly.moveLeft,
      s: Fly.moveBackward,
      d: Fly.moveRight,
      r: Fly.moveDown,
      t: Fly.moveUp,
      shift: Fly.boost
    }
  },
  mouse: {
    move: {
      normalizedMovementX: Fly.lookX,
      normalizedMovementY: Fly.lookY
    }
  },
  computed: [
    {
      transform: (input) => input.get(Fly.moveRight) - input.get(Fly.moveLeft),
      action: Fly.moveX
    },
    {
      transform: (input) => input.get(Fly.moveUp) - input.get(Fly.moveDown),
      action: Fly.moveY
    },
    {
      transform: (input) => input.get(Fly.moveBackward) - input.get(Fly.moveForward),
      action: Fly.moveZ
    }
  ]
}
export const EditorMapping = {
  mouse: {
    dblclick: {
      event: [booleanEventHandler(EditorInputs.focus)],
      position: EditorInputs.focusPosition
    },
    wheel: {
      normalizedDeltaY: EditorInputs.zoomDelta
    },
    pressed: {
      left: EditorInputs.selecting,
      middle: EditorInputs.panning,
      right: EditorInputs.flying
    },
    mousedown: {
      event: [requestPointerLockHandler((event) => event.button === 2)],
      left: EditorInputs.selectStart,
      position: EditorInputs.selectStartPosition,
      right: EditorInputs.enableFlyMode
    },
    mouseup: {
      event: [exitPointerLockHandler((event) => event.button === 2)],
      left: EditorInputs.selectEnd,
      position: EditorInputs.selectEndPosition,
      right: EditorInputs.disableFlyMode
    },
    move: {
      position: EditorInputs.cursorPosition,
      normalizedMovementX: EditorInputs.cursorDeltaX,
      normalizedMovementY: EditorInputs.cursorDeltaY
    }
  },
  keyboard: {
    pressed: {
      mod: EditorInputs.modifier,
      shift: EditorInputs.shift
    },
    hotkeys: {
      '=': EditorInputs.incrementGridHeight,
      '-': EditorInputs.decrementGridHeight,
      f: EditorInputs.focusSelection,
      t: EditorInputs.setTranslateMode,
      r: EditorInputs.setRotateMode,
      y: EditorInputs.setScaleMode,
      q: EditorInputs.rotateLeft,
      e: EditorInputs.rotateRight,
      g: EditorInputs.grab,
      z: EditorInputs.toggleTransformSpace,
      x: EditorInputs.toggleTransformPivot,
      c: EditorInputs.toggleSnapMode,
      backspace: EditorInputs.deleteSelected,
      del: EditorInputs.deleteSelected,
      'mod+z': EditorInputs.undo,
      'mod+shift+z': EditorInputs.redo,
      'mod+d': EditorInputs.duplicateSelected,
      'mod+g': EditorInputs.groupSelected,
      esc: EditorInputs.cancel
    },
    globalHotkeys: {
      'mod+s': EditorInputs.saveProject
    }
  }
}
