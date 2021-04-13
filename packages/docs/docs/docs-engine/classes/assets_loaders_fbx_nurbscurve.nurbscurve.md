---
id: "assets_loaders_fbx_nurbscurve.nurbscurve"
title: "Class: NURBSCurve"
sidebar_label: "NURBSCurve"
custom_edit_url: null
hide_title: true
---

# Class: NURBSCurve

[assets/loaders/fbx/NURBSCurve](../modules/assets_loaders_fbx_nurbscurve.md).NURBSCurve

NURBS curve object

Derives from Curve, overriding getPoint and getTangent.

Implementation is based on (x, y [, z=0 [, w=1]]) control points with w=weight.

## Hierarchy

* *Curve*<Vector3\>

  ↳ **NURBSCurve**

## Constructors

### constructor

\+ **new NURBSCurve**(`degree`: *number*, `knots`: *number*[], `controlPoints`: *any*[], `startKnot`: *number*, `endKnot`: *number*): [*NURBSCurve*](assets_loaders_fbx_nurbscurve.nurbscurve.md)

#### Parameters:

Name | Type |
:------ | :------ |
`degree` | *number* |
`knots` | *number*[] |
`controlPoints` | *any*[] |
`startKnot` | *number* |
`endKnot` | *number* |

**Returns:** [*NURBSCurve*](assets_loaders_fbx_nurbscurve.nurbscurve.md)

Overrides: void

Defined in: [packages/engine/src/assets/loaders/fbx/NURBSCurve.ts:23](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/assets/loaders/fbx/NURBSCurve.ts#L23)

## Properties

### controlPoints

• **controlPoints**: *any*[]

Defined in: [packages/engine/src/assets/loaders/fbx/NURBSCurve.ts:21](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/assets/loaders/fbx/NURBSCurve.ts#L21)

___

### degree

• **degree**: *number*

Defined in: [packages/engine/src/assets/loaders/fbx/NURBSCurve.ts:19](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/assets/loaders/fbx/NURBSCurve.ts#L19)

___

### endKnot

• **endKnot**: *number*

Defined in: [packages/engine/src/assets/loaders/fbx/NURBSCurve.ts:23](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/assets/loaders/fbx/NURBSCurve.ts#L23)

___

### knots

• **knots**: *number*[]

Defined in: [packages/engine/src/assets/loaders/fbx/NURBSCurve.ts:20](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/assets/loaders/fbx/NURBSCurve.ts#L20)

___

### startKnot

• **startKnot**: *number*

Defined in: [packages/engine/src/assets/loaders/fbx/NURBSCurve.ts:22](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/assets/loaders/fbx/NURBSCurve.ts#L22)

## Methods

### getPoint

▸ **getPoint**(`t`: *any*, `optionalTarget?`: *any*): *any*

#### Parameters:

Name | Type |
:------ | :------ |
`t` | *any* |
`optionalTarget?` | *any* |

**Returns:** *any*

Defined in: [packages/engine/src/assets/loaders/fbx/NURBSCurve.ts:42](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/assets/loaders/fbx/NURBSCurve.ts#L42)

___

### getTangent

▸ **getTangent**(`t`: *any*, `optionalTarget?`: *any*): *any*

#### Parameters:

Name | Type |
:------ | :------ |
`t` | *any* |
`optionalTarget?` | *any* |

**Returns:** *any*

Defined in: [packages/engine/src/assets/loaders/fbx/NURBSCurve.ts:62](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/assets/loaders/fbx/NURBSCurve.ts#L62)
