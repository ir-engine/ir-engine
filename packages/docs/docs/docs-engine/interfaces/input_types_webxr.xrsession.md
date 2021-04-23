---
id: "input_types_webxr.xrsession"
title: "Interface: XRSession"
sidebar_label: "XRSession"
custom_edit_url: null
hide_title: true
---

# Interface: XRSession

[input/types/WebXR](../modules/input_types_webxr.md).XRSession

## Implemented by

* [*XRSessionProxy*](../classes/worker_messagequeue.xrsessionproxy.md)

## Properties

### addEventListener

• **addEventListener**: *any*

Defined in: [packages/engine/src/input/types/WebXR.ts:52](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/input/types/WebXR.ts#L52)

___

### inputSources

• **inputSources**: [*XRInputSource*](input_types_webxr.xrinputsource.md)[]

Defined in: [packages/engine/src/input/types/WebXR.ts:59](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/input/types/WebXR.ts#L59)

___

### removeEventListener

• **removeEventListener**: *any*

Defined in: [packages/engine/src/input/types/WebXR.ts:53](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/input/types/WebXR.ts#L53)

___

### renderState

• **renderState**: [*XRRenderState*](input_types_webxr.xrrenderstate.md)

Defined in: [packages/engine/src/input/types/WebXR.ts:58](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/input/types/WebXR.ts#L58)

___

### requestAnimationFrame

• **requestAnimationFrame**: *any*

Defined in: [packages/engine/src/input/types/WebXR.ts:56](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/input/types/WebXR.ts#L56)

## Methods

### end

▸ **end**(): *Promise*<void\>

**Returns:** *Promise*<void\>

Defined in: [packages/engine/src/input/types/WebXR.ts:57](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/input/types/WebXR.ts#L57)

___

### requestHitTest

▸ **requestHitTest**(`ray`: [*XRRay*](../classes/input_types_webxr.xrray.md), `referenceSpace`: [*XRReferenceSpace*](input_types_webxr.xrreferencespace.md)): *Promise*<[*XRHitResult*](input_types_webxr.xrhitresult.md)[]\>

#### Parameters:

Name | Type |
:------ | :------ |
`ray` | [*XRRay*](../classes/input_types_webxr.xrray.md) |
`referenceSpace` | [*XRReferenceSpace*](input_types_webxr.xrreferencespace.md) |

**Returns:** *Promise*<[*XRHitResult*](input_types_webxr.xrhitresult.md)[]\>

Defined in: [packages/engine/src/input/types/WebXR.ts:68](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/input/types/WebXR.ts#L68)

___

### requestHitTestSource

▸ **requestHitTestSource**(`options`: [*XRHitTestOptionsInit*](input_types_webxr.xrhittestoptionsinit.md)): *Promise*<[*XRHitTestSource*](input_types_webxr.xrhittestsource.md)\>

#### Parameters:

Name | Type |
:------ | :------ |
`options` | [*XRHitTestOptionsInit*](input_types_webxr.xrhittestoptionsinit.md) |

**Returns:** *Promise*<[*XRHitTestSource*](input_types_webxr.xrhittestsource.md)\>

Defined in: [packages/engine/src/input/types/WebXR.ts:62](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/input/types/WebXR.ts#L62)

___

### requestHitTestSourceForTransientInput

▸ **requestHitTestSourceForTransientInput**(`options`: [*XRTransientInputHitTestOptionsInit*](input_types_webxr.xrtransientinputhittestoptionsinit.md)): *Promise*<[*XRTransientInputHitTestSource*](input_types_webxr.xrtransientinputhittestsource.md)\>

#### Parameters:

Name | Type |
:------ | :------ |
`options` | [*XRTransientInputHitTestOptionsInit*](input_types_webxr.xrtransientinputhittestoptionsinit.md) |

**Returns:** *Promise*<[*XRTransientInputHitTestSource*](input_types_webxr.xrtransientinputhittestsource.md)\>

Defined in: [packages/engine/src/input/types/WebXR.ts:63](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/input/types/WebXR.ts#L63)

___

### requestReferenceSpace

▸ **requestReferenceSpace**(`type`: [*XRReferenceSpaceType*](../modules/input_types_webxr.md#xrreferencespacetype)): *Promise*<[*XRReferenceSpace*](input_types_webxr.xrreferencespace.md)\>

#### Parameters:

Name | Type |
:------ | :------ |
`type` | [*XRReferenceSpaceType*](../modules/input_types_webxr.md#xrreferencespacetype) |

**Returns:** *Promise*<[*XRReferenceSpace*](input_types_webxr.xrreferencespace.md)\>

Defined in: [packages/engine/src/input/types/WebXR.ts:54](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/input/types/WebXR.ts#L54)

___

### updateRenderState

▸ **updateRenderState**(`XRRenderStateInit`: [*XRRenderState*](input_types_webxr.xrrenderstate.md)): *Promise*<void\>

#### Parameters:

Name | Type |
:------ | :------ |
`XRRenderStateInit` | [*XRRenderState*](input_types_webxr.xrrenderstate.md) |

**Returns:** *Promise*<void\>

Defined in: [packages/engine/src/input/types/WebXR.ts:55](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/input/types/WebXR.ts#L55)

___

### updateWorldTrackingState

▸ **updateWorldTrackingState**(`options`: { `planeDetectionState?`: { `enabled`: *boolean*  }  }): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`options` | *object* |
`options.planeDetectionState?` | *object* |
`options.planeDetectionState.enabled` | *boolean* |

**Returns:** *void*

Defined in: [packages/engine/src/input/types/WebXR.ts:71](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/input/types/WebXR.ts#L71)
