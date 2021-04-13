---
id: "renderer_postprocessing_passes_renderpass.renderpass"
title: "Class: RenderPass"
sidebar_label: "RenderPass"
custom_edit_url: null
hide_title: true
---

# Class: RenderPass

[renderer/postprocessing/passes/RenderPass](../modules/renderer_postprocessing_passes_renderpass.md).RenderPass

A pass that renders a given scene into the input buffer or to screen.

This pass uses a [ClearPass](renderer_postprocessing_passes_clearpass.clearpass.md) to clear the target buffer.

## Hierarchy

* [*Pass*](renderer_postprocessing_passes_pass.pass.md)

  ↳ **RenderPass**

## Constructors

### constructor

\+ **new RenderPass**(`scene`: *any*, `camera`: *any*, `overrideMaterial?`: *any*): [*RenderPass*](renderer_postprocessing_passes_renderpass.renderpass.md)

Constructs a new render pass.

#### Parameters:

Name | Type | Default value | Description |
:------ | :------ | :------ | :------ |
`scene` | *any* | - | The scene to render.   |
`camera` | *any* | - | The camera to use to render the scene.   |
`overrideMaterial` | *any* | null | - |

**Returns:** [*RenderPass*](renderer_postprocessing_passes_renderpass.renderpass.md)

Overrides: [Pass](renderer_postprocessing_passes_pass.pass.md)

