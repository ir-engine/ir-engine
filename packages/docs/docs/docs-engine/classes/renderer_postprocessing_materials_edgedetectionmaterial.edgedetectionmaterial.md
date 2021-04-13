---
id: "renderer_postprocessing_materials_edgedetectionmaterial.edgedetectionmaterial"
title: "Class: EdgeDetectionMaterial"
sidebar_label: "EdgeDetectionMaterial"
custom_edit_url: null
hide_title: true
---

# Class: EdgeDetectionMaterial

[renderer/postprocessing/materials/EdgeDetectionMaterial](../modules/renderer_postprocessing_materials_edgedetectionmaterial.md).EdgeDetectionMaterial

An edge detection material.

Mainly used for Subpixel Morphological Antialiasing.

## Hierarchy

* *ShaderMaterial*

  ↳ **EdgeDetectionMaterial**

## Constructors

### constructor

\+ **new EdgeDetectionMaterial**(`texelSize?`: *any*, `mode?`: *number*): [*EdgeDetectionMaterial*](renderer_postprocessing_materials_edgedetectionmaterial.edgedetectionmaterial.md)

Constructs a new edge detection material.

**`todo`** Remove texelSize parameter.

#### Parameters:

Name | Type |
:------ | :------ |
`texelSize` | *any* |
`mode` | *number* |

**Returns:** [*EdgeDetectionMaterial*](renderer_postprocessing_materials_edgedetectionmaterial.edgedetectionmaterial.md)

Overrides: void

Defined in: [packages/engine/src/renderer/postprocessing/materials/EdgeDetectionMaterial.ts:14](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/materials/EdgeDetectionMaterial.ts#L14)

## Accessors

### depthPacking

• get **depthPacking**(): *number*

The current depth packing.

**Returns:** *number*

Defined in: [packages/engine/src/renderer/postprocessing/materials/EdgeDetectionMaterial.ts:59](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/materials/EdgeDetectionMaterial.ts#L59)

• set **depthPacking**(`value`: *number*): *void*

Sets the depth packing.

#### Parameters:

Name | Type |
:------ | :------ |
`value` | *number* |

**Returns:** *void*

Defined in: [packages/engine/src/renderer/postprocessing/materials/EdgeDetectionMaterial.ts:69](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/materials/EdgeDetectionMaterial.ts#L69)

## Methods

### setEdgeDetectionMode

▸ **setEdgeDetectionMode**(`mode`: *any*): *void*

Sets the edge detection mode.

Warning: If you intend to change the edge detection mode at runtime, make
sure that [EffectPass.needsDepthTexture](renderer_postprocessing_passes_effectpass.effectpass.md#needsdepthtexture) is set to `true` _before_
the EffectPass is added to the composer.

#### Parameters:

Name | Type | Description |
:------ | :------ | :------ |
`mode` | *any* | The edge detection mode.    |

**Returns:** *void*

Defined in: [packages/engine/src/renderer/postprocessing/materials/EdgeDetectionMaterial.ts:84](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/materials/EdgeDetectionMaterial.ts#L84)

___

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

Defined in: [packages/engine/src/renderer/postprocessing/materials/EdgeDetectionMaterial.ts:138](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/materials/EdgeDetectionMaterial.ts#L138)

___

### setLocalContrastAdaptationFactor

▸ **setLocalContrastAdaptationFactor**(`factor`: *any*): *void*

Sets the local contrast adaptation factor. Has no effect if the edge
detection mode is set to DEPTH.

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

Defined in: [packages/engine/src/renderer/postprocessing/materials/EdgeDetectionMaterial.ts:118](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/materials/EdgeDetectionMaterial.ts#L118)
