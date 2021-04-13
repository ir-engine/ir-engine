---
id: "editor_classes_history.default"
title: "Class: default"
sidebar_label: "default"
custom_edit_url: null
hide_title: true
---

# Class: default

[editor/classes/History](../modules/editor_classes_history.md).default

**`author`** dforrer / https://github.com/dforrer
Developed as part of a project at University of Applied Sciences and Arts Northwestern Switzerland (www.fhnw.ch)

## Constructors

### constructor

\+ **new default**(): [*default*](editor_classes_history.default.md)

**Returns:** [*default*](editor_classes_history.default.md)

Defined in: [packages/engine/src/editor/classes/History.ts:12](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/classes/History.ts#L12)

## Properties

### commandUpdatesEnabled

• **commandUpdatesEnabled**: *boolean*

Defined in: [packages/engine/src/editor/classes/History.ts:11](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/classes/History.ts#L11)

___

### debug

• **debug**: *boolean*

Defined in: [packages/engine/src/editor/classes/History.ts:12](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/classes/History.ts#L12)

___

### idCounter

• **idCounter**: *number*

Defined in: [packages/engine/src/editor/classes/History.ts:10](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/classes/History.ts#L10)

___

### lastCmdTime

• **lastCmdTime**: Date

Defined in: [packages/engine/src/editor/classes/History.ts:9](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/classes/History.ts#L9)

___

### redos

• **redos**: *any*[]

Defined in: [packages/engine/src/editor/classes/History.ts:8](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/classes/History.ts#L8)

___

### undos

• **undos**: *any*[]

Defined in: [packages/engine/src/editor/classes/History.ts:7](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/classes/History.ts#L7)

## Methods

### clear

▸ **clear**(): *void*

**Returns:** *void*

Defined in: [packages/engine/src/editor/classes/History.ts:133](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/classes/History.ts#L133)

___

### execute

▸ **execute**(`cmd`: *any*): *any*

#### Parameters:

Name | Type |
:------ | :------ |
`cmd` | *any* |

**Returns:** *any*

Defined in: [packages/engine/src/editor/classes/History.ts:22](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/classes/History.ts#L22)

___

### getDebugLog

▸ **getDebugLog**(): *string*

**Returns:** *string*

Defined in: [packages/engine/src/editor/classes/History.ts:129](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/classes/History.ts#L129)

___

### redo

▸ **redo**(): *any*

**Returns:** *any*

Defined in: [packages/engine/src/editor/classes/History.ts:110](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/classes/History.ts#L110)

___

### revert

▸ **revert**(`checkpointId`: *any*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`checkpointId` | *any* |

**Returns:** *void*

Defined in: [packages/engine/src/editor/classes/History.ts:59](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/classes/History.ts#L59)

___

### undo

▸ **undo**(): *any*

**Returns:** *any*

Defined in: [packages/engine/src/editor/classes/History.ts:91](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/classes/History.ts#L91)
