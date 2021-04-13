---
id: "renderer_postprocessing_materials_godraysmaterial.godraysmaterial"
title: "Class: GodRaysMaterial"
sidebar_label: "GodRaysMaterial"
custom_edit_url: null
hide_title: true
---

# Class: GodRaysMaterial

[renderer/postprocessing/materials/GodRaysMaterial](../modules/renderer_postprocessing_materials_godraysmaterial.md).GodRaysMaterial

A crepuscular rays shader material.

This material supports dithering.

References:

Thibaut Despoulain, 2012:
 [(WebGL) Volumetric Light Approximation in Three.js](
 http://bkcore.com/blog/3d/webgl-three-js-volumetric-light-godrays.html)

Nvidia, GPU Gems 3, 2008:
 [Chapter 13. Volumetric Light Scattering as a Post-Process](
 https://developer.nvidia.com/gpugems/GPUGems3/gpugems3_ch13.html)

**`todo`** Remove dithering code from fragment shader.

## Hierarchy

* *ShaderMaterial*

  ↳ **GodRaysMaterial**

## Constructors

### constructor

\+ **new GodRaysMaterial**(`lightPosition`: *any*): [*GodRaysMaterial*](renderer_postprocessing_materials_godraysmaterial.godraysmaterial.md)

Constructs a new god rays material.

#### Parameters:

Name | Type | Description |
:------ | :------ | :------ |
`lightPosition` | *any* | The light position in screen space.    |

**Returns:** [*GodRaysMaterial*](renderer_postprocessing_materials_godraysmaterial.godraysmaterial.md)

Overrides: void

Defined in: [packages/engine/src/renderer/postprocessing/materials/GodRaysMaterial.ts:23](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/materials/GodRaysMaterial.ts#L23)

## Accessors

### samples

• get **samples**(): *number*

The amount of samples per pixel.

**Returns:** *number*

Defined in: [packages/engine/src/renderer/postprocessing/materials/GodRaysMaterial.ts:68](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/materials/GodRaysMaterial.ts#L68)

• set **samples**(`value`: *number*): *void*

Sets the amount of samples per pixel.

#### Parameters:

Name | Type |
:------ | :------ |
`value` | *number* |

**Returns:** *void*

Defined in: [packages/engine/src/renderer/postprocessing/materials/GodRaysMaterial.ts:78](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/materials/GodRaysMaterial.ts#L78)
