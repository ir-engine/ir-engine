---
id: "renderer_postprocessing_textureeffect.textureeffect"
title: "Class: TextureEffect"
sidebar_label: "TextureEffect"
custom_edit_url: null
hide_title: true
---

# Class: TextureEffect

[renderer/postprocessing/TextureEffect](../modules/renderer_postprocessing_textureeffect.md).TextureEffect

A texture effect.

## Hierarchy

* [*Effect*](renderer_postprocessing_effect.effect.md)

  ↳ **TextureEffect**

## Constructors

### constructor

\+ **new TextureEffect**(`__namedParameters?`: { `aspectCorrection`:  ; `blendFunction`:  ; `texture`:   }): [*TextureEffect*](renderer_postprocessing_textureeffect.textureeffect.md)

Constructs a new texture effect.

#### Parameters:

Name | Type |
:------ | :------ |
`__namedParameters` | *object* |
`__namedParameters.aspectCorrection` | - |
`__namedParameters.blendFunction` | - |
`__namedParameters.texture` | - |

**Returns:** [*TextureEffect*](renderer_postprocessing_textureeffect.textureeffect.md)

Overrides: [Effect](renderer_postprocessing_effect.effect.md)

Defined in: [packages/engine/src/renderer/postprocessing/TextureEffect.ts:12](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/TextureEffect.ts#L12)

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

### name

• **name**: *any*

Inherited from: [Effect](renderer_postprocessing_effect.effect.md).[name](renderer_postprocessing_effect.effect.md#name)

Defined in: [packages/engine/src/renderer/postprocessing/Effect.ts:16](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/Effect.ts#L16)

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

### aspectCorrection

• get **aspectCorrection**(): *any*

Indicates whether aspect correction is enabled.

If enabled, the texture can be scaled using the `scale` uniform.

**`deprecated`** Use uvTransform instead for full control over the texture coordinates.

**Returns:** *any*

Defined in: [packages/engine/src/renderer/postprocessing/TextureEffect.ts:91](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/TextureEffect.ts#L91)

• set **aspectCorrection**(`value`: *any*): *void*

Enables or disables aspect correction.

If enabled, the texture can be scaled using the `scale` uniform.

**`deprecated`** Use uvTransform instead for full control over the texture coordinates.

#### Parameters:

Name | Type |
:------ | :------ |
`value` | *any* |

**Returns:** *void*

Defined in: [packages/engine/src/renderer/postprocessing/TextureEffect.ts:102](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/TextureEffect.ts#L102)

___

### texture

• get **texture**(): *any*

The texture.

**Returns:** *any*

Defined in: [packages/engine/src/renderer/postprocessing/TextureEffect.ts:49](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/TextureEffect.ts#L49)

• set **texture**(`value`: *any*): *void*

Sets the texture.

#### Parameters:

Name | Type |
:------ | :------ |
`value` | *any* |

**Returns:** *void*

Defined in: [packages/engine/src/renderer/postprocessing/TextureEffect.ts:59](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/TextureEffect.ts#L59)

___

### uvTransform

• get **uvTransform**(): *any*

Indicates whether the texture UV coordinates will be transformed using the
transformation matrix of the texture.

Cannot be used if aspect correction is enabled.

**Returns:** *any*

Defined in: [packages/engine/src/renderer/postprocessing/TextureEffect.ts:129](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/TextureEffect.ts#L129)

• set **uvTransform**(`value`: *any*): *void*

Enables or disables texture UV transformation.

Cannot be used if aspect correction is enabled.

#### Parameters:

Name | Type |
:------ | :------ |
`value` | *any* |

**Returns:** *void*

Defined in: [packages/engine/src/renderer/postprocessing/TextureEffect.ts:139](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/TextureEffect.ts#L139)

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

### setTextureSwizzleRGBA

▸ **setTextureSwizzleRGBA**(`r`: *any*, `g?`: *any*, `b?`: *any*, `a?`: *any*): *void*

Sets the swizzles that will be applied to the `r`, `g`, `b`, and `a`
components of a texel before it is written to the output color.

#### Parameters:

Name | Type | Description |
:------ | :------ | :------ |
`r` | *any* | The swizzle for the `r` component.   |
`g` | *any* | - |
`b` | *any* | - |
`a` | *any* | - |

**Returns:** *void*

Defined in: [packages/engine/src/renderer/postprocessing/TextureEffect.ts:169](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/TextureEffect.ts#L169)

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

Defined in: [packages/engine/src/renderer/postprocessing/TextureEffect.ts:190](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/TextureEffect.ts#L190)
