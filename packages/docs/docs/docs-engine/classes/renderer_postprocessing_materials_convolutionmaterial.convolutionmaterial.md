---
id: "renderer_postprocessing_materials_convolutionmaterial.convolutionmaterial"
title: "Class: ConvolutionMaterial"
sidebar_label: "ConvolutionMaterial"
custom_edit_url: null
hide_title: true
---

# Class: ConvolutionMaterial

[renderer/postprocessing/materials/ConvolutionMaterial](../modules/renderer_postprocessing_materials_convolutionmaterial.md).ConvolutionMaterial

An optimised convolution shader material.

This material supports dithering.

Based on the GDC2003 Presentation by Masaki Kawase, Bunkasha Games:
 Frame Buffer Postprocessing Effects in DOUBLE-S.T.E.A.L (Wreckless)
and an article by Filip Strugar, Intel:
 An investigation of fast real-time GPU-based image blur algorithms

Further modified according to Apple's
[Best Practices for Shaders](https://goo.gl/lmRoM5).

**`todo`** Remove dithering code from fragment shader.

## Hierarchy

* *ShaderMaterial*

  ↳ **ConvolutionMaterial**

## Constructors

### constructor

\+ **new ConvolutionMaterial**(`texelSize?`: *any*): [*ConvolutionMaterial*](renderer_postprocessing_materials_convolutionmaterial.convolutionmaterial.md)

Constructs a new convolution material.

#### Parameters:

Name | Type |
:------ | :------ |
`texelSize` | *any* |

**Returns:** [*ConvolutionMaterial*](renderer_postprocessing_materials_convolutionmaterial.convolutionmaterial.md)

Overrides: void

Defined in: [packages/engine/src/renderer/postprocessing/materials/ConvolutionMaterial.ts:22](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/materials/ConvolutionMaterial.ts#L22)

## Properties

### kernelSize

• **kernelSize**: *number*

Defined in: [packages/engine/src/renderer/postprocessing/materials/ConvolutionMaterial.ts:22](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/materials/ConvolutionMaterial.ts#L22)

## Methods

### getKernel

▸ **getKernel**(): *Float32Array*

Returns the kernel.

**Returns:** *Float32Array*

The kernel.

Defined in: [packages/engine/src/renderer/postprocessing/materials/ConvolutionMaterial.ts:70](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/materials/ConvolutionMaterial.ts#L70)

___

### setTexelSize

▸ **setTexelSize**(`x`: *any*, `y`: *any*): *void*

Sets the texel size.

#### Parameters:

Name | Type | Description |
:------ | :------ | :------ |
`x` | *any* | The texel width.   |
`y` | *any* | The texel height.    |

**Returns:** *void*

Defined in: [packages/engine/src/renderer/postprocessing/materials/ConvolutionMaterial.ts:81](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/materials/ConvolutionMaterial.ts#L81)
