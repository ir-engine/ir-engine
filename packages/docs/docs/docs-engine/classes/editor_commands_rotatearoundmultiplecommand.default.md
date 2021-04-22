---
id: "editor_commands_rotatearoundmultiplecommand.default"
title: "Class: default"
sidebar_label: "default"
custom_edit_url: null
hide_title: true
---

# Class: default

[editor/commands/RotateAroundMultipleCommand](../modules/editor_commands_rotatearoundmultiplecommand.md).default

## Hierarchy

* [*default*](editor_commands_command.default.md)

  ↳ **default**

## Constructors

### constructor

\+ **new default**(`editor`: *any*, `objects`: *any*, `pivot`: *any*, `axis`: *any*, `angle`: *any*): [*default*](editor_commands_rotatearoundmultiplecommand.default.md)

#### Parameters:

Name | Type |
:------ | :------ |
`editor` | *any* |
`objects` | *any* |
`pivot` | *any* |
`axis` | *any* |
`angle` | *any* |

**Returns:** [*default*](editor_commands_rotatearoundmultiplecommand.default.md)

Overrides: [default](editor_commands_command.default.md)

Defined in: [packages/engine/src/editor/commands/RotateAroundMultipleCommand.ts:12](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/commands/RotateAroundMultipleCommand.ts#L12)

## Properties

### angle

• **angle**: *any*

Defined in: [packages/engine/src/editor/commands/RotateAroundMultipleCommand.ts:9](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/commands/RotateAroundMultipleCommand.ts#L9)

___

### axis

• **axis**: *any*

Defined in: [packages/engine/src/editor/commands/RotateAroundMultipleCommand.ts:8](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/commands/RotateAroundMultipleCommand.ts#L8)

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

### objects

• **objects**: *any*

Defined in: [packages/engine/src/editor/commands/RotateAroundMultipleCommand.ts:6](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/commands/RotateAroundMultipleCommand.ts#L6)

___

### oldPositions

• **oldPositions**: *any*

Defined in: [packages/engine/src/editor/commands/RotateAroundMultipleCommand.ts:11](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/commands/RotateAroundMultipleCommand.ts#L11)

___

### oldRotations

• **oldRotations**: *any*

Defined in: [packages/engine/src/editor/commands/RotateAroundMultipleCommand.ts:10](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/commands/RotateAroundMultipleCommand.ts#L10)

___

### pivot

• **pivot**: *any*

Defined in: [packages/engine/src/editor/commands/RotateAroundMultipleCommand.ts:7](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/commands/RotateAroundMultipleCommand.ts#L7)

___

### space

• **space**: *any*

Defined in: [packages/engine/src/editor/commands/RotateAroundMultipleCommand.ts:12](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/commands/RotateAroundMultipleCommand.ts#L12)

## Methods

### execute

▸ **execute**(): *void*

**Returns:** *void*

Overrides: [default](editor_commands_command.default.md)

Defined in: [packages/engine/src/editor/commands/RotateAroundMultipleCommand.ts:22](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/commands/RotateAroundMultipleCommand.ts#L22)

___

### shouldUpdate

▸ **shouldUpdate**(`newCommand`: *any*): *boolean*

#### Parameters:

Name | Type |
:------ | :------ |
`newCommand` | *any* |

**Returns:** *boolean*

Overrides: [default](editor_commands_command.default.md)

Defined in: [packages/engine/src/editor/commands/RotateAroundMultipleCommand.ts:31](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/commands/RotateAroundMultipleCommand.ts#L31)

___

### toString

▸ **toString**(): *string*

**Returns:** *string*

Overrides: [default](editor_commands_command.default.md)

Defined in: [packages/engine/src/editor/commands/RotateAroundMultipleCommand.ts:69](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/commands/RotateAroundMultipleCommand.ts#L69)

___

### undo

▸ **undo**(): *void*

**Returns:** *void*

Overrides: [default](editor_commands_command.default.md)

Defined in: [packages/engine/src/editor/commands/RotateAroundMultipleCommand.ts:48](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/commands/RotateAroundMultipleCommand.ts#L48)

___

### update

▸ **update**(`command`: *any*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`command` | *any* |

**Returns:** *void*

Overrides: [default](editor_commands_command.default.md)

Defined in: [packages/engine/src/editor/commands/RotateAroundMultipleCommand.ts:38](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/commands/RotateAroundMultipleCommand.ts#L38)
