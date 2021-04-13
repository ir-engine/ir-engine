---
id: "editor_commands_duplicatecommand.default"
title: "Class: default"
sidebar_label: "default"
custom_edit_url: null
hide_title: true
---

# Class: default

[editor/commands/DuplicateCommand](../modules/editor_commands_duplicatecommand.md).default

## Hierarchy

* [*default*](editor_commands_command.default.md)

  ↳ **default**

## Constructors

### constructor

\+ **new default**(`editor`: *any*, `object`: *any*, `parent`: *any*, `before`: *any*): [*default*](editor_commands_duplicatecommand.default.md)

#### Parameters:

Name | Type |
:------ | :------ |
`editor` | *any* |
`object` | *any* |
`parent` | *any* |
`before` | *any* |

**Returns:** [*default*](editor_commands_duplicatecommand.default.md)

Overrides: [default](editor_commands_command.default.md)

Defined in: [packages/engine/src/editor/commands/DuplicateCommand.ts:8](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/commands/DuplicateCommand.ts#L8)

## Properties

### before

• **before**: *any*

Defined in: [packages/engine/src/editor/commands/DuplicateCommand.ts:6](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/commands/DuplicateCommand.ts#L6)

___

### duplicatedObject

• **duplicatedObject**: *any*

Defined in: [packages/engine/src/editor/commands/DuplicateCommand.ts:8](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/commands/DuplicateCommand.ts#L8)

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

Defined in: [packages/engine/src/editor/commands/DuplicateCommand.ts:4](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/commands/DuplicateCommand.ts#L4)

___

### oldSelection

• **oldSelection**: *any*

Defined in: [packages/engine/src/editor/commands/DuplicateCommand.ts:7](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/commands/DuplicateCommand.ts#L7)

___

### parent

• **parent**: *any*

Defined in: [packages/engine/src/editor/commands/DuplicateCommand.ts:5](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/commands/DuplicateCommand.ts#L5)

## Methods

### execute

▸ **execute**(): *void*

**Returns:** *void*

Overrides: [default](editor_commands_command.default.md)

Defined in: [packages/engine/src/editor/commands/DuplicateCommand.ts:17](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/commands/DuplicateCommand.ts#L17)

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

Defined in: [packages/engine/src/editor/commands/DuplicateCommand.ts:29](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/commands/DuplicateCommand.ts#L29)

___

### undo

▸ **undo**(): *void*

**Returns:** *void*

Overrides: [default](editor_commands_command.default.md)

Defined in: [packages/engine/src/editor/commands/DuplicateCommand.ts:25](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/commands/DuplicateCommand.ts#L25)

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
