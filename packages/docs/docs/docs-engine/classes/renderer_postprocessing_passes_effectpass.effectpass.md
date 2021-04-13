---
id: "renderer_postprocessing_passes_effectpass.effectpass"
title: "Class: EffectPass"
sidebar_label: "EffectPass"
custom_edit_url: null
hide_title: true
---

# Class: EffectPass

[renderer/postprocessing/passes/EffectPass](../modules/renderer_postprocessing_passes_effectpass.md).EffectPass

An effect pass.

Use this pass to combine [Effect](renderer_postprocessing_effect.effect.md) instances.

**`implements`** {EventListener}

## Hierarchy

* [*Pass*](renderer_postprocessing_passes_pass.pass.md)

  ↳ **EffectPass**

## Constructors

### constructor

\+ **new EffectPass**(`camera`: *any*, ...`effects`: *any*[]): [*EffectPass*](renderer_postprocessing_passes_effectpass.effectpass.md)

Constructs a new effect pass.

The provided effects will be organized and merged for optimal performance.

#### Parameters:

Name | Type | Description |
:------ | :------ | :------ |
`camera` | *any* | The main camera. The camera's type and settings will be available to all effects.   |
`...effects` | *any*[] | The effects that will be rendered by this pass.    |

**Returns:** [*EffectPass*](renderer_postprocessing_passes_effectpass.effectpass.md)

Overrides: [Pass](renderer_postprocessing_passes_pass.pass.md)

