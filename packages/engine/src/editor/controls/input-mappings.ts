function requestPointerLockHandler(filter) {
  return {
    handler: (event, input) => {
      const shouldRequest = filter ? filter(event, input) : true;
      if (shouldRequest) {
        input.canvas.requestPointerLock();
      }
    }
  };
}
function exitPointerLockHandler(filter) {
  return {
    handler: (event, input) => {
      const shouldExit = filter ? filter(event, input) : true;
      if (shouldExit && document.pointerLockElement === input.canvas) {
        document.exitPointerLock();
      }
    }
  };
}
function booleanEventHandler(outputAction) {
  return {
    reset: true,
    defaultValue: false,
    handler: () => true,
    action: outputAction
  };
}
export const Fly = {
  moveLeft: "moveLeft",
  moveRight: "moveRight",
  moveX: "moveX",
  moveForward: "moveForward",
  moveBackward: "moveBackward",
  moveZ: "moveZ",
  lookX: "lookX",
  lookY: "lookY",
  moveDown: "moveDown",
  moveUp: "moveUp",
  moveY: "moveY",
  boost: "boost"
};
export const Editor = {
  grab: "grab",
  focus: "focus",
  focusPosition: "focusPosition",
  focusSelection: "focusSelection",
  zoomDelta: "zoomDelta",
  enableFlyMode: "enableFlyMode",
  disableFlyMode: "disableFlyMode",
  flying: "flying",
  selecting: "selecting",
  selectStart: "selectStart",
  selectStartPosition: "selectStartPosition",
  selectEnd: "selectEnd",
  selectEndPosition: "selectEndPosition",
  cursorPosition: "cursorPosition",
  cursorDeltaX: "cursorDeltaX",
  cursorDeltaY: "cursorDeltaY",
  panning: "panning",
  setTranslateMode: "setTranslateMode",
  setRotateMode: "setRotateMode",
  setScaleMode: "setScaleMode",
  toggleSnapMode: "toggleSnapMode",
  toggleTransformPivot: "toggleTransformPivot",
  modifier: "modifier",
  shift: "shift",
  toggleTransformSpace: "toggleTransformSpace",
  deleteSelected: "deleteSelected",
  undo: "undo",
  redo: "redo",
  duplicateSelected: "duplicateSelected",
  groupSelected: "groupSelected",
  saveProject: "saveProject",
  cancel: "cancel",
  rotateLeft: "rotateLeft",
  rotateRight: "rotateRight",
  incrementGridHeight: "incrementGridHeight",
  decrementGridHeight: "decrementGridHeight"
};
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
      transform: input => input.get(Fly.moveRight) - input.get(Fly.moveLeft),
      action: Fly.moveX
    },
    {
      transform: input => input.get(Fly.moveUp) - input.get(Fly.moveDown),
      action: Fly.moveY
    },
    {
      transform: input =>
        input.get(Fly.moveBackward) - input.get(Fly.moveForward),
      action: Fly.moveZ
    }
  ]
};
export const EditorMapping = {
  mouse: {
    dblclick: {
      event: [booleanEventHandler(Editor.focus)],
      position: Editor.focusPosition
    },
    wheel: {
      normalizedDeltaY: Editor.zoomDelta
    },
    pressed: {
      left: Editor.selecting,
      middle: Editor.panning,
      right: Editor.flying
    },
    mousedown: {
      event: [requestPointerLockHandler(event => event.button === 2)],
      left: Editor.selectStart,
      position: Editor.selectStartPosition,
      right: Editor.enableFlyMode
    },
    mouseup: {
      event: [exitPointerLockHandler(event => event.button === 2)],
      left: Editor.selectEnd,
      position: Editor.selectEndPosition,
      right: Editor.disableFlyMode
    },
    move: {
      position: Editor.cursorPosition,
      normalizedMovementX: Editor.cursorDeltaX,
      normalizedMovementY: Editor.cursorDeltaY
    }
  },
  keyboard: {
    pressed: {
      mod: Editor.modifier,
      shift: Editor.shift
    },
    hotkeys: {
      "=": Editor.incrementGridHeight,
      "-": Editor.decrementGridHeight,
      f: Editor.focusSelection,
      t: Editor.setTranslateMode,
      r: Editor.setRotateMode,
      y: Editor.setScaleMode,
      q: Editor.rotateLeft,
      e: Editor.rotateRight,
      g: Editor.grab,
      z: Editor.toggleTransformSpace,
      x: Editor.toggleTransformPivot,
      c: Editor.toggleSnapMode,
      backspace: Editor.deleteSelected,
      del: Editor.deleteSelected,
      "mod+z": Editor.undo,
      "mod+shift+z": Editor.redo,
      "mod+d": Editor.duplicateSelected,
      "mod+g": Editor.groupSelected,
      esc: Editor.cancel
    },
    globalHotkeys: {
      "mod+s": Editor.saveProject
    }
  }
};
