---
id: "input_behaviors_gamepadinputbehaviors"
title: "Module: input/behaviors/GamepadInputBehaviors"
sidebar_label: "input/behaviors/GamepadInputBehaviors"
custom_edit_url: null
hide_title: true
---

# Module: input/behaviors/GamepadInputBehaviors

## Variables

### gamepadMapping

• `Const` **gamepadMapping**: *object*

#### Type declaration:

Name | Type |
:------ | :------ |
`standard` | *object* |
`standard.0` | [*GamepadButtons*](../enums/input_enums_inputenums.gamepadbuttons.md) |
`standard.1` | [*GamepadButtons*](../enums/input_enums_inputenums.gamepadbuttons.md) |
`standard.10` | [*GamepadButtons*](../enums/input_enums_inputenums.gamepadbuttons.md) |
`standard.11` | [*GamepadButtons*](../enums/input_enums_inputenums.gamepadbuttons.md) |
`standard.12` | [*GamepadButtons*](../enums/input_enums_inputenums.gamepadbuttons.md) |
`standard.13` | [*GamepadButtons*](../enums/input_enums_inputenums.gamepadbuttons.md) |
`standard.14` | [*GamepadButtons*](../enums/input_enums_inputenums.gamepadbuttons.md) |
`standard.15` | [*GamepadButtons*](../enums/input_enums_inputenums.gamepadbuttons.md) |
`standard.2` | [*GamepadButtons*](../enums/input_enums_inputenums.gamepadbuttons.md) |
`standard.3` | [*GamepadButtons*](../enums/input_enums_inputenums.gamepadbuttons.md) |
`standard.4` | [*GamepadButtons*](../enums/input_enums_inputenums.gamepadbuttons.md) |
`standard.5` | [*GamepadButtons*](../enums/input_enums_inputenums.gamepadbuttons.md) |
`standard.6` | [*GamepadButtons*](../enums/input_enums_inputenums.gamepadbuttons.md) |
`standard.7` | [*GamepadButtons*](../enums/input_enums_inputenums.gamepadbuttons.md) |
`standard.8` | [*GamepadButtons*](../enums/input_enums_inputenums.gamepadbuttons.md) |
`standard.9` | [*GamepadButtons*](../enums/input_enums_inputenums.gamepadbuttons.md) |
`xr-standard` | *object* |
`xr-standard.left` | *object* |
`xr-standard.left.axes` | [*XRAxes*](../enums/input_enums_inputenums.xraxes.md) |
`xr-standard.left.buttons` | *object* |
`xr-standard.left.buttons.0` | [*GamepadButtons*](../enums/input_enums_inputenums.gamepadbuttons.md) |
`xr-standard.left.buttons.1` | [*GamepadButtons*](../enums/input_enums_inputenums.gamepadbuttons.md) |
`xr-standard.left.buttons.2` | [*GamepadButtons*](../enums/input_enums_inputenums.gamepadbuttons.md) |
`xr-standard.left.buttons.3` | [*GamepadButtons*](../enums/input_enums_inputenums.gamepadbuttons.md) |
`xr-standard.left.buttons.4` | [*GamepadButtons*](../enums/input_enums_inputenums.gamepadbuttons.md) |
`xr-standard.left.buttons.5` | [*GamepadButtons*](../enums/input_enums_inputenums.gamepadbuttons.md) |
`xr-standard.right` | *object* |
`xr-standard.right.axes` | [*XRAxes*](../enums/input_enums_inputenums.xraxes.md) |
`xr-standard.right.buttons` | *object* |
`xr-standard.right.buttons.0` | [*GamepadButtons*](../enums/input_enums_inputenums.gamepadbuttons.md) |
`xr-standard.right.buttons.1` | [*GamepadButtons*](../enums/input_enums_inputenums.gamepadbuttons.md) |
`xr-standard.right.buttons.2` | [*GamepadButtons*](../enums/input_enums_inputenums.gamepadbuttons.md) |
`xr-standard.right.buttons.3` | [*GamepadButtons*](../enums/input_enums_inputenums.gamepadbuttons.md) |
`xr-standard.right.buttons.4` | [*GamepadButtons*](../enums/input_enums_inputenums.gamepadbuttons.md) |
`xr-standard.right.buttons.5` | [*GamepadButtons*](../enums/input_enums_inputenums.gamepadbuttons.md) |

Defined in: [packages/engine/src/input/behaviors/GamepadInputBehaviors.ts:181](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/input/behaviors/GamepadInputBehaviors.ts#L181)

## Functions

### handleGamepadAxis

▸ `Const`**handleGamepadAxis**(`args`: { `gamepad`: Gamepad ; `inputIndex`: *number* ; `mappedInputValue`: [*InputAlias*](input_types_inputalias.md#inputalias)  }): *void*

Gamepad axios

#### Parameters:

Name | Type | Description |
:------ | :------ | :------ |
`args` | *object* | is argument object    |
`args.gamepad` | Gamepad | - |
`args.inputIndex` | *number* | - |
`args.mappedInputValue` | [*InputAlias*](input_types_inputalias.md#inputalias) | - |

**Returns:** *void*

Defined in: [packages/engine/src/input/behaviors/GamepadInputBehaviors.ts:100](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/input/behaviors/GamepadInputBehaviors.ts#L100)

___

### handleGamepadConnected

▸ `Const`**handleGamepadConnected**(`args`: { `event`: *any*  }): *void*

When a gamepad connects

#### Parameters:

Name | Type | Description |
:------ | :------ | :------ |
`args` | *object* | is argument object    |
`args.event` | *any* | - |

**Returns:** *void*

Defined in: [packages/engine/src/input/behaviors/GamepadInputBehaviors.ts:137](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/input/behaviors/GamepadInputBehaviors.ts#L137)

___

### handleGamepadDisconnected

▸ `Const`**handleGamepadDisconnected**(`args`: { `event`: *any*  }): *void*

When a gamepad disconnects

#### Parameters:

Name | Type | Description |
:------ | :------ | :------ |
`args` | *object* | is argument object    |
`args.event` | *any* | - |

**Returns:** *void*

Defined in: [packages/engine/src/input/behaviors/GamepadInputBehaviors.ts:158](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/input/behaviors/GamepadInputBehaviors.ts#L158)

___

### handleGamepads

▸ `Const`**handleGamepads**(): *void*

System behavior to handle gamepad input

**Returns:** *void*

Defined in: [packages/engine/src/input/behaviors/GamepadInputBehaviors.ts:27](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/input/behaviors/GamepadInputBehaviors.ts#L27)
