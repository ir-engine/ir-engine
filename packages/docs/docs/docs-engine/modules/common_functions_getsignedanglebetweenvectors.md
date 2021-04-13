---
id: "common_functions_getsignedanglebetweenvectors"
title: "Module: common/functions/getSignedAngleBetweenVectors"
sidebar_label: "common/functions/getSignedAngleBetweenVectors"
custom_edit_url: null
hide_title: true
---

# Module: common/functions/getSignedAngleBetweenVectors

## Functions

### getSignedAngleBetweenVectors

▸ **getSignedAngleBetweenVectors**(`v1`: THREE.Vector3, `v2`: THREE.Vector3, `normal?`: THREE.Vector3, `dotTreshold?`: *number*): *number*

Finds an angle between two vectors with a sign relative to normal vector.

#### Parameters:

Name | Type | Default value | Description |
:------ | :------ | :------ | :------ |
`v1` | THREE.Vector3 | - | First Vector.   |
`v2` | THREE.Vector3 | - | Second Vector.   |
`normal` | THREE.Vector3 | - | Normal Vector.   |
`dotTreshold` | *number* | 0.0005 |     |

**Returns:** *number*

Angle between two vectors.

Defined in: [packages/engine/src/common/functions/getSignedAngleBetweenVectors.ts:12](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/common/functions/getSignedAngleBetweenVectors.ts#L12)
