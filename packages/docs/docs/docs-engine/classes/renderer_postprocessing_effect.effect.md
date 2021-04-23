---
id: "renderer_postprocessing_effect.effect"
title: "Class: Effect"
sidebar_label: "Effect"
custom_edit_url: null
hide_title: true
---

# Class: Effect

[renderer/postprocessing/Effect](../modules/renderer_postprocessing_effect.md).Effect

An abstract effect.

Effects can be combined using the [EffectPass](renderer_postprocessing_passes_effectpass.effectpass.md).

**`implements`** {Initializable}

**`implements`** {Resizable}

**`implements`** {Disposable}

## Hierarchy

* *EventDispatcher*

  ↳ **Effect**

  ↳↳ [*BloomEffect*](renderer_postprocessing_bloomeffect.bloomeffect.md)

  ↳↳ [*BokehEffect*](renderer_postprocessing_bokeheffect.bokeheffect.md)

  ↳↳ [*BrightnessContrastEffect*](renderer_postprocessing_brightnesscontrasteffect.brightnesscontrasteffect.md)

  ↳↳ [*ChromaticAberrationEffect*](renderer_postprocessing_chromaticaberrationeffect.chromaticaberrationeffect.md)

  ↳↳ [*ColorAverageEffect*](renderer_postprocessing_coloraverageeffect.coloraverageeffect.md)

  ↳↳ [*ColorDepthEffect*](renderer_postprocessing_colordeptheffect.colordeptheffect.md)

  ↳↳ [*DepthEffect*](renderer_postprocessing_deptheffect.deptheffect.md)

  ↳↳ [*DepthOfFieldEffect*](renderer_postprocessing_depthoffieldeffect.depthoffieldeffect.md)

  ↳↳ [*DotScreenEffect*](renderer_postprocessing_dotscreeneffect.dotscreeneffect.md)

  ↳↳ [*FXAAEffect*](renderer_postprocessing_fxaaeffect.fxaaeffect.md)

  ↳↳ [*GammaCorrectionEffect*](renderer_postprocessing_gammacorrectioneffect.gammacorrectioneffect.md)

  ↳↳ [*GlitchEffect*](renderer_postprocessing_glitcheffect.glitcheffect.md)

  ↳↳ [*GodRaysEffect*](renderer_postprocessing_godrayseffect.godrayseffect.md)

  ↳↳ [*GridEffect*](renderer_postprocessing_grideffect.grideffect.md)

  ↳↳ [*HueSaturationEffect*](renderer_postprocessing_huesaturationeffect.huesaturationeffect.md)

  ↳↳ [*LinearTosRGBEffect*](renderer_postprocessing_lineartosrgbeffect.lineartosrgbeffect.md)

  ↳↳ [*NoiseEffect*](renderer_postprocessing_noiseeffect.noiseeffect.md)

  ↳↳ [*OutlineEffect*](renderer_postprocessing_outlineeffect.outlineeffect.md)

  ↳↳ [*PixelationEffect*](renderer_postprocessing_pixelationeffect.pixelationeffect.md)

  ↳↳ [*RealisticBokehEffect*](renderer_postprocessing_realisticbokeheffect.realisticbokeheffect.md)

  ↳↳ [*SSAOEffect*](renderer_postprocessing_ssaoeffect.ssaoeffect.md)

  ↳↳ [*ScanlineEffect*](renderer_postprocessing_scanlineeffect.scanlineeffect.md)

  ↳↳ [*SepiaEffect*](renderer_postprocessing_sepiaeffect.sepiaeffect.md)

  ↳↳ [*ShockWaveEffect*](renderer_postprocessing_shockwaveeffect.shockwaveeffect.md)

  ↳↳ [*TextureEffect*](renderer_postprocessing_textureeffect.textureeffect.md)

  ↳↳ [*ToneMappingEffect*](renderer_postprocessing_tonemappingeffect.tonemappingeffect.md)

  ↳↳ [*VignetteEffect*](renderer_postprocessing_vignetteeffect.vignetteeffect.md)

## Constructors

### constructor

\+ **new Effect**(`name`: *any*, `fragmentShader`: *any*, `__namedParameters?`: { `attributes`:  ; `blendFunction`:  ; `defines`:  ; `extensions`:  ; `uniforms`:  ; `vertexShader`:   }): [*Effect*](renderer_postprocessing_effect.effect.md)

Constructs a new effect.

#### Parameters:

