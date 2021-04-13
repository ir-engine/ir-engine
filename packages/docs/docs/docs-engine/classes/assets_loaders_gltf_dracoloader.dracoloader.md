---
id: "assets_loaders_gltf_dracoloader.dracoloader"
title: "Class: DRACOLoader"
sidebar_label: "DRACOLoader"
custom_edit_url: null
hide_title: true
---

# Class: DRACOLoader

[assets/loaders/gltf/DRACOLoader](../modules/assets_loaders_gltf_dracoloader.md).DRACOLoader

## Hierarchy

* *Loader*

  ↳ **DRACOLoader**

## Constructors

### constructor

\+ **new DRACOLoader**(`manager?`: *any*): [*DRACOLoader*](assets_loaders_gltf_dracoloader.dracoloader.md)

#### Parameters:

Name | Type |
:------ | :------ |
`manager?` | *any* |

**Returns:** [*DRACOLoader*](assets_loaders_gltf_dracoloader.dracoloader.md)

Overrides: void

Defined in: [packages/engine/src/assets/loaders/gltf/DRACOLoader.d.ts:7](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/assets/loaders/gltf/DRACOLoader.d.ts#L7)

## Methods

### dispose

▸ **dispose**(): [*DRACOLoader*](assets_loaders_gltf_dracoloader.dracoloader.md)

**Returns:** [*DRACOLoader*](assets_loaders_gltf_dracoloader.dracoloader.md)

Defined in: [packages/engine/src/assets/loaders/gltf/DRACOLoader.d.ts:16](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/assets/loaders/gltf/DRACOLoader.d.ts#L16)

___

### load

▸ **load**(`url`: *string*, `onLoad`: (`geometry`: *any*) => *void*, `onProgress?`: (`event`: *ProgressEvent*<EventTarget\>) => *void*, `onError?`: (`event`: ErrorEvent) => *void*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`url` | *string* |
`onLoad` | (`geometry`: *any*) => *void* |
`onProgress?` | (`event`: *ProgressEvent*<EventTarget\>) => *void* |
`onError?` | (`event`: ErrorEvent) => *void* |

**Returns:** *void*

Defined in: [packages/engine/src/assets/loaders/gltf/DRACOLoader.d.ts:11](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/assets/loaders/gltf/DRACOLoader.d.ts#L11)

___

### preload

▸ **preload**(): [*DRACOLoader*](assets_loaders_gltf_dracoloader.dracoloader.md)

**Returns:** [*DRACOLoader*](assets_loaders_gltf_dracoloader.dracoloader.md)

Defined in: [packages/engine/src/assets/loaders/gltf/DRACOLoader.d.ts:15](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/assets/loaders/gltf/DRACOLoader.d.ts#L15)

___

### setDecoderConfig

▸ **setDecoderConfig**(`config`: *object*): [*DRACOLoader*](assets_loaders_gltf_dracoloader.dracoloader.md)

#### Parameters:

Name | Type |
:------ | :------ |
`config` | *object* |

**Returns:** [*DRACOLoader*](assets_loaders_gltf_dracoloader.dracoloader.md)

Defined in: [packages/engine/src/assets/loaders/gltf/DRACOLoader.d.ts:13](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/assets/loaders/gltf/DRACOLoader.d.ts#L13)

___

### setDecoderPath

▸ **setDecoderPath**(`path`: *string*): [*DRACOLoader*](assets_loaders_gltf_dracoloader.dracoloader.md)

#### Parameters:

Name | Type |
:------ | :------ |
`path` | *string* |

**Returns:** [*DRACOLoader*](assets_loaders_gltf_dracoloader.dracoloader.md)

Defined in: [packages/engine/src/assets/loaders/gltf/DRACOLoader.d.ts:12](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/assets/loaders/gltf/DRACOLoader.d.ts#L12)

___

### setWorkerLimit

▸ **setWorkerLimit**(`workerLimit`: *number*): [*DRACOLoader*](assets_loaders_gltf_dracoloader.dracoloader.md)

#### Parameters:

Name | Type |
:------ | :------ |
`workerLimit` | *number* |

**Returns:** [*DRACOLoader*](assets_loaders_gltf_dracoloader.dracoloader.md)

Defined in: [packages/engine/src/assets/loaders/gltf/DRACOLoader.d.ts:14](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/assets/loaders/gltf/DRACOLoader.d.ts#L14)
