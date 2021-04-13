---
id: "renderer_postprocessing_outlineeffect.outlineeffect"
title: "Class: OutlineEffect"
sidebar_label: "OutlineEffect"
custom_edit_url: null
hide_title: true
---

# Class: OutlineEffect

[renderer/postprocessing/OutlineEffect](../modules/renderer_postprocessing_outlineeffect.md).OutlineEffect

An outline effect.

## Hierarchy

* [*Effect*](renderer_postprocessing_effect.effect.md)

  ↳ **OutlineEffect**

## Constructors

### constructor

\+ **new OutlineEffect**(`scene`: *any*, `camera`: *any*, `__namedParameters`: *Object*): [*OutlineEffect*](renderer_postprocessing_outlineeffect.outlineeffect.md)

Constructs a new outline effect.

If you want dark outlines, remember to use an appropriate blend function.

#### Parameters:

Name | Type | Description |
:------ | :------ | :------ |
`scene` | *any* | The main scene.   |
`camera` | *any* | The main camera.   |
`__namedParameters` | *Object* | - |

**Returns:** [*OutlineEffect*](renderer_postprocessing_outlineeffect.outlineeffect.md)

Overrides: [Effect](renderer_postprocessing_effect.effect.md)

Defined in: [packages/engine/src/renderer/postprocessing/OutlineEffect.ts:45](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/OutlineEffect.ts#L45)

## Properties

### attributes

• **attributes**: *number*

Inherited from: [Effect](renderer_postprocessing_effect.effect.md).[attributes](renderer_postprocessing_effect.effect.md#attributes)

Defined in: [packages/engine/src/renderer/postprocessing/Effect.ts:17](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/Effect.ts#L17)

___

### blendMode

• **blendMode**: [*BlendMode*](renderer_postprocessing_blending_blendmode.blendmode.md)

Inherited from: [Effect](renderer_postprocessing_effect.effect.md).[blendMode](renderer_postprocessing_effect.effect.md#blendmode)

Defined in: [packages/engine/src/renderer/postprocessing/Effect.ts:23](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/Effect.ts#L23)

___

### blurPass

• **blurPass**: [*BlurPass*](renderer_postprocessing_passes_blurpass.blurpass.md)

Defined in: [packages/engine/src/renderer/postprocessing/OutlineEffect.ts:41](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/OutlineEffect.ts#L41)

___

### camera

• **camera**: *any*

Defined in: [packages/engine/src/renderer/postprocessing/OutlineEffect.ts:34](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/OutlineEffect.ts#L34)

___

### clearPass

• **clearPass**: [*ClearPass*](renderer_postprocessing_passes_clearpass.clearpass.md)

Defined in: [packages/engine/src/renderer/postprocessing/OutlineEffect.ts:38](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/OutlineEffect.ts#L38)

___

### defines

• **defines**: *Map*<any, any\>

Inherited from: [Effect](renderer_postprocessing_effect.effect.md).[defines](renderer_postprocessing_effect.effect.md#defines)

Defined in: [packages/engine/src/renderer/postprocessing/Effect.ts:20](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/Effect.ts#L20)

___

### depthPass

• **depthPass**: [*DepthPass*](renderer_postprocessing_passes_depthpass.depthpass.md)

Defined in: [packages/engine/src/renderer/postprocessing/OutlineEffect.ts:39](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/OutlineEffect.ts#L39)

___

### extensions

• **extensions**: *any*

Inherited from: [Effect](renderer_postprocessing_effect.effect.md).[extensions](renderer_postprocessing_effect.effect.md#extensions)

Defined in: [packages/engine/src/renderer/postprocessing/Effect.ts:22](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/Effect.ts#L22)

___

### fragmentShader

• **fragmentShader**: *any*

Inherited from: [Effect](renderer_postprocessing_effect.effect.md).[fragmentShader](renderer_postprocessing_effect.effect.md#fragmentshader)

Defined in: [packages/engine/src/renderer/postprocessing/Effect.ts:18](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/Effect.ts#L18)

___

### maskPass

• **maskPass**: [*RenderPass*](renderer_postprocessing_passes_renderpass.renderpass.md)

Defined in: [packages/engine/src/renderer/postprocessing/OutlineEffect.ts:40](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/OutlineEffect.ts#L40)

___

### name

• **name**: *any*

Inherited from: [Effect](renderer_postprocessing_effect.effect.md).[name](renderer_postprocessing_effect.effect.md#name)

Defined in: [packages/engine/src/renderer/postprocessing/Effect.ts:16](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/Effect.ts#L16)

___

### outlinePass

• **outlinePass**: *any*

Defined in: [packages/engine/src/renderer/postprocessing/OutlineEffect.ts:42](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/OutlineEffect.ts#L42)

___

### pulseSpeed

• **pulseSpeed**: *number*

Defined in: [packages/engine/src/renderer/postprocessing/OutlineEffect.ts:45](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/OutlineEffect.ts#L45)

___

### renderTargetBlurredOutline

• **renderTargetBlurredOutline**: *any*

Defined in: [packages/engine/src/renderer/postprocessing/OutlineEffect.ts:37](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/OutlineEffect.ts#L37)

___

### renderTargetMask

• **renderTargetMask**: *any*

Defined in: [packages/engine/src/renderer/postprocessing/OutlineEffect.ts:35](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/OutlineEffect.ts#L35)

___

### renderTargetOutline

• **renderTargetOutline**: *any*

Defined in: [packages/engine/src/renderer/postprocessing/OutlineEffect.ts:36](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/OutlineEffect.ts#L36)

___

### scene

• **scene**: *any*

Defined in: [packages/engine/src/renderer/postprocessing/OutlineEffect.ts:33](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/OutlineEffect.ts#L33)

___

### selection

• **selection**: [*Selection*](renderer_postprocessing_core_selection.selection.md)

Defined in: [packages/engine/src/renderer/postprocessing/OutlineEffect.ts:44](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/OutlineEffect.ts#L44)

___

### time

• **time**: *number*

Defined in: [packages/engine/src/renderer/postprocessing/OutlineEffect.ts:43](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/OutlineEffect.ts#L43)

___

### uniforms

• **uniforms**: *Map*<any, any\>

Inherited from: [Effect](renderer_postprocessing_effect.effect.md).[uniforms](renderer_postprocessing_effect.effect.md#uniforms)

Defined in: [packages/engine/src/renderer/postprocessing/Effect.ts:21](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/Effect.ts#L21)

___

### vertexShader

• **vertexShader**: *any*

Inherited from: [Effect](renderer_postprocessing_effect.effect.md).[vertexShader](renderer_postprocessing_effect.effect.md#vertexshader)

Defined in: [packages/engine/src/renderer/postprocessing/Effect.ts:19](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/Effect.ts#L19)

## Accessors

### blur

• get **blur**(): *boolean*

Indicates whether the outlines should be blurred.

**Returns:** *boolean*

Defined in: [packages/engine/src/renderer/postprocessing/OutlineEffect.ts:371](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/OutlineEffect.ts#L371)

• set **blur**(`value`: *boolean*): *void*

Indicates whether the outlines should be blurred.

#### Parameters:

Name | Type |
:------ | :------ |
`value` | *boolean* |

**Returns:** *void*

Defined in: [packages/engine/src/renderer/postprocessing/OutlineEffect.ts:379](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/OutlineEffect.ts#L379)

___

### dithering

• get **dithering**(): *boolean*

Indicates whether dithering is enabled.

**`deprecated`** Set the frameBufferType of the EffectComposer to HalfFloatType instead.

**Returns:** *boolean*

Defined in: [packages/engine/src/renderer/postprocessing/OutlineEffect.ts:328](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/OutlineEffect.ts#L328)

• set **dithering**(`value`: *boolean*): *void*

Enables or disables dithering.

**`deprecated`** Set the frameBufferType of the EffectComposer to HalfFloatType instead.

#### Parameters:

Name | Type |
:------ | :------ |
`value` | *boolean* |

**Returns:** *void*

Defined in: [packages/engine/src/renderer/postprocessing/OutlineEffect.ts:339](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/OutlineEffect.ts#L339)

___

### height

• get **height**(): *any*

The current height of the internal render targets.

**`deprecated`** Use resolution.height instead.

**Returns:** *any*

Defined in: [packages/engine/src/renderer/postprocessing/OutlineEffect.ts:288](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/OutlineEffect.ts#L288)

• set **height**(`value`: *any*): *void*

Sets the render height.

**`deprecated`** Use resolution.height instead.

#### Parameters:

Name | Type |
:------ | :------ |
`value` | *any* |

**Returns:** *void*

Defined in: [packages/engine/src/renderer/postprocessing/OutlineEffect.ts:299](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/OutlineEffect.ts#L299)

___

### kernelSize

• get **kernelSize**(): *any*

The blur kernel size.

**`deprecated`** Use blurPass.kernelSize instead.

**Returns:** *any*

Defined in: [packages/engine/src/renderer/postprocessing/OutlineEffect.ts:350](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/OutlineEffect.ts#L350)

• set **kernelSize**(`value`: *any*): *void*

Sets the kernel size.

**`deprecated`** Use blurPass.kernelSize instead.

#### Parameters:

Name | Type |
:------ | :------ |
`value` | *any* |

**Returns:** *void*

Defined in: [packages/engine/src/renderer/postprocessing/OutlineEffect.ts:361](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/OutlineEffect.ts#L361)

___

### resolution

• get **resolution**(): [*Resizer*](renderer_postprocessing_core_resizer.resizer.md)

The resolution of this effect.

**Returns:** [*Resizer*](renderer_postprocessing_core_resizer.resizer.md)

Defined in: [packages/engine/src/renderer/postprocessing/OutlineEffect.ts:255](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/OutlineEffect.ts#L255)

___

### selectionLayer

• get **selectionLayer**(): *number*

**`deprecated`** Use selection.layer instead.

**Returns:** *number*

Defined in: [packages/engine/src/renderer/postprocessing/OutlineEffect.ts:308](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/OutlineEffect.ts#L308)

• set **selectionLayer**(`value`: *number*): *void*

**`deprecated`** Use selection.layer instead.

#### Parameters:

Name | Type |
:------ | :------ |
`value` | *number* |

**Returns:** *void*

Defined in: [packages/engine/src/renderer/postprocessing/OutlineEffect.ts:317](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/OutlineEffect.ts#L317)

___

### width

• get **width**(): *any*

The current width of the internal render targets.

**`deprecated`** Use resolution.width instead.

**Returns:** *any*

Defined in: [packages/engine/src/renderer/postprocessing/OutlineEffect.ts:266](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/OutlineEffect.ts#L266)

• set **width**(`value`: *any*): *void*

Sets the render width.

**`deprecated`** Use resolution.width instead.

#### Parameters:

Name | Type |
:------ | :------ |
`value` | *any* |

**Returns:** *void*

Defined in: [packages/engine/src/renderer/postprocessing/OutlineEffect.ts:277](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/OutlineEffect.ts#L277)

___

### xRay

• get **xRay**(): *any*

Indicates whether X-Ray outlines are enabled.

**Returns:** *any*

Defined in: [packages/engine/src/renderer/postprocessing/OutlineEffect.ts:393](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/OutlineEffect.ts#L393)

• set **xRay**(`value`: *any*): *void*

Enables or disables X-Ray outlines.

#### Parameters:

Name | Type |
:------ | :------ |
`value` | *any* |

**Returns:** *void*

Defined in: [packages/engine/src/renderer/postprocessing/OutlineEffect.ts:403](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/OutlineEffect.ts#L403)

## Methods

### clearSelection

▸ **clearSelection**(): [*OutlineEffect*](renderer_postprocessing_outlineeffect.outlineeffect.md)

Clears the list of selected objects.

**`deprecated`** Use selection.clear instead.

**Returns:** [*OutlineEffect*](renderer_postprocessing_outlineeffect.outlineeffect.md)

This pass.

Defined in: [packages/engine/src/renderer/postprocessing/OutlineEffect.ts:480](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/OutlineEffect.ts#L480)

___

### deselectObject

▸ **deselectObject**(`object`: *any*): [*OutlineEffect*](renderer_postprocessing_outlineeffect.outlineeffect.md)

Deselects an object.

**`deprecated`** Use selection.delete instead.

#### Parameters:

Name | Type | Description |
:------ | :------ | :------ |
`object` | *any* | The object that should no longer be outlined.   |

**Returns:** [*OutlineEffect*](renderer_postprocessing_outlineeffect.outlineeffect.md)

This pass.

Defined in: [packages/engine/src/renderer/postprocessing/OutlineEffect.ts:508](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/OutlineEffect.ts#L508)

___

### dispose

▸ **dispose**(): *void*

Performs a shallow search for properties that define a dispose method and
deletes them. The effect will be inoperative after this method was called!

The [EffectPass](renderer_postprocessing_passes_effectpass.effectpass.md) calls this method when it is being destroyed. Do not
call this method directly.

**Returns:** *void*

Inherited from: [Effect](renderer_postprocessing_effect.effect.md)

Defined in: [packages/engine/src/renderer/postprocessing/Effect.ts:285](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/Effect.ts#L285)

___

### getAttributes

▸ **getAttributes**(): *number*

Returns the effect attributes.

**Returns:** *number*

The attributes.

Inherited from: [Effect](renderer_postprocessing_effect.effect.md)

Defined in: [packages/engine/src/renderer/postprocessing/Effect.ts:149](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/Effect.ts#L149)

___

### getFragmentShader

▸ **getFragmentShader**(): *any*

Returns the fragment shader.

**Returns:** *any*

The fragment shader.

Inherited from: [Effect](renderer_postprocessing_effect.effect.md)

Defined in: [packages/engine/src/renderer/postprocessing/Effect.ts:174](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/Effect.ts#L174)

___

### getResolutionScale

▸ **getResolutionScale**(): *number*

Returns the current resolution scale.

**`deprecated`** Adjust the fixed resolution width or height instead.

**Returns:** *number*

The resolution scale.

Defined in: [packages/engine/src/renderer/postprocessing/OutlineEffect.ts:444](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/OutlineEffect.ts#L444)

___

### getVertexShader

▸ **getVertexShader**(): *any*

Returns the vertex shader.

**Returns:** *any*

The vertex shader.

Inherited from: [Effect](renderer_postprocessing_effect.effect.md)

Defined in: [packages/engine/src/renderer/postprocessing/Effect.ts:196](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/Effect.ts#L196)

___

### initialize

▸ **initialize**(`renderer`: *any*, `alpha`: *any*, `frameBufferType`: *any*): *void*

Performs initialization tasks.

#### Parameters:

Name | Type | Description |
:------ | :------ | :------ |
`renderer` | *any* | The renderer.   |
`alpha` | *any* | Whether the renderer uses the alpha channel or not.   |
`frameBufferType` | *any* | The type of the main frame buffers.    |

**Returns:** *void*

Overrides: [Effect](renderer_postprocessing_effect.effect.md)

Defined in: [packages/engine/src/renderer/postprocessing/OutlineEffect.ts:594](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/OutlineEffect.ts#L594)

___

### selectObject

▸ **selectObject**(`object`: *any*): [*OutlineEffect*](renderer_postprocessing_outlineeffect.outlineeffect.md)

Selects an object.

**`deprecated`** Use selection.add instead.

#### Parameters:

Name | Type | Description |
:------ | :------ | :------ |
`object` | *any* | The object that should be outlined.   |

**Returns:** [*OutlineEffect*](renderer_postprocessing_outlineeffect.outlineeffect.md)

This pass.

Defined in: [packages/engine/src/renderer/postprocessing/OutlineEffect.ts:494](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/OutlineEffect.ts#L494)

___

### setAttributes

▸ `Protected`**setAttributes**(`attributes`: *any*): *void*

Sets the effect attributes.

Effects that have the same attributes will be executed in the order in
which they were registered. Some attributes imply a higher priority.

#### Parameters:

Name | Type | Description |
:------ | :------ | :------ |
`attributes` | *any* | The attributes.    |

**Returns:** *void*

Inherited from: [Effect](renderer_postprocessing_effect.effect.md)

Defined in: [packages/engine/src/renderer/postprocessing/Effect.ts:163](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/Effect.ts#L163)

___

### setChanged

▸ `Protected`**setChanged**(): *void*

Informs the associated [EffectPass](renderer_postprocessing_passes_effectpass.effectpass.md) that this effect has changed in
a way that requires a shader recompilation.

Call this method after changing macro definitions or extensions and after
adding or removing uniforms.

**Returns:** *void*

Inherited from: [Effect](renderer_postprocessing_effect.effect.md)

Defined in: [packages/engine/src/renderer/postprocessing/Effect.ts:139](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/Effect.ts#L139)

___

### setDepthTexture

▸ **setDepthTexture**(`depthTexture`: *any*, `depthPacking?`: *number*): *void*

Sets the depth texture.

You may override this method if your effect requires direct access to the
depth texture that is bound to the associated [EffectPass](renderer_postprocessing_passes_effectpass.effectpass.md).

#### Parameters:

Name | Type | Default value | Description |
:------ | :------ | :------ | :------ |
`depthTexture` | *any* | - | A depth texture.   |
`depthPacking` | *number* | 0 | - |

**Returns:** *void*

Inherited from: [Effect](renderer_postprocessing_effect.effect.md)

Defined in: [packages/engine/src/renderer/postprocessing/Effect.ts:222](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/Effect.ts#L222)

___

### setFragmentShader

▸ `Protected`**setFragmentShader**(`fragmentShader`: *any*): *void*

Sets the fragment shader.

#### Parameters:

Name | Type | Description |
:------ | :------ | :------ |
`fragmentShader` | *any* | The fragment shader.    |

**Returns:** *void*

Inherited from: [Effect](renderer_postprocessing_effect.effect.md)

Defined in: [packages/engine/src/renderer/postprocessing/Effect.ts:185](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/Effect.ts#L185)

___

### setPatternTexture

▸ **setPatternTexture**(`texture`: *any*): *void*

Sets the pattern texture.

#### Parameters:

Name | Type | Description |
:------ | :------ | :------ |
`texture` | *any* | The new texture.    |

**Returns:** *void*

Defined in: [packages/engine/src/renderer/postprocessing/OutlineEffect.ts:421](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/OutlineEffect.ts#L421)

___

### setResolutionScale

▸ **setResolutionScale**(`scale`: *any*): *void*

Sets the resolution scale.

**`deprecated`** Adjust the fixed resolution width or height instead.

#### Parameters:

Name | Type | Description |
:------ | :------ | :------ |
`scale` | *any* | The new resolution scale.   |

**Returns:** *void*

Defined in: [packages/engine/src/renderer/postprocessing/OutlineEffect.ts:455](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/OutlineEffect.ts#L455)

___

### setSelection

▸ **setSelection**(`objects`: *any*): [*OutlineEffect*](renderer_postprocessing_outlineeffect.outlineeffect.md)

Clears the current selection and selects a list of objects.

**`deprecated`** Use selection.set instead.

#### Parameters:

Name | Type | Description |
:------ | :------ | :------ |
`objects` | *any* | The objects that should be outlined. This array will be copied.   |

**Returns:** [*OutlineEffect*](renderer_postprocessing_outlineeffect.outlineeffect.md)

This pass.

Defined in: [packages/engine/src/renderer/postprocessing/OutlineEffect.ts:467](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/OutlineEffect.ts#L467)

___

### setSize

▸ **setSize**(`width`: *any*, `height`: *any*): *void*

Updates the size of internal render targets.

#### Parameters:

Name | Type | Description |
:------ | :------ | :------ |
`width` | *any* | The width.   |
`height` | *any* | The height.    |

**Returns:** *void*

Overrides: [Effect](renderer_postprocessing_effect.effect.md)

Defined in: [packages/engine/src/renderer/postprocessing/OutlineEffect.ts:573](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/OutlineEffect.ts#L573)

___

### setVertexShader

▸ `Protected`**setVertexShader**(`vertexShader`: *any*): *void*

Sets the vertex shader.

#### Parameters:

Name | Type | Description |
:------ | :------ | :------ |
`vertexShader` | *any* | The vertex shader.    |

**Returns:** *void*

Inherited from: [Effect](renderer_postprocessing_effect.effect.md)

Defined in: [packages/engine/src/renderer/postprocessing/Effect.ts:207](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/Effect.ts#L207)

___

### update

▸ **update**(`renderer`: *any*, `inputBuffer`: *any*, `deltaTime`: *any*): *void*

Updates this effect.

#### Parameters:

Name | Type | Description |
:------ | :------ | :------ |
`renderer` | *any* | The renderer.   |
`inputBuffer` | *any* | A frame buffer that contains the result of the previous pass.   |
`deltaTime` | *any* | - |

**Returns:** *void*

Overrides: [Effect](renderer_postprocessing_effect.effect.md)

Defined in: [packages/engine/src/renderer/postprocessing/OutlineEffect.ts:522](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/OutlineEffect.ts#L522)
