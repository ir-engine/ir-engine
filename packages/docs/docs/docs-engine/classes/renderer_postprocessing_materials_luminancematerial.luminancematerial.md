---
id: "renderer_postprocessing_materials_luminancematerial.luminancematerial"
title: "Class: LuminanceMaterial"
sidebar_label: "LuminanceMaterial"
custom_edit_url: null
hide_title: true
---

# Class: LuminanceMaterial

[renderer/postprocessing/materials/LuminanceMaterial](../modules/renderer_postprocessing_materials_luminancematerial.md).LuminanceMaterial

A luminance shader material.

This shader produces a greyscale luminance map that describes the absolute
amount of light emitted by a scene. It can also be configured to output
colours that are scaled with their respective luminance value. Additionally,
a range may be provided to mask out undesired texels.

The alpha channel always contains the luminance value.

On luminance coefficients:
 http://www.poynton.com/notes/colour_and_gamma/ColorFAQ.html#RTFToC9

Coefficients for different colour spaces:
 https://hsto.org/getpro/habr/post_images/2ab/69d/084/2ab69d084f9a597e032624bcd74d57a7.png

Luminance range reference:
 https://cycling74.com/2007/05/23/your-first-shader/#.Vty9FfkrL4Z

## Hierarchy

* *ShaderMaterial*

  ↳ **LuminanceMaterial**

## Constructors

### constructor

\+ **new LuminanceMaterial**(`colorOutput?`: *boolean*, `luminanceRange?`: *any*): [*LuminanceMaterial*](renderer_postprocessing_materials_luminancematerial.luminancematerial.md)

Constructs a new luminance material.

#### Parameters:

Name | Type | Default value |
:------ | :------ | :------ |
`colorOutput` | *boolean* | false |
`luminanceRange` | *any* | null |

**Returns:** [*LuminanceMaterial*](renderer_postprocessing_materials_luminancematerial.luminancematerial.md)

Overrides: void

Defined in: [packages/engine/src/renderer/postprocessing/materials/LuminanceMaterial.ts:25](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/materials/LuminanceMaterial.ts#L25)

## Accessors

### colorOutput

• get **colorOutput**(): *boolean*

Indicates whether color output is enabled.

**Returns:** *boolean*

Defined in: [packages/engine/src/renderer/postprocessing/materials/LuminanceMaterial.ts:135](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/materials/LuminanceMaterial.ts#L135)

• set **colorOutput**(`value`: *boolean*): *void*

Enables or disables color output.

#### Parameters:

Name | Type |
:------ | :------ |
`value` | *boolean* |

**Returns:** *void*

Defined in: [packages/engine/src/renderer/postprocessing/materials/LuminanceMaterial.ts:145](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/materials/LuminanceMaterial.ts#L145)

___

### luminanceRange

• get **luminanceRange**(): *boolean*

Indicates whether luminance masking is enabled.

**`deprecated`** Use useRange instead.

**Returns:** *boolean*

Defined in: [packages/engine/src/renderer/postprocessing/materials/LuminanceMaterial.ts:201](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/materials/LuminanceMaterial.ts#L201)

• set **luminanceRange**(`value`: *boolean*): *void*

Enables or disables luminance masking.

**`deprecated`** Use useRange instead.

#### Parameters:

Name | Type |
:------ | :------ |
`value` | *boolean* |

**Returns:** *void*

Defined in: [packages/engine/src/renderer/postprocessing/materials/LuminanceMaterial.ts:212](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/materials/LuminanceMaterial.ts#L212)

___

### smoothing

• get **smoothing**(): *any*

The luminance threshold smoothing.

**Returns:** *any*

Defined in: [packages/engine/src/renderer/postprocessing/materials/LuminanceMaterial.ts:89](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/materials/LuminanceMaterial.ts#L89)

• set **smoothing**(`value`: *any*): *void*

Sets the luminance threshold smoothing.

#### Parameters:

Name | Type |
:------ | :------ |
`value` | *any* |

**Returns:** *void*

Defined in: [packages/engine/src/renderer/postprocessing/materials/LuminanceMaterial.ts:99](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/materials/LuminanceMaterial.ts#L99)

___

### threshold

• get **threshold**(): *any*

The luminance threshold.

**Returns:** *any*

Defined in: [packages/engine/src/renderer/postprocessing/materials/LuminanceMaterial.ts:69](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/materials/LuminanceMaterial.ts#L69)

• set **threshold**(`value`: *any*): *void*

Sets the luminance threshold.

#### Parameters:

Name | Type |
:------ | :------ |
`value` | *any* |

**Returns:** *void*

Defined in: [packages/engine/src/renderer/postprocessing/materials/LuminanceMaterial.ts:79](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/materials/LuminanceMaterial.ts#L79)

___

### useRange

• get **useRange**(): *boolean*

Indicates whether luminance masking is enabled.

**Returns:** *boolean*

Defined in: [packages/engine/src/renderer/postprocessing/materials/LuminanceMaterial.ts:172](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/materials/LuminanceMaterial.ts#L172)

• set **useRange**(`value`: *boolean*): *void*

Enables or disables luminance masking.

If enabled, the threshold will be ignored.

#### Parameters:

Name | Type |
:------ | :------ |
`value` | *boolean* |

**Returns:** *void*

Defined in: [packages/engine/src/renderer/postprocessing/materials/LuminanceMaterial.ts:184](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/materials/LuminanceMaterial.ts#L184)

___

### useThreshold

• get **useThreshold**(): *boolean*

Indicates whether the luminance threshold is enabled.

**Returns:** *boolean*

Defined in: [packages/engine/src/renderer/postprocessing/materials/LuminanceMaterial.ts:109](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/materials/LuminanceMaterial.ts#L109)

• set **useThreshold**(`value`: *boolean*): *void*

Enables or disables the luminance threshold.

#### Parameters:

Name | Type |
:------ | :------ |
`value` | *boolean* |

**Returns:** *void*

Defined in: [packages/engine/src/renderer/postprocessing/materials/LuminanceMaterial.ts:119](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/materials/LuminanceMaterial.ts#L119)

## Methods

### setColorOutputEnabled

▸ **setColorOutputEnabled**(`enabled`: *any*): *void*

Enables or disables color output.

**`deprecated`** Use colorOutput instead.

#### Parameters:

Name | Type | Description |
:------ | :------ | :------ |
`enabled` | *any* | Whether color output should be enabled.    |

**Returns:** *void*

Defined in: [packages/engine/src/renderer/postprocessing/materials/LuminanceMaterial.ts:162](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/materials/LuminanceMaterial.ts#L162)

___

### setLuminanceRangeEnabled

▸ **setLuminanceRangeEnabled**(`enabled`: *any*): *void*

Enables or disables the luminance mask.

**`deprecated`** Use luminanceRange instead.

#### Parameters:

Name | Type | Description |
:------ | :------ | :------ |
`enabled` | *any* | Whether the luminance mask should be enabled.    |

**Returns:** *void*

Defined in: [packages/engine/src/renderer/postprocessing/materials/LuminanceMaterial.ts:223](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/materials/LuminanceMaterial.ts#L223)
