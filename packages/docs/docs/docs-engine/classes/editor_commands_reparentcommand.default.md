---
id: "editor_commands_reparentcommand.default"
title: "Class: default"
sidebar_label: "default"
custom_edit_url: null
hide_title: true
---

# Class: default

[editor/commands/ReparentCommand](../modules/editor_commands_reparentcommand.md).default

## Hierarchy

* [*default*](editor_commands_command.default.md)

  ↳ **default**

## Constructors

### constructor

\+ **new default**(`editor`: *any*, `object`: *any*, `newParent`: *any*, `newBefore`: *any*): [*default*](editor_commands_reparentcommand.default.md)

#### Parameters:

Name | Type |
:------ | :------ |
`editor` | *any* |
`object` | *any* |
`newParent` | *any* |
`newBefore` | *any* |

**Returns:** [*default*](editor_commands_reparentcommand.default.md)

Overrides: [default](editor_commands_command.default.md)

Defined in: [packages/engine/src/editor/commands/ReparentCommand.ts:9](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/commands/ReparentCommand.ts#L9)

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

Defined in: [packages/engine/src/editor/commands/ReparentCommand.ts:8](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/commands/ReparentCommand.ts#L8)

___

### newParent

• **newParent**: *any*

Defined in: [packages/engine/src/editor/commands/ReparentCommand.ts:7](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/commands/ReparentCommand.ts#L7)

___

### object

• **object**: *any*

Defined in: [packages/engine/src/editor/commands/ReparentCommand.ts:4](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/commands/ReparentCommand.ts#L4)

___

### oldBefore

• **oldBefore**: *any*

Defined in: [packages/engine/src/editor/commands/ReparentCommand.ts:6](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/commands/ReparentCommand.ts#L6)

___

### oldParent

• **oldParent**: *any*

Defined in: [packages/engine/src/editor/commands/ReparentCommand.ts:5](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/commands/ReparentCommand.ts#L5)

___

### oldSelection

• **oldSelection**: *any*

Defined in: [packages/engine/src/editor/commands/ReparentCommand.ts:9](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/commands/ReparentCommand.ts#L9)

## Methods

### execute

▸ **execute**(): *void*

**Returns:** *void*

Overrides: [default](editor_commands_command.default.md)

Defined in: [packages/engine/src/editor/commands/ReparentCommand.ts:25](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/commands/ReparentCommand.ts#L25)

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

Defined in: [packages/engine/src/editor/commands/ReparentCommand.ts:39](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/commands/ReparentCommand.ts#L39)

___

### undo

▸ **undo**(): *void*

**Returns:** *void*

Overrides: [default](editor_commands_command.default.md)

Defined in: [packages/engine/src/editor/commands/ReparentCommand.ts:28](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/commands/ReparentCommand.ts#L28)

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
