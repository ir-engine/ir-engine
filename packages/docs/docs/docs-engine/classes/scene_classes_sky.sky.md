---
id: "scene_classes_sky.sky"
title: "Class: Sky"
sidebar_label: "Sky"
custom_edit_url: null
hide_title: true
---

# Class: Sky

[scene/classes/Sky](../modules/scene_classes_sky.md).Sky

## Hierarchy

* *Object3D*

  ↳ **Sky**

## Constructors

### constructor

\+ **new Sky**(): [*Sky*](scene_classes_sky.sky.md)

**Returns:** [*Sky*](scene_classes_sky.sky.md)

Overrides: void

Defined in: [packages/engine/src/scene/classes/Sky.ts:194](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/scene/classes/Sky.ts#L194)

## Properties

### \_azimuth

• **\_azimuth**: *number*

Defined in: [packages/engine/src/scene/classes/Sky.ts:192](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/scene/classes/Sky.ts#L192)

___

### \_distance

• **\_distance**: *number*

Defined in: [packages/engine/src/scene/classes/Sky.ts:193](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/scene/classes/Sky.ts#L193)

___

### \_inclination

• **\_inclination**: *number*

Defined in: [packages/engine/src/scene/classes/Sky.ts:191](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/scene/classes/Sky.ts#L191)

___

### cubeCamera

• **cubeCamera**: *any*

Defined in: [packages/engine/src/scene/classes/Sky.ts:189](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/scene/classes/Sky.ts#L189)

___

### sky

• **sky**: *any*

Defined in: [packages/engine/src/scene/classes/Sky.ts:190](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/scene/classes/Sky.ts#L190)

___

### skyScene

• **skyScene**: *any*

Defined in: [packages/engine/src/scene/classes/Sky.ts:188](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/scene/classes/Sky.ts#L188)

___

### geometry

▪ `Static` **geometry**: *any*

Defined in: [packages/engine/src/scene/classes/Sky.ts:187](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/scene/classes/Sky.ts#L187)

___

### material

▪ `Static` **material**: *any*

Defined in: [packages/engine/src/scene/classes/Sky.ts:194](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/scene/classes/Sky.ts#L194)

___

### shader

▪ `Static` **shader**: *object*

#### Type declaration:

Name | Type |
:------ | :------ |
`fragmentShader` | *string* |
`uniforms` | *any* |
`vertexShader` | *string* |

Defined in: [packages/engine/src/scene/classes/Sky.ts:172](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/scene/classes/Sky.ts#L172)

## Accessors

### azimuth

• get **azimuth**(): *number*

**Returns:** *number*

Defined in: [packages/engine/src/scene/classes/Sky.ts:252](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/scene/classes/Sky.ts#L252)

• set **azimuth**(`value`: *number*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`value` | *number* |

**Returns:** *void*

Defined in: [packages/engine/src/scene/classes/Sky.ts:255](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/scene/classes/Sky.ts#L255)

___

### distance

• get **distance**(): *number*

**Returns:** *number*

Defined in: [packages/engine/src/scene/classes/Sky.ts:259](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/scene/classes/Sky.ts#L259)

• set **distance**(`value`: *number*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`value` | *number* |

**Returns:** *void*

Defined in: [packages/engine/src/scene/classes/Sky.ts:262](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/scene/classes/Sky.ts#L262)

___

### inclination

• get **inclination**(): *number*

**Returns:** *number*

Defined in: [packages/engine/src/scene/classes/Sky.ts:245](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/scene/classes/Sky.ts#L245)

• set **inclination**(`value`: *number*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`value` | *number* |

**Returns:** *void*

Defined in: [packages/engine/src/scene/classes/Sky.ts:248](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/scene/classes/Sky.ts#L248)

___

### luminance

• get **luminance**(): *any*

**Returns:** *any*

Defined in: [packages/engine/src/scene/classes/Sky.ts:227](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/scene/classes/Sky.ts#L227)

• set **luminance**(`value`: *any*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`value` | *any* |

**Returns:** *void*

Defined in: [packages/engine/src/scene/classes/Sky.ts:230](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/scene/classes/Sky.ts#L230)

___

### mieCoefficient

• get **mieCoefficient**(): *any*

**Returns:** *any*

Defined in: [packages/engine/src/scene/classes/Sky.ts:233](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/scene/classes/Sky.ts#L233)

• set **mieCoefficient**(`value`: *any*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`value` | *any* |

**Returns:** *void*

Defined in: [packages/engine/src/scene/classes/Sky.ts:236](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/scene/classes/Sky.ts#L236)

___

### mieDirectionalG

• get **mieDirectionalG**(): *any*

**Returns:** *any*

Defined in: [packages/engine/src/scene/classes/Sky.ts:239](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/scene/classes/Sky.ts#L239)

• set **mieDirectionalG**(`value`: *any*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`value` | *any* |

**Returns:** *void*

Defined in: [packages/engine/src/scene/classes/Sky.ts:242](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/scene/classes/Sky.ts#L242)

___

### rayleigh

• get **rayleigh**(): *any*

**Returns:** *any*

Defined in: [packages/engine/src/scene/classes/Sky.ts:221](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/scene/classes/Sky.ts#L221)

• set **rayleigh**(`value`: *any*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`value` | *any* |

**Returns:** *void*

Defined in: [packages/engine/src/scene/classes/Sky.ts:224](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/scene/classes/Sky.ts#L224)

___

### turbidity

• get **turbidity**(): *any*

**Returns:** *any*

Defined in: [packages/engine/src/scene/classes/Sky.ts:215](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/scene/classes/Sky.ts#L215)

• set **turbidity**(`value`: *any*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`value` | *any* |

**Returns:** *void*

Defined in: [packages/engine/src/scene/classes/Sky.ts:218](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/scene/classes/Sky.ts#L218)

## Methods

### copy

▸ **copy**(`source`: *any*, `recursive?`: *boolean*): [*Sky*](scene_classes_sky.sky.md)

#### Parameters:

Name | Type | Default value |
:------ | :------ | :------ |
`source` | *any* | - |
`recursive` | *boolean* | true |

**Returns:** [*Sky*](scene_classes_sky.sky.md)

Defined in: [packages/engine/src/scene/classes/Sky.ts:295](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/scene/classes/Sky.ts#L295)

___

### generateEnvironmentMap

▸ **generateEnvironmentMap**(`renderer`: *any*): *any*

#### Parameters:

Name | Type |
:------ | :------ |
`renderer` | *any* |

**Returns:** *any*

Defined in: [packages/engine/src/scene/classes/Sky.ts:276](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/scene/classes/Sky.ts#L276)

___

### updateSunPosition

▸ **updateSunPosition**(): *void*

**Returns:** *void*

Defined in: [packages/engine/src/scene/classes/Sky.ts:266](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/scene/classes/Sky.ts#L266)
