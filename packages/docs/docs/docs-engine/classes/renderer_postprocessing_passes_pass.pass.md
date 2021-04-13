---
id: "renderer_postprocessing_passes_pass.pass"
title: "Class: Pass"
sidebar_label: "Pass"
custom_edit_url: null
hide_title: true
---

# Class: Pass

[renderer/postprocessing/passes/Pass](../modules/renderer_postprocessing_passes_pass.md).Pass

An abstract pass.

Passes that do not rely on the depth buffer should explicitly disable the
depth test and depth write flags of their fullscreen shader material.

Fullscreen passes use a shared fullscreen triangle:
https://michaldrobot.com/2014/04/01/gcn-execution-patterns-in-full-screen-passes/

**`implements`** {Initializable}

**`implements`** {Resizable}

**`implements`** {Disposable}

## Hierarchy

* **Pass**

  ↳ [*BlurPass*](renderer_postprocessing_passes_blurpass.blurpass.md)

  ↳ [*ClearMaskPass*](renderer_postprocessing_passes_clearmaskpass.clearmaskpass.md)

  ↳ [*ClearPass*](renderer_postprocessing_passes_clearpass.clearpass.md)

  ↳ [*DepthDownsamplingPass*](renderer_postprocessing_passes_depthdownsamplingpass.depthdownsamplingpass.md)

  ↳ [*DepthPass*](renderer_postprocessing_passes_depthpass.depthpass.md)

  ↳ [*EffectPass*](renderer_postprocessing_passes_effectpass.effectpass.md)

  ↳ [*MaskPass*](renderer_postprocessing_passes_maskpass.maskpass.md)

  ↳ [*NormalPass*](renderer_postprocessing_passes_normalpass.normalpass.md)

  ↳ [*RenderPass*](renderer_postprocessing_passes_renderpass.renderpass.md)

  ↳ [*SavePass*](renderer_postprocessing_passes_savepass.savepass.md)

  ↳ [*ShaderPass*](renderer_postprocessing_passes_shaderpass.shaderpass.md)

## Constructors

### constructor

\+ **new Pass**(`name?`: *string*, `scene?`: *any*, `camera?`: *any*): [*Pass*](renderer_postprocessing_passes_pass.pass.md)

Constructs a new pass.

#### Parameters:

Name | Type | Default value |
:------ | :------ | :------ |
`name` | *string* | 'Pass' |
`scene` | *any* | - |
`camera` | *any* | - |

**Returns:** [*Pass*](renderer_postprocessing_passes_pass.pass.md)

Defined in: [packages/engine/src/renderer/postprocessing/passes/Pass.ts:78](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/passes/Pass.ts#L78)

## Properties

### camera

• **camera**: *any*

Defined in: [packages/engine/src/renderer/postprocessing/passes/Pass.ts:73](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/passes/Pass.ts#L73)

___

### enabled

• **enabled**: *boolean*

Defined in: [packages/engine/src/renderer/postprocessing/passes/Pass.ts:78](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/passes/Pass.ts#L78)

___

### name

• **name**: *string*

Defined in: [packages/engine/src/renderer/postprocessing/passes/Pass.ts:71](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/passes/Pass.ts#L71)

___

### needsDepthTexture

• **needsDepthTexture**: *boolean*

Defined in: [packages/engine/src/renderer/postprocessing/passes/Pass.ts:77](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/passes/Pass.ts#L77)

___

### needsSwap

• **needsSwap**: *boolean*

Defined in: [packages/engine/src/renderer/postprocessing/passes/Pass.ts:76](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/passes/Pass.ts#L76)

___

### rtt

• **rtt**: *boolean*

Defined in: [packages/engine/src/renderer/postprocessing/passes/Pass.ts:75](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/passes/Pass.ts#L75)

___

### scene

• **scene**: *any*

Defined in: [packages/engine/src/renderer/postprocessing/passes/Pass.ts:72](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/passes/Pass.ts#L72)

___

### screen

• **screen**: *any*

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

## Methods

### dispose

▸ **dispose**(): *void*

Performs a shallow search for disposable properties and deletes them. The
pass will be inoperative after this method was called!

The [EffectComposer](renderer_postprocessing_core_effectcomposer.effectcomposer.md) calls this method when it is being destroyed.
You may, however, use it independently to free memory when you are certain
that you don't need this pass anymore.

**Returns:** *void*

Defined in: [packages/engine/src/renderer/postprocessing/passes/Pass.ts:322](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/passes/Pass.ts#L322)

___

### getDepthTexture

▸ **getDepthTexture**(): *any*

Returns the current depth texture.

**Returns:** *any*

The current depth texture, or null if there is none.

Defined in: [packages/engine/src/renderer/postprocessing/passes/Pass.ts:240](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/passes/Pass.ts#L240)

___

### getFullscreenMaterial

▸ **getFullscreenMaterial**(): *any*

Returns the current fullscreen material.

**Returns:** *any*

The current fullscreen material, or null if there is none.

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

Defined in: [packages/engine/src/renderer/postprocessing/passes/Pass.ts:311](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/passes/Pass.ts#L311)

___

### render

▸ **render**(`renderer`: *any*, `inputBuffer`: *any*, `outputBuffer`: *any*, `deltaTime`: *any*, `stencilTest`: *any*): *void*

Renders the effect.

This is an abstract method that must be overridden.

**`abstract`** 

**`throws`** {Error} An error is thrown if the method is not overridden.

#### Parameters:

Name | Type | Description |
:------ | :------ | :------ |
`renderer` | *any* | The renderer.   |
`inputBuffer` | *any* | A frame buffer that contains the result of the previous pass.   |
`outputBuffer` | *any* | A frame buffer that serves as the output render target unless this pass renders to screen.   |
`deltaTime` | *any* | - |
`stencilTest` | *any* | - |

**Returns:** *void*

Defined in: [packages/engine/src/renderer/postprocessing/passes/Pass.ts:272](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/passes/Pass.ts#L272)

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

Defined in: [packages/engine/src/renderer/postprocessing/passes/Pass.ts:290](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/passes/Pass.ts#L290)
