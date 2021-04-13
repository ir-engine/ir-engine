---
id: "physics_classes_three_to_cannon"
title: "Module: physics/classes/three-to-cannon"
sidebar_label: "physics/classes/three-to-cannon"
custom_edit_url: null
hide_title: true
---

# Module: physics/classes/three-to-cannon

## Table of contents

### Namespaces

- [threeToCannon](physics_classes_three_to_cannon.threetocannon.md)

## Variables

### threeToCannon

• `Const` **threeToCannon**: (`object`: *any*, `options`: *any*) => *any*

Given a Object3D instance, creates a corresponding CANNON shape.

**`param`** 

**`returns`** 

#### Type declaration:

▸ (`object`: *any*, `options`: *any*): *any*

Given a Object3D instance, creates a corresponding CANNON shape.

#### Parameters:

Name | Type |
:------ | :------ |
`object` | *any* |
`options` | *any* |

**Returns:** *any*

Defined in: [packages/engine/src/physics/classes/three-to-cannon.ts:25](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/physics/classes/three-to-cannon.ts#L25)

Name | Type |
:------ | :------ |
`Type` | *object* |
`Type.BOX` | *string* |
`Type.CYLINDER` | *string* |
`Type.HULL` | *string* |
`Type.MESH` | *string* |
`Type.SPHERE` | *string* |

Defined in: [packages/engine/src/physics/classes/three-to-cannon.ts:25](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/physics/classes/three-to-cannon.ts#L25)

## Functions

### getGeometry

▸ **getGeometry**(`object`: *any*): *any*

Returns a single geometry for the given object. If the object is compound,
its geometries are automatically merged.

#### Parameters:

Name | Type |
:------ | :------ |
`object` | *any* |

**Returns:** *any*

Defined in: [packages/engine/src/physics/classes/three-to-cannon.ts:297](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/physics/classes/three-to-cannon.ts#L297)
