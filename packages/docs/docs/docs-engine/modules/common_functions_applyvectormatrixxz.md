---
id: "common_functions_applyvectormatrixxz"
title: "Module: common/functions/applyVectorMatrixXZ"
sidebar_label: "common/functions/applyVectorMatrixXZ"
custom_edit_url: null
hide_title: true
---

# Module: common/functions/applyVectorMatrixXZ

## Functions

### applyVectorMatrixXZ

▸ **applyVectorMatrixXZ**(`a`: Vector3, `b`: Vector3): Vector3

Constructs a 2D matrix from first vector, replacing the Y axes with the global Y axis,
and applies this matrix to the second vector. Saves performance when compared to full 3D matrix application.
Useful for actor rotation, as it only happens on the Y axis.

#### Parameters:

Name | Type | Description |
:------ | :------ | :------ |
`a` | Vector3 | Vector to construct 2D matrix from   |
`b` | Vector3 | Vector to apply basis to    |

**Returns:** Vector3

Defined in: [packages/engine/src/common/functions/applyVectorMatrixXZ.ts:10](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/common/functions/applyVectorMatrixXZ.ts#L10)
