---
id: "editor_controls_input_mappings"
title: "Module: editor/controls/input-mappings"
sidebar_label: "editor/controls/input-mappings"
custom_edit_url: null
hide_title: true
---

# Module: editor/controls/input-mappings

## Variables

### Editor

• `Const` **Editor**: *object*

#### Type declaration:

Name | Type |
:------ | :------ |
`cancel` | *string* |
`cursorDeltaX` | *string* |
`cursorDeltaY` | *string* |
`cursorPosition` | *string* |
`decrementGridHeight` | *string* |
`deleteSelected` | *string* |
`disableFlyMode` | *string* |
`duplicateSelected` | *string* |
`enableFlyMode` | *string* |
`flying` | *string* |
`focus` | *string* |
`focusPosition` | *string* |
`focusSelection` | *string* |
`grab` | *string* |
`groupSelected` | *string* |
`incrementGridHeight` | *string* |
`modifier` | *string* |
`panning` | *string* |
`redo` | *string* |
`rotateLeft` | *string* |
`rotateRight` | *string* |
`saveProject` | *string* |
`selectEnd` | *string* |
`selectEndPosition` | *string* |
`selectStart` | *string* |
`selectStartPosition` | *string* |
`selecting` | *string* |
`setRotateMode` | *string* |
`setScaleMode` | *string* |
`setTranslateMode` | *string* |
`shift` | *string* |
`toggleSnapMode` | *string* |
`toggleTransformPivot` | *string* |
`toggleTransformSpace` | *string* |
`undo` | *string* |
`zoomDelta` | *string* |

Defined in: [packages/engine/src/editor/controls/input-mappings.ts:43](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/controls/input-mappings.ts#L43)

___

### EditorMapping

• `Const` **EditorMapping**: *object*

#### Type declaration:

Name | Type |
:------ | :------ |
`keyboard` | *object* |
`keyboard.globalHotkeys` | *object* |
`keyboard.globalHotkeys.mod+s` | *string* |
`keyboard.hotkeys` | *object* |
`keyboard.hotkeys.-` | *string* |
`keyboard.hotkeys.=` | *string* |
`keyboard.hotkeys.backspace` | *string* |
`keyboard.hotkeys.c` | *string* |
`keyboard.hotkeys.del` | *string* |
`keyboard.hotkeys.e` | *string* |
`keyboard.hotkeys.esc` | *string* |
`keyboard.hotkeys.f` | *string* |
`keyboard.hotkeys.g` | *string* |
`keyboard.hotkeys.mod+d` | *string* |
`keyboard.hotkeys.mod+g` | *string* |
`keyboard.hotkeys.mod+shift+z` | *string* |
`keyboard.hotkeys.mod+z` | *string* |
`keyboard.hotkeys.q` | *string* |
`keyboard.hotkeys.r` | *string* |
`keyboard.hotkeys.t` | *string* |
`keyboard.hotkeys.x` | *string* |
`keyboard.hotkeys.y` | *string* |
`keyboard.hotkeys.z` | *string* |
`keyboard.pressed` | *object* |
`keyboard.pressed.mod` | *string* |
`keyboard.pressed.shift` | *string* |
`mouse` | *object* |
`mouse.dblclick` | *object* |
`mouse.dblclick.event` | { `action`: *any* ; `defaultValue`: *boolean* = false; `handler`: () => *boolean* ; `reset`: *boolean* = true }[] |
`mouse.dblclick.position` | *string* |
`mouse.mousedown` | *object* |
`mouse.mousedown.event` | { `handler`: (`event`: *any*, `input`: *any*) => *void*  }[] |
`mouse.mousedown.left` | *string* |
`mouse.mousedown.position` | *string* |
`mouse.mousedown.right` | *string* |
`mouse.mouseup` | *object* |
`mouse.mouseup.event` | { `handler`: (`event`: *any*, `input`: *any*) => *void*  }[] |
`mouse.mouseup.left` | *string* |
`mouse.mouseup.position` | *string* |
`mouse.mouseup.right` | *string* |
`mouse.move` | *object* |
`mouse.move.normalizedMovementX` | *string* |
`mouse.move.normalizedMovementY` | *string* |
`mouse.move.position` | *string* |
`mouse.pressed` | *object* |
`mouse.pressed.left` | *string* |
`mouse.pressed.middle` | *string* |
`mouse.pressed.right` | *string* |
`mouse.wheel` | *object* |
`mouse.wheel.normalizedDeltaY` | *string* |

Defined in: [packages/engine/src/editor/controls/input-mappings.ts:115](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/controls/input-mappings.ts#L115)

___

### Fly

• `Const` **Fly**: *object*

#### Type declaration:

Name | Type |
:------ | :------ |
`boost` | *string* |
`lookX` | *string* |
`lookY` | *string* |
`moveBackward` | *string* |
`moveDown` | *string* |
`moveForward` | *string* |
`moveLeft` | *string* |
`moveRight` | *string* |
`moveUp` | *string* |
`moveX` | *string* |
`moveY` | *string* |
`moveZ` | *string* |

Defined in: [packages/engine/src/editor/controls/input-mappings.ts:29](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/controls/input-mappings.ts#L29)

___

### FlyMapping

• `Const` **FlyMapping**: *object*

#### Type declaration:

Name | Type |
:------ | :------ |
`computed` | { `action`: *string* ; `transform`: (`input`: *any*) => *number*  }[] |
`keyboard` | *object* |
`keyboard.pressed` | *object* |
`keyboard.pressed.a` | *string* |
`keyboard.pressed.d` | *string* |
`keyboard.pressed.r` | *string* |
`keyboard.pressed.s` | *string* |
`keyboard.pressed.shift` | *string* |
`keyboard.pressed.t` | *string* |
`keyboard.pressed.w` | *string* |
`mouse` | *object* |
`mouse.move` | *object* |
`mouse.move.normalizedMovementX` | *string* |
`mouse.move.normalizedMovementY` | *string* |

Defined in: [packages/engine/src/editor/controls/input-mappings.ts:81](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/controls/input-mappings.ts#L81)
