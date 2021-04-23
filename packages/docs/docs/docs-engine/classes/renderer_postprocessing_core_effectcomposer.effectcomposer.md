---
id: "renderer_postprocessing_core_effectcomposer.effectcomposer"
title: "Class: EffectComposer"
sidebar_label: "EffectComposer"
custom_edit_url: null
hide_title: true
---

# Class: EffectComposer

[renderer/postprocessing/core/EffectComposer](../modules/renderer_postprocessing_core_effectcomposer.md).EffectComposer

## Constructors

### constructor

\+ **new EffectComposer**(`renderer`: *any*, `options?`: { `depthBuffer`: *boolean* = true; `frameBufferType`: *any* ; `multisampling`: *boolean* = true; `stencilBuffer`: *boolean* = true }): [*EffectComposer*](renderer_postprocessing_core_effectcomposer.effectcomposer.md)

Constructs a new effect composer.

#### Parameters:

Name | Type | Default value | Description |
:------ | :------ | :------ | :------ |
`renderer` | *any* | - | The renderer that should be used.   |
`options` | *object* | - | - |
`options.depthBuffer` | *boolean* | true | - |
`options.frameBufferType` | *any* | - | - |
`options.multisampling` | *boolean* | true | - |
`options.stencilBuffer` | *boolean* | true | - |

**Returns:** [*EffectComposer*](renderer_postprocessing_core_effectcomposer.effectcomposer.md)

