---
id: "input_types_webxr.xrhittestresult"
title: "Interface: XRHitTestResult"
sidebar_label: "XRHitTestResult"
custom_edit_url: null
hide_title: true
---

# Interface: XRHitTestResult

[input/types/WebXR](../modules/input_types_webxr.md).XRHitTestResult

## Methods

### createAnchor

▸ `Optional`**createAnchor**(`pose`: [*XRRigidTransform*](../classes/input_types_webxr.xrrigidtransform.md)): *Promise*<[*XRAnchor*](input_types_webxr.xranchor.md)\>

#### Parameters:

Name | Type |
:------ | :------ |
`pose` | [*XRRigidTransform*](../classes/input_types_webxr.xrrigidtransform.md) |

**Returns:** *Promise*<[*XRAnchor*](input_types_webxr.xranchor.md)\>

Defined in: [packages/engine/src/input/types/WebXR.ts:174](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/input/types/WebXR.ts#L174)

___

### getPose

▸ **getPose**(`baseSpace`: EventTarget): [*XRPose*](input_types_webxr.xrpose.md)

#### Parameters:

Name | Type |
:------ | :------ |
`baseSpace` | EventTarget |

**Returns:** [*XRPose*](input_types_webxr.xrpose.md)

Defined in: [packages/engine/src/input/types/WebXR.ts:172](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/input/types/WebXR.ts#L172)
