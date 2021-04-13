---
id: "xr_functions_avatarfunctions"
title: "Module: xr/functions/AvatarFunctions"
sidebar_label: "xr/functions/AvatarFunctions"
custom_edit_url: null
hide_title: true
---

# Module: xr/functions/AvatarFunctions

## Table of contents

### Classes

- [AnimationMapping](../classes/xr_functions_avatarfunctions.animationmapping.md)

## Variables

### cubeGeometry

• `Const` **cubeGeometry**: *any*

Defined in: [packages/engine/src/xr/functions/AvatarFunctions.ts:55](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/xr/functions/AvatarFunctions.ts#L55)

___

### cubeGeometryPositions

• `Const` **cubeGeometryPositions**: *any*

Defined in: [packages/engine/src/xr/functions/AvatarFunctions.ts:59](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/xr/functions/AvatarFunctions.ts#L59)

___

### defaultSitAnimation

• `Const` **defaultSitAnimation**: *chair*= 'chair'

Defined in: [packages/engine/src/xr/functions/AvatarFunctions.ts:13](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/xr/functions/AvatarFunctions.ts#L13)

___

### defaultUseAnimation

• `Const` **defaultUseAnimation**: *combo*= 'combo'

Defined in: [packages/engine/src/xr/functions/AvatarFunctions.ts:14](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/xr/functions/AvatarFunctions.ts#L14)

___

### leftRotation

• `Const` **leftRotation**: *any*

Defined in: [packages/engine/src/xr/functions/AvatarFunctions.ts:11](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/xr/functions/AvatarFunctions.ts#L11)

___

### localEuler

• `Const` **localEuler**: *any*

Defined in: [packages/engine/src/xr/functions/AvatarFunctions.ts:7](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/xr/functions/AvatarFunctions.ts#L7)

___

### localMatrix

• `Const` **localMatrix**: *any*

Defined in: [packages/engine/src/xr/functions/AvatarFunctions.ts:8](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/xr/functions/AvatarFunctions.ts#L8)

___

### localQuaternion

• `Const` **localQuaternion**: *any*

Defined in: [packages/engine/src/xr/functions/AvatarFunctions.ts:6](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/xr/functions/AvatarFunctions.ts#L6)

___

### localVector

• `Const` **localVector**: *any*

Defined in: [packages/engine/src/xr/functions/AvatarFunctions.ts:4](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/xr/functions/AvatarFunctions.ts#L4)

___

### localVector2

• `Const` **localVector2**: *any*

Defined in: [packages/engine/src/xr/functions/AvatarFunctions.ts:5](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/xr/functions/AvatarFunctions.ts#L5)

___

### numCubeGeometryPositions

• `Const` **numCubeGeometryPositions**: *any*

Defined in: [packages/engine/src/xr/functions/AvatarFunctions.ts:60](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/xr/functions/AvatarFunctions.ts#L60)

___

### rightRotation

• `Const` **rightRotation**: *any*

Defined in: [packages/engine/src/xr/functions/AvatarFunctions.ts:12](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/xr/functions/AvatarFunctions.ts#L12)

___

### srcCubeGeometries

• `Const` **srcCubeGeometries**: *object*

#### Type declaration:

Defined in: [packages/engine/src/xr/functions/AvatarFunctions.ts:61](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/xr/functions/AvatarFunctions.ts#L61)

___

### upRotation

• `Const` **upRotation**: *any*

Defined in: [packages/engine/src/xr/functions/AvatarFunctions.ts:10](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/xr/functions/AvatarFunctions.ts#L10)

___

### useAnimationRate

• `Const` **useAnimationRate**: *750*= 750

Defined in: [packages/engine/src/xr/functions/AvatarFunctions.ts:15](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/xr/functions/AvatarFunctions.ts#L15)

## Functions

### copySkeleton

▸ `Const`**copySkeleton**(`src`: *any*, `dst`: *any*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`src` | *any* |
`dst` | *any* |

**Returns:** *void*

Defined in: [packages/engine/src/xr/functions/AvatarFunctions.ts:42](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/xr/functions/AvatarFunctions.ts#L42)

___

### countCharacters

▸ `Const`**countCharacters**(`name`: *any*, `regex`: *any*): *number*

#### Parameters:

Name | Type |
:------ | :------ |
`name` | *any* |
`regex` | *any* |

**Returns:** *number*

Defined in: [packages/engine/src/xr/functions/AvatarFunctions.ts:234](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/xr/functions/AvatarFunctions.ts#L234)

___

### distanceToParentBone

▸ `Const`**distanceToParentBone**(`bone`: *any*, `parentBone`: *any*): *number*

#### Parameters:

Name | Type |
:------ | :------ |
`bone` | *any* |
`parentBone` | *any* |

**Returns:** *number*

Defined in: [packages/engine/src/xr/functions/AvatarFunctions.ts:196](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/xr/functions/AvatarFunctions.ts#L196)

___

### exportBone

▸ `Const`**exportBone**(`bone`: *any*): *any*[]

#### Parameters:

Name | Type |
:------ | :------ |
`bone` | *any* |

**Returns:** *any*[]

Defined in: [packages/engine/src/xr/functions/AvatarFunctions.ts:391](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/xr/functions/AvatarFunctions.ts#L391)

___

### exportSkeleton

▸ `Const`**exportSkeleton**(`skeleton`: *any*): *string*

#### Parameters:

Name | Type |
:------ | :------ |
`skeleton` | *any* |

**Returns:** *string*

Defined in: [packages/engine/src/xr/functions/AvatarFunctions.ts:394](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/xr/functions/AvatarFunctions.ts#L394)

___

### findArmature

▸ `Const`**findArmature**(`bone`: *any*): *any*

#### Parameters:

Name | Type |
:------ | :------ |
`bone` | *any* |

**Returns:** *any*

Defined in: [packages/engine/src/xr/functions/AvatarFunctions.ts:382](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/xr/functions/AvatarFunctions.ts#L382)

___

### findBoneDeep

▸ `Const`**findBoneDeep**(`bones`: *any*, `boneName`: *any*): *any*

#### Parameters:

Name | Type |
:------ | :------ |
`bones` | *any* |
`boneName` | *any* |

**Returns:** *any*

Defined in: [packages/engine/src/xr/functions/AvatarFunctions.ts:28](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/xr/functions/AvatarFunctions.ts#L28)

___

### findClosestChildBone

▸ `Const`**findClosestChildBone**(`bone`: *any*, `pred`: *any*): *any*

#### Parameters:

Name | Type |
:------ | :------ |
`bone` | *any* |
`pred` | *any* |

**Returns:** *any*

Defined in: [packages/engine/src/xr/functions/AvatarFunctions.ts:204](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/xr/functions/AvatarFunctions.ts#L204)

___

### findClosestParentBone

▸ `Const`**findClosestParentBone**(`bone`: *any*, `pred`: *any*): *any*

#### Parameters:

Name | Type |
:------ | :------ |
`bone` | *any* |
`pred` | *any* |

**Returns:** *any*

Defined in: [packages/engine/src/xr/functions/AvatarFunctions.ts:179](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/xr/functions/AvatarFunctions.ts#L179)

___

### findEye

▸ `Const`**findEye**(`tailBones`: *any*, `left`: *any*): *any*

#### Parameters:

Name | Type |
:------ | :------ |
`tailBones` | *any* |
`left` | *any* |

**Returns:** *any*

Defined in: [packages/engine/src/xr/functions/AvatarFunctions.ts:260](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/xr/functions/AvatarFunctions.ts#L260)

___

### findFinger

▸ `Const`**findFinger**(`handBone`: *any*, `r`: *any*): *any*

#### Parameters:

Name | Type |
:------ | :------ |
`handBone` | *any* |
`r` | *any* |

**Returns:** *any*

Defined in: [packages/engine/src/xr/functions/AvatarFunctions.ts:336](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/xr/functions/AvatarFunctions.ts#L336)

___

### findFoot

▸ `Const`**findFoot**(`tailBones`: *any*, `left`: *any*): *any*

#### Parameters:

Name | Type |
:------ | :------ |
`tailBones` | *any* |
`left` | *any* |

**Returns:** *any*

Defined in: [packages/engine/src/xr/functions/AvatarFunctions.ts:337](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/xr/functions/AvatarFunctions.ts#L337)

___

### findFurthestParentBone

▸ `Const`**findFurthestParentBone**(`bone`: *any*, `pred`: *any*): *any*

#### Parameters:

Name | Type |
:------ | :------ |
`bone` | *any* |
`pred` | *any* |

**Returns:** *any*

Defined in: [packages/engine/src/xr/functions/AvatarFunctions.ts:187](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/xr/functions/AvatarFunctions.ts#L187)

___

### findHand

▸ `Const`**findHand**(`shoulderBone`: *any*): *any*

#### Parameters:

Name | Type |
:------ | :------ |
`shoulderBone` | *any* |

**Returns:** *any*

Defined in: [packages/engine/src/xr/functions/AvatarFunctions.ts:335](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/xr/functions/AvatarFunctions.ts#L335)

___

### findHead

▸ `Const`**findHead**(`tailBones`: *any*): *any*

#### Parameters:

Name | Type |
:------ | :------ |
`tailBones` | *any* |

**Returns:** *any*

Defined in: [packages/engine/src/xr/functions/AvatarFunctions.ts:244](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/xr/functions/AvatarFunctions.ts#L244)

___

### findHips

▸ `Const`**findHips**(`skeleton`: *any*): *any*

#### Parameters:

Name | Type |
:------ | :------ |
`skeleton` | *any* |

**Returns:** *any*

Defined in: [packages/engine/src/xr/functions/AvatarFunctions.ts:243](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/xr/functions/AvatarFunctions.ts#L243)

___

### findShoulder

▸ `Const`**findShoulder**(`tailBones`: *any*, `left`: *any*): *any*

#### Parameters:

Name | Type |
:------ | :------ |
`tailBones` | *any* |
`left` | *any* |

**Returns:** *any*

Defined in: [packages/engine/src/xr/functions/AvatarFunctions.ts:295](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/xr/functions/AvatarFunctions.ts#L295)

___

### findSpine

▸ `Const`**findSpine**(`chest`: *any*, `hips`: *any*): *any*

#### Parameters:

Name | Type |
:------ | :------ |
`chest` | *any* |
`hips` | *any* |

**Returns:** *any*

Defined in: [packages/engine/src/xr/functions/AvatarFunctions.ts:287](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/xr/functions/AvatarFunctions.ts#L287)

___

### getTailBones

▸ `Const`**getTailBones**(`skeleton`: *any*): *any*[]

#### Parameters:

Name | Type |
:------ | :------ |
`skeleton` | *any* |

**Returns:** *any*[]

Defined in: [packages/engine/src/xr/functions/AvatarFunctions.ts:162](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/xr/functions/AvatarFunctions.ts#L162)

___

### importArmature

▸ `Const`**importArmature**(`b`: *any*): *any*

#### Parameters:

Name | Type |
:------ | :------ |
`b` | *any* |

**Returns:** *any*

Defined in: [packages/engine/src/xr/functions/AvatarFunctions.ts:411](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/xr/functions/AvatarFunctions.ts#L411)

___

### importObject

▸ `Const`**importObject**(`b`: *any*, `Cons`: *any*, `ChildCons`: *any*): *any*

#### Parameters:

Name | Type |
:------ | :------ |
`b` | *any* |
`Cons` | *any* |
`ChildCons` | *any* |

**Returns:** *any*

Defined in: [packages/engine/src/xr/functions/AvatarFunctions.ts:399](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/xr/functions/AvatarFunctions.ts#L399)

___

### importSkeleton

▸ `Const`**importSkeleton**(`s`: *any*): *any*

#### Parameters:

Name | Type |
:------ | :------ |
`s` | *any* |

**Returns:** *any*

Defined in: [packages/engine/src/xr/functions/AvatarFunctions.ts:412](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/xr/functions/AvatarFunctions.ts#L412)

___

### localizeMatrixWorld

▸ `Const`**localizeMatrixWorld**(`bone`: *any*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`bone` | *any* |

**Returns:** *void*

Defined in: [packages/engine/src/xr/functions/AvatarFunctions.ts:17](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/xr/functions/AvatarFunctions.ts#L17)

___

### makeDebugMeshes

▸ `Const`**makeDebugMeshes**(): *any*

**Returns:** *any*

Defined in: [packages/engine/src/xr/functions/AvatarFunctions.ts:62](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/xr/functions/AvatarFunctions.ts#L62)

___

### traverseChild

▸ `Const`**traverseChild**(`bone`: *any*, `distance`: *any*): *any*

#### Parameters:

Name | Type |
:------ | :------ |
`bone` | *any* |
`distance` | *any* |

**Returns:** *any*

Defined in: [packages/engine/src/xr/functions/AvatarFunctions.ts:220](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/xr/functions/AvatarFunctions.ts#L220)
