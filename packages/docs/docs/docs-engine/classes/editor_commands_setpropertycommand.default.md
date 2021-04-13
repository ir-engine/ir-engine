---
id: "editor_commands_setpropertycommand.default"
title: "Class: default"
sidebar_label: "default"
custom_edit_url: null
hide_title: true
---

# Class: default

[editor/commands/SetPropertyCommand](../modules/editor_commands_setpropertycommand.md).default

## Hierarchy

* [*default*](editor_commands_command.default.md)

  ↳ **default**

## Constructors

### constructor

\+ **new default**(`editor`: *any*, `object`: *any*, `propertyName`: *any*, `value`: *any*, `disableCopy`: *any*): [*default*](editor_commands_setpropertycommand.default.md)

#### Parameters:

Name | Type |
:------ | :------ |
`editor` | *any* |
`object` | *any* |
`propertyName` | *any* |
`value` | *any* |
`disableCopy` | *any* |

**Returns:** [*default*](editor_commands_setpropertycommand.default.md)

Overrides: [default](editor_commands_command.default.md)

Defined in: [packages/engine/src/editor/commands/SetPropertyCommand.ts:8](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/commands/SetPropertyCommand.ts#L8)

## Properties

### disableCopy

• **disableCopy**: *any*

Defined in: [packages/engine/src/editor/commands/SetPropertyCommand.ts:6](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/commands/SetPropertyCommand.ts#L6)

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

### newValue

• **newValue**: *any*

Defined in: [packages/engine/src/editor/commands/SetPropertyCommand.ts:7](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/commands/SetPropertyCommand.ts#L7)

___

### object

• **object**: *any*

Defined in: [packages/engine/src/editor/commands/SetPropertyCommand.ts:4](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/commands/SetPropertyCommand.ts#L4)

___

### oldValue

• **oldValue**: *any*

Defined in: [packages/engine/src/editor/commands/SetPropertyCommand.ts:8](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/commands/SetPropertyCommand.ts#L8)

___

### propertyName

• **propertyName**: *any*

Defined in: [packages/engine/src/editor/commands/SetPropertyCommand.ts:5](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/commands/SetPropertyCommand.ts#L5)

## Methods

### execute

▸ **execute**(): *void*

**Returns:** *void*

Overrides: [default](editor_commands_command.default.md)

Defined in: [packages/engine/src/editor/commands/SetPropertyCommand.ts:26](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/commands/SetPropertyCommand.ts#L26)

___

### shouldUpdate

▸ **shouldUpdate**(`newCommand`: *any*): *boolean*

#### Parameters:

Name | Type |
:------ | :------ |
`newCommand` | *any* |

**Returns:** *boolean*

Overrides: [default](editor_commands_command.default.md)

Defined in: [packages/engine/src/editor/commands/SetPropertyCommand.ts:36](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/commands/SetPropertyCommand.ts#L36)

___

### toString

▸ **toString**(): *string*

**Returns:** *string*

Overrides: [default](editor_commands_command.default.md)

Defined in: [packages/engine/src/editor/commands/SetPropertyCommand.ts:68](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/commands/SetPropertyCommand.ts#L68)

___

### undo

▸ **undo**(): *void*

**Returns:** *void*

Overrides: [default](editor_commands_command.default.md)

Defined in: [packages/engine/src/editor/commands/SetPropertyCommand.ts:58](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/commands/SetPropertyCommand.ts#L58)

___

### update

▸ **update**(`command`: *any*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`command` | *any* |

**Returns:** *void*

Overrides: [default](editor_commands_command.default.md)

Defined in: [packages/engine/src/editor/commands/SetPropertyCommand.ts:42](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/commands/SetPropertyCommand.ts#L42)
