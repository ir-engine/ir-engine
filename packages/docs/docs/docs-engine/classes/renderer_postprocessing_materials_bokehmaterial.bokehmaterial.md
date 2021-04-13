---
id: "renderer_postprocessing_materials_bokehmaterial.bokehmaterial"
title: "Class: BokehMaterial"
sidebar_label: "BokehMaterial"
custom_edit_url: null
hide_title: true
---

# Class: BokehMaterial

[renderer/postprocessing/materials/BokehMaterial](../modules/renderer_postprocessing_materials_bokehmaterial.md).BokehMaterial

A bokeh blur material.

This material should be applied twice in a row, with `fill` mode enabled for
the second pass.

Enabling the `foreground` option causes the shader to combine the near and
far CoC values around foreground objects.

## Hierarchy

* *ShaderMaterial*

  ↳ **BokehMaterial**

## Constructors

### constructor

\+ **new BokehMaterial**(`fill?`: *boolean*, `foreground?`: *boolean*): [*BokehMaterial*](renderer_postprocessing_materials_bokehmaterial.bokehmaterial.md)

Constructs a new bokeh material.

#### Parameters:

Name | Type | Default value |
:------ | :------ | :------ |
`fill` | *boolean* | false |
`foreground` | *boolean* | false |

**Returns:** [*BokehMaterial*](renderer_postprocessing_materials_bokehmaterial.bokehmaterial.md)

Overrides: void

Defined in: [packages/engine/src/renderer/postprocessing/materials/BokehMaterial.ts:16](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/materials/BokehMaterial.ts#L16)

## Methods

### generateKernel

▸ `Private`**generateKernel**(): *void*

Generates the blur kernels; one big one and a small one for highlights.

**Returns:** *void*

Defined in: [packages/engine/src/renderer/postprocessing/materials/BokehMaterial.ts:66](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/materials/BokehMaterial.ts#L66)

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

Defined in: [packages/engine/src/renderer/postprocessing/materials/BokehMaterial.ts:95](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/materials/BokehMaterial.ts#L95)
