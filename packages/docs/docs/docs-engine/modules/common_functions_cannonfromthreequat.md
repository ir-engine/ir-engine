---
id: "common_functions_cannonfromthreequat"
title: "Module: common/functions/cannonFromThreeQuat"
sidebar_label: "common/functions/cannonFromThreeQuat"
custom_edit_url: null
hide_title: true
---

# Module: common/functions/cannonFromThreeQuat

## Functions

### cannonFromThreeQuat

▸ **cannonFromThreeQuat**(`quat`: THREE.Quaternion): CANNON.Quaternion

Converts [Quaternion](https://threejs.org/docs/#api/en/math/Quaternion) of three.js
into [Quaternion](http://schteppe.github.io/cannon.js/docs/classes/Quaternion.html) of Cannon-es library.

#### Parameters:

Name | Type | Description |
:------ | :------ | :------ |
`quat` | THREE.Quaternion | Quaternion of three.js library.   |

**Returns:** CANNON.Quaternion

Quaternion of cannon-es library.

Defined in: [packages/engine/src/common/functions/cannonFromThreeQuat.ts:11](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/common/functions/cannonFromThreeQuat.ts#L11)
