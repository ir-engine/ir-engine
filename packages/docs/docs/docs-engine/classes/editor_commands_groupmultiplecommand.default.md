---
id: "editor_commands_groupmultiplecommand.default"
title: "Class: default"
sidebar_label: "default"
custom_edit_url: null
hide_title: true
---

# Class: default

[editor/commands/GroupMultipleCommand](../modules/editor_commands_groupmultiplecommand.md).default

## Hierarchy

* [*default*](editor_commands_command.default.md)

  ↳ **default**

## Constructors

### constructor

\+ **new default**(`editor`: *any*, `objects`: *any*, `groupParent`: *any*, `groupBefore`: *any*): [*default*](editor_commands_groupmultiplecommand.default.md)

#### Parameters:

Name | Type |
:------ | :------ |
`editor` | *any* |
`objects` | *any* |
`groupParent` | *any* |
`groupBefore` | *any* |

**Returns:** [*default*](editor_commands_groupmultiplecommand.default.md)

Overrides: [default](editor_commands_command.default.md)

Defined in: [packages/engine/src/editor/commands/GroupMultipleCommand.ts:12](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/commands/GroupMultipleCommand.ts#L12)

## Properties

### editor

• **editor**: *any*

Inherited from: [default](editor_commands_command.default.md).[editor](editor_commands_command.default.md#editor)

Defined in: [packages/engine/src/editor/commands/Command.ts:6](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/commands/Command.ts#L6)

___

### groupBefore

• **groupBefore**: *any*

Defined in: [packages/engine/src/editor/commands/GroupMultipleCommand.ts:8](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/commands/GroupMultipleCommand.ts#L8)

___

### groupNode

• **groupNode**: *any*

Defined in: [packages/engine/src/editor/commands/GroupMultipleCommand.ts:12](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/commands/GroupMultipleCommand.ts#L12)

___

### groupParent

• **groupParent**: *any*

Defined in: [packages/engine/src/editor/commands/GroupMultipleCommand.ts:7](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/commands/GroupMultipleCommand.ts#L7)

___

### id

• **id**: *number*

Inherited from: [default](editor_commands_command.default.md).[id](editor_commands_command.default.md#id)

Defined in: [packages/engine/src/editor/commands/Command.ts:7](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/commands/Command.ts#L7)

___

### objects

• **objects**: *any*[]

Defined in: [packages/engine/src/editor/commands/GroupMultipleCommand.ts:5](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/commands/GroupMultipleCommand.ts#L5)

___

### oldBefores

• **oldBefores**: *any*[]

Defined in: [packages/engine/src/editor/commands/GroupMultipleCommand.ts:10](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/commands/GroupMultipleCommand.ts#L10)

___

### oldParents

• **oldParents**: *any*[]

Defined in: [packages/engine/src/editor/commands/GroupMultipleCommand.ts:9](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/commands/GroupMultipleCommand.ts#L9)

___

### oldSelection

• **oldSelection**: *any*

Defined in: [packages/engine/src/editor/commands/GroupMultipleCommand.ts:11](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/commands/GroupMultipleCommand.ts#L11)

___

### undoObjects

• **undoObjects**: *any*[]

Defined in: [packages/engine/src/editor/commands/GroupMultipleCommand.ts:6](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/commands/GroupMultipleCommand.ts#L6)

## Methods

### execute

▸ **execute**(): *void*

**Returns:** *void*

Overrides: [default](editor_commands_command.default.md)

Defined in: [packages/engine/src/editor/commands/GroupMultipleCommand.ts:45](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/commands/GroupMultipleCommand.ts#L45)

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

Defined in: [packages/engine/src/editor/commands/GroupMultipleCommand.ts:70](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/commands/GroupMultipleCommand.ts#L70)

___

### undo

▸ **undo**(): *void*

**Returns:** *void*

Overrides: [default](editor_commands_command.default.md)

Defined in: [packages/engine/src/editor/commands/GroupMultipleCommand.ts:53](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/commands/GroupMultipleCommand.ts#L53)

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
