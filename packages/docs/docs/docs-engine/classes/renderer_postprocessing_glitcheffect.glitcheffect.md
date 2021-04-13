---
id: "renderer_postprocessing_glitcheffect.glitcheffect"
title: "Class: GlitchEffect"
sidebar_label: "GlitchEffect"
custom_edit_url: null
hide_title: true
---

# Class: GlitchEffect

[renderer/postprocessing/GlitchEffect](../modules/renderer_postprocessing_glitcheffect.md).GlitchEffect

A glitch effect.

This effect can influence the [ChromaticAberrationEffect](renderer_postprocessing_chromaticaberrationeffect.chromaticaberrationeffect.md).

Reference: https://github.com/staffantan/unityglitch

Warning: This effect cannot be merged with convolution effects.

## Hierarchy

* [*Effect*](renderer_postprocessing_effect.effect.md)

  ↳ **GlitchEffect**

## Constructors

### constructor

\+ **new GlitchEffect**(`__namedParameters?`: { `blendFunction`:  ; `chromaticAberrationOffset`:  ; `columns`:  ; `delay`:  ; `dtSize`:  ; `duration`:  ; `perturbationMap`:  ; `ratio`:  ; `strength`:   }): [*GlitchEffect*](renderer_postprocessing_glitcheffect.glitcheffect.md)

Constructs a new glitch effect.

#### Parameters:

Name | Type |
:------ | :------ |
`__namedParameters` | *object* |
`__namedParameters.blendFunction` | - |
`__namedParameters.chromaticAberrationOffset` | - |
`__namedParameters.columns` | - |
`__namedParameters.delay` | - |
`__namedParameters.dtSize` | - |
`__namedParameters.duration` | - |
`__namedParameters.perturbationMap` | - |
`__namedParameters.ratio` | - |
`__namedParameters.strength` | - |

**Returns:** [*GlitchEffect*](renderer_postprocessing_glitcheffect.glitcheffect.md)

Overrides: [Effect](renderer_postprocessing_effect.effect.md)

