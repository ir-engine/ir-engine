---
id: "renderer_postprocessing_depthoffieldeffect.depthoffieldeffect"
title: "Class: DepthOfFieldEffect"
sidebar_label: "DepthOfFieldEffect"
custom_edit_url: null
hide_title: true
---

# Class: DepthOfFieldEffect

[renderer/postprocessing/DepthOfFieldEffect](../modules/renderer_postprocessing_depthoffieldeffect.md).DepthOfFieldEffect

A depth of field effect.

Based on a graphics study by Adrian Courrèges and an article by Steve Avery:
 https://www.adriancourreges.com/blog/2016/09/09/doom-2016-graphics-study/
 https://pixelmischiefblog.wordpress.com/2016/11/25/bokeh-depth-of-field/

## Hierarchy

* [*Effect*](renderer_postprocessing_effect.effect.md)

  ↳ **DepthOfFieldEffect**

## Constructors

### constructor

\+ **new DepthOfFieldEffect**(`camera`: *any*, `__namedParameters?`: { `blendFunction`:  ; `bokehScale`:  ; `focalLength`:  ; `focusDistance`:  ; `height`:  ; `width`:   }): [*DepthOfFieldEffect*](renderer_postprocessing_depthoffieldeffect.depthoffieldeffect.md)

Constructs a new depth of field effect.

#### Parameters:

Name | Type | Description |
:------ | :------ | :------ |
`camera` | *any* | The main camera.   |
`__namedParameters` | *object* | - |
`__namedParameters.blendFunction` | - | - |
`__namedParameters.bokehScale` | - | - |
`__namedParameters.focalLength` | - | - |
`__namedParameters.focusDistance` | - | - |
`__namedParameters.height` | - | - |
`__namedParameters.width` | - | - |

**Returns:** [*DepthOfFieldEffect*](renderer_postprocessing_depthoffieldeffect.depthoffieldeffect.md)

Overrides: [Effect](renderer_postprocessing_effect.effect.md)

