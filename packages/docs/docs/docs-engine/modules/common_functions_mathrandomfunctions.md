---
id: "common_functions_mathrandomfunctions"
title: "Module: common/functions/MathRandomFunctions"
sidebar_label: "common/functions/MathRandomFunctions"
custom_edit_url: null
hide_title: true
---

# Module: common/functions/MathRandomFunctions

## Functions

### createPseudoRandom

▸ **createPseudoRandom**(`s`: *any*): Function

Create pseudo random number from seed

#### Parameters:

Name | Type | Description |
:------ | :------ | :------ |
`s` | *any* | Seed   |

**Returns:** Function

Function to generate pseudo random numbers.

Defined in: [packages/engine/src/common/functions/MathRandomFunctions.ts:15](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/common/functions/MathRandomFunctions.ts#L15)

___

### randomArray

▸ **randomArray**(`min`: *any*, `max`: *any*, `rndFn?`: () => *number*): *any*

Generate an array with random elements.

#### Parameters:

Name | Type | Description |
:------ | :------ | :------ |
`min` | *any* |  |
`max` | *any* |  |
`rndFn` | () => *number* | Random function to be used to generate random number.   |

**Returns:** *any*

Array with random elements.

Defined in: [packages/engine/src/common/functions/MathRandomFunctions.ts:73](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/common/functions/MathRandomFunctions.ts#L73)

___

### randomBoxOffset

▸ `Const`**randomBoxOffset**(`dx`: *any*, `dy`: *any*, `dz`: *any*, `rndFn?`: () => *number*): *object*

#### Parameters:

Name | Type |
:------ | :------ |
`dx` | *any* |
`dy` | *any* |
`dz` | *any* |
`rndFn` | () => *number* |

**Returns:** *object*

Name | Type |
:------ | :------ |
`x` | *number* |
`y` | *number* |
`z` | *number* |

Generate random box offset.

Defined in: [packages/engine/src/common/functions/MathRandomFunctions.ts:115](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/common/functions/MathRandomFunctions.ts#L115)

___

### randomCubeOffset

▸ `Const`**randomCubeOffset**(`d`: *any*, `rndFn`: *any*): *object*

#### Parameters:

Name | Type |
:------ | :------ |
`d` | *any* |
`rndFn` | *any* |

**Returns:** *object*

Name | Type |
:------ | :------ |
`x` | *number* |
`y` | *number* |
`z` | *number* |

Generate random cube offset.

Defined in: [packages/engine/src/common/functions/MathRandomFunctions.ts:139](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/common/functions/MathRandomFunctions.ts#L139)

___

### randomEllipsoidOffset

▸ `Const`**randomEllipsoidOffset**(`rx`: *any*, `ry`: *any*, `rz`: *any*, `rndFn?`: () => *number*): *object*

#### Parameters:

Name | Type |
:------ | :------ |
`rx` | *any* |
`ry` | *any* |
`rz` | *any* |
`rndFn` | () => *number* |

**Returns:** *object*

Name | Type |
:------ | :------ |
`x` | *number* |
`y` | *number* |
`z` | *number* |

Generate random ellipsoid offset.

Defined in: [packages/engine/src/common/functions/MathRandomFunctions.ts:126](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/common/functions/MathRandomFunctions.ts#L126)

___

### randomId

▸ **randomId**(): *string*

Generate random Id

**Returns:** *string*

Defined in: [packages/engine/src/common/functions/MathRandomFunctions.ts:4](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/common/functions/MathRandomFunctions.ts#L4)

___

### randomNumber

▸ **randomNumber**(`min`: *any*, `max`: *any*, `rndFn?`: () => *number*): *any*

Generate random number between 2 numbers

#### Parameters:

Name | Type | Description |
:------ | :------ | :------ |
`min` | *any* |  |
`max` | *any* |  |
`rndFn` | () => *number* | Random function to be used to generate random number.   |

**Returns:** *any*

Random number between min and max limit.

Defined in: [packages/engine/src/common/functions/MathRandomFunctions.ts:31](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/common/functions/MathRandomFunctions.ts#L31)

___

### randomObject

▸ **randomObject**(`min`: *any*, `max`: *any*, `rndFn?`: () => *number*): *any*

Generate an Object with keys filled with random number, object or array.
All keys of the min object will be added into generated object.

#### Parameters:

Name | Type | Description |
:------ | :------ | :------ |
`min` | *any* |  |
`max` | *any* |  |
`rndFn` | () => *number* | Random function to be used to generate random number.   |

**Returns:** *any*

Object with keys filled with random number.

Defined in: [packages/engine/src/common/functions/MathRandomFunctions.ts:46](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/common/functions/MathRandomFunctions.ts#L46)

___

### randomSphereOffset

▸ `Const`**randomSphereOffset**(`r`: *any*, `rndFn`: *any*): *object*

#### Parameters:

Name | Type |
:------ | :------ |
`r` | *any* |
`rndFn` | *any* |

**Returns:** *object*

Name | Type |
:------ | :------ |
`x` | *number* |
`y` | *number* |
`z` | *number* |

Generate random sphere offset.

Defined in: [packages/engine/src/common/functions/MathRandomFunctions.ts:137](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/common/functions/MathRandomFunctions.ts#L137)

___

### randomize

▸ **randomize**(`min`: *any*, `max`: *any*, `rndFn?`: () => *number*): *any*

Generate random number, object or array. Type of output will be same as type of min.

#### Parameters:

Name | Type | Description |
:------ | :------ | :------ |
`min` | *any* | min value. Type of min will decide what to return.   |
`max` | *any* |  |
`rndFn` | () => *number* | Random function to be used to generate random number.   |

**Returns:** *any*

Random number, object or array

Defined in: [packages/engine/src/common/functions/MathRandomFunctions.ts:101](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/common/functions/MathRandomFunctions.ts#L101)
