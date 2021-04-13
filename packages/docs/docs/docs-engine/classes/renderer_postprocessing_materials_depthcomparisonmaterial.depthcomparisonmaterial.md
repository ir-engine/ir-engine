---
id: "renderer_postprocessing_materials_depthcomparisonmaterial.depthcomparisonmaterial"
title: "Class: DepthComparisonMaterial"
sidebar_label: "DepthComparisonMaterial"
custom_edit_url: null
hide_title: true
---

# Class: DepthComparisonMaterial

[renderer/postprocessing/materials/DepthComparisonMaterial](../modules/renderer_postprocessing_materials_depthcomparisonmaterial.md).DepthComparisonMaterial

A depth comparison shader material.

## Hierarchy

* *ShaderMaterial*

  ↳ **DepthComparisonMaterial**

## Constructors

### constructor

\+ **new DepthComparisonMaterial**(`depthTexture?`: *any*, `camera`: *any*): [*DepthComparisonMaterial*](renderer_postprocessing_materials_depthcomparisonmaterial.depthcomparisonmaterial.md)

Constructs a new depth comparison material.

#### Parameters:

Name | Type | Default value |
:------ | :------ | :------ |
`depthTexture` | *any* | null |
`camera` | *any* | - |

**Returns:** [*DepthComparisonMaterial*](renderer_postprocessing_materials_depthcomparisonmaterial.depthcomparisonmaterial.md)

Overrides: void

Defined in: [packages/engine/src/renderer/postprocessing/materials/DepthComparisonMaterial.ts:9](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/materials/DepthComparisonMaterial.ts#L9)

## Methods

### adoptCameraSettings

▸ **adoptCameraSettings**(`camera?`: *any*): *void*

Adopts the settings of the given camera.

#### Parameters:

Name | Type | Default value |
:------ | :------ | :------ |
`camera` | *any* | null |

**Returns:** *void*

Defined in: [packages/engine/src/renderer/postprocessing/materials/DepthComparisonMaterial.ts:51](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/materials/DepthComparisonMaterial.ts#L51)
