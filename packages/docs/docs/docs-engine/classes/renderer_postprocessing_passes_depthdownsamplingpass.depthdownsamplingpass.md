---
id: "renderer_postprocessing_passes_depthdownsamplingpass.depthdownsamplingpass"
title: "Class: DepthDownsamplingPass"
sidebar_label: "DepthDownsamplingPass"
custom_edit_url: null
hide_title: true
---

# Class: DepthDownsamplingPass

[renderer/postprocessing/passes/DepthDownsamplingPass](../modules/renderer_postprocessing_passes_depthdownsamplingpass.md).DepthDownsamplingPass

A pass that downsamples the scene depth by picking the most representative
depth in 2x2 texel neighborhoods. If a normal buffer is provided, the
corresponding normals will be stored as well.

Attention: This pass requires WebGL 2.

## Hierarchy

* [*Pass*](renderer_postprocessing_passes_pass.pass.md)

  ↳ **DepthDownsamplingPass**

## Constructors

### constructor

\+ **new DepthDownsamplingPass**(`__namedParameters?`: { `height`:  ; `normalBuffer`:  ; `resolutionScale`:  ; `width`:   }): [*DepthDownsamplingPass*](renderer_postprocessing_passes_depthdownsamplingpass.depthdownsamplingpass.md)

Constructs a new depth downsampling pass.

#### Parameters:

Name | Type |
:------ | :------ |
`__namedParameters` | *object* |
`__namedParameters.height` | - |
`__namedParameters.normalBuffer` | - |
`__namedParameters.resolutionScale` | - |
`__namedParameters.width` | - |

**Returns:** [*DepthDownsamplingPass*](renderer_postprocessing_passes_depthdownsamplingpass.depthdownsamplingpass.md)

Overrides: [Pass](renderer_postprocessing_passes_pass.pass.md)

Defined in: [packages/engine/src/renderer/postprocessing/passes/DepthDownsamplingPass.ts:19](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/passes/DepthDownsamplingPass.ts#L19)

## Properties

### camera

• **camera**: *any*

Inherited from: [Pass](renderer_postprocessing_passes_pass.pass.md).[camera](renderer_postprocessing_passes_pass.pass.md#camera)

Defined in: [packages/engine/src/renderer/postprocessing/passes/Pass.ts:73](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/passes/Pass.ts#L73)

___

### enabled

• **enabled**: *boolean*

Inherited from: [Pass](renderer_postprocessing_passes_pass.pass.md).[enabled](renderer_postprocessing_passes_pass.pass.md#enabled)

Defined in: [packages/engine/src/renderer/postprocessing/passes/Pass.ts:78](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/passes/Pass.ts#L78)

___

### name

• **name**: *string*

Inherited from: [Pass](renderer_postprocessing_passes_pass.pass.md).[name](renderer_postprocessing_passes_pass.pass.md#name)

Defined in: [packages/engine/src/renderer/postprocessing/passes/Pass.ts:71](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/passes/Pass.ts#L71)

___

### needsDepthTexture

• **needsDepthTexture**: *boolean*

Overrides: [Pass](renderer_postprocessing_passes_pass.pass.md).[needsDepthTexture](renderer_postprocessing_passes_pass.pass.md#needsdepthtexture)

Defined in: [packages/engine/src/renderer/postprocessing/passes/DepthDownsamplingPass.ts:16](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/passes/DepthDownsamplingPass.ts#L16)

___

### needsSwap

• **needsSwap**: *boolean*

Overrides: [Pass](renderer_postprocessing_passes_pass.pass.md).[needsSwap](renderer_postprocessing_passes_pass.pass.md#needsswap)

Defined in: [packages/engine/src/renderer/postprocessing/passes/DepthDownsamplingPass.ts:17](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/passes/DepthDownsamplingPass.ts#L17)

___

### renderTarget

• **renderTarget**: *any*

Defined in: [packages/engine/src/renderer/postprocessing/passes/DepthDownsamplingPass.ts:18](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/passes/DepthDownsamplingPass.ts#L18)

___

### resolution

• **resolution**: [*Resizer*](renderer_postprocessing_core_resizer.resizer.md)

Defined in: [packages/engine/src/renderer/postprocessing/passes/DepthDownsamplingPass.ts:19](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/passes/DepthDownsamplingPass.ts#L19)

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

## Accessors

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

___

### texture

• get **texture**(): *any*

The normal(RGB) + depth(A) texture.

**Returns:** *any*

Defined in: [packages/engine/src/renderer/postprocessing/passes/DepthDownsamplingPass.ts:83](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/passes/DepthDownsamplingPass.ts#L83)

## Methods

### dispose

▸ **dispose**(): *void*

Performs a shallow search for disposable properties and deletes them. The
pass will be inoperative after this method was called!

The [EffectComposer](renderer_postprocessing_core_effectcomposer.effectcomposer.md) calls this method when it is being destroyed.
You may, however, use it independently to free memory when you are certain
that you don't need this pass anymore.

**Returns:** *void*

Inherited from: [Pass](renderer_postprocessing_passes_pass.pass.md)

Defined in: [packages/engine/src/renderer/postprocessing/passes/Pass.ts:322](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/passes/Pass.ts#L322)

___

### getDepthTexture

▸ **getDepthTexture**(): *any*

Returns the current depth texture.

**Returns:** *any*

The current depth texture, or null if there is none.

Inherited from: [Pass](renderer_postprocessing_passes_pass.pass.md)

Defined in: [packages/engine/src/renderer/postprocessing/passes/Pass.ts:240](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/passes/Pass.ts#L240)

___

### getFullscreenMaterial

▸ **getFullscreenMaterial**(): *any*

Returns the current fullscreen material.

**Returns:** *any*

The current fullscreen material, or null if there is none.

Inherited from: [Pass](renderer_postprocessing_passes_pass.pass.md)

Defined in: [packages/engine/src/renderer/postprocessing/passes/Pass.ts:202](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/passes/Pass.ts#L202)

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

Defined in: [packages/engine/src/renderer/postprocessing/passes/DepthDownsamplingPass.ts:140](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/passes/DepthDownsamplingPass.ts#L140)

___

### render

▸ **render**(`renderer`: *any*, `inputBuffer`: *any*, `outputBuffer`: *any*, `deltaTime`: *any*, `stencilTest`: *any*): *void*

Downsamples depth and scene normals.

#### Parameters:

Name | Type | Description |
:------ | :------ | :------ |
`renderer` | *any* | The renderer.   |
`inputBuffer` | *any* | A frame buffer that contains the result of the previous pass.   |
`outputBuffer` | *any* | A frame buffer that serves as the output render target unless this pass renders to screen.   |
`deltaTime` | *any* | - |
`stencilTest` | *any* | - |

**Returns:** *void*

Overrides: [Pass](renderer_postprocessing_passes_pass.pass.md)

Defined in: [packages/engine/src/renderer/postprocessing/passes/DepthDownsamplingPass.ts:110](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/passes/DepthDownsamplingPass.ts#L110)

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

Defined in: [packages/engine/src/renderer/postprocessing/passes/DepthDownsamplingPass.ts:94](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/passes/DepthDownsamplingPass.ts#L94)

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

Defined in: [packages/engine/src/renderer/postprocessing/passes/DepthDownsamplingPass.ts:122](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/passes/DepthDownsamplingPass.ts#L122)
