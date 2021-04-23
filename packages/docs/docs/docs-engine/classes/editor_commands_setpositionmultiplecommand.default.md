---
id: "editor_commands_setpositionmultiplecommand.default"
title: "Class: default"
sidebar_label: "default"
custom_edit_url: null
hide_title: true
---

# Class: default

[editor/commands/SetPositionMultipleCommand](../modules/editor_commands_setpositionmultiplecommand.md).default

## Hierarchy

* [*default*](editor_commands_command.default.md)

  ↳ **default**

## Constructors

### constructor

\+ **new default**(`editor`: *any*, `objects`: *any*, `position`: *any*, `space`: *any*): [*default*](editor_commands_setpositionmultiplecommand.default.md)

#### Parameters:

Name | Type |
:------ | :------ |
`editor` | *any* |
`objects` | *any* |
`position` | *any* |
`space` | *any* |

**Returns:** [*default*](editor_commands_setpositionmultiplecommand.default.md)

Overrides: [default](editor_commands_command.default.md)

Defined in: [packages/engine/src/editor/commands/SetPositionMultipleCommand.ts:9](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/commands/SetPositionMultipleCommand.ts#L9)

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

Defined in: [packages/engine/src/editor/commands/SetPositionMultipleCommand.ts:6](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/commands/SetPositionMultipleCommand.ts#L6)

___

### oldPositions

• **oldPositions**: *any*

Defined in: [packages/engine/src/editor/commands/SetPositionMultipleCommand.ts:9](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/commands/SetPositionMultipleCommand.ts#L9)

___

### position

• **position**: *any*

Defined in: [packages/engine/src/editor/commands/SetPositionMultipleCommand.ts:7](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/commands/SetPositionMultipleCommand.ts#L7)

___

### space

• **space**: *any*

Defined in: [packages/engine/src/editor/commands/SetPositionMultipleCommand.ts:8](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/commands/SetPositionMultipleCommand.ts#L8)

## Methods

### execute

▸ **execute**(): *void*

**Returns:** *void*

Overrides: [default](editor_commands_command.default.md)

Defined in: [packages/engine/src/editor/commands/SetPositionMultipleCommand.ts:17](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/commands/SetPositionMultipleCommand.ts#L17)

___

### shouldUpdate

▸ **shouldUpdate**(`newCommand`: *any*): *boolean*

#### Parameters:

Name | Type |
:------ | :------ |
`newCommand` | *any* |

**Returns:** *boolean*

Overrides: [default](editor_commands_command.default.md)

Defined in: [packages/engine/src/editor/commands/SetPositionMultipleCommand.ts:25](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/commands/SetPositionMultipleCommand.ts#L25)

___

### toString

▸ **toString**(): *string*

**Returns:** *string*

Overrides: [default](editor_commands_command.default.md)

Defined in: [packages/engine/src/editor/commands/SetPositionMultipleCommand.ts:52](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/commands/SetPositionMultipleCommand.ts#L52)

___

### undo

▸ **undo**(): *void*

**Returns:** *void*

Overrides: [default](editor_commands_command.default.md)

Defined in: [packages/engine/src/editor/commands/SetPositionMultipleCommand.ts:40](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/commands/SetPositionMultipleCommand.ts#L40)

___

### update

▸ **update**(`command`: *any*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`command` | *any* |

**Returns:** *void*

Overrides: [default](editor_commands_command.default.md)

Defined in: [packages/engine/src/editor/commands/SetPositionMultipleCommand.ts:31](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/commands/SetPositionMultipleCommand.ts#L31)
