---
id: "editor_commands_setrotationmultiplecommand.default"
title: "Class: default"
sidebar_label: "default"
custom_edit_url: null
hide_title: true
---

# Class: default

[editor/commands/SetRotationMultipleCommand](../modules/editor_commands_setrotationmultiplecommand.md).default

## Hierarchy

* [*default*](editor_commands_command.default.md)

  ↳ **default**

## Constructors

### constructor

\+ **new default**(`editor`: *any*, `objects`: *any*, `rotation`: *any*, `space`: *any*): [*default*](editor_commands_setrotationmultiplecommand.default.md)

#### Parameters:

Name | Type |
:------ | :------ |
`editor` | *any* |
`objects` | *any* |
`rotation` | *any* |
`space` | *any* |

**Returns:** [*default*](editor_commands_setrotationmultiplecommand.default.md)

Overrides: [default](editor_commands_command.default.md)

Defined in: [packages/engine/src/editor/commands/SetRotationMultipleCommand.ts:9](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/commands/SetRotationMultipleCommand.ts#L9)

## Properties

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

Defined in: [packages/engine/src/editor/commands/SetRotationMultipleCommand.ts:6](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/commands/SetRotationMultipleCommand.ts#L6)

___

### oldRotations

• **oldRotations**: *any*

Defined in: [packages/engine/src/editor/commands/SetRotationMultipleCommand.ts:9](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/commands/SetRotationMultipleCommand.ts#L9)

___

### rotation

• **rotation**: *any*

Defined in: [packages/engine/src/editor/commands/SetRotationMultipleCommand.ts:7](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/commands/SetRotationMultipleCommand.ts#L7)

___

### space

• **space**: *any*

Defined in: [packages/engine/src/editor/commands/SetRotationMultipleCommand.ts:8](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/commands/SetRotationMultipleCommand.ts#L8)

## Methods

### execute

▸ **execute**(): *void*

**Returns:** *void*

Overrides: [default](editor_commands_command.default.md)

Defined in: [packages/engine/src/editor/commands/SetRotationMultipleCommand.ts:17](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/commands/SetRotationMultipleCommand.ts#L17)

___

### shouldUpdate

▸ **shouldUpdate**(`newCommand`: *any*): *boolean*

#### Parameters:

Name | Type |
:------ | :------ |
`newCommand` | *any* |

**Returns:** *boolean*

Overrides: [default](editor_commands_command.default.md)

Defined in: [packages/engine/src/editor/commands/SetRotationMultipleCommand.ts:25](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/commands/SetRotationMultipleCommand.ts#L25)

___

### toString

▸ **toString**(): *string*

**Returns:** *string*

Overrides: [default](editor_commands_command.default.md)

Defined in: [packages/engine/src/editor/commands/SetRotationMultipleCommand.ts:52](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/commands/SetRotationMultipleCommand.ts#L52)

___

### undo

▸ **undo**(): *void*

**Returns:** *void*

Overrides: [default](editor_commands_command.default.md)

Defined in: [packages/engine/src/editor/commands/SetRotationMultipleCommand.ts:40](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/commands/SetRotationMultipleCommand.ts#L40)

___

### update

▸ **update**(`command`: *any*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`command` | *any* |

**Returns:** *void*

Overrides: [default](editor_commands_command.default.md)

Defined in: [packages/engine/src/editor/commands/SetRotationMultipleCommand.ts:31](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/commands/SetRotationMultipleCommand.ts#L31)
