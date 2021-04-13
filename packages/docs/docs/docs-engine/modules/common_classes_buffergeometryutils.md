---
id: "common_classes_buffergeometryutils"
title: "Module: common/classes/BufferGeometryUtils"
sidebar_label: "common/classes/BufferGeometryUtils"
custom_edit_url: null
hide_title: true
---

# Module: common/classes/BufferGeometryUtils

## Functions

### computeMorphedAttributes

▸ **computeMorphedAttributes**(`object`: *any*): *object*

Calculates the morphed attributes of a morphed/skinned BufferGeometry.
Helpful for Raytracing or Decals.

#### Parameters:

Name | Type | Description |
:------ | :------ | :------ |
`object` | *any* | An instance of Mesh, Line or Points.   |

**Returns:** *object*

Name | Type |
:------ | :------ |
`morphedNormalAttribute` | *any* |
`morphedPositionAttribute` | *any* |
`normalAttribute` | *any* |
`positionAttribute` | *any* |

An Object with original position/normal attributes and morphed ones.

Defined in: [packages/engine/src/common/classes/BufferGeometryUtils.ts:638](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/common/classes/BufferGeometryUtils.ts#L638)

___

### computeTangents

▸ **computeTangents**(`geometry`: *any*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`geometry` | *any* |

**Returns:** *void*

Defined in: [packages/engine/src/common/classes/BufferGeometryUtils.ts:14](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/common/classes/BufferGeometryUtils.ts#L14)

___

### estimateBytesUsed

▸ **estimateBytesUsed**(`geometry`: *any*): *number*

#### Parameters:

Name | Type |
:------ | :------ |
`geometry` | *any* |

**Returns:** *number*

Defined in: [packages/engine/src/common/classes/BufferGeometryUtils.ts:354](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/common/classes/BufferGeometryUtils.ts#L354)

___

### interleaveAttributes

▸ **interleaveAttributes**(`attributes`: *any*): *any*[]

#### Parameters:

Name | Type |
:------ | :------ |
`attributes` | *any* |

**Returns:** *any*[]

Defined in: [packages/engine/src/common/classes/BufferGeometryUtils.ts:289](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/common/classes/BufferGeometryUtils.ts#L289)

___

### mergeBufferAttributes

▸ **mergeBufferAttributes**(`attributes`: *any*): *any*

#### Parameters:

Name | Type |
:------ | :------ |
`attributes` | *any* |

**Returns:** *any*

Defined in: [packages/engine/src/common/classes/BufferGeometryUtils.ts:224](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/common/classes/BufferGeometryUtils.ts#L224)

___

### mergeBufferGeometries

▸ **mergeBufferGeometries**(`geometries`: *any*, `useGroups?`: *any*): *any*

#### Parameters:

Name | Type |
:------ | :------ |
`geometries` | *any* |
`useGroups?` | *any* |

**Returns:** *any*

Defined in: [packages/engine/src/common/classes/BufferGeometryUtils.ts:24](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/common/classes/BufferGeometryUtils.ts#L24)

___

### mergeVertices

▸ **mergeVertices**(`geometry`: *any*, `tolerance?`: *number*): *any*

#### Parameters:

Name | Type | Default value |
:------ | :------ | :------ |
`geometry` | *any* | - |
`tolerance` | *number* | 1e-4 |

**Returns:** *any*

Defined in: [packages/engine/src/common/classes/BufferGeometryUtils.ts:378](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/common/classes/BufferGeometryUtils.ts#L378)

___

### toTrianglesDrawMode

▸ **toTrianglesDrawMode**(`geometry`: *any*, `drawMode`: *any*): *any*

#### Parameters:

Name | Type |
:------ | :------ |
`geometry` | *any* |
`drawMode` | *any* |

**Returns:** *any*

Defined in: [packages/engine/src/common/classes/BufferGeometryUtils.ts:527](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/common/classes/BufferGeometryUtils.ts#L527)
