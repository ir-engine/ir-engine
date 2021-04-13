---
id: "renderer_postprocessing_godrayseffect.godrayseffect"
title: "Class: GodRaysEffect"
sidebar_label: "GodRaysEffect"
custom_edit_url: null
hide_title: true
---

# Class: GodRaysEffect

[renderer/postprocessing/GodRaysEffect](../modules/renderer_postprocessing_godrayseffect.md).GodRaysEffect

A god rays effect.

## Hierarchy

* [*Effect*](renderer_postprocessing_effect.effect.md)

  ↳ **GodRaysEffect**

## Constructors

### constructor

\+ **new GodRaysEffect**(`camera`: *any*, `lightSource`: *any*, `__namedParameters?`: { `blendFunction`:  ; `blur`:  ; `clampMax`:  ; `decay`:  ; `density`:  ; `exposure`:  ; `height`:  ; `kernelSize`:  ; `resolutionScale`:  ; `samples`:  ; `weight`:  ; `width`:   }): [*GodRaysEffect*](renderer_postprocessing_godrayseffect.godrayseffect.md)

Constructs a new god rays effect.

#### Parameters:

Name | Type | Description |
:------ | :------ | :------ |
`camera` | *any* | The main camera.   |
`lightSource` | *any* | The light source. Must not write depth and has to be flagged as transparent.   |
`__namedParameters` | *object* | - |
`__namedParameters.blendFunction` | - | - |
`__namedParameters.blur` | - | - |
`__namedParameters.clampMax` | - | - |
`__namedParameters.decay` | - | - |
`__namedParameters.density` | - | - |
`__namedParameters.exposure` | - | - |
`__namedParameters.height` | - | - |
`__namedParameters.kernelSize` | - | - |
`__namedParameters.resolutionScale` | - | - |
`__namedParameters.samples` | - | - |
`__namedParameters.weight` | - | - |
`__namedParameters.width` | - | - |

**Returns:** [*GodRaysEffect*](renderer_postprocessing_godrayseffect.godrayseffect.md)

Overrides: [Effect](renderer_postprocessing_effect.effect.md)

