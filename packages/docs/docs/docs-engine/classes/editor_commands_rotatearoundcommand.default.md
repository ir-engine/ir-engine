---
id: "editor_commands_rotatearoundcommand.default"
title: "Class: default"
sidebar_label: "default"
custom_edit_url: null
hide_title: true
---

# Class: default

[editor/commands/RotateAroundCommand](../modules/editor_commands_rotatearoundcommand.md).default

## Hierarchy

* [*default*](editor_commands_command.default.md)

  ↳ **default**

## Constructors

### constructor

\+ **new default**(`editor`: *any*, `object`: *any*, `pivot`: *any*, `axis`: *any*, `angle`: *any*): [*default*](editor_commands_rotatearoundcommand.default.md)

#### Parameters:

Name | Type |
:------ | :------ |
`editor` | *any* |
`object` | *any* |
`pivot` | *any* |
`axis` | *any* |
`angle` | *any* |

**Returns:** [*default*](editor_commands_rotatearoundcommand.default.md)

Overrides: [default](editor_commands_command.default.md)

Defined in: [packages/engine/src/editor/commands/RotateAroundCommand.ts:10](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/commands/RotateAroundCommand.ts#L10)

## Properties

### angle

• **angle**: *any*

Defined in: [packages/engine/src/editor/commands/RotateAroundCommand.ts:8](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/commands/RotateAroundCommand.ts#L8)

___

### axis

• **axis**: *any*

Defined in: [packages/engine/src/editor/commands/RotateAroundCommand.ts:7](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/commands/RotateAroundCommand.ts#L7)

___

### editor

• **editor**: *any*

Inherited from: [default](editor_commands_command.default.md).[editor](editor_commands_command.default.md#editor)

Defined in: [packages/engine/src/editor/commands/Command.ts:6](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/commands/Command.ts#L6)

___

### id

• **id**: *number*

Inherited from: [default](editor_commands_command.default.md).[id](editor_commands_command.default.md#id)

Defined in: [packages/engine/src/editor/commands/Command.ts:7](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/commands/Command.ts#L7)

___

### object

• **object**: *any*

Defined in: [packages/engine/src/editor/commands/RotateAroundCommand.ts:5](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/commands/RotateAroundCommand.ts#L5)

___

### oldPosition

• **oldPosition**: *any*

Defined in: [packages/engine/src/editor/commands/RotateAroundCommand.ts:9](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/commands/RotateAroundCommand.ts#L9)

___

### oldRotation

• **oldRotation**: *any*

Defined in: [packages/engine/src/editor/commands/RotateAroundCommand.ts:10](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/commands/RotateAroundCommand.ts#L10)

___

### pivot

• **pivot**: *any*

Defined in: [packages/engine/src/editor/commands/RotateAroundCommand.ts:6](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/commands/RotateAroundCommand.ts#L6)

## Methods

### execute

▸ **execute**(): *void*

**Returns:** *void*

Overrides: [default](editor_commands_command.default.md)

Defined in: [packages/engine/src/editor/commands/RotateAroundCommand.ts:20](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/commands/RotateAroundCommand.ts#L20)

___

### objects

▸ **objects**(`arg0`: *string*, `objects`: *any*, `arg2`: *string*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`arg0` | *string* |
`objects` | *any* |
`arg2` | *string* |

**Returns:** *void*

Defined in: [packages/engine/src/editor/commands/RotateAroundCommand.ts:64](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/commands/RotateAroundCommand.ts#L64)

___

### shouldUpdate

▸ **shouldUpdate**(`newCommand`: *any*): *any*

#### Parameters:

Name | Type |
:------ | :------ |
`newCommand` | *any* |

**Returns:** *any*

Overrides: [default](editor_commands_command.default.md)

Defined in: [packages/engine/src/editor/commands/RotateAroundCommand.ts:29](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/commands/RotateAroundCommand.ts#L29)

___

### toString

▸ **toString**(): *string*

**Returns:** *string*

Overrides: [default](editor_commands_command.default.md)

Defined in: [packages/engine/src/editor/commands/RotateAroundCommand.ts:67](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/commands/RotateAroundCommand.ts#L67)

___

### undo

▸ **undo**(): *void*

**Returns:** *void*

Overrides: [default](editor_commands_command.default.md)

Defined in: [packages/engine/src/editor/commands/RotateAroundCommand.ts:46](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/commands/RotateAroundCommand.ts#L46)

___

### update

▸ **update**(`command`: *any*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`command` | *any* |

**Returns:** *void*

Overrides: [default](editor_commands_command.default.md)

Defined in: [packages/engine/src/editor/commands/RotateAroundCommand.ts:36](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/commands/RotateAroundCommand.ts#L36)