Defined in: [packages/engine/src/renderer/postprocessing/core/EffectComposer.ts:52](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/core/EffectComposer.ts#L52)

## Properties

### autoRenderToScreen

• **autoRenderToScreen**: *boolean*

Defined in: [packages/engine/src/renderer/postprocessing/core/EffectComposer.ts:52](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/core/EffectComposer.ts#L52)

___

### copyPass

• **copyPass**: [*ShaderPass*](renderer_postprocessing_passes_shaderpass.shaderpass.md)

Defined in: [packages/engine/src/renderer/postprocessing/core/EffectComposer.ts:48](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/core/EffectComposer.ts#L48)

___

### depthTexture

• **depthTexture**: *any*

Defined in: [packages/engine/src/renderer/postprocessing/core/EffectComposer.ts:50](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/core/EffectComposer.ts#L50)

___

### inputBuffer

• **inputBuffer**: *any*

Defined in: [packages/engine/src/renderer/postprocessing/core/EffectComposer.ts:46](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/core/EffectComposer.ts#L46)

___

### outlineEffect

• **outlineEffect**: [*OutlineEffect*](renderer_postprocessing_outlineeffect.outlineeffect.md)

Defined in: [packages/engine/src/renderer/postprocessing/core/EffectComposer.ts:49](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/core/EffectComposer.ts#L49)

___

### outputBuffer

• **outputBuffer**: *any*

Defined in: [packages/engine/src/renderer/postprocessing/core/EffectComposer.ts:47](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/core/EffectComposer.ts#L47)

___

### passes

• **passes**: *any*[]

Defined in: [packages/engine/src/renderer/postprocessing/core/EffectComposer.ts:51](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/core/EffectComposer.ts#L51)

___

### renderer

• **renderer**: *any*

Defined in: [packages/engine/src/renderer/postprocessing/core/EffectComposer.ts:45](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/core/EffectComposer.ts#L45)

## Accessors

### multisampling

• get **multisampling**(): *any*

The current amount of samples used for multisample antialiasing.

**Returns:** *any*

Defined in: [packages/engine/src/renderer/postprocessing/core/EffectComposer.ts:149](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/core/EffectComposer.ts#L149)

• set **multisampling**(`value`: *any*): *void*

Sets the amount of MSAA samples.

Requires WebGL 2. Set to zero to disable multisampling.

#### Parameters:

Name | Type |
:------ | :------ |
`value` | *any* |

**Returns:** *void*

Defined in: [packages/engine/src/renderer/postprocessing/core/EffectComposer.ts:162](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/core/EffectComposer.ts#L162)

## Methods

### addPass

▸ **addPass**(`pass`: *any*, `index?`: *any*): *void*

Adds a pass, optionally at a specific index.

#### Parameters:

Name | Type | Description |
:------ | :------ | :------ |
`pass` | *any* | A new pass.   |
`index?` | *any* | - |

**Returns:** *void*

Defined in: [packages/engine/src/renderer/postprocessing/core/EffectComposer.ts:338](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/core/EffectComposer.ts#L338)

___

### createBuffer

▸ **createBuffer**(`depthBuffer`: *any*, `stencilBuffer`: *any*, `type`: *any*, `multisampling`: *any*): *any*

Creates a new render target by replicating the renderer's canvas.

The created render target uses a linear filter for texel minification and
magnification. Its render texture format depends on whether the renderer
uses the alpha channel. Mipmaps are disabled.

Note: The buffer format will also be set to RGBA if the frame buffer type
is HalfFloatType because RGB16F buffers are not renderable.

#### Parameters:

Name | Type | Description |
:------ | :------ | :------ |
`depthBuffer` | *any* | Whether the render target should have a depth buffer.   |
`stencilBuffer` | *any* | Whether the render target should have a stencil buffer.   |
`type` | *any* | The frame buffer type.   |
`multisampling` | *any* | The number of samples to use for antialiasing.   |

**Returns:** *any*

A new render target that equals the renderer's canvas.

Defined in: [packages/engine/src/renderer/postprocessing/core/EffectComposer.ts:301](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/core/EffectComposer.ts#L301)

___

### createDepthTexture

▸ `Private`**createDepthTexture**(): *any*

Creates a depth texture attachment that will be provided to all passes.

Note: When a shader reads from a depth texture and writes to a render
target that uses the same depth texture attachment, the depth information
will be lost. This happens even if `depthWrite` is disabled.

**Returns:** *any*

The depth texture.

Defined in: [packages/engine/src/renderer/postprocessing/core/EffectComposer.ts:270](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/core/EffectComposer.ts#L270)

___

### dispose

▸ **dispose**(): *void*

Destroys this composer and all passes.

This method deallocates all disposable objects created by the passes. It
also deletes the main frame buffers of this composer.

**Returns:** *void*

Defined in: [packages/engine/src/renderer/postprocessing/core/EffectComposer.ts:528](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/core/EffectComposer.ts#L528)

___

### enableExtensions

▸ `Private`**enableExtensions**(): *void*

Explicitly enables required WebGL extensions.

**Returns:** *void*

Defined in: [packages/engine/src/renderer/postprocessing/core/EffectComposer.ts:204](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/core/EffectComposer.ts#L204)

___

### getRenderer

▸ **getRenderer**(): *any*

Returns the WebGL renderer.

You may replace the renderer at any time by using
{@link EffectComposer#replaceRenderer}.

**Returns:** *any*

The renderer.

Defined in: [packages/engine/src/renderer/postprocessing/core/EffectComposer.ts:194](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/core/EffectComposer.ts#L194)

___

### removePass

▸ **removePass**(`pass`: *any*): *void*

Removes a pass.

#### Parameters:

Name | Type | Description |
:------ | :------ | :------ |
`pass` | *any* | The pass.    |

**Returns:** *void*

Defined in: [packages/engine/src/renderer/postprocessing/core/EffectComposer.ts:387](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/core/EffectComposer.ts#L387)

___

### render

▸ **render**(`deltaTime`: *any*): *void*

Renders all enabled passes in the order in which they were added.

#### Parameters:

Name | Type | Description |
:------ | :------ | :------ |
`deltaTime` | *any* | The time between the last frame and the current one in seconds.    |

**Returns:** *void*

Defined in: [packages/engine/src/renderer/postprocessing/core/EffectComposer.ts:428](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/core/EffectComposer.ts#L428)

___

### replaceRenderer

▸ **replaceRenderer**(`renderer`: *any*, `updateDOM?`: *boolean*): *any*

Replaces the current renderer with the given one.

The auto clear mechanism of the provided renderer will be disabled. If the
new render size differs from the previous one, all passes will be updated.

By default, the DOM element of the current renderer will automatically be
removed from its parent node and the DOM element of the new renderer will
take its place.

#### Parameters:

Name | Type | Default value | Description |
:------ | :------ | :------ | :------ |
`renderer` | *any* | - | The new renderer.   |
`updateDOM` | *boolean* | true | Indicates whether the old canvas should be replaced by the new one in the DOM.   |

**Returns:** *any*

The old renderer.

Defined in: [packages/engine/src/renderer/postprocessing/core/EffectComposer.ts:233](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/core/EffectComposer.ts#L233)

___

### reset

▸ **reset**(): *void*

Resets this composer by deleting all passes and creating new buffers.

**Returns:** *void*

Defined in: [packages/engine/src/renderer/postprocessing/core/EffectComposer.ts:508](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/core/EffectComposer.ts#L508)

___

### setSize

▸ **setSize**(`width`: *any*, `height`: *any*, `updateStyle?`: *any*): *void*

Sets the size of the buffers and the renderer's output canvas.

Every pass will be informed of the new size. It's up to each pass how that
information is used.

If no width or height is specified, the render targets and passes will be
updated with the current size of the renderer.

#### Parameters:

Name | Type |
:------ | :------ |
`width` | *any* |
`height` | *any* |
`updateStyle?` | *any* |

**Returns:** *void*

Defined in: [packages/engine/src/renderer/postprocessing/core/EffectComposer.ts:482](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/core/EffectComposer.ts#L482)
