---
id: "renderer_postprocessing_materials_ssaomaterial.ssaomaterial"
title: "Class: SSAOMaterial"
sidebar_label: "SSAOMaterial"
custom_edit_url: null
hide_title: true
---

# Class: SSAOMaterial

[renderer/postprocessing/materials/SSAOMaterial](../modules/renderer_postprocessing_materials_ssaomaterial.md).SSAOMaterial

A Screen Space Ambient Occlusion (SSAO) shader material.

## Hierarchy

* *ShaderMaterial*

  ↳ **SSAOMaterial**

## Constructors

### constructor

\+ **new SSAOMaterial**(`camera`: *any*): [*SSAOMaterial*](renderer_postprocessing_materials_ssaomaterial.ssaomaterial.md)

Constructs a new SSAO material.

#### Parameters:

Name | Type | Description |
:------ | :------ | :------ |
`camera` | *any* | A camera.    |

**Returns:** [*SSAOMaterial*](renderer_postprocessing_materials_ssaomaterial.ssaomaterial.md)

Overrides: void

Defined in: [packages/engine/src/renderer/postprocessing/materials/SSAOMaterial.ts:9](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/materials/SSAOMaterial.ts#L9)

## Accessors

### depthPacking

• get **depthPacking**(): *number*

The depth packing of the source depth buffer.

**Returns:** *number*

Defined in: [packages/engine/src/renderer/postprocessing/materials/SSAOMaterial.ts:73](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/materials/SSAOMaterial.ts#L73)

• set **depthPacking**(`value`: *number*): *void*

Sets the depth packing.

#### Parameters:

Name | Type |
:------ | :------ |
`value` | *number* |

**Returns:** *void*

Defined in: [packages/engine/src/renderer/postprocessing/materials/SSAOMaterial.ts:83](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/materials/SSAOMaterial.ts#L83)

## Methods

### adoptCameraSettings

▸ **adoptCameraSettings**(`camera?`: *any*): *void*

Adopts the settings of the given camera.

#### Parameters:

Name | Type | Default value |
:------ | :------ | :------ |
`camera` | *any* | null |

**Returns:** *void*

Defined in: [packages/engine/src/renderer/postprocessing/materials/SSAOMaterial.ts:105](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/materials/SSAOMaterial.ts#L105)

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

Defined in: [packages/engine/src/renderer/postprocessing/materials/SSAOMaterial.ts:95](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/materials/SSAOMaterial.ts#L95)
