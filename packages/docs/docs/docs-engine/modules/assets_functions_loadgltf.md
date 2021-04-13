---
id: "assets_functions_loadgltf"
title: "Module: assets/functions/LoadGLTF"
sidebar_label: "assets/functions/LoadGLTF"
custom_edit_url: null
hide_title: true
---

# Module: assets/functions/LoadGLTF

## Table of contents

### Interfaces

- [LoadGLTFResultInterface](../interfaces/assets_functions_loadgltf.loadgltfresultinterface.md)

## Functions

### LoadGLTF

▸ **LoadGLTF**(`url`: *string*): *Promise*<[*LoadGLTFResultInterface*](../interfaces/assets_functions_loadgltf.loadgltfresultinterface.md)\>

Loads an Asset which is in GLTF format.

#### Parameters:

Name | Type | Description |
:------ | :------ | :------ |
`url` | *string* | URL of the asset.   |

**Returns:** *Promise*<[*LoadGLTFResultInterface*](../interfaces/assets_functions_loadgltf.loadgltfresultinterface.md)\>

a promise of [LoadGLTFResultInterface](../interfaces/assets_functions_loadgltf.loadgltfresultinterface.md).

Defined in: [packages/engine/src/assets/functions/LoadGLTF.ts:39](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/assets/functions/LoadGLTF.ts#L39)

___

### getLoader

▸ **getLoader**(): [*GLTFLoader*](../classes/assets_loaders_gltf_gltfloader.gltfloader.md)

**Returns:** [*GLTFLoader*](../classes/assets_loaders_gltf_gltfloader.gltfloader.md)

Defined in: [packages/engine/src/assets/functions/LoadGLTF.ts:29](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/assets/functions/LoadGLTF.ts#L29)

___

### loadExtentions

▸ `Const`**loadExtentions**(`gltf`: *any*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`gltf` | *any* |

**Returns:** *void*

Defined in: [packages/engine/src/assets/functions/LoadGLTF.ts:48](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/assets/functions/LoadGLTF.ts#L48)
