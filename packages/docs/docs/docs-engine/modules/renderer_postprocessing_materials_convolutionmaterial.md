---
id: "renderer_postprocessing_materials_convolutionmaterial"
title: "Module: renderer/postprocessing/materials/ConvolutionMaterial"
sidebar_label: "renderer/postprocessing/materials/ConvolutionMaterial"
custom_edit_url: null
hide_title: true
---

# Module: renderer/postprocessing/materials/ConvolutionMaterial

## Table of contents

### Classes

- [ConvolutionMaterial](../classes/renderer_postprocessing_materials_convolutionmaterial.convolutionmaterial.md)

## Variables

### KernelSize

• `Const` **KernelSize**: *object*

A kernel size enumeration.

**`property`** {Number} VERY_SMALL - A very small kernel that matches a 7x7 Gauss blur kernel.

**`property`** {Number} SMALL - A small kernel that matches a 15x15 Gauss blur kernel.

**`property`** {Number} MEDIUM - A medium sized kernel that matches a 23x23 Gauss blur kernel.

**`property`** {Number} LARGE - A large kernel that matches a 35x35 Gauss blur kernel.

**`property`** {Number} VERY_LARGE - A very large kernel that matches a 63x63 Gauss blur kernel.

**`property`** {Number} HUGE - A huge kernel that matches a 127x127 Gauss blur kernel.

#### Type declaration:

Name | Type |
:------ | :------ |
`HUGE` | *number* |
`LARGE` | *number* |
`MEDIUM` | *number* |
`SMALL` | *number* |
`VERY_LARGE` | *number* |
`VERY_SMALL` | *number* |

Defined in: [packages/engine/src/renderer/postprocessing/materials/ConvolutionMaterial.ts:115](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/materials/ConvolutionMaterial.ts#L115)
