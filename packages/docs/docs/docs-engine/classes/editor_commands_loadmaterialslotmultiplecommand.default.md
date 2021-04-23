---
id: "editor_commands_loadmaterialslotmultiplecommand.default"
title: "Class: default"
sidebar_label: "default"
custom_edit_url: null
hide_title: true
---

# Class: default

[editor/commands/LoadMaterialSlotMultipleCommand](../modules/editor_commands_loadmaterialslotmultiplecommand.md).default

## Hierarchy

* [*default*](editor_commands_command.default.md)

  ↳ **default**

## Constructors

### constructor

\+ **new default**(`editor`: *any*, `objects`: *any*, `subPieceId`: *any*, `materialSlotId`: *any*, `materialId`: *any*): [*default*](editor_commands_loadmaterialslotmultiplecommand.default.md)

#### Parameters:

Name | Type |
:------ | :------ |
`editor` | *any* |
`objects` | *any* |
`subPieceId` | *any* |
`materialSlotId` | *any* |
`materialId` | *any* |

**Returns:** [*default*](editor_commands_loadmaterialslotmultiplecommand.default.md)

Overrides: [default](editor_commands_command.default.md)

Defined in: [packages/engine/src/editor/commands/LoadMaterialSlotMultipleCommand.ts:8](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/commands/LoadMaterialSlotMultipleCommand.ts#L8)

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

### materialId

• **materialId**: *any*

Defined in: [packages/engine/src/editor/commands/LoadMaterialSlotMultipleCommand.ts:7](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/commands/LoadMaterialSlotMultipleCommand.ts#L7)

___

### materialSlotId

• **materialSlotId**: *any*

Defined in: [packages/engine/src/editor/commands/LoadMaterialSlotMultipleCommand.ts:6](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/commands/LoadMaterialSlotMultipleCommand.ts#L6)

___

### objects

• **objects**: *any*

Defined in: [packages/engine/src/editor/commands/LoadMaterialSlotMultipleCommand.ts:4](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/commands/LoadMaterialSlotMultipleCommand.ts#L4)

___

### prevMaterialIds

• **prevMaterialIds**: *any*

Defined in: [packages/engine/src/editor/commands/LoadMaterialSlotMultipleCommand.ts:8](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/commands/LoadMaterialSlotMultipleCommand.ts#L8)

___

### subPieceId

• **subPieceId**: *any*

Defined in: [packages/engine/src/editor/commands/LoadMaterialSlotMultipleCommand.ts:5](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/commands/LoadMaterialSlotMultipleCommand.ts#L5)

## Methods

### execute

▸ **execute**(): *void*

**Returns:** *void*

Overrides: [default](editor_commands_command.default.md)

Defined in: [packages/engine/src/editor/commands/LoadMaterialSlotMultipleCommand.ts:19](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/commands/LoadMaterialSlotMultipleCommand.ts#L19)

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

Defined in: [packages/engine/src/editor/commands/LoadMaterialSlotMultipleCommand.ts:42](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/commands/LoadMaterialSlotMultipleCommand.ts#L42)

___

### undo

▸ **undo**(): *void*

**Returns:** *void*

Overrides: [default](editor_commands_command.default.md)

Defined in: [packages/engine/src/editor/commands/LoadMaterialSlotMultipleCommand.ts:28](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/commands/LoadMaterialSlotMultipleCommand.ts#L28)

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