Defined in: [packages/engine/src/renderer/postprocessing/GlitchEffect.ts:56](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/GlitchEffect.ts#L56)

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

### breakPoint

• **breakPoint**: *any*

Defined in: [packages/engine/src/renderer/postprocessing/GlitchEffect.ts:49](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/GlitchEffect.ts#L49)

___

### chromaticAberrationOffset

• **chromaticAberrationOffset**: *any*

Defined in: [packages/engine/src/renderer/postprocessing/GlitchEffect.ts:56](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/GlitchEffect.ts#L56)

___

### defines

• **defines**: *Map*<any, any\>

Inherited from: [Effect](renderer_postprocessing_effect.effect.md).[defines](renderer_postprocessing_effect.effect.md#defines)

Defined in: [packages/engine/src/renderer/postprocessing/Effect.ts:20](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/Effect.ts#L20)

___

### delay

• **delay**: *any*

Defined in: [packages/engine/src/renderer/postprocessing/GlitchEffect.ts:47](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/GlitchEffect.ts#L47)

___

### distortion

• **distortion**: *any*

Defined in: [packages/engine/src/renderer/postprocessing/GlitchEffect.ts:52](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/GlitchEffect.ts#L52)

___

### duration

• **duration**: *any*

Defined in: [packages/engine/src/renderer/postprocessing/GlitchEffect.ts:48](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/GlitchEffect.ts#L48)

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

### mode

• **mode**: *number*

Defined in: [packages/engine/src/renderer/postprocessing/GlitchEffect.ts:53](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/GlitchEffect.ts#L53)

___

### name

• **name**: *any*

Inherited from: [Effect](renderer_postprocessing_effect.effect.md).[name](renderer_postprocessing_effect.effect.md#name)

Defined in: [packages/engine/src/renderer/postprocessing/Effect.ts:16](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/Effect.ts#L16)

___

### ratio

• **ratio**: *number*

Defined in: [packages/engine/src/renderer/postprocessing/GlitchEffect.ts:55](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/GlitchEffect.ts#L55)

___

### seed

• **seed**: *any*

Defined in: [packages/engine/src/renderer/postprocessing/GlitchEffect.ts:51](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/GlitchEffect.ts#L51)

___

### strength

• **strength**: *any*

Defined in: [packages/engine/src/renderer/postprocessing/GlitchEffect.ts:54](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/GlitchEffect.ts#L54)

___

### time

• **time**: *number*

Defined in: [packages/engine/src/renderer/postprocessing/GlitchEffect.ts:50](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/GlitchEffect.ts#L50)

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

### active

• get **active**(): *any*

Indicates whether the glitch effect is currently active.

**Returns:** *any*

Defined in: [packages/engine/src/renderer/postprocessing/GlitchEffect.ts:199](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/GlitchEffect.ts#L199)

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

### generatePerturbationMap

▸ **generatePerturbationMap**(`size?`: *number*): [*NoiseTexture*](renderer_postprocessing_images_textures_noisetexture.noisetexture.md)

Generates a perturbation map.

#### Parameters:

Name | Type | Default value |
:------ | :------ | :------ |
`size` | *number* | 64 |

**Returns:** [*NoiseTexture*](renderer_postprocessing_images_textures_noisetexture.noisetexture.md)

The perturbation map.

Defined in: [packages/engine/src/renderer/postprocessing/GlitchEffect.ts:242](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/GlitchEffect.ts#L242)

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

### getPerturbationMap

▸ **getPerturbationMap**(): *any*

Returns the current perturbation map.

**Returns:** *any*

The current perturbation map.

Defined in: [packages/engine/src/renderer/postprocessing/GlitchEffect.ts:209](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/GlitchEffect.ts#L209)

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

By overriding this method you gain access to the renderer. You'll also be
able to configure your custom render targets to use the appropriate format
(RGB or RGBA).

The provided renderer can be used to warm up special off-screen render
targets by performing a preliminary render operation.

The [EffectPass](renderer_postprocessing_passes_effectpass.effectpass.md) calls this method during its own initialization
which happens after the size has been set.

**`example`** if(!alpha && frameBufferType === UnsignedByteType) { this.myRenderTarget.texture.format = RGBFormat; }

#### Parameters:

Name | Type | Description |
:------ | :------ | :------ |
`renderer` | *any* | The renderer.   |
`alpha` | *any* | Whether the renderer uses the alpha channel or not.   |
`frameBufferType` | *any* | The type of the main frame buffers.   |

**Returns:** *void*

Inherited from: [Effect](renderer_postprocessing_effect.effect.md)

Defined in: [packages/engine/src/renderer/postprocessing/Effect.ts:275](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/Effect.ts#L275)

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

### setPerturbationMap

▸ **setPerturbationMap**(`map`: *any*): *void*

Replaces the current perturbation map with the given one.

The current map will be disposed if it was generated by this effect.

#### Parameters:

Name | Type | Description |
:------ | :------ | :------ |
`map` | *any* | The new perturbation map.    |

**Returns:** *void*

Defined in: [packages/engine/src/renderer/postprocessing/GlitchEffect.ts:221](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/GlitchEffect.ts#L221)

___

### setSize

▸ **setSize**(`width`: *any*, `height`: *any*): *void*

Updates the size of this effect.

You may override this method in case you want to be informed about the main
render size.

The [EffectPass](renderer_postprocessing_passes_effectpass.effectpass.md) calls this method before this effect is initialized
and every time its own size is updated.

**`example`** this.myRenderTarget.setSize(width, height);

#### Parameters:

Name | Type | Description |
:------ | :------ | :------ |
`width` | *any* | The width.   |
`height` | *any* | The height.   |

**Returns:** *void*

Inherited from: [Effect](renderer_postprocessing_effect.effect.md)

Defined in: [packages/engine/src/renderer/postprocessing/Effect.ts:254](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/Effect.ts#L254)

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

Defined in: [packages/engine/src/renderer/postprocessing/GlitchEffect.ts:257](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/GlitchEffect.ts#L257)
