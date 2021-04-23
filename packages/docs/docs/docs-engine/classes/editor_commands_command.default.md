---
id: "editor_commands_command.default"
title: "Class: default"
sidebar_label: "default"
custom_edit_url: null
hide_title: true
---

# Class: default

[editor/commands/Command](../modules/editor_commands_command.md).default

**`author`** dforrer / https://github.com/dforrer
Developed as part of a project at University of Applied Sciences and Arts Northwestern Switzerland (www.fhnw.ch)

## Hierarchy

* **default**

  ↳ [*default*](editor_commands_addmultipleobjectscommand.default.md)

  ↳ [*default*](editor_commands_addobjectcommand.default.md)

  ↳ [*default*](editor_commands_deselectcommand.default.md)

  ↳ [*default*](editor_commands_deselectmultiplecommand.default.md)

  ↳ [*default*](editor_commands_duplicatecommand.default.md)

  ↳ [*default*](editor_commands_duplicatemultiplecommand.default.md)

  ↳ [*default*](editor_commands_groupmultiplecommand.default.md)

  ↳ [*default*](editor_commands_loadmaterialslotcommand.default.md)

  ↳ [*default*](editor_commands_loadmaterialslotmultiplecommand.default.md)

  ↳ [*default*](editor_commands_removemultipleobjectscommand.default.md)

  ↳ [*default*](editor_commands_removeobjectcommand.default.md)

  ↳ [*default*](editor_commands_reparentcommand.default.md)

  ↳ [*default*](editor_commands_reparentmultiplecommand.default.md)

  ↳ [*default*](editor_commands_reparentmultiplewithpositioncommand.default.md)

  ↳ [*default*](editor_commands_rotatearoundcommand.default.md)

  ↳ [*default*](editor_commands_rotatearoundmultiplecommand.default.md)

  ↳ [*default*](editor_commands_rotateonaxiscommand.default.md)

  ↳ [*default*](editor_commands_rotateonaxismultiplecommand.default.md)

  ↳ [*default*](editor_commands_scalecommand.default.md)

  ↳ [*default*](editor_commands_scalemultiplecommand.default.md)

  ↳ [*default*](editor_commands_selectcommand.default.md)

  ↳ [*default*](editor_commands_selectmultiplecommand.default.md)

  ↳ [*default*](editor_commands_setpositioncommand.default.md)

  ↳ [*default*](editor_commands_setpositionmultiplecommand.default.md)

  ↳ [*default*](editor_commands_setpropertiescommand.default.md)

  ↳ [*default*](editor_commands_setpropertiesmultiplecommand.default.md)

  ↳ [*default*](editor_commands_setpropertycommand.default.md)

  ↳ [*default*](editor_commands_setpropertymultiplecommand.default.md)

  ↳ [*default*](editor_commands_setrotationcommand.default.md)

  ↳ [*default*](editor_commands_setrotationmultiplecommand.default.md)

  ↳ [*default*](editor_commands_setscalecommand.default.md)

  ↳ [*default*](editor_commands_setscalemultiplecommand.default.md)

  ↳ [*default*](editor_commands_setselectioncommand.default.md)

  ↳ [*default*](editor_commands_translatecommand.default.md)

  ↳ [*default*](editor_commands_translatemultiplecommand.default.md)

## Constructors

### constructor

\+ **new default**(`editor`: *any*): [*default*](editor_commands_command.default.md)

#### Parameters:

Name | Type |
:------ | :------ |
`editor` | *any* |

**Returns:** [*default*](editor_commands_command.default.md)

Defined in: [packages/engine/src/editor/commands/Command.ts:7](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/commands/Command.ts#L7)

## Properties

### editor

• **editor**: *any*

Defined in: [packages/engine/src/editor/commands/Command.ts:6](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/commands/Command.ts#L6)

___

### id

• **id**: *number*

Defined in: [packages/engine/src/editor/commands/Command.ts:7](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/commands/Command.ts#L7)

## Methods

### execute

▸ **execute**(`_redo`: *any*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`_redo` | *any* |

**Returns:** *void*

Defined in: [packages/engine/src/editor/commands/Command.ts:12](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/commands/Command.ts#L12)

___

### shouldUpdate

▸ **shouldUpdate**(`_newCommand`: *any*): *boolean*

#### Parameters:

Name | Type |
:------ | :------ |
`_newCommand` | *any* |

**Returns:** *boolean*

Defined in: [packages/engine/src/editor/commands/Command.ts:13](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/commands/Command.ts#L13)

___

### toString

▸ **toString**(): *string*

**Returns:** *string*

Defined in: [packages/engine/src/editor/commands/Command.ts:18](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/commands/Command.ts#L18)

___

### undo

▸ **undo**(): *void*

**Returns:** *void*

Defined in: [packages/engine/src/editor/commands/Command.ts:17](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/commands/Command.ts#L17)

___

### update

▸ **update**(`_command`: *any*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`_command` | *any* |

**Returns:** *void*

Defined in: [packages/engine/src/editor/commands/Command.ts:16](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/commands/Command.ts#L16)
