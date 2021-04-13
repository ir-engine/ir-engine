---
id: "assets_classes_assetloader.assetloader"
title: "Class: AssetLoader"
sidebar_label: "AssetLoader"
custom_edit_url: null
hide_title: true
---

# Class: AssetLoader

[assets/classes/AssetLoader](../modules/assets_classes_assetloader.md).AssetLoader

## Constructors

### constructor

\+ **new AssetLoader**(`params`: AssetLoaderParamType, `onLoad`: (`response`: *any*) => *void*, `onProgress?`: (`request`: *ProgressEvent*<EventTarget\>) => *void*, `onError?`: (`event`: ErrorEvent \| Error) => *void*): [*AssetLoader*](assets_classes_assetloader.assetloader.md)

#### Parameters:

Name | Type |
:------ | :------ |
`params` | AssetLoaderParamType |
`onLoad` | (`response`: *any*) => *void* |
`onProgress?` | (`request`: *ProgressEvent*<EventTarget\>) => *void* |
`onError?` | (`event`: ErrorEvent \| Error) => *void* |

**Returns:** [*AssetLoader*](assets_classes_assetloader.assetloader.md)

Defined in: [packages/engine/src/assets/classes/AssetLoader.ts:29](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/assets/classes/AssetLoader.ts#L29)

## Properties

### assetClass

• **assetClass**: [*AssetClass*](../enums/assets_enum_assetclass.assetclass.md)

Defined in: [packages/engine/src/assets/classes/AssetLoader.ts:26](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/assets/classes/AssetLoader.ts#L26)

___

### assetType

• **assetType**: [*AssetType*](../enums/assets_enum_assettype.assettype.md)

Defined in: [packages/engine/src/assets/classes/AssetLoader.ts:25](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/assets/classes/AssetLoader.ts#L25)

___

### fileLoader

• **fileLoader**: *any*

Defined in: [packages/engine/src/assets/classes/AssetLoader.ts:27](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/assets/classes/AssetLoader.ts#L27)

___

### result

• **result**: *any*

Defined in: [packages/engine/src/assets/classes/AssetLoader.ts:28](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/assets/classes/AssetLoader.ts#L28)

___

### status

• **status**: *number*

Defined in: [packages/engine/src/assets/classes/AssetLoader.ts:29](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/assets/classes/AssetLoader.ts#L29)

___

### Cache

▪ `Static` **Cache**: *Map*<string, any\>

Defined in: [packages/engine/src/assets/classes/AssetLoader.ts:22](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/assets/classes/AssetLoader.ts#L22)

___

### loaders

▪ `Static` **loaders**: *Map*<number, any\>

Defined in: [packages/engine/src/assets/classes/AssetLoader.ts:23](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/assets/classes/AssetLoader.ts#L23)

## Methods

### \_onError

▸ **_onError**(`event`: ErrorEvent \| Error): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`event` | ErrorEvent \| Error |

**Returns:** *void*

Defined in: [packages/engine/src/assets/classes/AssetLoader.ts:238](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/assets/classes/AssetLoader.ts#L238)

___

### \_onLoad

▸ **_onLoad**(`response`: *any*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`response` | *any* |

**Returns:** *void*

Defined in: [packages/engine/src/assets/classes/AssetLoader.ts:214](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/assets/classes/AssetLoader.ts#L214)

___

### \_onProgress

▸ **_onProgress**(`request`: *ProgressEvent*<EventTarget\>): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`request` | *ProgressEvent*<EventTarget\> |

**Returns:** *void*

Defined in: [packages/engine/src/assets/classes/AssetLoader.ts:232](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/assets/classes/AssetLoader.ts#L232)

___

### dispatchEvent

▸ **dispatchEvent**(): *void*

**Returns:** *void*

Defined in: [packages/engine/src/assets/classes/AssetLoader.ts:204](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/assets/classes/AssetLoader.ts#L204)

___

### getAssetClass

▸ **getAssetClass**(`assetFileName`: *string*): [*AssetClass*](../enums/assets_enum_assetclass.assetclass.md)

Get asset class from the asset file extension.

#### Parameters:

Name | Type | Description |
:------ | :------ | :------ |
`assetFileName` | *string* | Name of the Asset file.   |

**Returns:** [*AssetClass*](../enums/assets_enum_assetclass.assetclass.md)

Asset class of the file.

Defined in: [packages/engine/src/assets/classes/AssetLoader.ts:194](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/assets/classes/AssetLoader.ts#L194)

___

### getAssetType

▸ **getAssetType**(`assetFileName`: *string*): [*AssetType*](../enums/assets_enum_assettype.assettype.md)

Get asset type from the asset file extension.

#### Parameters:

Name | Type | Description |
:------ | :------ | :------ |
`assetFileName` | *string* | Name of the Asset file.   |

**Returns:** [*AssetType*](../enums/assets_enum_assettype.assettype.md)

Asset type of the file.

Defined in: [packages/engine/src/assets/classes/AssetLoader.ts:174](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/assets/classes/AssetLoader.ts#L174)

___

### handleLODs

▸ **handleLODs**(`asset`: *any*): *any*

Handles Level of Detail for asset.

#### Parameters:

Name | Type | Description |
:------ | :------ | :------ |
`asset` | *any* | Asset on which LOD will apply.   |

**Returns:** *any*

LOD handled asset.

Defined in: [packages/engine/src/assets/classes/AssetLoader.ts:79](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/assets/classes/AssetLoader.ts#L79)

___

### processAsset

▸ **processAsset**(`asset`: *any*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`asset` | *any* |

**Returns:** *void*

Defined in: [packages/engine/src/assets/classes/AssetLoader.ts:116](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/assets/classes/AssetLoader.ts#L116)

___

### load

▸ `Static`**load**(`params`: AssetLoaderParamType, `onLoad`: (`response`: *any*) => *void*, `onProgress?`: (`request`: *ProgressEvent*<EventTarget\>) => *void*, `onError?`: (`event`: ErrorEvent \| Error) => *void*): [*AssetLoader*](assets_classes_assetloader.assetloader.md)

#### Parameters:

Name | Type |
:------ | :------ |
`params` | AssetLoaderParamType |
`onLoad` | (`response`: *any*) => *void* |
`onProgress?` | (`request`: *ProgressEvent*<EventTarget\>) => *void* |
`onError?` | (`event`: ErrorEvent \| Error) => *void* |

**Returns:** [*AssetLoader*](assets_classes_assetloader.assetloader.md)

Defined in: [packages/engine/src/assets/classes/AssetLoader.ts:245](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/assets/classes/AssetLoader.ts#L245)
