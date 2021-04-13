---
id: "assets_loaders_gltf_gltfloader.gltfloader"
title: "Class: GLTFLoader"
sidebar_label: "GLTFLoader"
custom_edit_url: null
hide_title: true
---

# Class: GLTFLoader

[assets/loaders/gltf/GLTFLoader](../modules/assets_loaders_gltf_gltfloader.md).GLTFLoader

## Hierarchy

* *Loader*

  ↳ **GLTFLoader**

## Constructors

### constructor

\+ **new GLTFLoader**(`manager?`: *any*): [*GLTFLoader*](assets_loaders_gltf_gltfloader.gltfloader.md)

#### Parameters:

Name | Type |
:------ | :------ |
`manager?` | *any* |

**Returns:** [*GLTFLoader*](assets_loaders_gltf_gltfloader.gltfloader.md)

Overrides: void

Defined in: [packages/engine/src/assets/loaders/gltf/GLTFLoader.d.ts:31](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/assets/loaders/gltf/GLTFLoader.d.ts#L31)

## Properties

### dracoLoader

• **dracoLoader**: [*DRACOLoader*](assets_loaders_gltf_dracoloader.dracoloader.md)

Defined in: [packages/engine/src/assets/loaders/gltf/GLTFLoader.d.ts:34](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/assets/loaders/gltf/GLTFLoader.d.ts#L34)

## Methods

### load

▸ **load**(`url`: *string*, `onLoad`: (`gltf`: [*GLTF*](../interfaces/assets_loaders_gltf_gltfloader.gltf.md)) => *void*, `onProgress?`: (`event`: *ProgressEvent*<EventTarget\>) => *void*, `onError?`: (`event`: ErrorEvent) => *void*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`url` | *string* |
`onLoad` | (`gltf`: [*GLTF*](../interfaces/assets_loaders_gltf_gltfloader.gltf.md)) => *void* |
`onProgress?` | (`event`: *ProgressEvent*<EventTarget\>) => *void* |
`onError?` | (`event`: ErrorEvent) => *void* |

**Returns:** *void*

Defined in: [packages/engine/src/assets/loaders/gltf/GLTFLoader.d.ts:35](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/assets/loaders/gltf/GLTFLoader.d.ts#L35)

___

### parse

▸ **parse**(`data`: *string* \| ArrayBuffer, `path`: *string*, `onLoad`: (`gltf`: [*GLTF*](../interfaces/assets_loaders_gltf_gltfloader.gltf.md)) => *void*, `onError?`: (`event`: ErrorEvent) => *void*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`data` | *string* \| ArrayBuffer |
`path` | *string* |
`onLoad` | (`gltf`: [*GLTF*](../interfaces/assets_loaders_gltf_gltfloader.gltf.md)) => *void* |
`onError?` | (`event`: ErrorEvent) => *void* |

**Returns:** *void*

Defined in: [packages/engine/src/assets/loaders/gltf/GLTFLoader.d.ts:39](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/assets/loaders/gltf/GLTFLoader.d.ts#L39)

___

### setDRACOLoader

▸ **setDRACOLoader**(`dracoLoader`: [*DRACOLoader*](assets_loaders_gltf_dracoloader.dracoloader.md)): [*GLTFLoader*](assets_loaders_gltf_gltfloader.gltfloader.md)

#### Parameters:

Name | Type |
:------ | :------ |
`dracoLoader` | [*DRACOLoader*](assets_loaders_gltf_dracoloader.dracoloader.md) |

**Returns:** [*GLTFLoader*](assets_loaders_gltf_gltfloader.gltfloader.md)

Defined in: [packages/engine/src/assets/loaders/gltf/GLTFLoader.d.ts:36](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/assets/loaders/gltf/GLTFLoader.d.ts#L36)

___

### setMeshoptDecoder

▸ **setMeshoptDecoder**(`meshoptDecoder`: *any*): [*GLTFLoader*](assets_loaders_gltf_gltfloader.gltfloader.md)

#### Parameters:

Name | Type |
:------ | :------ |
`meshoptDecoder` | *any* |

**Returns:** [*GLTFLoader*](assets_loaders_gltf_gltfloader.gltfloader.md)

Defined in: [packages/engine/src/assets/loaders/gltf/GLTFLoader.d.ts:37](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/assets/loaders/gltf/GLTFLoader.d.ts#L37)
