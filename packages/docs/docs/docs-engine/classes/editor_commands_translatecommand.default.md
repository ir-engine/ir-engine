---
id: "editor_commands_translatecommand.default"
title: "Class: default"
sidebar_label: "default"
custom_edit_url: null
hide_title: true
---

# Class: default

[editor/commands/TranslateCommand](../modules/editor_commands_translatecommand.md).default

## Hierarchy

* [*default*](editor_commands_command.default.md)

  ↳ **default**

## Constructors

### constructor

\+ **new default**(`editor`: *any*, `object`: *any*, `translation`: *any*, `space`: *any*): [*default*](editor_commands_translatecommand.default.md)

#### Parameters:

Name | Type |
:------ | :------ |
`editor` | *any* |
`object` | *any* |
`translation` | *any* |
`space` | *any* |

**Returns:** [*default*](editor_commands_translatecommand.default.md)

Overrides: [default](editor_commands_command.default.md)

Defined in: [packages/engine/src/editor/commands/TranslateCommand.ts:8](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/commands/TranslateCommand.ts#L8)

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

Defined in: [packages/engine/src/editor/commands/TranslateCommand.ts:5](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/commands/TranslateCommand.ts#L5)

___

### oldPosition

• **oldPosition**: *any*

Defined in: [packages/engine/src/editor/commands/TranslateCommand.ts:8](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/commands/TranslateCommand.ts#L8)

___

### space

• **space**: *any*

Defined in: [packages/engine/src/editor/commands/TranslateCommand.ts:7](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/commands/TranslateCommand.ts#L7)

___

### translation

• **translation**: *any*

Defined in: [packages/engine/src/editor/commands/TranslateCommand.ts:6](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/commands/TranslateCommand.ts#L6)

## Methods

### execute

▸ **execute**(): *void*

**Returns:** *void*

Overrides: [default](editor_commands_command.default.md)

Defined in: [packages/engine/src/editor/commands/TranslateCommand.ts:16](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/commands/TranslateCommand.ts#L16)

___

### shouldUpdate

▸ **shouldUpdate**(`newCommand`: *any*): *boolean*

#### Parameters:

Name | Type |
:------ | :------ |
`newCommand` | *any* |

**Returns:** *boolean*

Overrides: [default](editor_commands_command.default.md)

Defined in: [packages/engine/src/editor/commands/TranslateCommand.ts:19](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/commands/TranslateCommand.ts#L19)

___

### toString

▸ **toString**(): *string*

**Returns:** *string*

Overrides: [default](editor_commands_command.default.md)

Defined in: [packages/engine/src/editor/commands/TranslateCommand.ts:34](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/commands/TranslateCommand.ts#L34)

___

### undo

▸ **undo**(): *void*

**Returns:** *void*

Overrides: [default](editor_commands_command.default.md)

Defined in: [packages/engine/src/editor/commands/TranslateCommand.ts:26](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/commands/TranslateCommand.ts#L26)

___

### update

▸ **update**(`command`: *any*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`command` | *any* |

**Returns:** *void*

Overrides: [default](editor_commands_command.default.md)

Defined in: [packages/engine/src/editor/commands/TranslateCommand.ts:22](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/commands/TranslateCommand.ts#L22)
