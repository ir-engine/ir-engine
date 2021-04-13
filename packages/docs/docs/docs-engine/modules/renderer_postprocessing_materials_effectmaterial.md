---
id: "renderer_postprocessing_materials_effectmaterial"
title: "Module: renderer/postprocessing/materials/EffectMaterial"
sidebar_label: "renderer/postprocessing/materials/EffectMaterial"
custom_edit_url: null
hide_title: true
---

# Module: renderer/postprocessing/materials/EffectMaterial

## Table of contents

### Classes

- [EffectMaterial](../classes/renderer_postprocessing_materials_effectmaterial.effectmaterial.md)

## Variables

### Section

• `Const` **Section**: *object*

An enumeration of shader code placeholders used by the [EffectPass](../classes/renderer_postprocessing_passes_effectpass.effectpass.md).

**`property`** {String} FRAGMENT_HEAD - A placeholder for function and variable declarations inside the fragment shader.

**`property`** {String} FRAGMENT_MAIN_UV - A placeholder for UV transformations inside the fragment shader.

**`property`** {String} FRAGMENT_MAIN_IMAGE - A placeholder for color calculations inside the fragment shader.

**`property`** {String} VERTEX_HEAD - A placeholder for function and variable declarations inside the vertex shader.

**`property`** {String} VERTEX_MAIN_SUPPORT - A placeholder for supporting calculations inside the vertex shader.

#### Type declaration:

Name | Type |
:------ | :------ |
`FRAGMENT_HEAD` | *string* |
`FRAGMENT_MAIN_IMAGE` | *string* |
`FRAGMENT_MAIN_UV` | *string* |
`VERTEX_HEAD` | *string* |
`VERTEX_MAIN_SUPPORT` | *string* |

Defined in: [packages/engine/src/renderer/postprocessing/materials/EffectMaterial.ts:196](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/materials/EffectMaterial.ts#L196)
