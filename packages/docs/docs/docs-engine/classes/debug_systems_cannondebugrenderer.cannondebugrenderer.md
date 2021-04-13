---
id: "debug_systems_cannondebugrenderer.cannondebugrenderer"
title: "Class: CannonDebugRenderer"
sidebar_label: "CannonDebugRenderer"
custom_edit_url: null
hide_title: true
---

# Class: CannonDebugRenderer

[debug/systems/CannonDebugRenderer](../modules/debug_systems_cannondebugrenderer.md).CannonDebugRenderer

## Constructors

### constructor

\+ **new CannonDebugRenderer**(`scene`: *any*, `world`: *World*, `options?`: *object*): [*CannonDebugRenderer*](debug_systems_cannondebugrenderer.cannondebugrenderer.md)

#### Parameters:

Name | Type |
:------ | :------ |
`scene` | *any* |
`world` | *World* |
`options?` | *object* |

**Returns:** [*CannonDebugRenderer*](debug_systems_cannondebugrenderer.cannondebugrenderer.md)

Defined in: [packages/engine/src/debug/systems/CannonDebugRenderer.ts:35](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/debug/systems/CannonDebugRenderer.ts#L35)

## Properties

### \_boxGeometry

• `Private` **\_boxGeometry**: *any*

Defined in: [packages/engine/src/debug/systems/CannonDebugRenderer.ts:27](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/debug/systems/CannonDebugRenderer.ts#L27)

___

### \_material

• `Private` **\_material**: *any*

Defined in: [packages/engine/src/debug/systems/CannonDebugRenderer.ts:24](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/debug/systems/CannonDebugRenderer.ts#L24)

___

### \_meshes

• `Private` **\_meshes**: *any*[]

Defined in: [packages/engine/src/debug/systems/CannonDebugRenderer.ts:23](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/debug/systems/CannonDebugRenderer.ts#L23)

___

### \_particleGeometry

• `Private` **\_particleGeometry**: *any*

Defined in: [packages/engine/src/debug/systems/CannonDebugRenderer.ts:29](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/debug/systems/CannonDebugRenderer.ts#L29)

___

### \_particleMaterial

• `Private` **\_particleMaterial**: *any*

Defined in: [packages/engine/src/debug/systems/CannonDebugRenderer.ts:25](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/debug/systems/CannonDebugRenderer.ts#L25)

___

### \_planeGeometry

• `Private` **\_planeGeometry**: *any*

Defined in: [packages/engine/src/debug/systems/CannonDebugRenderer.ts:28](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/debug/systems/CannonDebugRenderer.ts#L28)

___

### \_sphereGeometry

• `Private` **\_sphereGeometry**: *any*

Defined in: [packages/engine/src/debug/systems/CannonDebugRenderer.ts:26](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/debug/systems/CannonDebugRenderer.ts#L26)

___

### enabled

• `Private` **enabled**: *boolean*

Defined in: [packages/engine/src/debug/systems/CannonDebugRenderer.ts:35](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/debug/systems/CannonDebugRenderer.ts#L35)

___

### scene

• **scene**: *any*

Defined in: [packages/engine/src/debug/systems/CannonDebugRenderer.ts:21](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/debug/systems/CannonDebugRenderer.ts#L21)

___

### tmpQuat0

• `Private` **tmpQuat0**: *Quaternion*

Defined in: [packages/engine/src/debug/systems/CannonDebugRenderer.ts:34](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/debug/systems/CannonDebugRenderer.ts#L34)

___

### tmpVec0

• `Private` **tmpVec0**: *Vec3*

Defined in: [packages/engine/src/debug/systems/CannonDebugRenderer.ts:31](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/debug/systems/CannonDebugRenderer.ts#L31)

___

### tmpVec1

• `Private` **tmpVec1**: *Vec3*

Defined in: [packages/engine/src/debug/systems/CannonDebugRenderer.ts:32](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/debug/systems/CannonDebugRenderer.ts#L32)

___

### tmpVec2

• `Private` **tmpVec2**: *Vec3*

Defined in: [packages/engine/src/debug/systems/CannonDebugRenderer.ts:33](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/debug/systems/CannonDebugRenderer.ts#L33)

___

### world

• **world**: *World*

Defined in: [packages/engine/src/debug/systems/CannonDebugRenderer.ts:22](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/debug/systems/CannonDebugRenderer.ts#L22)

## Methods

### \_createMesh

▸ `Private`**_createMesh**(`shape`: *Shape*): *any*

#### Parameters:

Name | Type |
:------ | :------ |
`shape` | *Shape* |

**Returns:** *any*

Defined in: [packages/engine/src/debug/systems/CannonDebugRenderer.ts:144](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/debug/systems/CannonDebugRenderer.ts#L144)

___

### \_scaleMesh

▸ `Private`**_scaleMesh**(`mesh`: *any*, `shape`: *Shape*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`mesh` | *any* |
`shape` | *Shape* |

**Returns:** *void*

Defined in: [packages/engine/src/debug/systems/CannonDebugRenderer.ts:269](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/debug/systems/CannonDebugRenderer.ts#L269)

___

### \_typeMatch

▸ `Private`**_typeMatch**(`mesh`: *any*, `shape`: *Shape*): Boolean

#### Parameters:

Name | Type |
:------ | :------ |
`mesh` | *any* |
`shape` | *Shape* |

**Returns:** Boolean

Defined in: [packages/engine/src/debug/systems/CannonDebugRenderer.ts:129](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/debug/systems/CannonDebugRenderer.ts#L129)

___

### \_updateMesh

▸ `Private`**_updateMesh**(`index`: *number*, `body`: *Body*, `shape`: *Shape*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`index` | *number* |
`body` | *Body* |
`shape` | *Shape* |

**Returns:** *void*

Defined in: [packages/engine/src/debug/systems/CannonDebugRenderer.ts:118](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/debug/systems/CannonDebugRenderer.ts#L118)

___

### setEnabled

▸ **setEnabled**(`enabled`: *any*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`enabled` | *any* |

**Returns:** *void*

Defined in: [packages/engine/src/debug/systems/CannonDebugRenderer.ts:55](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/debug/systems/CannonDebugRenderer.ts#L55)

___

### update

▸ **update**(): *void*

**Returns:** *void*

Defined in: [packages/engine/src/debug/systems/CannonDebugRenderer.ts:62](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/debug/systems/CannonDebugRenderer.ts#L62)