Name | Type | Description |
:------ | :------ | :------ |
`name` | *any* | The name of this effect. Doesn't have to be unique.   |
`fragmentShader` | *any* | The fragment shader. This shader is required.   |
`__namedParameters` | *object* | - |
`__namedParameters.attributes` | - | - |
`__namedParameters.blendFunction` | - | - |
`__namedParameters.defines` | - | - |
`__namedParameters.extensions` | - | - |
`__namedParameters.uniforms` | - | - |
`__namedParameters.vertexShader` | - | - |

**Returns:** [*Effect*](renderer_postprocessing_effect.effect.md)

Overrides: void

Defined in: [packages/engine/src/renderer/postprocessing/Effect.ts:23](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/Effect.ts#L23)

## Properties

### attributes

• **attributes**: *number*

Defined in: [packages/engine/src/renderer/postprocessing/Effect.ts:17](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/Effect.ts#L17)

___

### blendMode

• **blendMode**: [*BlendMode*](renderer_postprocessing_blending_blendmode.blendmode.md)

Defined in: [packages/engine/src/renderer/postprocessing/Effect.ts:23](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/Effect.ts#L23)

___

### defines

• **defines**: *Map*<any, any\>

Defined in: [packages/engine/src/renderer/postprocessing/Effect.ts:20](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/Effect.ts#L20)

___

### extensions

• **extensions**: *any*

Defined in: [packages/engine/src/renderer/postprocessing/Effect.ts:22](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/Effect.ts#L22)

___

### fragmentShader

• **fragmentShader**: *any*

Defined in: [packages/engine/src/renderer/postprocessing/Effect.ts:18](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/Effect.ts#L18)

___

### name

• **name**: *any*

Defined in: [packages/engine/src/renderer/postprocessing/Effect.ts:16](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/Effect.ts#L16)

___

### uniforms

• **uniforms**: *Map*<any, any\>

Defined in: [packages/engine/src/renderer/postprocessing/Effect.ts:21](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/Effect.ts#L21)

___

### vertexShader

• **vertexShader**: *any*

Defined in: [packages/engine/src/renderer/postprocessing/Effect.ts:19](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/Effect.ts#L19)

## Methods

### dispose

▸ **dispose**(): *void*

Performs a shallow search for properties that define a dispose method and
deletes them. The effect will be inoperative after this method was called!

The [EffectPass](renderer_postprocessing_passes_effectpass.effectpass.md) calls this method when it is being destroyed. Do not
call this method directly.

**Returns:** *void*

Defined in: [packages/engine/src/renderer/postprocessing/Effect.ts:285](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/Effect.ts#L285)

___

### getAttributes

▸ **getAttributes**(): *number*

Returns the effect attributes.

**Returns:** *number*

The attributes.

Defined in: [packages/engine/src/renderer/postprocessing/Effect.ts:149](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/Effect.ts#L149)

___

### getFragmentShader

▸ **getFragmentShader**(): *any*

Returns the fragment shader.

**Returns:** *any*

The fragment shader.

Defined in: [packages/engine/src/renderer/postprocessing/Effect.ts:174](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/Effect.ts#L174)

___

### getVertexShader

▸ **getVertexShader**(): *any*

Returns the vertex shader.

**Returns:** *any*

The vertex shader.

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

Defined in: [packages/engine/src/renderer/postprocessing/Effect.ts:163](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/Effect.ts#L163)

___

### setChanged

▸ `Protected`**setChanged**(): *void*

Informs the associated [EffectPass](renderer_postprocessing_passes_effectpass.effectpass.md) that this effect has changed in
a way that requires a shader recompilation.

Call this method after changing macro definitions or extensions and after
adding or removing uniforms.

**Returns:** *void*

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

Defined in: [packages/engine/src/renderer/postprocessing/Effect.ts:207](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/Effect.ts#L207)

___

### update

▸ **update**(`renderer`: *any*, `inputBuffer`: *any*, `deltaTime`: *number*): *void*

Updates the effect by performing supporting operations.

This method is called by the [EffectPass](renderer_postprocessing_passes_effectpass.effectpass.md) right before the main
fullscreen render operation, even if the blend function is set to `SKIP`.

You may override this method if you need to render additional off-screen
textures or update custom uniforms.

#### Parameters:

Name | Type | Description |
:------ | :------ | :------ |
`renderer` | *any* | The renderer.   |
`inputBuffer` | *any* | A frame buffer that contains the result of the previous pass.   |
`deltaTime` | *number* | - |

**Returns:** *void*

Defined in: [packages/engine/src/renderer/postprocessing/Effect.ts:238](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/Effect.ts#L238)
