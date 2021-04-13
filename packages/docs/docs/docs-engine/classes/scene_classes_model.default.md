---
id: "scene_classes_model.default"
title: "Class: default"
sidebar_label: "default"
custom_edit_url: null
hide_title: true
---

# Class: default

[scene/classes/Model](../modules/scene_classes_model.md).default

## Hierarchy

* *Object3D*

  ↳ **default**

## Constructors

### constructor

\+ **new default**(): [*default*](scene_classes_model.default.md)

**Returns:** [*default*](scene_classes_model.default.md)

Overrides: void

Defined in: [packages/engine/src/scene/classes/Model.ts:11](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/scene/classes/Model.ts#L11)

## Properties

### \_castShadow

• **\_castShadow**: *boolean*

Defined in: [packages/engine/src/scene/classes/Model.ts:7](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/scene/classes/Model.ts#L7)

___

### \_receiveShadow

• **\_receiveShadow**: *boolean*

Defined in: [packages/engine/src/scene/classes/Model.ts:8](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/scene/classes/Model.ts#L8)

___

### \_src

• **\_src**: *any*

Defined in: [packages/engine/src/scene/classes/Model.ts:6](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/scene/classes/Model.ts#L6)

___

### activeClipAction

• **activeClipAction**: *any*

Defined in: [packages/engine/src/scene/classes/Model.ts:11](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/scene/classes/Model.ts#L11)

___

### activeClipIndex

• **activeClipIndex**: *number*

Defined in: [packages/engine/src/scene/classes/Model.ts:9](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/scene/classes/Model.ts#L9)

___

### animationMixer

• **animationMixer**: *any*

Defined in: [packages/engine/src/scene/classes/Model.ts:10](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/scene/classes/Model.ts#L10)

___

### model

• **model**: *any*

Defined in: [packages/engine/src/scene/classes/Model.ts:5](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/scene/classes/Model.ts#L5)

## Accessors

### activeClip

• get **activeClip**(): *any*

**Returns:** *any*

Defined in: [packages/engine/src/scene/classes/Model.ts:65](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/scene/classes/Model.ts#L65)

___

### castShadow

• get **castShadow**(): *boolean*

**`ts-ignore`** 

**Returns:** *boolean*

Defined in: [packages/engine/src/scene/classes/Model.ts:105](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/scene/classes/Model.ts#L105)

• set **castShadow**(`value`: *boolean*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`value` | *boolean* |

**Returns:** *void*

Defined in: [packages/engine/src/scene/classes/Model.ts:108](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/scene/classes/Model.ts#L108)

___

### receiveShadow

• get **receiveShadow**(): *boolean*

**`ts-ignore`** 

**Returns:** *boolean*

Defined in: [packages/engine/src/scene/classes/Model.ts:127](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/scene/classes/Model.ts#L127)

• set **receiveShadow**(`value`: *boolean*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`value` | *boolean* |

**Returns:** *void*

Defined in: [packages/engine/src/scene/classes/Model.ts:130](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/scene/classes/Model.ts#L130)

___

### src

• get **src**(): *any*

**Returns:** *any*

Defined in: [packages/engine/src/scene/classes/Model.ts:24](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/scene/classes/Model.ts#L24)

• set **src**(`value`: *any*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`value` | *any* |

**Returns:** *void*

Defined in: [packages/engine/src/scene/classes/Model.ts:27](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/scene/classes/Model.ts#L27)

## Methods

### copy

▸ **copy**(`source`: *any*, `recursive?`: *boolean*): [*default*](scene_classes_model.default.md)

#### Parameters:

Name | Type | Default value |
:------ | :------ | :------ |
`source` | *any* | - |
`recursive` | *boolean* | true |

**Returns:** [*default*](scene_classes_model.default.md)

Defined in: [packages/engine/src/scene/classes/Model.ts:167](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/scene/classes/Model.ts#L167)

___

### getClipOptions

▸ **getClipOptions**(): *any*

**Returns:** *any*

Defined in: [packages/engine/src/scene/classes/Model.ts:54](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/scene/classes/Model.ts#L54)

___

### load

▸ **load**(`src`: *any*, ...`args`: *any*[]): *Promise*<[*default*](scene_classes_model.default.md)\>

#### Parameters:

Name | Type |
:------ | :------ |
`src` | *any* |
`...args` | *any*[] |

**Returns:** *Promise*<[*default*](scene_classes_model.default.md)\>

Defined in: [packages/engine/src/scene/classes/Model.ts:37](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/scene/classes/Model.ts#L37)

___

### loadGLTF

▸ **loadGLTF**(`src`: *any*): *Promise*<any\>

#### Parameters:

Name | Type |
:------ | :------ |
`src` | *any* |

**Returns:** *Promise*<any\>

Defined in: [packages/engine/src/scene/classes/Model.ts:30](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/scene/classes/Model.ts#L30)

___

### playAnimation

▸ **playAnimation**(): *void*

**Returns:** *void*

Defined in: [packages/engine/src/scene/classes/Model.ts:89](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/scene/classes/Model.ts#L89)

___

### setShadowsEnabled

▸ **setShadowsEnabled**(`enabled`: *any*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`enabled` | *any* |

**Returns:** *void*

Defined in: [packages/engine/src/scene/classes/Model.ts:148](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/scene/classes/Model.ts#L148)

___

### stopAnimation

▸ **stopAnimation**(): *void*

**Returns:** *void*

Defined in: [packages/engine/src/scene/classes/Model.ts:92](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/scene/classes/Model.ts#L92)

___

### update

▸ **update**(`dt`: *any*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`dt` | *any* |

**Returns:** *void*

Defined in: [packages/engine/src/scene/classes/Model.ts:98](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/scene/classes/Model.ts#L98)

___

### updateAnimationState

▸ **updateAnimationState**(): *void*

**Returns:** *void*

Defined in: [packages/engine/src/scene/classes/Model.ts:73](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/scene/classes/Model.ts#L73)
