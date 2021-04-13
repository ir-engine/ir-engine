---
id: "renderer_postprocessing_bloomeffect.bloomeffect"
title: "Class: BloomEffect"
sidebar_label: "BloomEffect"
custom_edit_url: null
hide_title: true
---

# Class: BloomEffect

[renderer/postprocessing/BloomEffect](../modules/renderer_postprocessing_bloomeffect.md).BloomEffect

A bloom effect.

This effect uses the fast Kawase convolution technique and a luminance filter
to blur bright highlights.

## Hierarchy

* [*Effect*](renderer_postprocessing_effect.effect.md)

  ↳ **BloomEffect**

  ↳↳ [*SelectiveBloomEffect*](renderer_postprocessing_selectivebloomeffect.selectivebloomeffect.md)

## Constructors

### constructor

\+ **new BloomEffect**(`__namedParameters?`: { `blendFunction`:  ; `height`:  ; `intensity`:  ; `kernelSize`:  ; `luminanceSmoothing`:  ; `luminanceThreshold`:  ; `resolutionScale`:  ; `width`:   }): [*BloomEffect*](renderer_postprocessing_bloomeffect.bloomeffect.md)

Constructs a new bloom effect.

#### Parameters:

Name | Type |
:------ | :------ |
`__namedParameters` | *object* |
`__namedParameters.blendFunction` | - |
`__namedParameters.height` | - |
`__namedParameters.intensity` | - |
`__namedParameters.kernelSize` | - |
`__namedParameters.luminanceSmoothing` | - |
`__namedParameters.luminanceThreshold` | - |
`__namedParameters.resolutionScale` | - |
`__namedParameters.width` | - |

**Returns:** [*BloomEffect*](renderer_postprocessing_bloomeffect.bloomeffect.md)

Overrides: [Effect](renderer_postprocessing_effect.effect.md)

Defined in: [packages/engine/src/renderer/postprocessing/BloomEffect.ts:22](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/BloomEffect.ts#L22)

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

• **blurPass**: *any*

Defined in: [packages/engine/src/renderer/postprocessing/BloomEffect.ts:21](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/BloomEffect.ts#L21)

___

### defines

• **defines**: *Map*<any, any\>

Inherited from: [Effect](renderer_postprocessing_effect.effect.md).[defines](renderer_postprocessing_effect.effect.md#defines)

Defined in: [packages/engine/src/renderer/postprocessing/Effect.ts:20](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/Effect.ts#L20)

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

### luminancePass

• **luminancePass**: *any*

Defined in: [packages/engine/src/renderer/postprocessing/BloomEffect.ts:22](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/BloomEffect.ts#L22)

___

### name

• **name**: *any*

Inherited from: [Effect](renderer_postprocessing_effect.effect.md).[name](renderer_postprocessing_effect.effect.md#name)

Defined in: [packages/engine/src/renderer/postprocessing/Effect.ts:16](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/Effect.ts#L16)

___

### renderTarget

• **renderTarget**: *any*

Defined in: [packages/engine/src/renderer/postprocessing/BloomEffect.ts:19](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/BloomEffect.ts#L19)

___

### uniforms

• **uniforms**: *any*

Overrides: [Effect](renderer_postprocessing_effect.effect.md).[uniforms](renderer_postprocessing_effect.effect.md#uniforms)

Defined in: [packages/engine/src/renderer/postprocessing/BloomEffect.ts:20](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/BloomEffect.ts#L20)

___

### vertexShader

• **vertexShader**: *any*

Inherited from: [Effect](renderer_postprocessing_effect.effect.md).[vertexShader](renderer_postprocessing_effect.effect.md#vertexshader)

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

▸ **getResolutionScale**(): *any*

Returns the current resolution scale.

**`deprecated`** Adjust the fixed resolution width or height instead.

**Returns:** *any*

The resolution scale.

Defined in: [packages/engine/src/renderer/postprocessing/BloomEffect.ts:267](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/BloomEffect.ts#L267)

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

Defined in: [packages/engine/src/renderer/postprocessing/BloomEffect.ts:321](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/BloomEffect.ts#L321)

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

### setResolutionScale

▸ **setResolutionScale**(`scale`: *any*): *void*

Sets the resolution scale.

**`deprecated`** Adjust the fixed resolution width or height instead.

#### Parameters:

Name | Type | Description |
:------ | :------ | :------ |
`scale` | *any* | The new resolution scale.   |

**Returns:** *void*

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

Overrides: [Effect](renderer_postprocessing_effect.effect.md)

Defined in: [packages/engine/src/renderer/postprocessing/BloomEffect.ts:308](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/BloomEffect.ts#L308)

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

Defined in: [packages/engine/src/renderer/postprocessing/BloomEffect.ts:290](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/BloomEffect.ts#L290)
