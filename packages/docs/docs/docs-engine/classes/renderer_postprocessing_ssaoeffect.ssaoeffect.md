---
id: "renderer_postprocessing_ssaoeffect.ssaoeffect"
title: "Class: SSAOEffect"
sidebar_label: "SSAOEffect"
custom_edit_url: null
hide_title: true
---

# Class: SSAOEffect

[renderer/postprocessing/SSAOEffect](../modules/renderer_postprocessing_ssaoeffect.md).SSAOEffect

A Screen Space Ambient Occlusion (SSAO) effect.

For high quality visuals use two SSAO effect instances in a row with
different radii, one for rough AO and one for fine details.

This effect supports depth-aware upsampling and should be rendered at a lower
resolution. The resolution should match that of the downsampled normals and
depth. If you intend to render SSAO at full resolution, do not provide a
downsampled `normalDepthBuffer` and make sure to disable
`depthAwareUpsampling`.

It's recommended to specify a relative render resolution using the
`resolutionScale` constructor parameter to avoid undesired sampling patterns.

Based on "Scalable Ambient Obscurance" by Morgan McGuire et al. and
"Depth-aware upsampling experiments" by Eleni Maria Stea:
https://research.nvidia.com/publication/scalable-ambient-obscurance
https://eleni.mutantstargoat.com/hikiko/on-depth-aware-upsampling

## Hierarchy

* [*Effect*](renderer_postprocessing_effect.effect.md)

  ↳ **SSAOEffect**

## Constructors

### constructor

\+ **new SSAOEffect**(`camera`: *any*, `normalBuffer`: *any*, `__namedParameters?`: { `bias`:  ; `blendFunction`:  ; `color`:  ; `depthAwareUpsampling`:  ; `distanceFalloff`:  ; `distanceScaling`:  ; `distanceThreshold`:  ; `fade`:  ; `height`:  ; `intensity`:  ; `luminanceInfluence`:  ; `minRadiusScale`:  ; `normalDepthBuffer`:  ; `radius`:  ; `rangeFalloff`:  ; `rangeThreshold`:  ; `resolutionScale`:  ; `rings`:  ; `samples`:  ; `width`:   }): [*SSAOEffect*](renderer_postprocessing_ssaoeffect.ssaoeffect.md)

Constructs a new SSAO effect.

**`todo`** Move normalBuffer to options.

#### Parameters:

Name | Type | Description |
:------ | :------ | :------ |
`camera` | *any* | The main camera.   |
`normalBuffer` | *any* | A texture that contains the scene normals. May be null if a normalDepthBuffer is provided. See [NormalPass](renderer_postprocessing_passes_normalpass.normalpass.md).   |
`__namedParameters` | *object* | - |
`__namedParameters.bias` | - | - |
`__namedParameters.blendFunction` | - | - |
`__namedParameters.color` | - | - |
`__namedParameters.depthAwareUpsampling` | - | - |
`__namedParameters.distanceFalloff` | - | - |
`__namedParameters.distanceScaling` | - | - |
`__namedParameters.distanceThreshold` | - | - |
`__namedParameters.fade` | - | - |
`__namedParameters.height` | - | - |
`__namedParameters.intensity` | - | - |
`__namedParameters.luminanceInfluence` | - | - |
`__namedParameters.minRadiusScale` | - | - |
`__namedParameters.normalDepthBuffer` | - | - |
`__namedParameters.radius` | - | - |
`__namedParameters.rangeFalloff` | - | - |
`__namedParameters.rangeThreshold` | - | - |
`__namedParameters.resolutionScale` | - | - |
`__namedParameters.rings` | - | - |
`__namedParameters.samples` | - | - |
`__namedParameters.width` | - | - |

**Returns:** [*SSAOEffect*](renderer_postprocessing_ssaoeffect.ssaoeffect.md)

Overrides: [Effect](renderer_postprocessing_effect.effect.md)

