---
id: "editor_commands_reparentmultiplecommand.default"
title: "Class: default"
sidebar_label: "default"
custom_edit_url: null
hide_title: true
---

# Class: default

[editor/commands/ReparentMultipleCommand](../modules/editor_commands_reparentmultiplecommand.md).default

## Hierarchy

* [*default*](editor_commands_command.default.md)

  ↳ **default**

## Constructors

### constructor

\+ **new default**(`editor`: *any*, `objects`: *any*, `newParent`: *any*, `newBefore`: *any*): [*default*](editor_commands_reparentmultiplecommand.default.md)

#### Parameters:

Name | Type |
:------ | :------ |
`editor` | *any* |
`objects` | *any* |
`newParent` | *any* |
`newBefore` | *any* |

**Returns:** [*default*](editor_commands_reparentmultiplecommand.default.md)

Overrides: [default](editor_commands_command.default.md)

Defined in: [packages/engine/src/editor/commands/ReparentMultipleCommand.ts:11](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/commands/ReparentMultipleCommand.ts#L11)

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

### newBefore

• **newBefore**: *any*

Defined in: [packages/engine/src/editor/commands/ReparentMultipleCommand.ts:8](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/commands/ReparentMultipleCommand.ts#L8)

___

### newParent

• **newParent**: *any*

Defined in: [packages/engine/src/editor/commands/ReparentMultipleCommand.ts:7](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/commands/ReparentMultipleCommand.ts#L7)

___

### objects

• **objects**: *any*[]

Defined in: [packages/engine/src/editor/commands/ReparentMultipleCommand.ts:5](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/commands/ReparentMultipleCommand.ts#L5)

___

### oldBefores

• **oldBefores**: *any*[]

Defined in: [packages/engine/src/editor/commands/ReparentMultipleCommand.ts:10](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/commands/ReparentMultipleCommand.ts#L10)

___

### oldParents

• **oldParents**: *any*[]

Defined in: [packages/engine/src/editor/commands/ReparentMultipleCommand.ts:9](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/commands/ReparentMultipleCommand.ts#L9)

___

### oldSelection

• **oldSelection**: *any*

Defined in: [packages/engine/src/editor/commands/ReparentMultipleCommand.ts:11](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/commands/ReparentMultipleCommand.ts#L11)

___

### undoObjects

• **undoObjects**: *any*[]

Defined in: [packages/engine/src/editor/commands/ReparentMultipleCommand.ts:6](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/commands/ReparentMultipleCommand.ts#L6)

## Methods

### execute

▸ **execute**(): *void*

**Returns:** *void*

Overrides: [default](editor_commands_command.default.md)

Defined in: [packages/engine/src/editor/commands/ReparentMultipleCommand.ts:43](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/commands/ReparentMultipleCommand.ts#L43)

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

Defined in: [packages/engine/src/editor/commands/ReparentMultipleCommand.ts:67](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/commands/ReparentMultipleCommand.ts#L67)

___

### undo

▸ **undo**(): *void*

**Returns:** *void*

Overrides: [default](editor_commands_command.default.md)

Defined in: [packages/engine/src/editor/commands/ReparentMultipleCommand.ts:51](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/commands/ReparentMultipleCommand.ts#L51)

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
