---
id: "editor_commands_setpropertymultiplecommand.default"
title: "Class: default"
sidebar_label: "default"
custom_edit_url: null
hide_title: true
---

# Class: default

[editor/commands/SetPropertyMultipleCommand](../modules/editor_commands_setpropertymultiplecommand.md).default

## Hierarchy

* [*default*](editor_commands_command.default.md)

  ↳ **default**

## Constructors

### constructor

\+ **new default**(`editor`: *any*, `objects`: *any*, `propertyName`: *any*, `value`: *any*): [*default*](editor_commands_setpropertymultiplecommand.default.md)

#### Parameters:

Name | Type |
:------ | :------ |
`editor` | *any* |
`objects` | *any* |
`propertyName` | *any* |
`value` | *any* |

**Returns:** [*default*](editor_commands_setpropertymultiplecommand.default.md)

Overrides: [default](editor_commands_command.default.md)

Defined in: [packages/engine/src/editor/commands/SetPropertyMultipleCommand.ts:8](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/commands/SetPropertyMultipleCommand.ts#L8)

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

### newValue

• **newValue**: *any*

Defined in: [packages/engine/src/editor/commands/SetPropertyMultipleCommand.ts:7](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/commands/SetPropertyMultipleCommand.ts#L7)

___

### objects

• **objects**: *any*

Defined in: [packages/engine/src/editor/commands/SetPropertyMultipleCommand.ts:5](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/commands/SetPropertyMultipleCommand.ts#L5)

___

### oldValues

• **oldValues**: *any*

Defined in: [packages/engine/src/editor/commands/SetPropertyMultipleCommand.ts:8](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/commands/SetPropertyMultipleCommand.ts#L8)

___

### propertyName

• **propertyName**: *any*

Defined in: [packages/engine/src/editor/commands/SetPropertyMultipleCommand.ts:6](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/commands/SetPropertyMultipleCommand.ts#L6)

## Methods

### execute

▸ **execute**(): *void*

**Returns:** *void*

Overrides: [default](editor_commands_command.default.md)

Defined in: [packages/engine/src/editor/commands/SetPropertyMultipleCommand.ts:23](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/commands/SetPropertyMultipleCommand.ts#L23)

___

### shouldUpdate

▸ **shouldUpdate**(`newCommand`: *any*): *boolean*

#### Parameters:

Name | Type |
:------ | :------ |
`newCommand` | *any* |

**Returns:** *boolean*

Overrides: [default](editor_commands_command.default.md)

Defined in: [packages/engine/src/editor/commands/SetPropertyMultipleCommand.ts:31](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/commands/SetPropertyMultipleCommand.ts#L31)

___

### toString

▸ **toString**(): *string*

**Returns:** *string*

Overrides: [default](editor_commands_command.default.md)

Defined in: [packages/engine/src/editor/commands/SetPropertyMultipleCommand.ts:63](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/commands/SetPropertyMultipleCommand.ts#L63)

___

### undo

▸ **undo**(): *void*

**Returns:** *void*

Overrides: [default](editor_commands_command.default.md)

Defined in: [packages/engine/src/editor/commands/SetPropertyMultipleCommand.ts:51](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/commands/SetPropertyMultipleCommand.ts#L51)

___

### update

▸ **update**(`command`: *any*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`command` | *any* |

**Returns:** *void*

Overrides: [default](editor_commands_command.default.md)

Defined in: [packages/engine/src/editor/commands/SetPropertyMultipleCommand.ts:37](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/commands/SetPropertyMultipleCommand.ts#L37)
