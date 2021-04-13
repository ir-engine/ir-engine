---
id: "renderer_postprocessing_materials_circleofconfusionmaterial.circleofconfusionmaterial"
title: "Class: CircleOfConfusionMaterial"
sidebar_label: "CircleOfConfusionMaterial"
custom_edit_url: null
hide_title: true
---

# Class: CircleOfConfusionMaterial

[renderer/postprocessing/materials/CircleOfConfusionMaterial](../modules/renderer_postprocessing_materials_circleofconfusionmaterial.md).CircleOfConfusionMaterial

A CoC shader material.

## Hierarchy

* *ShaderMaterial*

  ↳ **CircleOfConfusionMaterial**

## Constructors

### constructor

\+ **new CircleOfConfusionMaterial**(`camera`: *any*): [*CircleOfConfusionMaterial*](renderer_postprocessing_materials_circleofconfusionmaterial.circleofconfusionmaterial.md)

Constructs a new CoC material.

#### Parameters:

Name | Type | Description |
:------ | :------ | :------ |
`camera` | *any* | A camera.    |

**Returns:** [*CircleOfConfusionMaterial*](renderer_postprocessing_materials_circleofconfusionmaterial.circleofconfusionmaterial.md)

Overrides: void

Defined in: [packages/engine/src/renderer/postprocessing/materials/CircleOfConfusionMaterial.ts:10](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/materials/CircleOfConfusionMaterial.ts#L10)

## Accessors

### depthPacking

• get **depthPacking**(): *number*

The current depth packing.

**Returns:** *number*

Defined in: [packages/engine/src/renderer/postprocessing/materials/CircleOfConfusionMaterial.ts:54](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/materials/CircleOfConfusionMaterial.ts#L54)

• set **depthPacking**(`value`: *number*): *void*

Sets the depth packing.

#### Parameters:

Name | Type |
:------ | :------ |
`value` | *number* |

**Returns:** *void*

Defined in: [packages/engine/src/renderer/postprocessing/materials/CircleOfConfusionMaterial.ts:64](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/materials/CircleOfConfusionMaterial.ts#L64)

## Methods

### adoptCameraSettings

▸ **adoptCameraSettings**(`camera?`: *any*): *void*

Adopts the settings of the given camera.

#### Parameters:

Name | Type | Default value |
:------ | :------ | :------ |
`camera` | *any* | null |

**Returns:** *void*

Defined in: [packages/engine/src/renderer/postprocessing/materials/CircleOfConfusionMaterial.ts:75](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/materials/CircleOfConfusionMaterial.ts#L75)
