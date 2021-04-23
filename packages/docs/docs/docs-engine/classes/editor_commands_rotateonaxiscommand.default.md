---
id: "editor_commands_rotateonaxiscommand.default"
title: "Class: default"
sidebar_label: "default"
custom_edit_url: null
hide_title: true
---

# Class: default

[editor/commands/RotateOnAxisCommand](../modules/editor_commands_rotateonaxiscommand.md).default

## Hierarchy

* [*default*](editor_commands_command.default.md)

  ↳ **default**

## Constructors

### constructor

\+ **new default**(`editor`: *any*, `object`: *any*, `axis`: *any*, `angle`: *any*, `space`: *any*): [*default*](editor_commands_rotateonaxiscommand.default.md)

#### Parameters:

Name | Type |
:------ | :------ |
`editor` | *any* |
`object` | *any* |
`axis` | *any* |
`angle` | *any* |
`space` | *any* |

**Returns:** [*default*](editor_commands_rotateonaxiscommand.default.md)

Overrides: [default](editor_commands_command.default.md)

Defined in: [packages/engine/src/editor/commands/RotateOnAxisCommand.ts:9](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/commands/RotateOnAxisCommand.ts#L9)

## Properties

### angle

• **angle**: *any*

Defined in: [packages/engine/src/editor/commands/RotateOnAxisCommand.ts:7](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/commands/RotateOnAxisCommand.ts#L7)

___

### axis

• **axis**: *any*

Defined in: [packages/engine/src/editor/commands/RotateOnAxisCommand.ts:6](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/commands/RotateOnAxisCommand.ts#L6)

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

### object

• **object**: *any*

Defined in: [packages/engine/src/editor/commands/RotateOnAxisCommand.ts:5](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/commands/RotateOnAxisCommand.ts#L5)

___

### oldRotation

• **oldRotation**: *any*

Defined in: [packages/engine/src/editor/commands/RotateOnAxisCommand.ts:9](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/commands/RotateOnAxisCommand.ts#L9)

___

### space

• **space**: *any*

Defined in: [packages/engine/src/editor/commands/RotateOnAxisCommand.ts:8](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/commands/RotateOnAxisCommand.ts#L8)

## Methods

### execute

▸ **execute**(): *void*

**Returns:** *void*

Overrides: [default](editor_commands_command.default.md)

Defined in: [packages/engine/src/editor/commands/RotateOnAxisCommand.ts:18](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/commands/RotateOnAxisCommand.ts#L18)

___

### shouldUpdate

▸ **shouldUpdate**(`newCommand`: *any*): *any*

#### Parameters:

Name | Type |
:------ | :------ |
`newCommand` | *any* |

**Returns:** *any*

Overrides: [default](editor_commands_command.default.md)

Defined in: [packages/engine/src/editor/commands/RotateOnAxisCommand.ts:27](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/commands/RotateOnAxisCommand.ts#L27)

___

### toString

▸ **toString**(): *string*

**Returns:** *string*

Overrides: [default](editor_commands_command.default.md)

Defined in: [packages/engine/src/editor/commands/RotateOnAxisCommand.ts:52](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/commands/RotateOnAxisCommand.ts#L52)

___

### undo

▸ **undo**(): *void*

**Returns:** *void*

Overrides: [default](editor_commands_command.default.md)

Defined in: [packages/engine/src/editor/commands/RotateOnAxisCommand.ts:44](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/commands/RotateOnAxisCommand.ts#L44)

___

### update

▸ **update**(`command`: *any*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`command` | *any* |

**Returns:** *void*

Overrides: [default](editor_commands_command.default.md)

Defined in: [packages/engine/src/editor/commands/RotateOnAxisCommand.ts:34](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/commands/RotateOnAxisCommand.ts#L34)