Defined in: [packages/engine/src/renderer/postprocessing/DepthOfFieldEffect.ts:39](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/DepthOfFieldEffect.ts#L39)

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

Defined in: [packages/engine/src/renderer/postprocessing/DepthOfFieldEffect.ts:33](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/DepthOfFieldEffect.ts#L33)

___

### bokehFarBasePass

• **bokehFarBasePass**: *any*

Defined in: [packages/engine/src/renderer/postprocessing/DepthOfFieldEffect.ts:37](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/DepthOfFieldEffect.ts#L37)

___

### bokehFarFillPass

• **bokehFarFillPass**: *any*

Defined in: [packages/engine/src/renderer/postprocessing/DepthOfFieldEffect.ts:38](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/DepthOfFieldEffect.ts#L38)

___

### bokehNearBasePass

• **bokehNearBasePass**: *any*

Defined in: [packages/engine/src/renderer/postprocessing/DepthOfFieldEffect.ts:35](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/DepthOfFieldEffect.ts#L35)

___

### bokehNearFillPass

• **bokehNearFillPass**: *any*

Defined in: [packages/engine/src/renderer/postprocessing/DepthOfFieldEffect.ts:36](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/DepthOfFieldEffect.ts#L36)

___

### camera

• **camera**: *any*

Defined in: [packages/engine/src/renderer/postprocessing/DepthOfFieldEffect.ts:24](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/DepthOfFieldEffect.ts#L24)

___

### cocPass

• **cocPass**: *any*

Defined in: [packages/engine/src/renderer/postprocessing/DepthOfFieldEffect.ts:32](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/DepthOfFieldEffect.ts#L32)

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

### maskPass

• **maskPass**: *any*

Defined in: [packages/engine/src/renderer/postprocessing/DepthOfFieldEffect.ts:34](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/DepthOfFieldEffect.ts#L34)

___

### name

• **name**: *any*

Inherited from: [Effect](renderer_postprocessing_effect.effect.md).[name](renderer_postprocessing_effect.effect.md#name)

Defined in: [packages/engine/src/renderer/postprocessing/Effect.ts:16](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/Effect.ts#L16)

___

### renderTarget

• **renderTarget**: *any*

Defined in: [packages/engine/src/renderer/postprocessing/DepthOfFieldEffect.ts:25](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/DepthOfFieldEffect.ts#L25)

___

### renderTargetCoC

• **renderTargetCoC**: *any*

Defined in: [packages/engine/src/renderer/postprocessing/DepthOfFieldEffect.ts:30](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/DepthOfFieldEffect.ts#L30)

___

### renderTargetCoCBlurred

• **renderTargetCoCBlurred**: *any*

Defined in: [packages/engine/src/renderer/postprocessing/DepthOfFieldEffect.ts:31](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/DepthOfFieldEffect.ts#L31)

___

### renderTargetFar

• **renderTargetFar**: *any*

Defined in: [packages/engine/src/renderer/postprocessing/DepthOfFieldEffect.ts:29](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/DepthOfFieldEffect.ts#L29)

___

### renderTargetMasked

• **renderTargetMasked**: *any*

Defined in: [packages/engine/src/renderer/postprocessing/DepthOfFieldEffect.ts:26](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/DepthOfFieldEffect.ts#L26)

___

### renderTargetNear

• **renderTargetNear**: *any*

Defined in: [packages/engine/src/renderer/postprocessing/DepthOfFieldEffect.ts:27](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/DepthOfFieldEffect.ts#L27)

___

### target

• **target**: *any*

Defined in: [packages/engine/src/renderer/postprocessing/DepthOfFieldEffect.ts:39](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/DepthOfFieldEffect.ts#L39)

___

### uniforms

• **uniforms**: *any*

Overrides: [Effect](renderer_postprocessing_effect.effect.md).[uniforms](renderer_postprocessing_effect.effect.md#uniforms)

Defined in: [packages/engine/src/renderer/postprocessing/DepthOfFieldEffect.ts:28](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/DepthOfFieldEffect.ts#L28)

___

### vertexShader

• **vertexShader**: *any*

Inherited from: [Effect](renderer_postprocessing_effect.effect.md).[vertexShader](renderer_postprocessing_effect.effect.md#vertexshader)

Defined in: [packages/engine/src/renderer/postprocessing/Effect.ts:19](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/Effect.ts#L19)

## Accessors

### bokehScale

• get **bokehScale**(): *any*

The current bokeh scale.

**Returns:** *any*

Defined in: [packages/engine/src/renderer/postprocessing/DepthOfFieldEffect.ts:269](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/DepthOfFieldEffect.ts#L269)

• set **bokehScale**(`value`: *any*): *void*

Sets the bokeh scale.

#### Parameters:

Name | Type |
:------ | :------ |
`value` | *any* |

**Returns:** *void*

Defined in: [packages/engine/src/renderer/postprocessing/DepthOfFieldEffect.ts:279](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/DepthOfFieldEffect.ts#L279)

___

### circleOfConfusionMaterial

• get **circleOfConfusionMaterial**(): *any*

The circle of confusion material.

**Returns:** *any*

Defined in: [packages/engine/src/renderer/postprocessing/DepthOfFieldEffect.ts:249](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/DepthOfFieldEffect.ts#L249)

___

### resolution

• get **resolution**(): *any*

The resolution of this effect.

**Returns:** *any*

Defined in: [packages/engine/src/renderer/postprocessing/DepthOfFieldEffect.ts:259](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/DepthOfFieldEffect.ts#L259)

## Methods

### calculateFocusDistance

▸ **calculateFocusDistance**(`target`: *any*): *number*

Calculates the focus distance from the camera to the given position.

#### Parameters:

Name | Type | Description |
:------ | :------ | :------ |
`target` | *any* | The target.   |

**Returns:** *number*

The normalized focus distance.

Defined in: [packages/engine/src/renderer/postprocessing/DepthOfFieldEffect.ts:302](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/DepthOfFieldEffect.ts#L302)

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

Defined in: [packages/engine/src/renderer/postprocessing/DepthOfFieldEffect.ts:426](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/DepthOfFieldEffect.ts#L426)

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

Defined in: [packages/engine/src/renderer/postprocessing/DepthOfFieldEffect.ts:317](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/DepthOfFieldEffect.ts#L317)

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

Updates the size of internal render targets.

#### Parameters:

Name | Type | Description |
:------ | :------ | :------ |
`width` | *any* | The width.   |
`height` | *any* | The height.    |

**Returns:** *void*

Overrides: [Effect](renderer_postprocessing_effect.effect.md)

Defined in: [packages/engine/src/renderer/postprocessing/DepthOfFieldEffect.ts:378](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/DepthOfFieldEffect.ts#L378)

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

Defined in: [packages/engine/src/renderer/postprocessing/DepthOfFieldEffect.ts:331](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/DepthOfFieldEffect.ts#L331)