Defined in: [packages/engine/src/renderer/postprocessing/SSAOEffect.ts:53](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/SSAOEffect.ts#L53)

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

### camera

• **camera**: *any*

Defined in: [packages/engine/src/renderer/postprocessing/SSAOEffect.ts:52](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/SSAOEffect.ts#L52)

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

### r

• **r**: *number*

Defined in: [packages/engine/src/renderer/postprocessing/SSAOEffect.ts:51](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/SSAOEffect.ts#L51)

___

### renderTargetAO

• **renderTargetAO**: *any*

Defined in: [packages/engine/src/renderer/postprocessing/SSAOEffect.ts:49](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/SSAOEffect.ts#L49)

___

### resolution

• **resolution**: [*Resizer*](renderer_postprocessing_core_resizer.resizer.md)

Defined in: [packages/engine/src/renderer/postprocessing/SSAOEffect.ts:50](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/SSAOEffect.ts#L50)

___

### ssaoPass

• **ssaoPass**: [*ShaderPass*](renderer_postprocessing_passes_shaderpass.shaderpass.md)

Defined in: [packages/engine/src/renderer/postprocessing/SSAOEffect.ts:53](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/SSAOEffect.ts#L53)

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

### color

• get **color**(): *any*

The color of the ambient occlusion.

**Returns:** *any*

Defined in: [packages/engine/src/renderer/postprocessing/SSAOEffect.ts:357](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/SSAOEffect.ts#L357)

• set **color**(`value`: *any*): *void*

Sets the color of the ambient occlusion.

Set to `null` to disable colorization.

#### Parameters:

Name | Type |
:------ | :------ |
`value` | *any* |

**Returns:** *void*

Defined in: [packages/engine/src/renderer/postprocessing/SSAOEffect.ts:369](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/SSAOEffect.ts#L369)

___

### depthAwareUpsampling

• get **depthAwareUpsampling**(): *any*

Indicates whether depth-aware upsampling is enabled.

**Returns:** *any*

Defined in: [packages/engine/src/renderer/postprocessing/SSAOEffect.ts:299](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/SSAOEffect.ts#L299)

• set **depthAwareUpsampling**(`value`: *any*): *void*

Enables or disables depth-aware upsampling.

#### Parameters:

Name | Type |
:------ | :------ |
`value` | *any* |

**Returns:** *void*

Defined in: [packages/engine/src/renderer/postprocessing/SSAOEffect.ts:309](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/SSAOEffect.ts#L309)

___

### distanceScaling

• get **distanceScaling**(): *boolean*

Indicates whether distance-based radius scaling is enabled.

**Returns:** *boolean*

Defined in: [packages/engine/src/renderer/postprocessing/SSAOEffect.ts:327](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/SSAOEffect.ts#L327)

• set **distanceScaling**(`value`: *boolean*): *void*

Enables or disables distance-based radius scaling.

#### Parameters:

Name | Type |
:------ | :------ |
`value` | *boolean* |

**Returns:** *void*

Defined in: [packages/engine/src/renderer/postprocessing/SSAOEffect.ts:337](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/SSAOEffect.ts#L337)

___

### radius

• get **radius**(): *number*

The occlusion sampling radius.

**Returns:** *number*

Defined in: [packages/engine/src/renderer/postprocessing/SSAOEffect.ts:273](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/SSAOEffect.ts#L273)

• set **radius**(`value`: *number*): *void*

Sets the occlusion sampling radius. Range [1e-6, 1.0].

#### Parameters:

Name | Type |
:------ | :------ |
`value` | *number* |

**Returns:** *void*

Defined in: [packages/engine/src/renderer/postprocessing/SSAOEffect.ts:283](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/SSAOEffect.ts#L283)

___

### rings

• get **rings**(): *number*

The amount of spiral turns in the occlusion sampling pattern.

**Returns:** *number*

Defined in: [packages/engine/src/renderer/postprocessing/SSAOEffect.ts:251](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/SSAOEffect.ts#L251)

• set **rings**(`value`: *number*): *void*

Sets the amount of spiral turns in the occlusion sampling pattern.

#### Parameters:

Name | Type |
:------ | :------ |
`value` | *number* |

**Returns:** *void*

Defined in: [packages/engine/src/renderer/postprocessing/SSAOEffect.ts:261](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/SSAOEffect.ts#L261)

___

### samples

• get **samples**(): *number*

The amount of occlusion samples per pixel.

**Returns:** *number*

Defined in: [packages/engine/src/renderer/postprocessing/SSAOEffect.ts:228](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/SSAOEffect.ts#L228)

• set **samples**(`value`: *number*): *void*

Sets the amount of occlusion samples per pixel.

#### Parameters:

Name | Type |
:------ | :------ |
`value` | *number* |

**Returns:** *void*

Defined in: [packages/engine/src/renderer/postprocessing/SSAOEffect.ts:238](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/SSAOEffect.ts#L238)

___

### ssaoMaterial

• get **ssaoMaterial**(): *any*

The SSAO material.

**Returns:** *any*

Defined in: [packages/engine/src/renderer/postprocessing/SSAOEffect.ts:218](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/SSAOEffect.ts#L218)

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

#### Parameters:

Name | Type | Default value | Description |
:------ | :------ | :------ | :------ |
`depthTexture` | *any* | - | A depth texture.   |
`depthPacking` | *number* | 0 | - |

**Returns:** *void*

Overrides: [Effect](renderer_postprocessing_effect.effect.md)

Defined in: [packages/engine/src/renderer/postprocessing/SSAOEffect.ts:425](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/SSAOEffect.ts#L425)

___

### setDistanceCutoff

▸ **setDistanceCutoff**(`threshold`: *any*, `falloff`: *any*): *void*

Sets the occlusion distance cutoff.

#### Parameters:

Name | Type | Description |
:------ | :------ | :------ |
`threshold` | *any* | The distance threshold. Range [0.0, 1.0].   |
`falloff` | *any* | The falloff. Range [0.0, 1.0].    |

**Returns:** *void*

Defined in: [packages/engine/src/renderer/postprocessing/SSAOEffect.ts:397](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/SSAOEffect.ts#L397)

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

### setProximityCutoff

▸ **setProximityCutoff**(`threshold`: *any*, `falloff`: *any*): *void*

Sets the occlusion proximity cutoff.

#### Parameters:

Name | Type | Description |
:------ | :------ | :------ |
`threshold` | *any* | The range threshold. Range [0.0, 1.0].   |
`falloff` | *any* | The falloff. Range [0.0, 1.0].    |

**Returns:** *void*

Defined in: [packages/engine/src/renderer/postprocessing/SSAOEffect.ts:411](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/SSAOEffect.ts#L411)

___

### setSize

▸ **setSize**(`width`: *any*, `height`: *any*): *void*

Updates the camera projection matrix uniforms and the size of internal
render targets.

#### Parameters:

Name | Type | Description |
:------ | :------ | :------ |
`width` | *any* | The width.   |
`height` | *any* | The height.    |

**Returns:** *void*

Overrides: [Effect](renderer_postprocessing_effect.effect.md)

Defined in: [packages/engine/src/renderer/postprocessing/SSAOEffect.ts:454](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/SSAOEffect.ts#L454)

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

Defined in: [packages/engine/src/renderer/postprocessing/SSAOEffect.ts:442](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/SSAOEffect.ts#L442)
