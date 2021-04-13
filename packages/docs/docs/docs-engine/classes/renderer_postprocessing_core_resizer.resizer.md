---
id: "renderer_postprocessing_core_resizer.resizer"
title: "Class: Resizer"
sidebar_label: "Resizer"
custom_edit_url: null
hide_title: true
---

# Class: Resizer

[renderer/postprocessing/core/Resizer](../modules/renderer_postprocessing_core_resizer.md).Resizer

A resizer that can be used to store a base and a target resolution.

The attached resizeable will be updated with the base resolution when the
target resolution changes. The new calculated resolution can then be
retrieved via [Resizer.width](renderer_postprocessing_core_resizer.resizer.md#width) and [Resizer.height](renderer_postprocessing_core_resizer.resizer.md#height).

## Constructors

### constructor

\+ **new Resizer**(`resizable`: *any*, `width?`: *number*, `height?`: *number*, `scale?`: *number*): [*Resizer*](renderer_postprocessing_core_resizer.resizer.md)

Constructs a new resizer.

#### Parameters:

Name | Type | Default value |
:------ | :------ | :------ |
`resizable` | *any* | - |
`width` | *number* | - |
`height` | *number* | - |
`scale` | *number* | 1.0 |

**Returns:** [*Resizer*](renderer_postprocessing_core_resizer.resizer.md)

Defined in: [packages/engine/src/renderer/postprocessing/core/Resizer.ts:24](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/core/Resizer.ts#L24)

## Properties

### base

• **base**: *any*

Defined in: [packages/engine/src/renderer/postprocessing/core/Resizer.ts:22](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/core/Resizer.ts#L22)

___

### resizable

• **resizable**: *any*

Defined in: [packages/engine/src/renderer/postprocessing/core/Resizer.ts:21](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/core/Resizer.ts#L21)

___

### s

• **s**: *number*

Defined in: [packages/engine/src/renderer/postprocessing/core/Resizer.ts:24](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/core/Resizer.ts#L24)

___

### target

• **target**: *any*

Defined in: [packages/engine/src/renderer/postprocessing/core/Resizer.ts:23](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/core/Resizer.ts#L23)

## Accessors

### height

• get **height**(): *any*

The calculated height.

If both the width and the height are set to [Resizer.AUTO_SIZE](renderer_postprocessing_core_resizer.resizer.md#auto_size), the
base height will be returned.

**Returns:** *any*

Defined in: [packages/engine/src/renderer/postprocessing/core/Resizer.ts:152](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/core/Resizer.ts#L152)

• set **height**(`value`: *any*): *void*

Sets the target height.

Use [Resizer.AUTO_SIZE](renderer_postprocessing_core_resizer.resizer.md#auto_size) to automatically calculate the height based
on the width and the original aspect ratio.

#### Parameters:

Name | Type |
:------ | :------ |
`value` | *any* |

**Returns:** *void*

Defined in: [packages/engine/src/renderer/postprocessing/core/Resizer.ts:178](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/core/Resizer.ts#L178)

___

### scale

• get **scale**(): *number*

The current resolution scale.

**Returns:** *number*

Defined in: [packages/engine/src/renderer/postprocessing/core/Resizer.ts:82](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/core/Resizer.ts#L82)

• set **scale**(`value`: *number*): *void*

Sets the resolution scale.

Also sets the width and height to [Resizer.AUTO_SIZE](renderer_postprocessing_core_resizer.resizer.md#auto_size).

#### Parameters:

Name | Type |
:------ | :------ |
`value` | *number* |

**Returns:** *void*

Defined in: [packages/engine/src/renderer/postprocessing/core/Resizer.ts:94](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/core/Resizer.ts#L94)

___

### width

• get **width**(): *any*

The calculated width.

If both the width and the height are set to [Resizer.AUTO_SIZE](renderer_postprocessing_core_resizer.resizer.md#auto_size), the
base width will be returned.

**Returns:** *any*

Defined in: [packages/engine/src/renderer/postprocessing/core/Resizer.ts:112](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/core/Resizer.ts#L112)

• set **width**(`value`: *any*): *void*

Sets the target width.

Use [Resizer.AUTO_SIZE](renderer_postprocessing_core_resizer.resizer.md#auto_size) to automatically calculate the width based
on the height and the original aspect ratio.

#### Parameters:

Name | Type |
:------ | :------ |
`value` | *any* |

**Returns:** *void*

Defined in: [packages/engine/src/renderer/postprocessing/core/Resizer.ts:138](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/core/Resizer.ts#L138)

___

### AUTO\_SIZE

• `Static`get **AUTO_SIZE**(): *number*

An auto sizing constant.

Can be used to automatically calculate the width or height based on the
original aspect ratio.

**Returns:** *number*

Defined in: [packages/engine/src/renderer/postprocessing/core/Resizer.ts:192](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/core/Resizer.ts#L192)
