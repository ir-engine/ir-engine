---
id: "renderer_postprocessing_materials_maskmaterial.maskmaterial"
title: "Class: MaskMaterial"
sidebar_label: "MaskMaterial"
custom_edit_url: null
hide_title: true
---

# Class: MaskMaterial

[renderer/postprocessing/materials/MaskMaterial](../modules/renderer_postprocessing_materials_maskmaterial.md).MaskMaterial

A mask shader material.

This material applies a mask texture to a buffer.

## Hierarchy

* *ShaderMaterial*

  ↳ **MaskMaterial**

## Constructors

### constructor

\+ **new MaskMaterial**(`maskTexture?`: *any*): [*MaskMaterial*](renderer_postprocessing_materials_maskmaterial.maskmaterial.md)

Constructs a new mask material.

#### Parameters:

Name | Type | Default value |
:------ | :------ | :------ |
`maskTexture` | *any* | null |

**Returns:** [*MaskMaterial*](renderer_postprocessing_materials_maskmaterial.maskmaterial.md)

Overrides: void

Defined in: [packages/engine/src/renderer/postprocessing/materials/MaskMaterial.ts:12](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/materials/MaskMaterial.ts#L12)

## Accessors

### colorChannel

• set **colorChannel**(`value`: *any*): *void*

Sets the color channel to use for masking.

The default channel is `RED`.

#### Parameters:

Name | Type |
:------ | :------ |
`value` | *any* |

**Returns:** *void*

Defined in: [packages/engine/src/renderer/postprocessing/materials/MaskMaterial.ts:63](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/materials/MaskMaterial.ts#L63)

___

### inverted

• get **inverted**(): *boolean*

Indicates whether the masking is inverted.

**Returns:** *boolean*

Defined in: [packages/engine/src/renderer/postprocessing/materials/MaskMaterial.ts:87](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/materials/MaskMaterial.ts#L87)

• set **inverted**(`value`: *boolean*): *void*

Determines whether the masking should be inverted.

#### Parameters:

Name | Type |
:------ | :------ |
`value` | *boolean* |

**Returns:** *void*

Defined in: [packages/engine/src/renderer/postprocessing/materials/MaskMaterial.ts:97](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/materials/MaskMaterial.ts#L97)

___

### maskFunction

• set **maskFunction**(`value`: *any*): *void*

Sets the masking technique.

The default function is `DISCARD`.

#### Parameters:

Name | Type |
:------ | :------ |
`value` | *any* |

**Returns:** *void*

Defined in: [packages/engine/src/renderer/postprocessing/materials/MaskMaterial.ts:76](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/materials/MaskMaterial.ts#L76)

___

### maskTexture

• set **maskTexture**(`value`: *any*): *void*

Sets the mask texture.

#### Parameters:

Name | Type |
:------ | :------ |
`value` | *any* |

**Returns:** *void*

Defined in: [packages/engine/src/renderer/postprocessing/materials/MaskMaterial.ts:51](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/materials/MaskMaterial.ts#L51)

___

### strength

• get **strength**(): *any*

The current mask strength.

Individual mask values will be clamped to [0.0, 1.0].

**Returns:** *any*

Defined in: [packages/engine/src/renderer/postprocessing/materials/MaskMaterial.ts:115](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/materials/MaskMaterial.ts#L115)

• set **strength**(`value`: *any*): *void*

Sets the strength of the mask.

Has no effect when the mask function is set to `DISCARD`.

#### Parameters:

Name | Type |
:------ | :------ |
`value` | *any* |

**Returns:** *void*

Defined in: [packages/engine/src/renderer/postprocessing/materials/MaskMaterial.ts:127](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/materials/MaskMaterial.ts#L127)