Defined in: [packages/engine/src/renderer/postprocessing/passes/RenderPass.ts:17](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/passes/RenderPass.ts#L17)

## Properties

### camera

• **camera**: *any*

Overrides: [Pass](renderer_postprocessing_passes_pass.pass.md).[camera](renderer_postprocessing_passes_pass.pass.md#camera)

Defined in: [packages/engine/src/renderer/postprocessing/passes/RenderPass.ts:17](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/passes/RenderPass.ts#L17)

___

### clearPass

• **clearPass**: [*ClearPass*](renderer_postprocessing_passes_clearpass.clearpass.md)

Defined in: [packages/engine/src/renderer/postprocessing/passes/RenderPass.ts:13](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/passes/RenderPass.ts#L13)

___

### depthTexture

• **depthTexture**: *any*

Defined in: [packages/engine/src/renderer/postprocessing/passes/RenderPass.ts:14](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/passes/RenderPass.ts#L14)

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

Defined in: [packages/engine/src/renderer/postprocessing/passes/RenderPass.ts:12](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/passes/RenderPass.ts#L12)

___

### overrideMaterialManager

• **overrideMaterialManager**: [*OverrideMaterialManager*](renderer_postprocessing_core_overridematerialmanager.overridematerialmanager.md)

Defined in: [packages/engine/src/renderer/postprocessing/passes/RenderPass.ts:15](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/passes/RenderPass.ts#L15)

___

### rtt

• **rtt**: *boolean*

Inherited from: [Pass](renderer_postprocessing_passes_pass.pass.md).[rtt](renderer_postprocessing_passes_pass.pass.md#rtt)

Defined in: [packages/engine/src/renderer/postprocessing/passes/Pass.ts:75](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/passes/Pass.ts#L75)

___

### scene

• **scene**: *any*

Overrides: [Pass](renderer_postprocessing_passes_pass.pass.md).[scene](renderer_postprocessing_passes_pass.pass.md#scene)

Defined in: [packages/engine/src/renderer/postprocessing/passes/RenderPass.ts:16](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/passes/RenderPass.ts#L16)

___

### screen

• **screen**: *any*

Inherited from: [Pass](renderer_postprocessing_passes_pass.pass.md).[screen](renderer_postprocessing_passes_pass.pass.md#screen)

Defined in: [packages/engine/src/renderer/postprocessing/passes/Pass.ts:74](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/passes/Pass.ts#L74)

## Accessors

### clear

• get **clear**(): *boolean*

Indicates whether the target buffer should be cleared before rendering.

**Returns:** *boolean*

Defined in: [packages/engine/src/renderer/postprocessing/passes/RenderPass.ts:118](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/passes/RenderPass.ts#L118)

• set **clear**(`value`: *boolean*): *void*

Enables or disables auto clear.

#### Parameters:

Name | Type |
:------ | :------ |
`value` | *boolean* |

**Returns:** *void*

Defined in: [packages/engine/src/renderer/postprocessing/passes/RenderPass.ts:128](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/passes/RenderPass.ts#L128)

___

### overrideMaterial

• get **overrideMaterial**(): *any*

The current override material.

**Returns:** *any*

Defined in: [packages/engine/src/renderer/postprocessing/passes/RenderPass.ts:87](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/passes/RenderPass.ts#L87)

• set **overrideMaterial**(`value`: *any*): *void*

Sets the override material.

#### Parameters:

Name | Type |
:------ | :------ |
`value` | *any* |

**Returns:** *void*

Defined in: [packages/engine/src/renderer/postprocessing/passes/RenderPass.ts:99](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/passes/RenderPass.ts#L99)

___

### renderToScreen

• get **renderToScreen**(): *boolean*

Indicates whether this pass should render to screen.

**Returns:** *boolean*

Defined in: [packages/engine/src/renderer/postprocessing/passes/RenderPass.ts:66](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/passes/RenderPass.ts#L66)

• set **renderToScreen**(`value`: *boolean*): *void*

Sets the render to screen flag.

#### Parameters:

Name | Type |
:------ | :------ |
`value` | *boolean* |

**Returns:** *void*

Defined in: [packages/engine/src/renderer/postprocessing/passes/RenderPass.ts:76](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/passes/RenderPass.ts#L76)

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

### getClearPass

▸ **getClearPass**(): [*ClearPass*](renderer_postprocessing_passes_clearpass.clearpass.md)

Returns the clear pass.

**Returns:** [*ClearPass*](renderer_postprocessing_passes_clearpass.clearpass.md)

The clear pass.

Defined in: [packages/engine/src/renderer/postprocessing/passes/RenderPass.ts:138](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/passes/RenderPass.ts#L138)

___

### getDepthTexture

▸ **getDepthTexture**(): *any*

Returns the current depth texture.

**Returns:** *any*

The current depth texture, or null if there is none.

Overrides: [Pass](renderer_postprocessing_passes_pass.pass.md)

Defined in: [packages/engine/src/renderer/postprocessing/passes/RenderPass.ts:148](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/passes/RenderPass.ts#L148)

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

▸ **render**(`renderer`: *any*, `inputBuffer`: *any*, `outputBuffer?`: *any*, `deltaTime?`: *any*, `stencilTest?`: *any*): *void*

Renders the scene.

#### Parameters:

Name | Type | Description |
:------ | :------ | :------ |
`renderer` | *any* | The renderer.   |
`inputBuffer` | *any* | A frame buffer that contains the result of the previous pass.   |
`outputBuffer?` | *any* | A frame buffer that serves as the output render target unless this pass renders to screen.   |
`deltaTime?` | *any* | - |
`stencilTest?` | *any* | - |

**Returns:** *void*

Overrides: [Pass](renderer_postprocessing_passes_pass.pass.md)

Defined in: [packages/engine/src/renderer/postprocessing/passes/RenderPass.ts:176](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/passes/RenderPass.ts#L176)

___

### setDepthTexture

▸ **setDepthTexture**(`depthTexture`: *any*, `depthPacking?`: *number*): *void*

Sets the depth texture.

The provided texture will be attached to the input buffer unless this pass
renders to screen.

#### Parameters:

Name | Type | Default value | Description |
:------ | :------ | :------ | :------ |
`depthTexture` | *any* | - | A depth texture.   |
`depthPacking` | *number* | 0 | - |

**Returns:** *void*

Overrides: [Pass](renderer_postprocessing_passes_pass.pass.md)

Defined in: [packages/engine/src/renderer/postprocessing/passes/RenderPass.ts:162](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/passes/RenderPass.ts#L162)

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

Updates this pass with the renderer's size.

You may override this method in case you want to be informed about the size
of the main frame buffer.

The [EffectComposer](renderer_postprocessing_core_effectcomposer.effectcomposer.md) calls this method before this pass is
initialized and every time its own size is updated.

**`example`** this.myRenderTarget.setSize(width, height);

#### Parameters:

Name | Type | Description |
:------ | :------ | :------ |
`width` | *any* | The renderer's width.   |
`height` | *any* | The renderer's height.   |

**Returns:** *void*

Inherited from: [Pass](renderer_postprocessing_passes_pass.pass.md)

Defined in: [packages/engine/src/renderer/postprocessing/passes/Pass.ts:290](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/passes/Pass.ts#L290)
