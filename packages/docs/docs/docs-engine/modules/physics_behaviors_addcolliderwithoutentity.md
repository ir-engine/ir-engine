---
id: "physics_behaviors_addcolliderwithoutentity"
title: "Module: physics/behaviors/addColliderWithoutEntity"
sidebar_label: "physics/behaviors/addColliderWithoutEntity"
custom_edit_url: null
hide_title: true
---

# Module: physics/behaviors/addColliderWithoutEntity

## Functions

### addColliderWithoutEntity

▸ **addColliderWithoutEntity**(`userData`: *any*, `position`: *any*, `quaternion`: *any*, `scale`: *any*, `model?`: { `indices`: *any* = null; `mesh`: *any* = null; `vertices`: *any* = null }): *Body*

#### Parameters:

Name | Type | Default value |
:------ | :------ | :------ |
`userData` | *any* | - |
`position` | *any* | - |
`quaternion` | *any* | - |
`scale` | *any* | - |
`model` | *object* | - |
`model.indices` | *any* | null |
`model.mesh` | *any* | null |
`model.vertices` | *any* | null |

**Returns:** *Body*

Defined in: [packages/engine/src/physics/behaviors/addColliderWithoutEntity.ts:39](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/physics/behaviors/addColliderWithoutEntity.ts#L39)

___

### createBoxCollider

▸ **createBoxCollider**(`scale`: *any*): *void* \| *Box*

#### Parameters:

Name | Type |
:------ | :------ |
`scale` | *any* |

**Returns:** *void* \| *Box*

Defined in: [packages/engine/src/physics/behaviors/addColliderWithoutEntity.ts:15](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/physics/behaviors/addColliderWithoutEntity.ts#L15)

___

### createCylinderCollider

▸ **createCylinderCollider**(`scale`: *any*): *void* \| *Cylinder*

#### Parameters:

Name | Type |
:------ | :------ |
`scale` | *any* |

**Returns:** *void* \| *Cylinder*

Defined in: [packages/engine/src/physics/behaviors/addColliderWithoutEntity.ts:28](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/physics/behaviors/addColliderWithoutEntity.ts#L28)

___

### createGroundCollider

▸ **createGroundCollider**(): *Plane*

**Returns:** *Plane*

Defined in: [packages/engine/src/physics/behaviors/addColliderWithoutEntity.ts:24](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/physics/behaviors/addColliderWithoutEntity.ts#L24)

___

### createSphereCollider

▸ **createSphereCollider**(`scale`: *any*): *Sphere*

#### Parameters:

Name | Type |
:------ | :------ |
`scale` | *any* |

**Returns:** *Sphere*

Defined in: [packages/engine/src/physics/behaviors/addColliderWithoutEntity.ts:20](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/physics/behaviors/addColliderWithoutEntity.ts#L20)

___

### createTrimeshFromArrayVertices

▸ **createTrimeshFromArrayVertices**(`vertices`: *any*, `indices`: *any*): *Trimesh*

#### Parameters:

Name | Type |
:------ | :------ |
`vertices` | *any* |
`indices` | *any* |

**Returns:** *Trimesh*

Defined in: [packages/engine/src/physics/behaviors/addColliderWithoutEntity.ts:6](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/physics/behaviors/addColliderWithoutEntity.ts#L6)

___

### createTrimeshFromMesh

▸ **createTrimeshFromMesh**(`mesh`: *any*): *any*

#### Parameters:

Name | Type |
:------ | :------ |
`mesh` | *any* |

**Returns:** *any*

Defined in: [packages/engine/src/physics/behaviors/addColliderWithoutEntity.ts:11](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/physics/behaviors/addColliderWithoutEntity.ts#L11)

___

### doThisActivateCollider

▸ **doThisActivateCollider**(`body`: *any*, `userData`: *any*): *any*

#### Parameters:

Name | Type |
:------ | :------ |
`body` | *any* |
`userData` | *any* |

**Returns:** *any*

Defined in: [packages/engine/src/physics/behaviors/addColliderWithoutEntity.ts:33](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/physics/behaviors/addColliderWithoutEntity.ts#L33)
