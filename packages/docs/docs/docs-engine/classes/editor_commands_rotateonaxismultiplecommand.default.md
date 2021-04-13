---
id: "editor_commands_rotateonaxismultiplecommand.default"
title: "Class: default"
sidebar_label: "default"
custom_edit_url: null
hide_title: true
---

# Class: default

[editor/commands/RotateOnAxisMultipleCommand](../modules/editor_commands_rotateonaxismultiplecommand.md).default

## Hierarchy

* [*default*](editor_commands_command.default.md)

  ↳ **default**

## Constructors

### constructor

\+ **new default**(`editor`: *any*, `objects`: *any*, `axis`: *any*, `angle`: *any*, `space`: *any*): [*default*](editor_commands_rotateonaxismultiplecommand.default.md)

#### Parameters:

Name | Type |
:------ | :------ |
`editor` | *any* |
`objects` | *any* |
`axis` | *any* |
`angle` | *any* |
`space` | *any* |

**Returns:** [*default*](editor_commands_rotateonaxismultiplecommand.default.md)

Overrides: [default](editor_commands_command.default.md)

Defined in: [packages/engine/src/editor/commands/RotateOnAxisMultipleCommand.ts:10](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/commands/RotateOnAxisMultipleCommand.ts#L10)

## Properties

### angle

• **angle**: *any*

Defined in: [packages/engine/src/editor/commands/RotateOnAxisMultipleCommand.ts:8](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/commands/RotateOnAxisMultipleCommand.ts#L8)

___

### axis

• **axis**: *any*

Defined in: [packages/engine/src/editor/commands/RotateOnAxisMultipleCommand.ts:7](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/commands/RotateOnAxisMultipleCommand.ts#L7)

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

Defined in: [packages/engine/src/editor/commands/RotateOnAxisMultipleCommand.ts:6](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/commands/RotateOnAxisMultipleCommand.ts#L6)

___

### oldRotations

• **oldRotations**: *any*

Defined in: [packages/engine/src/editor/commands/RotateOnAxisMultipleCommand.ts:10](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/commands/RotateOnAxisMultipleCommand.ts#L10)

___

### space

• **space**: *any*

Defined in: [packages/engine/src/editor/commands/RotateOnAxisMultipleCommand.ts:9](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/commands/RotateOnAxisMultipleCommand.ts#L9)

## Methods

### execute

▸ **execute**(): *void*

**Returns:** *void*

Overrides: [default](editor_commands_command.default.md)

Defined in: [packages/engine/src/editor/commands/RotateOnAxisMultipleCommand.ts:19](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/commands/RotateOnAxisMultipleCommand.ts#L19)

___

### shouldUpdate

▸ **shouldUpdate**(`newCommand`: *any*): *boolean*

#### Parameters:

Name | Type |
:------ | :------ |
`newCommand` | *any* |

**Returns:** *boolean*

Overrides: [default](editor_commands_command.default.md)

Defined in: [packages/engine/src/editor/commands/RotateOnAxisMultipleCommand.ts:28](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/commands/RotateOnAxisMultipleCommand.ts#L28)

___

### toString

▸ **toString**(): *string*

**Returns:** *string*

Overrides: [default](editor_commands_command.default.md)

Defined in: [packages/engine/src/editor/commands/RotateOnAxisMultipleCommand.ts:57](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/commands/RotateOnAxisMultipleCommand.ts#L57)

___

### undo

▸ **undo**(): *void*

**Returns:** *void*

Overrides: [default](editor_commands_command.default.md)

Defined in: [packages/engine/src/editor/commands/RotateOnAxisMultipleCommand.ts:45](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/commands/RotateOnAxisMultipleCommand.ts#L45)

___

### update

▸ **update**(`command`: *any*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`command` | *any* |

**Returns:** *void*

Overrides: [default](editor_commands_command.default.md)

Defined in: [packages/engine/src/editor/commands/RotateOnAxisMultipleCommand.ts:35](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/commands/RotateOnAxisMultipleCommand.ts#L35)
