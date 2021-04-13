---
id: "assets_loaders_fbx_nurbsutils"
title: "Module: assets/loaders/fbx/NURBSUtils"
sidebar_label: "assets/loaders/fbx/NURBSUtils"
custom_edit_url: null
hide_title: true
---

# Module: assets/loaders/fbx/NURBSUtils

## Functions

### calcBSplineDerivatives

▸ **calcBSplineDerivatives**(`p`: *number*, `U`: *number*[], `P`: Vector4[], `u`: *number*, `nd`: *number*): Vector4[]

#### Parameters:

Name | Type |
:------ | :------ |
`p` | *number* |
`U` | *number*[] |
`P` | Vector4[] |
`u` | *number* |
`nd` | *number* |

**Returns:** Vector4[]

Defined in: [packages/engine/src/assets/loaders/fbx/NURBSUtils.ts:268](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/assets/loaders/fbx/NURBSUtils.ts#L268)

___

### calcBSplinePoint

▸ **calcBSplinePoint**(`p`: *number*, `U`: *number*[], `P`: Vector4[], `u`: *number*): Vector4

#### Parameters:

Name | Type |
:------ | :------ |
`p` | *number* |
`U` | *number*[] |
`P` | Vector4[] |
`u` | *number* |

**Returns:** Vector4

Defined in: [packages/engine/src/assets/loaders/fbx/NURBSUtils.ts:109](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/assets/loaders/fbx/NURBSUtils.ts#L109)

___

### calcBasisFunctionDerivatives

▸ **calcBasisFunctionDerivatives**(`span`: *number*, `u`: *number*, `p`: *number*, `n`: *number*, `U`: *number*[]): *number*[][]

#### Parameters:

Name | Type |
:------ | :------ |
`span` | *number* |
`u` | *number* |
`p` | *number* |
`n` | *number* |
`U` | *number*[] |

**Returns:** *number*[][]

Defined in: [packages/engine/src/assets/loaders/fbx/NURBSUtils.ts:140](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/assets/loaders/fbx/NURBSUtils.ts#L140)

___

### calcBasisFunctions

▸ **calcBasisFunctions**(`span`: *number*, `u`: *number*, `p`: *number*, `U`: *number*[]): *number*[]

#### Parameters:

Name | Type |
:------ | :------ |
`span` | *number* |
`u` | *number* |
`p` | *number* |
`U` | *number*[] |

**Returns:** *number*[]

Defined in: [packages/engine/src/assets/loaders/fbx/NURBSUtils.ts:69](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/assets/loaders/fbx/NURBSUtils.ts#L69)

___

### calcKoverI

▸ **calcKoverI**(`k`: *number*, `i`: *number*): *number*

#### Parameters:

Name | Type |
:------ | :------ |
`k` | *number* |
`i` | *number* |

**Returns:** *number*

Defined in: [packages/engine/src/assets/loaders/fbx/NURBSUtils.ts:316](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/assets/loaders/fbx/NURBSUtils.ts#L316)

___

### calcNURBSDerivatives

▸ **calcNURBSDerivatives**(`p`: *number*, `U`: *number*[], `P`: Vector4[], `u`: *number*, `nd`: *number*): Vector3[]

#### Parameters:

Name | Type |
:------ | :------ |
`p` | *number* |
`U` | *number*[] |
`P` | Vector4[] |
`u` | *number* |
`nd` | *number* |

**Returns:** Vector3[]

Defined in: [packages/engine/src/assets/loaders/fbx/NURBSUtils.ts:392](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/assets/loaders/fbx/NURBSUtils.ts#L392)

___

### calcRationalCurveDerivatives

▸ **calcRationalCurveDerivatives**(`Pders`: Vector4[]): Vector3[]

#### Parameters:

Name | Type |
:------ | :------ |
`Pders` | Vector4[] |

**Returns:** Vector3[]

Defined in: [packages/engine/src/assets/loaders/fbx/NURBSUtils.ts:349](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/assets/loaders/fbx/NURBSUtils.ts#L349)

___

### calcSurfacePoint

▸ **calcSurfacePoint**(`p`: *number*, `q`: *number*, `U`: *number*[], `V`: *number*[], `P`: Vector4[], `u`: *number*, `v`: *number*, `target`: Vector3): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`p` | *number* |
`q` | *number* |
`U` | *number*[] |
`V` | *number*[] |
`P` | Vector4[] |
`u` | *number* |
`v` | *number* |
`target` | Vector3 |

**Returns:** *void*

Defined in: [packages/engine/src/assets/loaders/fbx/NURBSUtils.ts:407](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/assets/loaders/fbx/NURBSUtils.ts#L407)

___

### findSpan

▸ **findSpan**(`p`: *number*, `u`: *number*, `U`: *number*[]): *number*

	NURBS Utils

#### Parameters:

Name | Type |
:------ | :------ |
`p` | *number* |
`u` | *number* |
`U` | *number*[] |

**Returns:** *number*

Defined in: [packages/engine/src/assets/loaders/fbx/NURBSUtils.ts:20](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/assets/loaders/fbx/NURBSUtils.ts#L20)
