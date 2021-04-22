---
id: "editor_commands_removemultipleobjectscommand.default"
title: "Class: default"
sidebar_label: "default"
custom_edit_url: null
hide_title: true
---

# Class: default

[editor/commands/RemoveMultipleObjectsCommand](../modules/editor_commands_removemultipleobjectscommand.md).default

## Hierarchy

* [*default*](editor_commands_command.default.md)

  ↳ **default**

## Constructors

### constructor

\+ **new default**(`editor`: *any*, `objects`: *any*): [*default*](editor_commands_removemultipleobjectscommand.default.md)

#### Parameters:

Name | Type |
:------ | :------ |
`editor` | *any* |
`objects` | *any* |

**Returns:** [*default*](editor_commands_removemultipleobjectscommand.default.md)

Overrides: [default](editor_commands_command.default.md)

Defined in: [packages/engine/src/editor/commands/RemoveMultipleObjectsCommand.ts:8](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/commands/RemoveMultipleObjectsCommand.ts#L8)

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

• **objects**: *any*[]

Defined in: [packages/engine/src/editor/commands/RemoveMultipleObjectsCommand.ts:4](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/commands/RemoveMultipleObjectsCommand.ts#L4)

___

### oldBefores

• **oldBefores**: *any*[]

Defined in: [packages/engine/src/editor/commands/RemoveMultipleObjectsCommand.ts:6](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/commands/RemoveMultipleObjectsCommand.ts#L6)

___

### oldNodes

• **oldNodes**: *any*

Defined in: [packages/engine/src/editor/commands/RemoveMultipleObjectsCommand.ts:7](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/commands/RemoveMultipleObjectsCommand.ts#L7)

___

### oldParents

• **oldParents**: *any*[]

Defined in: [packages/engine/src/editor/commands/RemoveMultipleObjectsCommand.ts:5](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/commands/RemoveMultipleObjectsCommand.ts#L5)

___

### oldSelection

• **oldSelection**: *any*

Defined in: [packages/engine/src/editor/commands/RemoveMultipleObjectsCommand.ts:8](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/commands/RemoveMultipleObjectsCommand.ts#L8)

## Methods

### execute

▸ **execute**(): *void*

**Returns:** *void*

Overrides: [default](editor_commands_command.default.md)

Defined in: [packages/engine/src/editor/commands/RemoveMultipleObjectsCommand.ts:33](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/commands/RemoveMultipleObjectsCommand.ts#L33)

___

### shouldUpdate

▸ **shouldUpdate**(`_newCommand`: *any*): *boolean*

#### Parameters:

Name | Type |
:------ | :------ |
`_newCommand` | *any* |

**Returns:** *boolean*

Inherited from: [default](editor_commands_command.default.md)

Defined in: [packages/engine/src/editor/commands/Command.ts:13](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/commands/Command.ts#L13)

___

### toString

▸ **toString**(): *string*

**Returns:** *string*

Overrides: [default](editor_commands_command.default.md)

Defined in: [packages/engine/src/editor/commands/RemoveMultipleObjectsCommand.ts:45](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/commands/RemoveMultipleObjectsCommand.ts#L45)

___

### undo

▸ **undo**(): *void*

**Returns:** *void*

Overrides: [default](editor_commands_command.default.md)

Defined in: [packages/engine/src/editor/commands/RemoveMultipleObjectsCommand.ts:36](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/commands/RemoveMultipleObjectsCommand.ts#L36)

___

### update

▸ **update**(`_command`: *any*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`_command` | *any* |

**Returns:** *void*

Inherited from: [default](editor_commands_command.default.md)

Defined in: [packages/engine/src/editor/commands/Command.ts:16](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/commands/Command.ts#L16)
