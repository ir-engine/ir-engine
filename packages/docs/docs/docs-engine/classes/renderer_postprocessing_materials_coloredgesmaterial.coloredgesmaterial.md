---
id: "renderer_postprocessing_materials_coloredgesmaterial.coloredgesmaterial"
title: "Class: ColorEdgesMaterial"
sidebar_label: "ColorEdgesMaterial"
custom_edit_url: null
hide_title: true
---

# Class: ColorEdgesMaterial

[renderer/postprocessing/materials/ColorEdgesMaterial](../modules/renderer_postprocessing_materials_coloredgesmaterial.md).ColorEdgesMaterial

A material that detects edges in a color texture.

**`deprecated`** Use EdgeDetectionMaterial instead.

## Hierarchy

* *ShaderMaterial*

  ↳ **ColorEdgesMaterial**

## Constructors

### constructor

\+ **new ColorEdgesMaterial**(`texelSize?`: *any*): [*ColorEdgesMaterial*](renderer_postprocessing_materials_coloredgesmaterial.coloredgesmaterial.md)

Constructs a new color edges material.

#### Parameters:

Name | Type |
:------ | :------ |
`texelSize` | *any* |

**Returns:** [*ColorEdgesMaterial*](renderer_postprocessing_materials_coloredgesmaterial.coloredgesmaterial.md)

Overrides: void

Defined in: [packages/engine/src/renderer/postprocessing/materials/ColorEdgesMaterial.ts:11](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/materials/ColorEdgesMaterial.ts#L11)

## Methods

### setEdgeDetectionThreshold

▸ **setEdgeDetectionThreshold**(`threshold`: *any*): *void*

Sets the edge detection sensitivity.

A lower value results in more edges being detected at the expense of
performance.

0.1 is a reasonable value, and allows to catch most visible edges.
0.05 is a rather overkill value, that allows to catch 'em all.

If temporal supersampling is used, 0.2 could be a reasonable value, as low
contrast edges are properly filtered by just 2x.

#### Parameters:

Name | Type | Description |
:------ | :------ | :------ |
`threshold` | *any* | The edge detection sensitivity. Range: [0.05, 0.5].    |

**Returns:** *void*

Defined in: [packages/engine/src/renderer/postprocessing/materials/ColorEdgesMaterial.ts:78](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/materials/ColorEdgesMaterial.ts#L78)

___

### setLocalContrastAdaptationFactor

▸ **setLocalContrastAdaptationFactor**(`factor`: *any*): *void*

Sets the local contrast adaptation factor.

If there is a neighbor edge that has _factor_ times bigger contrast than
the current edge, the edge will be discarded.

This allows to eliminate spurious crossing edges and is based on the fact
that if there is too much contrast in a direction, the perceptual contrast
in the other neighbors will be hidden.

#### Parameters:

Name | Type | Description |
:------ | :------ | :------ |
`factor` | *any* | The local contrast adaptation factor. Default is 2.0.    |

**Returns:** *void*

Defined in: [packages/engine/src/renderer/postprocessing/materials/ColorEdgesMaterial.ts:58](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/materials/ColorEdgesMaterial.ts#L58)
