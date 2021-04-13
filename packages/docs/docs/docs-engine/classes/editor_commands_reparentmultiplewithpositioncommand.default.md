---
id: "editor_commands_reparentmultiplewithpositioncommand.default"
title: "Class: default"
sidebar_label: "default"
custom_edit_url: null
hide_title: true
---

# Class: default

[editor/commands/ReparentMultipleWithPositionCommand](../modules/editor_commands_reparentmultiplewithpositioncommand.md).default

## Hierarchy

* [*default*](editor_commands_command.default.md)

  ↳ **default**

## Constructors

### constructor

\+ **new default**(`editor`: *any*, `objects`: *any*, `newParent`: *any*, `newBefore`: *any*, `position`: *any*): [*default*](editor_commands_reparentmultiplewithpositioncommand.default.md)

#### Parameters:

Name | Type |
:------ | :------ |
`editor` | *any* |
`objects` | *any* |
`newParent` | *any* |
`newBefore` | *any* |
`position` | *any* |

**Returns:** [*default*](editor_commands_reparentmultiplewithpositioncommand.default.md)

Overrides: [default](editor_commands_command.default.md)

Defined in: [packages/engine/src/editor/commands/ReparentMultipleWithPositionCommand.ts:18](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/commands/ReparentMultipleWithPositionCommand.ts#L18)

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

Defined in: [packages/engine/src/editor/commands/ReparentMultipleWithPositionCommand.ts:13](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/commands/ReparentMultipleWithPositionCommand.ts#L13)

___

### newParent

• **newParent**: *any*

Defined in: [packages/engine/src/editor/commands/ReparentMultipleWithPositionCommand.ts:12](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/commands/ReparentMultipleWithPositionCommand.ts#L12)

___

### objects

• **objects**: *any*[]

Defined in: [packages/engine/src/editor/commands/ReparentMultipleWithPositionCommand.ts:10](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/commands/ReparentMultipleWithPositionCommand.ts#L10)

___

### oldBefores

• **oldBefores**: *any*[]

Defined in: [packages/engine/src/editor/commands/ReparentMultipleWithPositionCommand.ts:15](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/commands/ReparentMultipleWithPositionCommand.ts#L15)

___

### oldParents

• **oldParents**: *any*[]

Defined in: [packages/engine/src/editor/commands/ReparentMultipleWithPositionCommand.ts:14](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/commands/ReparentMultipleWithPositionCommand.ts#L14)

___

### oldPositions

• **oldPositions**: *any*

Defined in: [packages/engine/src/editor/commands/ReparentMultipleWithPositionCommand.ts:17](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/commands/ReparentMultipleWithPositionCommand.ts#L17)

___

### oldSelection

• **oldSelection**: *any*

Defined in: [packages/engine/src/editor/commands/ReparentMultipleWithPositionCommand.ts:16](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/commands/ReparentMultipleWithPositionCommand.ts#L16)

___

### position

• **position**: *any*

Defined in: [packages/engine/src/editor/commands/ReparentMultipleWithPositionCommand.ts:18](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/commands/ReparentMultipleWithPositionCommand.ts#L18)

___

### undoObjects

• **undoObjects**: *any*[]

Defined in: [packages/engine/src/editor/commands/ReparentMultipleWithPositionCommand.ts:11](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/commands/ReparentMultipleWithPositionCommand.ts#L11)

## Methods

### execute

▸ **execute**(): *void*

**Returns:** *void*

Overrides: [default](editor_commands_command.default.md)

Defined in: [packages/engine/src/editor/commands/ReparentMultipleWithPositionCommand.ts:52](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/commands/ReparentMultipleWithPositionCommand.ts#L52)

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

Defined in: [packages/engine/src/editor/commands/ReparentMultipleWithPositionCommand.ts:92](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/commands/ReparentMultipleWithPositionCommand.ts#L92)

___

### undo

▸ **undo**(): *void*

**Returns:** *void*

Overrides: [default](editor_commands_command.default.md)

Defined in: [packages/engine/src/editor/commands/ReparentMultipleWithPositionCommand.ts:66](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/commands/ReparentMultipleWithPositionCommand.ts#L66)

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
