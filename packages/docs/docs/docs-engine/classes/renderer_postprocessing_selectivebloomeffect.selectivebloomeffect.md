---
id: "renderer_postprocessing_selectivebloomeffect.selectivebloomeffect"
title: "Class: SelectiveBloomEffect"
sidebar_label: "SelectiveBloomEffect"
custom_edit_url: null
hide_title: true
---

# Class: SelectiveBloomEffect

[renderer/postprocessing/SelectiveBloomEffect](../modules/renderer_postprocessing_selectivebloomeffect.md).SelectiveBloomEffect

A selective bloom effect.

This effect applies bloom only to selected objects by using layers. Make sure
to enable the selection layer for all relevant lights:

`lights.forEach((l) => l.layers.enable(bloomEffect.selection.layer));`

Attention: If you don't need to limit bloom to a subset of objects, consider
using the [BloomEffect](renderer_postprocessing_bloomeffect.bloomeffect.md) instead for better performance.

## Hierarchy

* [*BloomEffect*](renderer_postprocessing_bloomeffect.bloomeffect.md)

  ↳ **SelectiveBloomEffect**

## Constructors

### constructor

\+ **new SelectiveBloomEffect**(`scene`: *any*, `camera`: *any*, `options`: *any*): [*SelectiveBloomEffect*](renderer_postprocessing_selectivebloomeffect.selectivebloomeffect.md)

Constructs a new selective bloom effect.

#### Parameters:

Name | Type | Description |
:------ | :------ | :------ |
`scene` | *any* | The main scene.   |
`camera` | *any* | The main camera.   |
`options` | *any* | - |

**Returns:** [*SelectiveBloomEffect*](renderer_postprocessing_selectivebloomeffect.selectivebloomeffect.md)

Overrides: [BloomEffect](renderer_postprocessing_bloomeffect.bloomeffect.md)

