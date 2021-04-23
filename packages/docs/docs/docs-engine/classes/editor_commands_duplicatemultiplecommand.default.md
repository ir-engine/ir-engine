---
id: "editor_commands_duplicatemultiplecommand.default"
title: "Class: default"
sidebar_label: "default"
custom_edit_url: null
hide_title: true
---

# Class: default

[editor/commands/DuplicateMultipleCommand](../modules/editor_commands_duplicatemultiplecommand.md).default

## Hierarchy

* [*default*](editor_commands_command.default.md)

  ↳ **default**

## Constructors

### constructor

\+ **new default**(`editor`: *any*, `objects`: *any*, `parent`: *any*, `before`: *any*, `selectObjects`: *any*): [*default*](editor_commands_duplicatemultiplecommand.default.md)

#### Parameters:

Name | Type |
:------ | :------ |
`editor` | *any* |
`objects` | *any* |
`parent` | *any* |
`before` | *any* |
`selectObjects` | *any* |

**Returns:** [*default*](editor_commands_duplicatemultiplecommand.default.md)

Overrides: [default](editor_commands_command.default.md)

Defined in: [packages/engine/src/editor/commands/DuplicateMultipleCommand.ts:9](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/commands/DuplicateMultipleCommand.ts#L9)

## Properties

### before

• **before**: *any*

Defined in: [packages/engine/src/editor/commands/DuplicateMultipleCommand.ts:6](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/commands/DuplicateMultipleCommand.ts#L6)

___

### duplicatedObjects

• **duplicatedObjects**: *any*[]

Defined in: [packages/engine/src/editor/commands/DuplicateMultipleCommand.ts:9](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/commands/DuplicateMultipleCommand.ts#L9)

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

Defined in: [packages/engine/src/editor/commands/DuplicateMultipleCommand.ts:4](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/commands/DuplicateMultipleCommand.ts#L4)

___

### oldSelection

• **oldSelection**: *any*

Defined in: [packages/engine/src/editor/commands/DuplicateMultipleCommand.ts:8](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/commands/DuplicateMultipleCommand.ts#L8)

___

### parent

• **parent**: *any*

Defined in: [packages/engine/src/editor/commands/DuplicateMultipleCommand.ts:5](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/commands/DuplicateMultipleCommand.ts#L5)

___

### selectObjects

• **selectObjects**: *any*

Defined in: [packages/engine/src/editor/commands/DuplicateMultipleCommand.ts:7](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/commands/DuplicateMultipleCommand.ts#L7)

## Methods

### execute

▸ **execute**(`redo`: *any*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`redo` | *any* |

**Returns:** *void*

Overrides: [default](editor_commands_command.default.md)

Defined in: [packages/engine/src/editor/commands/DuplicateMultipleCommand.ts:19](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/commands/DuplicateMultipleCommand.ts#L19)

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

Defined in: [packages/engine/src/editor/commands/DuplicateMultipleCommand.ts:49](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/commands/DuplicateMultipleCommand.ts#L49)

___

### undo

▸ **undo**(): *void*

**Returns:** *void*

Overrides: [default](editor_commands_command.default.md)

Defined in: [packages/engine/src/editor/commands/DuplicateMultipleCommand.ts:40](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/commands/DuplicateMultipleCommand.ts#L40)

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
