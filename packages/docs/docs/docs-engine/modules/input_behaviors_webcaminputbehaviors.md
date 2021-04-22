---
id: "input_behaviors_webcaminputbehaviors"
title: "Module: input/behaviors/WebcamInputBehaviors"
sidebar_label: "input/behaviors/WebcamInputBehaviors"
custom_edit_url: null
hide_title: true
---

# Module: input/behaviors/WebcamInputBehaviors

## Variables

### WEBCAM\_INPUT\_EVENTS

• `Const` **WEBCAM\_INPUT\_EVENTS**: *object*

#### Type declaration:

Name | Type |
:------ | :------ |
`FACE_INPUT` | *string* |
`LIP_INPUT` | *string* |

Defined in: [packages/engine/src/input/behaviors/WebcamInputBehaviors.ts:11](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/input/behaviors/WebcamInputBehaviors.ts#L11)

## Functions

### faceToInput

▸ **faceToInput**(`entity`: *any*, `detection`: *any*): *Promise*<void\>

#### Parameters:

Name | Type |
:------ | :------ |
`entity` | *any* |
`detection` | *any* |

**Returns:** *Promise*<void\>

Defined in: [packages/engine/src/input/behaviors/WebcamInputBehaviors.ts:78](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/input/behaviors/WebcamInputBehaviors.ts#L78)

___

### lipToInput

▸ `Const`**lipToInput**(`entity`: *any*, `pucker`: *any*, `widen`: *any*, `open`: *any*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`entity` | *any* |
`pucker` | *any* |
`widen` | *any* |
`open` | *any* |

**Returns:** *void*

Defined in: [packages/engine/src/input/behaviors/WebcamInputBehaviors.ts:176](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/input/behaviors/WebcamInputBehaviors.ts#L176)

___

### startFaceTracking

▸ `Const`**startFaceTracking**(): *Promise*<void\>

**Returns:** *Promise*<void\>

Defined in: [packages/engine/src/input/behaviors/WebcamInputBehaviors.ts:38](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/input/behaviors/WebcamInputBehaviors.ts#L38)

___

### startLipsyncTracking

▸ `Const`**startLipsyncTracking**(): *void*

**Returns:** *void*

Defined in: [packages/engine/src/input/behaviors/WebcamInputBehaviors.ts:100](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/input/behaviors/WebcamInputBehaviors.ts#L100)

___

### stopFaceTracking

▸ `Const`**stopFaceTracking**(): *void*

**Returns:** *void*

Defined in: [packages/engine/src/input/behaviors/WebcamInputBehaviors.ts:26](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/input/behaviors/WebcamInputBehaviors.ts#L26)

___

### stopLipsyncTracking

▸ `Const`**stopLipsyncTracking**(): *void*

**Returns:** *void*

Defined in: [packages/engine/src/input/behaviors/WebcamInputBehaviors.ts:32](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/input/behaviors/WebcamInputBehaviors.ts#L32)
