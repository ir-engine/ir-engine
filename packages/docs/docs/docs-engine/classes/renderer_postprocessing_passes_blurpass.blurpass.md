---
id: "renderer_postprocessing_passes_blurpass.blurpass"
title: "Class: BlurPass"
sidebar_label: "BlurPass"
custom_edit_url: null
hide_title: true
---

# Class: BlurPass

[renderer/postprocessing/passes/BlurPass](../modules/renderer_postprocessing_passes_blurpass.md).BlurPass

An efficient, incremental blur pass.

## Hierarchy

* [*Pass*](renderer_postprocessing_passes_pass.pass.md)

  ↳ **BlurPass**

## Constructors

### constructor

\+ **new BlurPass**(`__namedParameters`: *Object*): [*BlurPass*](renderer_postprocessing_passes_blurpass.blurpass.md)

Constructs a new blur pass.

#### Parameters:

Name | Type |
:------ | :------ |
`__namedParameters` | *Object* |

**Returns:** [*BlurPass*](renderer_postprocessing_passes_blurpass.blurpass.md)

Overrides: [Pass](renderer_postprocessing_passes_pass.pass.md)

Defined in: [packages/engine/src/renderer/postprocessing/passes/BlurPass.ts:18](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/passes/BlurPass.ts#L18)

## Properties

### camera

• **camera**: *any*

Overrides: [Pass](renderer_postprocessing_passes_pass.pass.md).[camera](renderer_postprocessing_passes_pass.pass.md#camera)

Defined in: [packages/engine/src/renderer/postprocessing/passes/BlurPass.ts:18](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/passes/BlurPass.ts#L18)

___

### convolutionMaterial

• **convolutionMaterial**: *any*

Defined in: [packages/engine/src/renderer/postprocessing/passes/BlurPass.ts:14](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/passes/BlurPass.ts#L14)

___

### ditheredConvolutionMaterial

• **ditheredConvolutionMaterial**: *any*

Defined in: [packages/engine/src/renderer/postprocessing/passes/BlurPass.ts:15](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/passes/BlurPass.ts#L15)

___

### dithering

• **dithering**: *boolean*

Defined in: [packages/engine/src/renderer/postprocessing/passes/BlurPass.ts:16](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/passes/BlurPass.ts#L16)

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

Inherited from: [Pass](renderer_postprocessing_passes_pass.pass.md).[needsSwap](renderer_postprocessing_passes_pass.pass.md#needsswap)

Defined in: [packages/engine/src/renderer/postprocessing/passes/Pass.ts:76](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/passes/Pass.ts#L76)

___

### renderTargetA

• **renderTargetA**: *any*

Defined in: [packages/engine/src/renderer/postprocessing/passes/BlurPass.ts:11](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/passes/BlurPass.ts#L11)

___

### renderTargetB

• **renderTargetB**: *any*

Defined in: [packages/engine/src/renderer/postprocessing/passes/BlurPass.ts:12](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/passes/BlurPass.ts#L12)

___

### resolution

• **resolution**: [*Resizer*](renderer_postprocessing_core_resizer.resizer.md)

Defined in: [packages/engine/src/renderer/postprocessing/passes/BlurPass.ts:13](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/passes/BlurPass.ts#L13)

___

### rtt

• **rtt**: *boolean*

Inherited from: [Pass](renderer_postprocessing_passes_pass.pass.md).[rtt](renderer_postprocessing_passes_pass.pass.md#rtt)

Defined in: [packages/engine/src/renderer/postprocessing/passes/Pass.ts:75](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/passes/Pass.ts#L75)

___

### scene

• **scene**: *any*

Overrides: [Pass](renderer_postprocessing_passes_pass.pass.md).[scene](renderer_postprocessing_passes_pass.pass.md#scene)

Defined in: [packages/engine/src/renderer/postprocessing/passes/BlurPass.ts:17](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/passes/BlurPass.ts#L17)

___

### screen

• **screen**: *any*

Inherited from: [Pass](renderer_postprocessing_passes_pass.pass.md).[screen](renderer_postprocessing_passes_pass.pass.md#screen)

Defined in: [packages/engine/src/renderer/postprocessing/passes/Pass.ts:74](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/passes/Pass.ts#L74)

## Accessors

### height

• get **height**(): *any*

The current height of the internal render targets.

**`deprecated`** Use resolution.height instead.

**Returns:** *any*

Defined in: [packages/engine/src/renderer/postprocessing/passes/BlurPass.ts:134](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/passes/BlurPass.ts#L134)

• set **height**(`value`: *any*): *void*

Sets the render height.

**`deprecated`** Use resolution.height instead.

#### Parameters:

Name | Type |
:------ | :------ |
`value` | *any* |

**Returns:** *void*

Defined in: [packages/engine/src/renderer/postprocessing/passes/BlurPass.ts:145](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/passes/BlurPass.ts#L145)

___

### kernelSize

• get **kernelSize**(): *any*

The kernel size.

**Returns:** *any*

Defined in: [packages/engine/src/renderer/postprocessing/passes/BlurPass.ts:183](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/passes/BlurPass.ts#L183)

• set **kernelSize**(`value`: *any*): *void*

Sets the kernel size.

Larger kernels require more processing power but scale well with larger
render resolutions.

#### Parameters:

Name | Type |
:------ | :------ |
`value` | *any* |

**Returns:** *void*

Defined in: [packages/engine/src/renderer/postprocessing/passes/BlurPass.ts:196](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/passes/BlurPass.ts#L196)

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

___

### scale

• get **scale**(): *any*

The current blur scale.

**Returns:** *any*

Defined in: [packages/engine/src/renderer/postprocessing/passes/BlurPass.ts:155](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/passes/BlurPass.ts#L155)

• set **scale**(`value`: *any*): *void*

Sets the blur scale.

This value influences the overall blur strength and should not be greater
than 1. For larger blurs please increase the [kernelSize](renderer_postprocessing_passes_blurpass.blurpass.md#kernelsize)!

Note that the blur strength is closely tied to the resolution. For a smooth
transition from no blur to full blur, set the width or the height to a high
enough value.

#### Parameters:

Name | Type |
:------ | :------ |
`value` | *any* |

**Returns:** *void*

Defined in: [packages/engine/src/renderer/postprocessing/passes/BlurPass.ts:172](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/passes/BlurPass.ts#L172)

___

### width

• get **width**(): *any*

The current width of the internal render targets.

**`deprecated`** Use resolution.width instead.

**Returns:** *any*

Defined in: [packages/engine/src/renderer/postprocessing/passes/BlurPass.ts:112](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/passes/BlurPass.ts#L112)

• set **width**(`value`: *any*): *void*

Sets the render width.

**`deprecated`** Use resolution.width instead.

#### Parameters:

Name | Type |
:------ | :------ |
`value` | *any* |

**Returns:** *void*

Defined in: [packages/engine/src/renderer/postprocessing/passes/BlurPass.ts:123](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/passes/BlurPass.ts#L123)

___

### AUTO\_SIZE

• `Static`get **AUTO_SIZE**(): *number*

An auto sizing flag.

**`deprecated`** Use [Resizer.AUTO_SIZE](renderer_postprocessing_core_resizer.resizer.md#auto_size) instead.

**Returns:** *number*

Defined in: [packages/engine/src/renderer/postprocessing/passes/BlurPass.ts:324](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/passes/BlurPass.ts#L324)

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

▸ **getResolutionScale**(): *number*

Returns the current resolution scale.

**`deprecated`** Adjust the fixed resolution width or height instead.

**Returns:** *number*

The resolution scale.

Defined in: [packages/engine/src/renderer/postprocessing/passes/BlurPass.ts:208](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/passes/BlurPass.ts#L208)

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

Defined in: [packages/engine/src/renderer/postprocessing/passes/BlurPass.ts:305](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/passes/BlurPass.ts#L305)

___

### render

▸ **render**(`renderer`: *any*, `inputBuffer`: *any*, `outputBuffer`: *any*, `deltaTime?`: *any*, `stencilTest?`: *any*): *void*

Blurs the input buffer and writes the result to the output buffer. The
input buffer remains intact, unless it's also the output buffer.

#### Parameters:

Name | Type | Description |
:------ | :------ | :------ |
`renderer` | *any* | The renderer.   |
`inputBuffer` | *any* | A frame buffer that contains the result of the previous pass.   |
`outputBuffer` | *any* | A frame buffer that serves as the output render target unless this pass renders to screen.   |
`deltaTime?` | *any* | - |
`stencilTest?` | *any* | - |

**Returns:** *void*

Overrides: [Pass](renderer_postprocessing_passes_pass.pass.md)

Defined in: [packages/engine/src/renderer/postprocessing/passes/BlurPass.ts:234](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/passes/BlurPass.ts#L234)

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

Defined in: [packages/engine/src/renderer/postprocessing/passes/BlurPass.ts:219](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/passes/BlurPass.ts#L219)

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

Defined in: [packages/engine/src/renderer/postprocessing/passes/BlurPass.ts:283](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/passes/BlurPass.ts#L283)
