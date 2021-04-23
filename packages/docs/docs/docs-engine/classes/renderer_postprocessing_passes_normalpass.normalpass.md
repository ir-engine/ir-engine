---
id: "renderer_postprocessing_passes_normalpass.normalpass"
title: "Class: NormalPass"
sidebar_label: "NormalPass"
custom_edit_url: null
hide_title: true
---

# Class: NormalPass

[renderer/postprocessing/passes/NormalPass](../modules/renderer_postprocessing_passes_normalpass.md).NormalPass

A pass that renders the normals of a given scene.

## Hierarchy

* [*Pass*](renderer_postprocessing_passes_pass.pass.md)

  ↳ **NormalPass**

## Constructors

### constructor

\+ **new NormalPass**(`scene`: *any*, `camera`: *any*, `__namedParameters`: *Object*): [*NormalPass*](renderer_postprocessing_passes_normalpass.normalpass.md)

Constructs a new normal pass.

#### Parameters:

Name | Type | Description |
:------ | :------ | :------ |
`scene` | *any* | The scene to render.   |
`camera` | *any* | The camera to use to render the scene.   |
`__namedParameters` | *Object* | - |

**Returns:** [*NormalPass*](renderer_postprocessing_passes_normalpass.normalpass.md)

Overrides: [Pass](renderer_postprocessing_passes_pass.pass.md)

Defined in: [packages/engine/src/renderer/postprocessing/passes/NormalPass.ts:22](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/passes/NormalPass.ts#L22)

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

Inherited from: [Pass](renderer_postprocessing_passes_pass.pass.md).[needsDepthTexture](renderer_postprocessing_passes_pass.pass.md#needsdepthtexture)

Defined in: [packages/engine/src/renderer/postprocessing/passes/Pass.ts:77](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/passes/Pass.ts#L77)

___

### needsSwap

• **needsSwap**: *boolean*

Overrides: [Pass](renderer_postprocessing_passes_pass.pass.md).[needsSwap](renderer_postprocessing_passes_pass.pass.md#needsswap)

Defined in: [packages/engine/src/renderer/postprocessing/passes/NormalPass.ts:18](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/passes/NormalPass.ts#L18)

___

### renderPass

• **renderPass**: [*RenderPass*](renderer_postprocessing_passes_renderpass.renderpass.md)

Defined in: [packages/engine/src/renderer/postprocessing/passes/NormalPass.ts:19](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/passes/NormalPass.ts#L19)

___

### renderTarget

• **renderTarget**: *any*

Defined in: [packages/engine/src/renderer/postprocessing/passes/NormalPass.ts:20](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/passes/NormalPass.ts#L20)

___

### resolution

• **resolution**: [*Resizer*](renderer_postprocessing_core_resizer.resizer.md)

Defined in: [packages/engine/src/renderer/postprocessing/passes/NormalPass.ts:21](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/passes/NormalPass.ts#L21)

___

### resolutionScale

• **resolutionScale**: *any*

Defined in: [packages/engine/src/renderer/postprocessing/passes/NormalPass.ts:22](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/passes/NormalPass.ts#L22)

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

The normal texture.

**Returns:** *any*

Defined in: [packages/engine/src/renderer/postprocessing/passes/NormalPass.ts:99](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/passes/NormalPass.ts#L99)

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

### getResolutionScale

▸ **getResolutionScale**(): *any*

Returns the current resolution scale.

**`deprecated`** Adjust the fixed resolution width or height instead.

**Returns:** *any*

The resolution scale.

Defined in: [packages/engine/src/renderer/postprocessing/passes/NormalPass.ts:110](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/passes/NormalPass.ts#L110)

___

### initialize

▸ **initialize**(`renderer`: *any*, `alpha`: *any*, `frameBufferType`: *any*): *void*

Performs initialization tasks.

By overriding this method you gain access to the renderer. You'll also be
able to configure your custom render targets to use the appropriate format
(RGB or RGBA).

The provided renderer can be used to warm up special off-screen render
targets by performing a preliminary render operation.

The [EffectComposer](renderer_postprocessing_core_effectcomposer.effectcomposer.md) calls this method when this pass is added to its
queue, but not before its size has been set.

**`example`** if(!alpha && frameBufferType === UnsignedByteType) { this.myRenderTarget.texture.format = RGBFormat; }

#### Parameters:

Name | Type | Description |
:------ | :------ | :------ |
`renderer` | *any* | The renderer.   |
`alpha` | *any* | Whether the renderer uses the alpha channel or not.   |
`frameBufferType` | *any* | The type of the main frame buffers.   |

**Returns:** *void*

Inherited from: [Pass](renderer_postprocessing_passes_pass.pass.md)

Defined in: [packages/engine/src/renderer/postprocessing/passes/Pass.ts:311](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/passes/Pass.ts#L311)

___

### render

▸ **render**(`renderer`: *any*, `inputBuffer`: *any*, `outputBuffer`: *any*, `deltaTime`: *any*, `stencilTest`: *any*): *void*

Renders the scene normals.

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

Defined in: [packages/engine/src/renderer/postprocessing/passes/NormalPass.ts:136](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/passes/NormalPass.ts#L136)

___

### setDepthTexture

▸ **setDepthTexture**(`depthTexture`: *any*, `depthPacking?`: *number*): *void*

Sets the depth texture.

This method will be called automatically by the [EffectComposer](renderer_postprocessing_core_effectcomposer.effectcomposer.md).

You may override this method if your pass relies on the depth information
of a preceding [RenderPass](renderer_postprocessing_passes_renderpass.renderpass.md).

#### Parameters:

Name | Type | Default value | Description |
:------ | :------ | :------ | :------ |
`depthTexture` | *any* | - | A depth texture.   |
`depthPacking` | *number* | 0 | - |

**Returns:** *void*

Inherited from: [Pass](renderer_postprocessing_passes_pass.pass.md)

Defined in: [packages/engine/src/renderer/postprocessing/passes/Pass.ts:256](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/passes/Pass.ts#L256)

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

### setResolutionScale

▸ **setResolutionScale**(`scale`: *any*): *void*

Sets the resolution scale.

**`deprecated`** Adjust the fixed resolution width or height instead.

#### Parameters:

Name | Type | Description |
:------ | :------ | :------ |
`scale` | *any* | The new resolution scale.   |

**Returns:** *void*

Defined in: [packages/engine/src/renderer/postprocessing/passes/NormalPass.ts:121](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/passes/NormalPass.ts#L121)

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

Defined in: [packages/engine/src/renderer/postprocessing/passes/NormalPass.ts:148](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/passes/NormalPass.ts#L148)
