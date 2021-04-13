---
id: "renderer_postprocessing_materials_depthdownsamplingmaterial.depthdownsamplingmaterial"
title: "Class: DepthDownsamplingMaterial"
sidebar_label: "DepthDownsamplingMaterial"
custom_edit_url: null
hide_title: true
---

# Class: DepthDownsamplingMaterial

[renderer/postprocessing/materials/DepthDownsamplingMaterial](../modules/renderer_postprocessing_materials_depthdownsamplingmaterial.md).DepthDownsamplingMaterial

A depth downsampling shader material.

Based on an article by Eleni Maria Stea:
https://eleni.mutantstargoat.com/hikiko/depth-aware-upsampling-6

## Hierarchy

* *ShaderMaterial*

  ↳ **DepthDownsamplingMaterial**

## Constructors

### constructor

\+ **new DepthDownsamplingMaterial**(): [*DepthDownsamplingMaterial*](renderer_postprocessing_materials_depthdownsamplingmaterial.depthdownsamplingmaterial.md)

Constructs a new depth downsampling material.

**Returns:** [*DepthDownsamplingMaterial*](renderer_postprocessing_materials_depthdownsamplingmaterial.depthdownsamplingmaterial.md)

Overrides: void

Defined in: [packages/engine/src/renderer/postprocessing/materials/DepthDownsamplingMaterial.ts:12](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/materials/DepthDownsamplingMaterial.ts#L12)

## Accessors

### depthPacking

• get **depthPacking**(): *number*

The depth packing of the source depth buffer.

**Returns:** *number*

Defined in: [packages/engine/src/renderer/postprocessing/materials/DepthDownsamplingMaterial.ts:50](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/materials/DepthDownsamplingMaterial.ts#L50)

• set **depthPacking**(`value`: *number*): *void*

Sets the depth packing.

#### Parameters:

Name | Type |
:------ | :------ |
`value` | *number* |

**Returns:** *void*

Defined in: [packages/engine/src/renderer/postprocessing/materials/DepthDownsamplingMaterial.ts:60](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/materials/DepthDownsamplingMaterial.ts#L60)

## Methods

### setTexelSize

▸ **setTexelSize**(`x`: *any*, `y`: *any*): *void*

Sets the texel size.

#### Parameters:

Name | Type | Description |
:------ | :------ | :------ |
`x` | *any* | The texel width.   |
`y` | *any* | The texel height.    |

**Returns:** *void*

Defined in: [packages/engine/src/renderer/postprocessing/materials/DepthDownsamplingMaterial.ts:72](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/materials/DepthDownsamplingMaterial.ts#L72)
