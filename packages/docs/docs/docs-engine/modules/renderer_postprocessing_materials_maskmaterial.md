---
id: "renderer_postprocessing_materials_maskmaterial"
title: "Module: renderer/postprocessing/materials/MaskMaterial"
sidebar_label: "renderer/postprocessing/materials/MaskMaterial"
custom_edit_url: null
hide_title: true
---

# Module: renderer/postprocessing/materials/MaskMaterial

## Table of contents

### Classes

- [MaskMaterial](../classes/renderer_postprocessing_materials_maskmaterial.maskmaterial.md)

## Variables

### MaskFunction

• `Const` **MaskFunction**: *object*

A mask function enumeration.

**`property`** {Number} DISCARD - Discards elements when the respective mask value is zero.

**`property`** {Number} MULTIPLY - Multiplies the input buffer with the mask texture.

**`property`** {Number} MULTIPLY_RGB_SET_ALPHA - Multiplies the input RGB values with the mask and sets alpha to the mask value.

#### Type declaration:

Name | Type |
:------ | :------ |
`DISCARD` | *number* |
`MULTIPLY` | *number* |
`MULTIPLY_RGB_SET_ALPHA` | *number* |

Defined in: [packages/engine/src/renderer/postprocessing/materials/MaskMaterial.ts:141](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/materials/MaskMaterial.ts#L141)
