---
id: "input_types_webxr.xrframe"
title: "Interface: XRFrame"
sidebar_label: "XRFrame"
custom_edit_url: null
hide_title: true
---

# Interface: XRFrame

[input/types/WebXR](../modules/input_types_webxr.md).XRFrame

## Properties

### session

• **session**: [*XRSession*](input_types_webxr.xrsession.md)

Defined in: [packages/engine/src/input/types/WebXR.ts:83](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/input/types/WebXR.ts#L83)

___

### trackedAnchors

• `Optional` **trackedAnchors**: [*XRAnchorSet*](../modules/input_types_webxr.md#xranchorset)

Defined in: [packages/engine/src/input/types/WebXR.ts:91](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/input/types/WebXR.ts#L91)

___

### worldInformation

• **worldInformation**: *object*

#### Type declaration:

Name | Type |
:------ | :------ |
`detectedPlanes`? | [*XRPlaneSet*](../modules/input_types_webxr.md#xrplaneset) |

Defined in: [packages/engine/src/input/types/WebXR.ts:94](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/input/types/WebXR.ts#L94)

## Methods

### createAnchor

▸ **createAnchor**(`pose`: [*XRRigidTransform*](../classes/input_types_webxr.xrrigidtransform.md), `space`: EventTarget): *Promise*<[*XRAnchor*](input_types_webxr.xranchor.md)\>

#### Parameters:

Name | Type |
:------ | :------ |
`pose` | [*XRRigidTransform*](../classes/input_types_webxr.xrrigidtransform.md) |
`space` | EventTarget |

**Returns:** *Promise*<[*XRAnchor*](input_types_webxr.xranchor.md)\>

Defined in: [packages/engine/src/input/types/WebXR.ts:92](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/input/types/WebXR.ts#L92)

___

### getHitTestResults

▸ **getHitTestResults**(`hitTestSource`: [*XRHitTestSource*](input_types_webxr.xrhittestsource.md)): [*XRHitTestResult*](input_types_webxr.xrhittestresult.md)[]

#### Parameters:

Name | Type |
:------ | :------ |
`hitTestSource` | [*XRHitTestSource*](input_types_webxr.xrhittestsource.md) |

**Returns:** [*XRHitTestResult*](input_types_webxr.xrhittestresult.md)[]

Defined in: [packages/engine/src/input/types/WebXR.ts:88](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/input/types/WebXR.ts#L88)

___

### getHitTestResultsForTransientInput

▸ **getHitTestResultsForTransientInput**(`hitTestSource`: [*XRTransientInputHitTestSource*](input_types_webxr.xrtransientinputhittestsource.md)): [*XRTransientInputHitTestResult*](input_types_webxr.xrtransientinputhittestresult.md)[]

#### Parameters:

Name | Type |
:------ | :------ |
`hitTestSource` | [*XRTransientInputHitTestSource*](input_types_webxr.xrtransientinputhittestsource.md) |

**Returns:** [*XRTransientInputHitTestResult*](input_types_webxr.xrtransientinputhittestresult.md)[]

Defined in: [packages/engine/src/input/types/WebXR.ts:89](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/input/types/WebXR.ts#L89)

___

### getPose

▸ **getPose**(`space`: EventTarget, `baseSpace`: EventTarget): [*XRPose*](input_types_webxr.xrpose.md)

#### Parameters:

Name | Type |
:------ | :------ |
`space` | EventTarget |
`baseSpace` | EventTarget |

**Returns:** [*XRPose*](input_types_webxr.xrpose.md)

Defined in: [packages/engine/src/input/types/WebXR.ts:85](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/input/types/WebXR.ts#L85)

___

### getViewerPose

▸ **getViewerPose**(`referenceSpace`: [*XRReferenceSpace*](input_types_webxr.xrreferencespace.md)): [*XRViewerPose*](input_types_webxr.xrviewerpose.md)

#### Parameters:

Name | Type |
:------ | :------ |
`referenceSpace` | [*XRReferenceSpace*](input_types_webxr.xrreferencespace.md) |

**Returns:** [*XRViewerPose*](input_types_webxr.xrviewerpose.md)

Defined in: [packages/engine/src/input/types/WebXR.ts:84](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/input/types/WebXR.ts#L84)
