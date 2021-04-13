---
id: "editor_commands_deselectcommand.default"
title: "Class: default"
sidebar_label: "default"
custom_edit_url: null
hide_title: true
---

# Class: default

[editor/commands/DeselectCommand](../modules/editor_commands_deselectcommand.md).default

## Hierarchy

* [*default*](editor_commands_command.default.md)

  ↳ **default**

## Constructors

### constructor

\+ **new default**(`editor`: *any*, `object`: *any*): [*default*](editor_commands_deselectcommand.default.md)

#### Parameters:

Name | Type |
:------ | :------ |
`editor` | *any* |
`object` | *any* |

**Returns:** [*default*](editor_commands_deselectcommand.default.md)

Overrides: [default](editor_commands_command.default.md)

Defined in: [packages/engine/src/editor/commands/DeselectCommand.ts:5](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/commands/DeselectCommand.ts#L5)

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

### object

• **object**: *any*

Defined in: [packages/engine/src/editor/commands/DeselectCommand.ts:4](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/commands/DeselectCommand.ts#L4)

___

### oldSelection

• **oldSelection**: *any*

Defined in: [packages/engine/src/editor/commands/DeselectCommand.ts:5](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/commands/DeselectCommand.ts#L5)

## Methods

### execute

▸ **execute**(): *void*

**Returns:** *void*

Overrides: [default](editor_commands_command.default.md)

Defined in: [packages/engine/src/editor/commands/DeselectCommand.ts:11](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/commands/DeselectCommand.ts#L11)

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

Defined in: [packages/engine/src/editor/commands/DeselectCommand.ts:17](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/commands/DeselectCommand.ts#L17)

___

### undo

▸ **undo**(): *void*

**Returns:** *void*

Overrides: [default](editor_commands_command.default.md)

Defined in: [packages/engine/src/editor/commands/DeselectCommand.ts:14](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/commands/DeselectCommand.ts#L14)

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
