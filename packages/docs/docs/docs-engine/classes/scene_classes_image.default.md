---
id: "scene_classes_image.default"
title: "Class: default"
sidebar_label: "default"
custom_edit_url: null
hide_title: true
---

# Class: default

[scene/classes/Image](../modules/scene_classes_image.md).default

## Hierarchy

* *Object3D*

  ↳ **default**

## Constructors

### constructor

\+ **new default**(): [*default*](scene_classes_image.default.md)

**Returns:** [*default*](scene_classes_image.default.md)

Overrides: void

Defined in: [packages/engine/src/scene/classes/Image.ts:28](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/scene/classes/Image.ts#L28)

## Properties

### \_alphaCutoff

• **\_alphaCutoff**: *number*

Defined in: [packages/engine/src/scene/classes/Image.ts:26](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/scene/classes/Image.ts#L26)

___

### \_alphaMode

• **\_alphaMode**: *string*

Defined in: [packages/engine/src/scene/classes/Image.ts:25](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/scene/classes/Image.ts#L25)

___

### \_mesh

• **\_mesh**: *any*

Defined in: [packages/engine/src/scene/classes/Image.ts:27](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/scene/classes/Image.ts#L27)

___

### \_projection

• **\_projection**: *string*

Defined in: [packages/engine/src/scene/classes/Image.ts:24](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/scene/classes/Image.ts#L24)

___

### \_src

• **\_src**: *any*

Defined in: [packages/engine/src/scene/classes/Image.ts:23](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/scene/classes/Image.ts#L23)

___

### \_texture

• **\_texture**: *any*

Defined in: [packages/engine/src/scene/classes/Image.ts:28](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/scene/classes/Image.ts#L28)

## Accessors

### alphaCutoff

• get **alphaCutoff**(): *number*

**Returns:** *number*

Defined in: [packages/engine/src/scene/classes/Image.ts:65](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/scene/classes/Image.ts#L65)

• set **alphaCutoff**(`v`: *number*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`v` | *number* |

**Returns:** *void*

Defined in: [packages/engine/src/scene/classes/Image.ts:68](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/scene/classes/Image.ts#L68)

___

### alphaMode

• get **alphaMode**(): *string*

**Returns:** *string*

Defined in: [packages/engine/src/scene/classes/Image.ts:55](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/scene/classes/Image.ts#L55)

• set **alphaMode**(`v`: *string*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`v` | *string* |

**Returns:** *void*

Defined in: [packages/engine/src/scene/classes/Image.ts:58](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/scene/classes/Image.ts#L58)

___

### projection

• get **projection**(): *string*

**Returns:** *string*

Defined in: [packages/engine/src/scene/classes/Image.ts:73](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/scene/classes/Image.ts#L73)

• set **projection**(`projection`: *string*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`projection` | *string* |

**Returns:** *void*

Defined in: [packages/engine/src/scene/classes/Image.ts:76](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/scene/classes/Image.ts#L76)

___

### src

• get **src**(): *any*

**Returns:** *any*

Defined in: [packages/engine/src/scene/classes/Image.ts:46](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/scene/classes/Image.ts#L46)

• set **src**(`src`: *any*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`src` | *any* |

**Returns:** *void*

Defined in: [packages/engine/src/scene/classes/Image.ts:49](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/scene/classes/Image.ts#L49)

## Methods

### copy

▸ **copy**(`source`: *any*, `recursive?`: *boolean*): [*default*](scene_classes_image.default.md)

#### Parameters:

Name | Type | Default value |
:------ | :------ | :------ |
`source` | *any* | - |
`recursive` | *boolean* | true |

**Returns:** [*default*](scene_classes_image.default.md)

Defined in: [packages/engine/src/scene/classes/Image.ts:136](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/scene/classes/Image.ts#L136)

___

### load

▸ **load**(`src`: *any*): *Promise*<[*default*](scene_classes_image.default.md)\>

#### Parameters:

Name | Type |
:------ | :------ |
`src` | *any* |

**Returns:** *Promise*<[*default*](scene_classes_image.default.md)\>

Defined in: [packages/engine/src/scene/classes/Image.ts:105](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/scene/classes/Image.ts#L105)

___

### loadTexture

▸ **loadTexture**(`src`: *any*): *Promise*<unknown\>

#### Parameters:

Name | Type |
:------ | :------ |
`src` | *any* |

**Returns:** *Promise*<unknown\>

Defined in: [packages/engine/src/scene/classes/Image.ts:52](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/scene/classes/Image.ts#L52)

___

### onResize

▸ **onResize**(): *void*

**Returns:** *void*

Defined in: [packages/engine/src/scene/classes/Image.ts:126](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/scene/classes/Image.ts#L126)
