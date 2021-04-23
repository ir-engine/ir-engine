---
id: "editor_classes_meshcombinationgroup.default"
title: "Class: default"
sidebar_label: "default"
custom_edit_url: null
hide_title: true
---

# Class: default

[editor/classes/MeshCombinationGroup](../modules/editor_classes_meshcombinationgroup.md).default

## Constructors

### constructor

\+ **new default**(`initialObject`: *any*, `imageHashes`: *any*): [*default*](editor_classes_meshcombinationgroup.default.md)

#### Parameters:

Name | Type |
:------ | :------ |
`initialObject` | *any* |
`imageHashes` | *any* |

**Returns:** [*default*](editor_classes_meshcombinationgroup.default.md)

Defined in: [packages/engine/src/editor/classes/MeshCombinationGroup.ts:158](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/classes/MeshCombinationGroup.ts#L158)

## Properties

### imageHashes

• **imageHashes**: *any*

Defined in: [packages/engine/src/editor/classes/MeshCombinationGroup.ts:109](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/classes/MeshCombinationGroup.ts#L109)

___

### initialObject

• **initialObject**: *any*

Defined in: [packages/engine/src/editor/classes/MeshCombinationGroup.ts:107](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/classes/MeshCombinationGroup.ts#L107)

___

### meshes

• **meshes**: *any*[]

Defined in: [packages/engine/src/editor/classes/MeshCombinationGroup.ts:108](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/classes/MeshCombinationGroup.ts#L108)

___

### MaterialComparators

▪ `Static` **MaterialComparators**: *object*

#### Type declaration:

Name | Type |
:------ | :------ |
`MeshBasicMaterial` | (`group`: *any*, `a`: *any*, `b`: *any*) => *Promise*<boolean\> |
`MeshStandardMaterial` | (`group`: *any*, `a`: *any*, `b`: *any*) => *Promise*<boolean\> |

Defined in: [packages/engine/src/editor/classes/MeshCombinationGroup.ts:103](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/classes/MeshCombinationGroup.ts#L103)

## Methods

### \_combine

▸ **_combine**(): *any*

**Returns:** *any*

Defined in: [packages/engine/src/editor/classes/MeshCombinationGroup.ts:203](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/classes/MeshCombinationGroup.ts#L203)

___

### \_tryAdd

▸ **_tryAdd**(`object`: *any*): *Promise*<boolean\>

#### Parameters:

Name | Type |
:------ | :------ |
`object` | *any* |

**Returns:** *Promise*<boolean\>

Defined in: [packages/engine/src/editor/classes/MeshCombinationGroup.ts:170](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/classes/MeshCombinationGroup.ts#L170)

___

### combineMeshes

▸ `Static`**combineMeshes**(`rootObject`: *any*): *Promise*<any\>

#### Parameters:

Name | Type |
:------ | :------ |
`rootObject` | *any* |

**Returns:** *Promise*<any\>

Defined in: [packages/engine/src/editor/classes/MeshCombinationGroup.ts:111](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/classes/MeshCombinationGroup.ts#L111)
