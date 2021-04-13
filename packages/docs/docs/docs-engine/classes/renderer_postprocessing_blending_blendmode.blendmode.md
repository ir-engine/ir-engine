---
id: "renderer_postprocessing_blending_blendmode.blendmode"
title: "Class: BlendMode"
sidebar_label: "BlendMode"
custom_edit_url: null
hide_title: true
---

# Class: BlendMode

[renderer/postprocessing/blending/BlendMode](../modules/renderer_postprocessing_blending_blendmode.md).BlendMode

A blend mode.

## Hierarchy

* *EventDispatcher*

  ↳ **BlendMode**

## Constructors

### constructor

\+ **new BlendMode**(`blendFunction`: *any*, `opacity?`: *number*): [*BlendMode*](renderer_postprocessing_blending_blendmode.blendmode.md)

Constructs a new blend mode.

#### Parameters:

Name | Type | Default value | Description |
:------ | :------ | :------ | :------ |
`blendFunction` | *any* | - | The blend function to use.   |
`opacity` | *number* | 1.0 | The opacity of the color that will be blended with the base color.    |

**Returns:** [*BlendMode*](renderer_postprocessing_blending_blendmode.blendmode.md)

Overrides: void

Defined in: [packages/engine/src/renderer/postprocessing/blending/BlendMode.ts:55](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/blending/BlendMode.ts#L55)

## Properties

### blendFunction

• **blendFunction**: *any*

Defined in: [packages/engine/src/renderer/postprocessing/blending/BlendMode.ts:54](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/blending/BlendMode.ts#L54)

___

### opacity

• **opacity**: *any*

Defined in: [packages/engine/src/renderer/postprocessing/blending/BlendMode.ts:55](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/blending/BlendMode.ts#L55)

## Methods

### getBlendFunction

▸ **getBlendFunction**(): *any*

Returns the blend function.

**Returns:** *any*

The blend function.

Defined in: [packages/engine/src/renderer/postprocessing/blending/BlendMode.ts:90](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/blending/BlendMode.ts#L90)

___

### getShaderCode

▸ **getShaderCode**(): *string*

Returns the blend function shader code.

**Returns:** *string*

The blend function shader code.

Defined in: [packages/engine/src/renderer/postprocessing/blending/BlendMode.ts:111](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/blending/BlendMode.ts#L111)

___

### setBlendFunction

▸ **setBlendFunction**(`blendFunction`: *any*): *void*

Sets the blend function.

#### Parameters:

Name | Type | Description |
:------ | :------ | :------ |
`blendFunction` | *any* | The blend function.    |

**Returns:** *void*

Defined in: [packages/engine/src/renderer/postprocessing/blending/BlendMode.ts:100](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/blending/BlendMode.ts#L100)
