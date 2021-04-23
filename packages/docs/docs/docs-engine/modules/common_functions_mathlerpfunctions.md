---
id: "common_functions_mathlerpfunctions"
title: "Module: common/functions/MathLerpFunctions"
sidebar_label: "common/functions/MathLerpFunctions"
custom_edit_url: null
hide_title: true
---

# Module: common/functions/MathLerpFunctions

## Functions

### clamp

▸ `Const`**clamp**(`value`: *number*, `min`: *number*, `max`: *number*): *number*

Returns values which will be clamped if goes out of minimum and maximum range.

#### Parameters:

Name | Type | Description |
:------ | :------ | :------ |
`value` | *number* | Value to be clamped.   |
`min` | *number* | Minimum boundary value.   |
`max` | *number* | Maximum boundary value.   |

**Returns:** *number*

Clamped value.

Defined in: [packages/engine/src/common/functions/MathLerpFunctions.ts:128](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/common/functions/MathLerpFunctions.ts#L128)

___

### degreeLerp

▸ `Const`**degreeLerp**(`start`: *number*, `end`: *number*, `t`: *number*): *number*

Find Interpolation between 2 degree angles.

#### Parameters:

Name | Type | Description |
:------ | :------ | :------ |
`start` | *number* | Degree from which to interpolate.   |
`end` | *number* | Degree to which to interpolate.   |
`t` | *number* | How far to interpolate from start.   |

**Returns:** *number*

Interpolation between start and end.

Defined in: [packages/engine/src/common/functions/MathLerpFunctions.ts:22](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/common/functions/MathLerpFunctions.ts#L22)

___

### lerp

▸ `Const`**lerp**(`start`: *number*, `end`: *number*, `t`: *number*): *number*

Find Interpolation between 2 number.

#### Parameters:

Name | Type | Description |
:------ | :------ | :------ |
`start` | *number* | Number from which to interpolate.   |
`end` | *number* | Number to which to interpolate.   |
`t` | *number* | How far to interpolate from start.   |

**Returns:** *number*

Interpolation between start and end.

Defined in: [packages/engine/src/common/functions/MathLerpFunctions.ts:11](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/common/functions/MathLerpFunctions.ts#L11)

___

### quatSlerp

▸ `Const`**quatSlerp**(`qa`: [*Quat*](../interfaces/networking_types_snapshotdatatypes.quat.md), `qb`: [*Quat*](../interfaces/networking_types_snapshotdatatypes.quat.md), `t`: *number*): *any*

Find Interpolation between 2 quaternion.

#### Parameters:

Name | Type | Description |
:------ | :------ | :------ |
`qa` | [*Quat*](../interfaces/networking_types_snapshotdatatypes.quat.md) | - |
`qb` | [*Quat*](../interfaces/networking_types_snapshotdatatypes.quat.md) | - |
`t` | *number* | How far to interpolate from start.   |

**Returns:** *any*

Interpolation between start and end.

Defined in: [packages/engine/src/common/functions/MathLerpFunctions.ts:86](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/common/functions/MathLerpFunctions.ts#L86)

___

### radianLerp

▸ `Const`**radianLerp**(`start`: *number*, `end`: *number*, `t`: *number*): *number*

Find Interpolation between 2 radian angles.

#### Parameters:

Name | Type | Description |
:------ | :------ | :------ |
`start` | *number* | Radian from which to interpolate.   |
`end` | *number* | Radian to which to interpolate.   |
`t` | *number* | How far to interpolate from start.   |

**Returns:** *number*

Interpolation between start and end.

Defined in: [packages/engine/src/common/functions/MathLerpFunctions.ts:54](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/common/functions/MathLerpFunctions.ts#L54)
