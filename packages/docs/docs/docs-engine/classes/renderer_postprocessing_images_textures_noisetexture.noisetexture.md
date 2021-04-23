---
id: "renderer_postprocessing_images_textures_noisetexture.noisetexture"
title: "Class: NoiseTexture"
sidebar_label: "NoiseTexture"
custom_edit_url: null
hide_title: true
---

# Class: NoiseTexture

[renderer/postprocessing/images/textures/NoiseTexture](../modules/renderer_postprocessing_images_textures_noisetexture.md).NoiseTexture

A simple noise texture.

## Hierarchy

* *DataTexture*

  ↳ **NoiseTexture**

## Constructors

### constructor

\+ **new NoiseTexture**(`width`: *any*, `height`: *any*, `format?`: *any*, `type?`: *any*): [*NoiseTexture*](renderer_postprocessing_images_textures_noisetexture.noisetexture.md)

Constructs a new noise texture.

The texture format can be either `LuminanceFormat`, `RGBFormat` or
`RGBAFormat`. Additionally, the formats `RedFormat` and `RGFormat` can be
used in a WebGL 2 context.

#### Parameters:

Name | Type | Description |
:------ | :------ | :------ |
`width` | *any* | The width.   |
`height` | *any* | The height.   |
`format` | *any* | - |
`type` | *any* | - |

**Returns:** [*NoiseTexture*](renderer_postprocessing_images_textures_noisetexture.noisetexture.md)

Overrides: void

Defined in: [packages/engine/src/renderer/postprocessing/images/textures/NoiseTexture.ts:57](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/images/textures/NoiseTexture.ts#L57)
