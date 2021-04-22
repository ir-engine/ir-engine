---
id: "renderer_postprocessing_effect"
title: "Module: renderer/postprocessing/Effect"
sidebar_label: "renderer/postprocessing/Effect"
custom_edit_url: null
hide_title: true
---

# Module: renderer/postprocessing/Effect

## Table of contents

### Classes

- [Effect](../classes/renderer_postprocessing_effect.effect.md)

## Variables

### EffectAttribute

• `Const` **EffectAttribute**: *object*

An enumeration of effect attributes.

Attributes can be concatenated using the bitwise OR operator.

**`property`** {Number} NONE - No attributes. Most effects don't need to specify any attributes.

**`property`** {Number} DEPTH - Describes effects that require a depth texture.

**`property`** {Number} CONVOLUTION - Describes effects that fetch additional samples from the input buffer. There cannot be more than one effect with this attribute per [EffectPass](../classes/renderer_postprocessing_passes_effectpass.effectpass.md).

**`example`** const attributes = EffectAttribute.CONVOLUTION | EffectAttribute.DEPTH;

#### Type declaration:

Name | Type |
:------ | :------ |
`CONVOLUTION` | *number* |
`DEPTH` | *number* |
`NONE` | *number* |

Defined in: [packages/engine/src/renderer/postprocessing/Effect.ts:307](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/Effect.ts#L307)

___

### WebGLExtension

• `Const` **WebGLExtension**: *object*

An enumeration of WebGL extensions.

**`property`** {String} DERIVATIVES - Enables derivatives by adding the functions dFdx, dFdy and fwidth.

**`property`** {String} FRAG_DEPTH - Enables gl_FragDepthEXT to set a depth value of a fragment from within the fragment shader.

**`property`** {String} DRAW_BUFFERS - Enables multiple render targets (MRT) support.

**`property`** {String} SHADER_TEXTURE_LOD - Enables explicit control of texture LOD.

#### Type declaration:

Name | Type |
:------ | :------ |
`DERIVATIVES` | *string* |
`DRAW_BUFFERS` | *string* |
`FRAG_DEPTH` | *string* |
`SHADER_TEXTURE_LOD` | *string* |

Defined in: [packages/engine/src/renderer/postprocessing/Effect.ts:325](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/Effect.ts#L325)
