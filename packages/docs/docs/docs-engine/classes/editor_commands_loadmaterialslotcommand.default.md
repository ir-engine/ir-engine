---
id: "editor_commands_loadmaterialslotcommand.default"
title: "Class: default"
sidebar_label: "default"
custom_edit_url: null
hide_title: true
---

# Class: default

[editor/commands/LoadMaterialSlotCommand](../modules/editor_commands_loadmaterialslotcommand.md).default

## Hierarchy

* [*default*](editor_commands_command.default.md)

  ↳ **default**

## Constructors

### constructor

\+ **new default**(`editor`: *any*, `object`: *any*, `subPieceId`: *any*, `materialSlotId`: *any*, `materialId`: *any*): [*default*](editor_commands_loadmaterialslotcommand.default.md)

#### Parameters:

Name | Type |
:------ | :------ |
`editor` | *any* |
`object` | *any* |
`subPieceId` | *any* |
`materialSlotId` | *any* |
`materialId` | *any* |

**Returns:** [*default*](editor_commands_loadmaterialslotcommand.default.md)

Overrides: [default](editor_commands_command.default.md)

Defined in: [packages/engine/src/editor/commands/LoadMaterialSlotCommand.ts:8](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/commands/LoadMaterialSlotCommand.ts#L8)

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

Defined in: [packages/engine/src/editor/commands/LoadMaterialSlotCommand.ts:7](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/commands/LoadMaterialSlotCommand.ts#L7)

___

### materialSlotId

• **materialSlotId**: *any*

Defined in: [packages/engine/src/editor/commands/LoadMaterialSlotCommand.ts:6](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/commands/LoadMaterialSlotCommand.ts#L6)

___

### object

• **object**: *any*

Defined in: [packages/engine/src/editor/commands/LoadMaterialSlotCommand.ts:4](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/commands/LoadMaterialSlotCommand.ts#L4)

___

### prevMaterialId

• **prevMaterialId**: *any*

Defined in: [packages/engine/src/editor/commands/LoadMaterialSlotCommand.ts:8](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/commands/LoadMaterialSlotCommand.ts#L8)

___

### subPieceId

• **subPieceId**: *any*

Defined in: [packages/engine/src/editor/commands/LoadMaterialSlotCommand.ts:5](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/commands/LoadMaterialSlotCommand.ts#L5)

## Methods

### execute

▸ **execute**(): *void*

**Returns:** *void*

Overrides: [default](editor_commands_command.default.md)

Defined in: [packages/engine/src/editor/commands/LoadMaterialSlotCommand.ts:20](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/commands/LoadMaterialSlotCommand.ts#L20)

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

Defined in: [packages/engine/src/editor/commands/LoadMaterialSlotCommand.ts:38](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/commands/LoadMaterialSlotCommand.ts#L38)

___

### undo

▸ **undo**(): *void*

**Returns:** *void*

Overrides: [default](editor_commands_command.default.md)

Defined in: [packages/engine/src/editor/commands/LoadMaterialSlotCommand.ts:29](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/commands/LoadMaterialSlotCommand.ts#L29)

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