Defined in: [packages/engine/src/renderer/postprocessing/SelectiveBloomEffect.ts:38](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/SelectiveBloomEffect.ts#L38)

## Properties

### attributes

• **attributes**: *number*

Inherited from: [BloomEffect](renderer_postprocessing_bloomeffect.bloomeffect.md).[attributes](renderer_postprocessing_bloomeffect.bloomeffect.md#attributes)

Defined in: [packages/engine/src/renderer/postprocessing/Effect.ts:17](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/Effect.ts#L17)

___

### backgroundPass

• **backgroundPass**: [*RenderPass*](renderer_postprocessing_passes_renderpass.renderpass.md)

Defined in: [packages/engine/src/renderer/postprocessing/SelectiveBloomEffect.ts:35](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/SelectiveBloomEffect.ts#L35)

___

### blackoutPass

• **blackoutPass**: [*RenderPass*](renderer_postprocessing_passes_renderpass.renderpass.md)

Defined in: [packages/engine/src/renderer/postprocessing/SelectiveBloomEffect.ts:34](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/SelectiveBloomEffect.ts#L34)

___

### blendMode

• **blendMode**: [*BlendMode*](renderer_postprocessing_blending_blendmode.blendmode.md)

Inherited from: [BloomEffect](renderer_postprocessing_bloomeffect.bloomeffect.md).[blendMode](renderer_postprocessing_bloomeffect.bloomeffect.md#blendmode)

Defined in: [packages/engine/src/renderer/postprocessing/Effect.ts:23](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/Effect.ts#L23)

___

### blurPass

• **blurPass**: *any*

Inherited from: [BloomEffect](renderer_postprocessing_bloomeffect.bloomeffect.md).[blurPass](renderer_postprocessing_bloomeffect.bloomeffect.md#blurpass)

Defined in: [packages/engine/src/renderer/postprocessing/BloomEffect.ts:21](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/BloomEffect.ts#L21)

___

### camera

• **camera**: *any*

Defined in: [packages/engine/src/renderer/postprocessing/SelectiveBloomEffect.ts:31](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/SelectiveBloomEffect.ts#L31)

___

### clearPass

• **clearPass**: [*ClearPass*](renderer_postprocessing_passes_clearpass.clearpass.md)

Defined in: [packages/engine/src/renderer/postprocessing/SelectiveBloomEffect.ts:32](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/SelectiveBloomEffect.ts#L32)

___

### defines

• **defines**: *Map*<any, any\>

Inherited from: [BloomEffect](renderer_postprocessing_bloomeffect.bloomeffect.md).[defines](renderer_postprocessing_bloomeffect.bloomeffect.md#defines)

Defined in: [packages/engine/src/renderer/postprocessing/Effect.ts:20](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/Effect.ts#L20)

___

### extensions

• **extensions**: *any*

Inherited from: [BloomEffect](renderer_postprocessing_bloomeffect.bloomeffect.md).[extensions](renderer_postprocessing_bloomeffect.bloomeffect.md#extensions)

Defined in: [packages/engine/src/renderer/postprocessing/Effect.ts:22](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/Effect.ts#L22)

___

### fragmentShader

• **fragmentShader**: *any*

Inherited from: [BloomEffect](renderer_postprocessing_bloomeffect.bloomeffect.md).[fragmentShader](renderer_postprocessing_bloomeffect.bloomeffect.md#fragmentshader)

Defined in: [packages/engine/src/renderer/postprocessing/Effect.ts:18](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/Effect.ts#L18)

___

### inverted

• **inverted**: *boolean*

Defined in: [packages/engine/src/renderer/postprocessing/SelectiveBloomEffect.ts:38](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/SelectiveBloomEffect.ts#L38)

___

### luminancePass

• **luminancePass**: *any*

Inherited from: [BloomEffect](renderer_postprocessing_bloomeffect.bloomeffect.md).[luminancePass](renderer_postprocessing_bloomeffect.bloomeffect.md#luminancepass)

Defined in: [packages/engine/src/renderer/postprocessing/BloomEffect.ts:22](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/BloomEffect.ts#L22)

___

### name

• **name**: *any*

Inherited from: [BloomEffect](renderer_postprocessing_bloomeffect.bloomeffect.md).[name](renderer_postprocessing_bloomeffect.bloomeffect.md#name)

Defined in: [packages/engine/src/renderer/postprocessing/Effect.ts:16](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/Effect.ts#L16)

___

### renderPass

• **renderPass**: [*RenderPass*](renderer_postprocessing_passes_renderpass.renderpass.md)

Defined in: [packages/engine/src/renderer/postprocessing/SelectiveBloomEffect.ts:33](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/SelectiveBloomEffect.ts#L33)

___

### renderTarget

• **renderTarget**: *any*

Inherited from: [BloomEffect](renderer_postprocessing_bloomeffect.bloomeffect.md).[renderTarget](renderer_postprocessing_bloomeffect.bloomeffect.md#rendertarget)

Defined in: [packages/engine/src/renderer/postprocessing/BloomEffect.ts:19](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/BloomEffect.ts#L19)

___

### renderTargetSelection

• **renderTargetSelection**: *any*

Defined in: [packages/engine/src/renderer/postprocessing/SelectiveBloomEffect.ts:36](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/SelectiveBloomEffect.ts#L36)

___

### scene

• **scene**: *any*

Defined in: [packages/engine/src/renderer/postprocessing/SelectiveBloomEffect.ts:30](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/SelectiveBloomEffect.ts#L30)

___

### selection

• **selection**: [*Selection*](renderer_postprocessing_core_selection.selection.md)

Defined in: [packages/engine/src/renderer/postprocessing/SelectiveBloomEffect.ts:37](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/SelectiveBloomEffect.ts#L37)

___

### uniforms

• **uniforms**: *any*

Inherited from: [BloomEffect](renderer_postprocessing_bloomeffect.bloomeffect.md).[uniforms](renderer_postprocessing_bloomeffect.bloomeffect.md#uniforms)

Defined in: [packages/engine/src/renderer/postprocessing/BloomEffect.ts:20](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/BloomEffect.ts#L20)

___

### vertexShader

• **vertexShader**: *any*

Inherited from: [BloomEffect](renderer_postprocessing_bloomeffect.bloomeffect.md).[vertexShader](renderer_postprocessing_bloomeffect.bloomeffect.md#vertexshader)

Defined in: [packages/engine/src/renderer/postprocessing/Effect.ts:19](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/Effect.ts#L19)

## Accessors

### distinction

• get **distinction**(): *number*

**`deprecated`** Use luminanceMaterial.threshold and luminanceMaterial.smoothing instead.

**Returns:** *number*

Defined in: [packages/engine/src/renderer/postprocessing/BloomEffect.ts:225](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/BloomEffect.ts#L225)

• set **distinction**(`value`: *number*): *void*

**`deprecated`** Use luminanceMaterial.threshold and luminanceMaterial.smoothing instead.

#### Parameters:

Name | Type |
:------ | :------ |
`value` | *number* |

**Returns:** *void*

Defined in: [packages/engine/src/renderer/postprocessing/BloomEffect.ts:236](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/BloomEffect.ts#L236)

___

### dithering

• get **dithering**(): *any*

Indicates whether dithering is enabled.

**`deprecated`** Set the frameBufferType of the EffectComposer to HalfFloatType instead.

**Returns:** *any*

Defined in: [packages/engine/src/renderer/postprocessing/BloomEffect.ts:185](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/BloomEffect.ts#L185)

• set **dithering**(`value`: *any*): *void*

Enables or disables dithering.

**`deprecated`** Set the frameBufferType of the EffectComposer to HalfFloatType instead.

#### Parameters:

Name | Type |
:------ | :------ |
`value` | *any* |

**Returns:** *void*

Defined in: [packages/engine/src/renderer/postprocessing/BloomEffect.ts:196](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/BloomEffect.ts#L196)

___

### height

• get **height**(): *any*

The current height of the internal render targets.

**`deprecated`** Use resolution.height instead.

**Returns:** *any*

Defined in: [packages/engine/src/renderer/postprocessing/BloomEffect.ts:163](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/BloomEffect.ts#L163)

• set **height**(`value`: *any*): *void*

Sets the render height.

**`deprecated`** Use resolution.height instead.

#### Parameters:

Name | Type |
:------ | :------ |
`value` | *any* |

**Returns:** *void*

Defined in: [packages/engine/src/renderer/postprocessing/BloomEffect.ts:174](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/BloomEffect.ts#L174)

___

### ignoreBackground

• get **ignoreBackground**(): *boolean*

Indicates whether the scene background should be ignored.

**Returns:** *boolean*

Defined in: [packages/engine/src/renderer/postprocessing/SelectiveBloomEffect.ts:155](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/SelectiveBloomEffect.ts#L155)

• set **ignoreBackground**(`value`: *boolean*): *void*

Enables or disables background rendering.

#### Parameters:

Name | Type |
:------ | :------ |
`value` | *boolean* |

**Returns:** *void*

Defined in: [packages/engine/src/renderer/postprocessing/SelectiveBloomEffect.ts:165](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/SelectiveBloomEffect.ts#L165)

___

### intensity

• get **intensity**(): *any*

The bloom intensity.

**Returns:** *any*

Defined in: [packages/engine/src/renderer/postprocessing/BloomEffect.ts:246](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/BloomEffect.ts#L246)

• set **intensity**(`value`: *any*): *void*

Sets the bloom intensity.

#### Parameters:

Name | Type |
:------ | :------ |
`value` | *any* |

**Returns:** *void*

Defined in: [packages/engine/src/renderer/postprocessing/BloomEffect.ts:256](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/BloomEffect.ts#L256)

___

### kernelSize

• get **kernelSize**(): *any*

The blur kernel size.

**`deprecated`** Use blurPass.kernelSize instead.

**Returns:** *any*

Defined in: [packages/engine/src/renderer/postprocessing/BloomEffect.ts:207](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/BloomEffect.ts#L207)

• set **kernelSize**(`value`: *any*): *void*

The blur kernel size.

**`deprecated`** Use blurPass.kernelSize instead.

#### Parameters:

Name | Type |
:------ | :------ |
`value` | *any* |

**Returns:** *void*

Defined in: [packages/engine/src/renderer/postprocessing/BloomEffect.ts:216](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/BloomEffect.ts#L216)

___

### luminanceMaterial

• get **luminanceMaterial**(): *any*

The luminance material.

**Returns:** *any*

Defined in: [packages/engine/src/renderer/postprocessing/BloomEffect.ts:120](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/BloomEffect.ts#L120)

___

### resolution

• get **resolution**(): *any*

The resolution of this effect.

**Returns:** *any*

Defined in: [packages/engine/src/renderer/postprocessing/BloomEffect.ts:130](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/BloomEffect.ts#L130)

___

### texture

• get **texture**(): *any*

A texture that contains the intermediate result of this effect.

This texture will be applied to the scene colors unless the blend function
is set to `SKIP`.

**Returns:** *any*

Defined in: [packages/engine/src/renderer/postprocessing/BloomEffect.ts:110](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/BloomEffect.ts#L110)

___

### width

• get **width**(): *any*

The current width of the internal render targets.

**`deprecated`** Use resolution.width instead.

**Returns:** *any*

Defined in: [packages/engine/src/renderer/postprocessing/BloomEffect.ts:141](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/BloomEffect.ts#L141)

• set **width**(`value`: *any*): *void*

Sets the render width.

**`deprecated`** Use resolution.width instead.

#### Parameters:

Name | Type |
:------ | :------ |
`value` | *any* |

**Returns:** *void*

Defined in: [packages/engine/src/renderer/postprocessing/BloomEffect.ts:152](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/BloomEffect.ts#L152)

## Methods

### dispose

▸ **dispose**(): *void*

Performs a shallow search for properties that define a dispose method and
deletes them. The effect will be inoperative after this method was called!

The [EffectPass](renderer_postprocessing_passes_effectpass.effectpass.md) calls this method when it is being destroyed. Do not
call this method directly.

**Returns:** *void*

Inherited from: [BloomEffect](renderer_postprocessing_bloomeffect.bloomeffect.md)

Defined in: [packages/engine/src/renderer/postprocessing/Effect.ts:285](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/Effect.ts#L285)

___

### getAttributes

▸ **getAttributes**(): *number*

Returns the effect attributes.

**Returns:** *number*

The attributes.

Inherited from: [BloomEffect](renderer_postprocessing_bloomeffect.bloomeffect.md)

Defined in: [packages/engine/src/renderer/postprocessing/Effect.ts:149](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/Effect.ts#L149)

___

### getFragmentShader

▸ **getFragmentShader**(): *any*

Returns the fragment shader.

**Returns:** *any*

The fragment shader.

Inherited from: [BloomEffect](renderer_postprocessing_bloomeffect.bloomeffect.md)

Defined in: [packages/engine/src/renderer/postprocessing/Effect.ts:174](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/Effect.ts#L174)

___

### getResolutionScale

▸ **getResolutionScale**(): *any*

Returns the current resolution scale.

**`deprecated`** Adjust the fixed resolution width or height instead.

**Returns:** *any*

The resolution scale.

Inherited from: [BloomEffect](renderer_postprocessing_bloomeffect.bloomeffect.md)

Defined in: [packages/engine/src/renderer/postprocessing/BloomEffect.ts:267](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/BloomEffect.ts#L267)

___

### getVertexShader

▸ **getVertexShader**(): *any*

Returns the vertex shader.

**Returns:** *any*

The vertex shader.

Inherited from: [BloomEffect](renderer_postprocessing_bloomeffect.bloomeffect.md)

Defined in: [packages/engine/src/renderer/postprocessing/Effect.ts:196](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/Effect.ts#L196)

___

### initialize

▸ **initialize**(`renderer`: *any*, `alpha`: *any*, `frameBufferType`: *any*): *void*

Performs initialization tasks.

#### Parameters:

Name | Type | Description |
:------ | :------ | :------ |
`renderer` | *any* | The renderer.   |
`alpha` | *any* | Whether the renderer uses the alpha channel.   |
`frameBufferType` | *any* | The type of the main frame buffers.    |

**Returns:** *void*

Overrides: [BloomEffect](renderer_postprocessing_bloomeffect.bloomeffect.md)

Defined in: [packages/engine/src/renderer/postprocessing/SelectiveBloomEffect.ts:244](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/SelectiveBloomEffect.ts#L244)

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

Inherited from: [BloomEffect](renderer_postprocessing_bloomeffect.bloomeffect.md)

Defined in: [packages/engine/src/renderer/postprocessing/Effect.ts:163](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/Effect.ts#L163)

___

### setChanged

▸ `Protected`**setChanged**(): *void*

Informs the associated [EffectPass](renderer_postprocessing_passes_effectpass.effectpass.md) that this effect has changed in
a way that requires a shader recompilation.

Call this method after changing macro definitions or extensions and after
adding or removing uniforms.

**Returns:** *void*

Inherited from: [BloomEffect](renderer_postprocessing_bloomeffect.bloomeffect.md)

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

Inherited from: [BloomEffect](renderer_postprocessing_bloomeffect.bloomeffect.md)

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

Inherited from: [BloomEffect](renderer_postprocessing_bloomeffect.bloomeffect.md)

Defined in: [packages/engine/src/renderer/postprocessing/Effect.ts:185](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/Effect.ts#L185)

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

Inherited from: [BloomEffect](renderer_postprocessing_bloomeffect.bloomeffect.md)

Defined in: [packages/engine/src/renderer/postprocessing/BloomEffect.ts:278](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/BloomEffect.ts#L278)

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

Overrides: [BloomEffect](renderer_postprocessing_bloomeffect.bloomeffect.md)

Defined in: [packages/engine/src/renderer/postprocessing/SelectiveBloomEffect.ts:223](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/SelectiveBloomEffect.ts#L223)

___

### setVertexShader

▸ `Protected`**setVertexShader**(`vertexShader`: *any*): *void*

Sets the vertex shader.

#### Parameters:

Name | Type | Description |
:------ | :------ | :------ |
`vertexShader` | *any* | The vertex shader.    |

**Returns:** *void*

Inherited from: [BloomEffect](renderer_postprocessing_bloomeffect.bloomeffect.md)

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

Overrides: [BloomEffect](renderer_postprocessing_bloomeffect.bloomeffect.md)

Defined in: [packages/engine/src/renderer/postprocessing/SelectiveBloomEffect.ts:177](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/SelectiveBloomEffect.ts#L177)