Defined in: [packages/engine/src/renderer/postprocessing/passes/EffectPass.ts:189](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/passes/EffectPass.ts#L189)

## Properties

### camera

• **camera**: *any*

Inherited from: [Pass](renderer_postprocessing_passes_pass.pass.md).[camera](renderer_postprocessing_passes_pass.pass.md#camera)

Defined in: [packages/engine/src/renderer/postprocessing/passes/Pass.ts:73](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/passes/Pass.ts#L73)

___

### capabilities

• **capabilities**: *any*

Defined in: [packages/engine/src/renderer/postprocessing/passes/EffectPass.ts:189](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/passes/EffectPass.ts#L189)

___

### effects

• **effects**: [*Effect*](renderer_postprocessing_effect.effect.md)[]

Defined in: [packages/engine/src/renderer/postprocessing/passes/EffectPass.ts:180](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/passes/EffectPass.ts#L180)

___

### enabled

• **enabled**: *boolean*

Inherited from: [Pass](renderer_postprocessing_passes_pass.pass.md).[enabled](renderer_postprocessing_passes_pass.pass.md#enabled)

Defined in: [packages/engine/src/renderer/postprocessing/passes/Pass.ts:78](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/passes/Pass.ts#L78)

___

### maxTime

• **maxTime**: *number*

Defined in: [packages/engine/src/renderer/postprocessing/passes/EffectPass.ts:185](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/passes/EffectPass.ts#L185)

___

### minTime

• **minTime**: *number*

Defined in: [packages/engine/src/renderer/postprocessing/passes/EffectPass.ts:184](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/passes/EffectPass.ts#L184)

___

### name

• **name**: *string*

Inherited from: [Pass](renderer_postprocessing_passes_pass.pass.md).[name](renderer_postprocessing_passes_pass.pass.md#name)

Defined in: [packages/engine/src/renderer/postprocessing/passes/Pass.ts:71](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/passes/Pass.ts#L71)

___

### needsDepthTexture

• **needsDepthTexture**: *boolean*

Overrides: [Pass](renderer_postprocessing_passes_pass.pass.md).[needsDepthTexture](renderer_postprocessing_passes_pass.pass.md#needsdepthtexture)

Defined in: [packages/engine/src/renderer/postprocessing/passes/EffectPass.ts:186](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/passes/EffectPass.ts#L186)

___

### needsSwap

• **needsSwap**: *boolean*

Overrides: [Pass](renderer_postprocessing_passes_pass.pass.md).[needsSwap](renderer_postprocessing_passes_pass.pass.md#needsswap)

Defined in: [packages/engine/src/renderer/postprocessing/passes/EffectPass.ts:187](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/passes/EffectPass.ts#L187)

___

### needsUpdate

• **needsUpdate**: *boolean*

Defined in: [packages/engine/src/renderer/postprocessing/passes/EffectPass.ts:188](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/passes/EffectPass.ts#L188)

___

### rtt

• **rtt**: *boolean*

Inherited from: [Pass](renderer_postprocessing_passes_pass.pass.md).[rtt](renderer_postprocessing_passes_pass.pass.md#rtt)

Defined in: [packages/engine/src/renderer/postprocessing/passes/Pass.ts:75](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/passes/Pass.ts#L75)

___

### scene

• **scene**: *any*

Inherited from: [Pass](renderer_postprocessing_passes_pass.pass.md).[scene](renderer_postprocessing_passes_pass.pass.md#scene)

Defined in: [packages/engine/src/renderer/postprocessing/passes/Pass.ts:72](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/passes/Pass.ts#L72)

___

### screen

• **screen**: *any*

Inherited from: [Pass](renderer_postprocessing_passes_pass.pass.md).[screen](renderer_postprocessing_passes_pass.pass.md#screen)

Defined in: [packages/engine/src/renderer/postprocessing/passes/Pass.ts:74](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/passes/Pass.ts#L74)

___

### skipRendering

• **skipRendering**: *boolean*

Defined in: [packages/engine/src/renderer/postprocessing/passes/EffectPass.ts:181](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/passes/EffectPass.ts#L181)

___

### uniforms

• **uniforms**: *number*

Defined in: [packages/engine/src/renderer/postprocessing/passes/EffectPass.ts:182](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/passes/EffectPass.ts#L182)

___

### varyings

• **varyings**: *number*

Defined in: [packages/engine/src/renderer/postprocessing/passes/EffectPass.ts:183](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/passes/EffectPass.ts#L183)

## Accessors

### dithering

• get **dithering**(): *any*

Indicates whether dithering is enabled.

Color quantization reduces banding artifacts but degrades performance.

**Returns:** *any*

Defined in: [packages/engine/src/renderer/postprocessing/passes/EffectPass.ts:300](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/passes/EffectPass.ts#L300)

• set **dithering**(`value`: *any*): *void*

Enables or disables dithering.

Color quantization reduces banding artifacts but degrades performance.

#### Parameters:

Name | Type |
:------ | :------ |
`value` | *any* |

**Returns:** *void*

Defined in: [packages/engine/src/renderer/postprocessing/passes/EffectPass.ts:310](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/passes/EffectPass.ts#L310)

___

### encodeOutput

• get **encodeOutput**(): *boolean*

Indicates whether this pass encodes its output when rendering to screen.

**Returns:** *boolean*

Defined in: [packages/engine/src/renderer/postprocessing/passes/EffectPass.ts:269](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/passes/EffectPass.ts#L269)

• set **encodeOutput**(`value`: *boolean*): *void*

Enables or disables output encoding.

#### Parameters:

Name | Type |
:------ | :------ |
`value` | *boolean* |

**Returns:** *void*

Defined in: [packages/engine/src/renderer/postprocessing/passes/EffectPass.ts:279](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/passes/EffectPass.ts#L279)

___

### renderToScreen

• get **renderToScreen**(): *boolean*

Indicates whether this pass should render to screen.

**Returns:** *boolean*

Defined in: [packages/engine/src/renderer/postprocessing/passes/Pass.ts:171](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/passes/Pass.ts#L171)

• set **renderToScreen**(`value`: *boolean*): *void*

Sets the render to screen flag.

If the flag is changed to a different value, the fullscreen material will
be updated as well.

#### Parameters:

Name | Type |
:------ | :------ |
`value` | *boolean* |

**Returns:** *void*

Defined in: [packages/engine/src/renderer/postprocessing/passes/Pass.ts:184](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/passes/Pass.ts#L184)

## Methods

### dispose

▸ **dispose**(): *void*

Deletes disposable objects.

This pass will be inoperative after this method was called!

**Returns:** *void*

Overrides: [Pass](renderer_postprocessing_passes_pass.pass.md)

Defined in: [packages/engine/src/renderer/postprocessing/passes/EffectPass.ts:565](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/passes/EffectPass.ts#L565)

___

### getDepthTexture

▸ **getDepthTexture**(): *any*

Returns the current depth texture.

**Returns:** *any*

The current depth texture, or null if there is none.

Overrides: [Pass](renderer_postprocessing_passes_pass.pass.md)

Defined in: [packages/engine/src/renderer/postprocessing/passes/EffectPass.ts:470](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/passes/EffectPass.ts#L470)

___

### getFullscreenMaterial

▸ **getFullscreenMaterial**(): *any*

Returns the current fullscreen material.

**Returns:** *any*

The current fullscreen material, or null if there is none.

Inherited from: [Pass](renderer_postprocessing_passes_pass.pass.md)

Defined in: [packages/engine/src/renderer/postprocessing/passes/Pass.ts:202](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/passes/Pass.ts#L202)

___

### handleEvent

▸ **handleEvent**(`event`: *any*): *void*

Handles events.

#### Parameters:

Name | Type | Description |
:------ | :------ | :------ |
`event` | *any* | An event.    |

**Returns:** *void*

Defined in: [packages/engine/src/renderer/postprocessing/passes/EffectPass.ts:581](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/passes/EffectPass.ts#L581)

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

Overrides: [Pass](renderer_postprocessing_passes_pass.pass.md)

Defined in: [packages/engine/src/renderer/postprocessing/passes/EffectPass.ts:545](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/passes/EffectPass.ts#L545)

___

### recompile

▸ **recompile**(`renderer`: *any*): *void*

Updates the shader material.

Warning: This method triggers a relatively expensive shader recompilation.

#### Parameters:

Name | Type |
:------ | :------ |
`renderer` | *any* |

**Returns:** *void*

Defined in: [packages/engine/src/renderer/postprocessing/passes/EffectPass.ts:456](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/passes/EffectPass.ts#L456)

___

### render

▸ **render**(`renderer`: *any*, `inputBuffer`: *any*, `outputBuffer`: *any*, `deltaTime`: *number*, `stencilTest`: *boolean*): *void*

Renders the effect.

#### Parameters:

Name | Type | Description |
:------ | :------ | :------ |
`renderer` | *any* | The renderer.   |
`inputBuffer` | *any* | A frame buffer that contains the result of the previous pass.   |
`outputBuffer` | *any* | A frame buffer that serves as the output render target unless this pass renders to screen.   |
`deltaTime` | *number* | - |
`stencilTest` | *boolean* | - |

**Returns:** *void*

Overrides: [Pass](renderer_postprocessing_passes_pass.pass.md)

Defined in: [packages/engine/src/renderer/postprocessing/passes/EffectPass.ts:502](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/passes/EffectPass.ts#L502)

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

Overrides: [Pass](renderer_postprocessing_passes_pass.pass.md)

Defined in: [packages/engine/src/renderer/postprocessing/passes/EffectPass.ts:481](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/passes/EffectPass.ts#L481)

___

### setFullscreenMaterial

▸ `Protected`**setFullscreenMaterial**(`material`: *any*): *void*

Sets the fullscreen material.

The material will be assigned to a mesh that fills the screen. The mesh
will be created once a material is assigned via this method.

#### Parameters:

Name | Type | Description |
:------ | :------ | :------ |
`material` | *any* | A fullscreen material.    |

**Returns:** *void*

Inherited from: [Pass](renderer_postprocessing_passes_pass.pass.md)

Defined in: [packages/engine/src/renderer/postprocessing/passes/Pass.ts:216](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/passes/Pass.ts#L216)

___

### setSize

▸ **setSize**(`width`: *any*, `height`: *any*): *void*

Updates the size of this pass.

#### Parameters:

Name | Type | Description |
:------ | :------ | :------ |
`width` | *any* | The width.   |
`height` | *any* | The height.    |

**Returns:** *void*

Overrides: [Pass](renderer_postprocessing_passes_pass.pass.md)

Defined in: [packages/engine/src/renderer/postprocessing/passes/EffectPass.ts:529](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/passes/EffectPass.ts#L529)

___

### updateMaterial

▸ `Private`**updateMaterial**(): *void*

Updates the compound shader material.

**Returns:** *void*

Defined in: [packages/engine/src/renderer/postprocessing/passes/EffectPass.ts:349](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/passes/EffectPass.ts#L349)

___

### verifyResources

▸ `Private`**verifyResources**(`renderer`: *any*): *void*

Compares required resources with device capabilities.

#### Parameters:

Name | Type | Description |
:------ | :------ | :------ |
`renderer` | *any* | The renderer.    |

**Returns:** *void*

Defined in: [packages/engine/src/renderer/postprocessing/passes/EffectPass.ts:326](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/passes/EffectPass.ts#L326)
