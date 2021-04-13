---
id: "renderer_postprocessing_materials_effectmaterial.effectmaterial"
title: "Class: EffectMaterial"
sidebar_label: "EffectMaterial"
custom_edit_url: null
hide_title: true
---

# Class: EffectMaterial

[renderer/postprocessing/materials/EffectMaterial](../modules/renderer_postprocessing_materials_effectmaterial.md).EffectMaterial

An effect material for compound shaders.

This material supports dithering.

**`implements`** {Resizable}

## Hierarchy

* *ShaderMaterial*

  ↳ **EffectMaterial**

## Constructors

### constructor

\+ **new EffectMaterial**(`shaderParts?`: *any*, `defines?`: *any*, `uniforms?`: *any*, `camera?`: *any*, `dithering?`: *boolean*): [*EffectMaterial*](renderer_postprocessing_materials_effectmaterial.effectmaterial.md)

Constructs a new effect material.

#### Parameters:

Name | Type | Default value |
:------ | :------ | :------ |
`shaderParts` | *any* | null |
`defines` | *any* | null |
`uniforms` | *any* | null |
`camera` | *any* | null |
`dithering` | *boolean* | false |

**Returns:** [*EffectMaterial*](renderer_postprocessing_materials_effectmaterial.effectmaterial.md)

Overrides: void

Defined in: [packages/engine/src/renderer/postprocessing/materials/EffectMaterial.ts:13](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/materials/EffectMaterial.ts#L13)

## Accessors

### depthPacking

• get **depthPacking**(): *number*

The current depth packing.

**Returns:** *number*

Defined in: [packages/engine/src/renderer/postprocessing/materials/EffectMaterial.ts:75](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/materials/EffectMaterial.ts#L75)

• set **depthPacking**(`value`: *number*): *void*

Sets the depth packing.

Use `BasicDepthPacking` or `RGBADepthPacking` if your depth texture
contains packed depth.

#### Parameters:

Name | Type |
:------ | :------ |
`value` | *number* |

**Returns:** *void*

Defined in: [packages/engine/src/renderer/postprocessing/materials/EffectMaterial.ts:88](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/materials/EffectMaterial.ts#L88)

## Methods

### adoptCameraSettings

▸ **adoptCameraSettings**(`camera?`: *any*): *void*

Adopts the settings of the given camera.

#### Parameters:

Name | Type | Default value |
:------ | :------ | :------ |
`camera` | *any* | null |

**Returns:** *void*

Defined in: [packages/engine/src/renderer/postprocessing/materials/EffectMaterial.ts:153](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/materials/EffectMaterial.ts#L153)

___

### setDefines

▸ **setDefines**(`defines`: *any*): [*EffectMaterial*](renderer_postprocessing_materials_effectmaterial.effectmaterial.md)

Sets the shader macros.

#### Parameters:

Name | Type | Description |
:------ | :------ | :------ |
`defines` | *any* | A collection of preprocessor macro definitions.   |

**Returns:** [*EffectMaterial*](renderer_postprocessing_materials_effectmaterial.effectmaterial.md)

This material.

Defined in: [packages/engine/src/renderer/postprocessing/materials/EffectMaterial.ts:122](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/materials/EffectMaterial.ts#L122)

___

### setShaderParts

▸ **setShaderParts**(`shaderParts`: *any*): [*EffectMaterial*](renderer_postprocessing_materials_effectmaterial.effectmaterial.md)

Sets the shader parts.

#### Parameters:

Name | Type | Description |
:------ | :------ | :------ |
`shaderParts` | *any* | A collection of shader snippets. See [Section](../modules/renderer_postprocessing_materials_effectmaterial.md#section).   |

**Returns:** [*EffectMaterial*](renderer_postprocessing_materials_effectmaterial.effectmaterial.md)

This material.

Defined in: [packages/engine/src/renderer/postprocessing/materials/EffectMaterial.ts:100](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/materials/EffectMaterial.ts#L100)

___

### setSize

▸ **setSize**(`width`: *any*, `height`: *any*): *void*

Sets the resolution.

#### Parameters:

Name | Type | Description |
:------ | :------ | :------ |
`width` | *any* | The width.   |
`height` | *any* | The height.    |

**Returns:** *void*

Defined in: [packages/engine/src/renderer/postprocessing/materials/EffectMaterial.ts:175](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/materials/EffectMaterial.ts#L175)

___

### setUniforms

▸ **setUniforms**(`uniforms`: *any*): [*EffectMaterial*](renderer_postprocessing_materials_effectmaterial.effectmaterial.md)

Sets the shader uniforms.

#### Parameters:

Name | Type | Description |
:------ | :------ | :------ |
`uniforms` | *any* | A collection of uniforms.   |

**Returns:** [*EffectMaterial*](renderer_postprocessing_materials_effectmaterial.effectmaterial.md)

This material.

Defined in: [packages/engine/src/renderer/postprocessing/materials/EffectMaterial.ts:139](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/materials/EffectMaterial.ts#L139)