Defined in: [packages/engine/src/renderer/postprocessing/GodRaysEffect.ts:62](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/GodRaysEffect.ts#L62)

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

Defined in: [packages/engine/src/renderer/postprocessing/GodRaysEffect.ts:60](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/GodRaysEffect.ts#L60)

___

### camera

• **camera**: *any*

Defined in: [packages/engine/src/renderer/postprocessing/GodRaysEffect.ts:51](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/GodRaysEffect.ts#L51)

___

### clearPass

• **clearPass**: *any*

Defined in: [packages/engine/src/renderer/postprocessing/GodRaysEffect.ts:59](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/GodRaysEffect.ts#L59)

___

### defines

• **defines**: *Map*<any, any\>

Inherited from: [Effect](renderer_postprocessing_effect.effect.md).[defines](renderer_postprocessing_effect.effect.md#defines)

Defined in: [packages/engine/src/renderer/postprocessing/Effect.ts:20](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/Effect.ts#L20)

___

### depthMaskPass

• **depthMaskPass**: *any*

Defined in: [packages/engine/src/renderer/postprocessing/GodRaysEffect.ts:61](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/GodRaysEffect.ts#L61)

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

### godRaysPass

• **godRaysPass**: *any*

Defined in: [packages/engine/src/renderer/postprocessing/GodRaysEffect.ts:62](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/GodRaysEffect.ts#L62)

___

### lightScene

• **lightScene**: *any*

Defined in: [packages/engine/src/renderer/postprocessing/GodRaysEffect.ts:53](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/GodRaysEffect.ts#L53)

___

### lightSource

• **lightSource**: *any*

Defined in: [packages/engine/src/renderer/postprocessing/GodRaysEffect.ts:52](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/GodRaysEffect.ts#L52)

___

### name

• **name**: *any*

Inherited from: [Effect](renderer_postprocessing_effect.effect.md).[name](renderer_postprocessing_effect.effect.md#name)

Defined in: [packages/engine/src/renderer/postprocessing/Effect.ts:16](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/Effect.ts#L16)

___

### renderPassLight

• **renderPassLight**: *any*

Defined in: [packages/engine/src/renderer/postprocessing/GodRaysEffect.ts:58](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/GodRaysEffect.ts#L58)

___

### renderTargetA

• **renderTargetA**: *any*

Defined in: [packages/engine/src/renderer/postprocessing/GodRaysEffect.ts:55](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/GodRaysEffect.ts#L55)

___

### renderTargetB

• **renderTargetB**: *any*

Defined in: [packages/engine/src/renderer/postprocessing/GodRaysEffect.ts:56](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/GodRaysEffect.ts#L56)

___

### renderTargetLight

• **renderTargetLight**: *any*

Defined in: [packages/engine/src/renderer/postprocessing/GodRaysEffect.ts:57](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/GodRaysEffect.ts#L57)

___

### screenPosition

• **screenPosition**: *any*

Defined in: [packages/engine/src/renderer/postprocessing/GodRaysEffect.ts:54](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/GodRaysEffect.ts#L54)

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

• get **blur**(): *any*

Indicates whether the god rays should be blurred to reduce artifacts.

**Returns:** *any*

Defined in: [packages/engine/src/renderer/postprocessing/GodRaysEffect.ts:360](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/GodRaysEffect.ts#L360)

• set **blur**(`value`: *any*): *void*

Indicates whether the god rays should be blurred to reduce artifacts.

#### Parameters:

Name | Type |
:------ | :------ |
`value` | *any* |

**Returns:** *void*

Defined in: [packages/engine/src/renderer/postprocessing/GodRaysEffect.ts:368](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/GodRaysEffect.ts#L368)

___

### dithering

• get **dithering**(): *any*

Indicates whether dithering is enabled.

**`deprecated`** Set the frameBufferType of the EffectComposer to HalfFloatType instead.

**Returns:** *any*

Defined in: [packages/engine/src/renderer/postprocessing/GodRaysEffect.ts:336](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/GodRaysEffect.ts#L336)

• set **dithering**(`value`: *any*): *void*

Enables or disables dithering.

**`deprecated`** Set the frameBufferType of the EffectComposer to HalfFloatType instead.

#### Parameters:

Name | Type |
:------ | :------ |
`value` | *any* |

**Returns:** *void*

Defined in: [packages/engine/src/renderer/postprocessing/GodRaysEffect.ts:347](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/GodRaysEffect.ts#L347)

___

### godRaysMaterial

• get **godRaysMaterial**(): *any*

The internal god rays material.

**Returns:** *any*

Defined in: [packages/engine/src/renderer/postprocessing/GodRaysEffect.ts:271](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/GodRaysEffect.ts#L271)

___

### height

• get **height**(): *any*

The current height of the internal render targets.

**`deprecated`** Use resolution.height instead.

**Returns:** *any*

Defined in: [packages/engine/src/renderer/postprocessing/GodRaysEffect.ts:314](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/GodRaysEffect.ts#L314)

• set **height**(`value`: *any*): *void*

Sets the render height.

**`deprecated`** Use resolution.height instead.

#### Parameters:

Name | Type |
:------ | :------ |
`value` | *any* |

**Returns:** *void*

Defined in: [packages/engine/src/renderer/postprocessing/GodRaysEffect.ts:325](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/GodRaysEffect.ts#L325)

___

### kernelSize

• get **kernelSize**(): *any*

The blur kernel size.

**`deprecated`** Use blurPass.kernelSize instead.

**Returns:** *any*

Defined in: [packages/engine/src/renderer/postprocessing/GodRaysEffect.ts:379](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/GodRaysEffect.ts#L379)

• set **kernelSize**(`value`: *any*): *void*

Sets the blur kernel size.

**`deprecated`** Use blurPass.kernelSize instead.

#### Parameters:

Name | Type |
:------ | :------ |
`value` | *any* |

**Returns:** *void*

Defined in: [packages/engine/src/renderer/postprocessing/GodRaysEffect.ts:390](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/GodRaysEffect.ts#L390)

___

### resolution

• get **resolution**(): *any*

The resolution of this effect.

**Returns:** *any*

Defined in: [packages/engine/src/renderer/postprocessing/GodRaysEffect.ts:281](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/GodRaysEffect.ts#L281)

___

### samples

• get **samples**(): *any*

The number of samples per pixel.

**Returns:** *any*

Defined in: [packages/engine/src/renderer/postprocessing/GodRaysEffect.ts:422](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/GodRaysEffect.ts#L422)

• set **samples**(`value`: *any*): *void*

A higher sample count improves quality at the cost of performance.

#### Parameters:

Name | Type |
:------ | :------ |
`value` | *any* |

**Returns:** *void*

Defined in: [packages/engine/src/renderer/postprocessing/GodRaysEffect.ts:432](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/GodRaysEffect.ts#L432)

___

### texture

• get **texture**(): *any*

A texture that contains the intermediate result of this effect.

This texture will be applied to the scene colors unless the blend function
is set to `SKIP`.

**Returns:** *any*

Defined in: [packages/engine/src/renderer/postprocessing/GodRaysEffect.ts:261](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/GodRaysEffect.ts#L261)

___

### width

• get **width**(): *any*

The current width of the internal render targets.

**`deprecated`** Use resolution.width instead.

**Returns:** *any*

Defined in: [packages/engine/src/renderer/postprocessing/GodRaysEffect.ts:292](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/GodRaysEffect.ts#L292)

• set **width**(`value`: *any*): *void*

Sets the render width.

**`deprecated`** Use resolution.width instead.

#### Parameters:

Name | Type |
:------ | :------ |
`value` | *any* |

**Returns:** *void*

Defined in: [packages/engine/src/renderer/postprocessing/GodRaysEffect.ts:303](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/GodRaysEffect.ts#L303)

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

Defined in: [packages/engine/src/renderer/postprocessing/GodRaysEffect.ts:401](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/GodRaysEffect.ts#L401)

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

Defined in: [packages/engine/src/renderer/postprocessing/GodRaysEffect.ts:547](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/GodRaysEffect.ts#L547)

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

#### Parameters:

Name | Type | Default value | Description |
:------ | :------ | :------ | :------ |
`depthTexture` | *any* | - | A depth texture.   |
`depthPacking` | *number* | 0 | - |

**Returns:** *void*

Overrides: [Effect](renderer_postprocessing_effect.effect.md)

Defined in: [packages/engine/src/renderer/postprocessing/GodRaysEffect.ts:443](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/GodRaysEffect.ts#L443)

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

Defined in: [packages/engine/src/renderer/postprocessing/GodRaysEffect.ts:412](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/GodRaysEffect.ts#L412)

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

Defined in: [packages/engine/src/renderer/postprocessing/GodRaysEffect.ts:525](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/GodRaysEffect.ts#L525)

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

Defined in: [packages/engine/src/renderer/postprocessing/GodRaysEffect.ts:457](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/GodRaysEffect.ts#L457)
