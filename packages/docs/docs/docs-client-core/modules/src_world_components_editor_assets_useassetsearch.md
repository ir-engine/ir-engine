---
id: "src_world_components_editor_assets_useassetsearch"
title: "Module: src/world/components/editor/assets/useAssetSearch"
sidebar_label: "src/world/components/editor/assets/useAssetSearch"
custom_edit_url: null
hide_title: true
---

# Module: src/world/components/editor/assets/useAssetSearch

## Functions

### useAddRemoveItems

▸ **useAddRemoveItems**(`items`: *any*, `dependencies?`: *any*[]): *any*[]

useAddRemoveItems function component provides callback function for adding and removing items.

**`author`** Robert Long

#### Parameters:

Name | Type |
:------ | :------ |
`items` | *any* |
`dependencies` | *any*[] |

**Returns:** *any*[]

[returns array containing finalItems, addItem, removeItem]

Defined in: [packages/client-core/src/world/components/editor/assets/useAssetSearch.tsx:232](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/client-core/src/world/components/editor/assets/useAssetSearch.tsx#L232)

___

### useAssetSearch

▸ **useAssetSearch**(`source`: *any*, `initialParams?`: {}, `initialResults?`: *any*[], `initialCursor?`: *number*): *object*

useAssetSearch used for providing search on MediaSourcePanel.

**`author`** Robert Long

#### Parameters:

Name | Type | Default value |
:------ | :------ | :------ |
`source` | *any* | - |
`initialParams` | *object* | - |
`initialResults` | *any*[] | - |
`initialCursor` | *number* | 0 |

**Returns:** *object*

Name | Type |
:------ | :------ |
`error` | *any* |
`hasMore` | *boolean* |
`isLoading` | *boolean* |
`loadMore` | (`params`: *any*) => *void* |
`params` | *object* |
`results` | *any*[] |
`setParams` | (`nextParams`: *any*) => *void* |
`suggestions` | *any*[] |

Defined in: [packages/client-core/src/world/components/editor/assets/useAssetSearch.tsx:154](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/client-core/src/world/components/editor/assets/useAssetSearch.tsx#L154)

___

### useLoadAsync

▸ **useLoadAsync**(`callback`: *any*, `initialResults?`: *any*[], `initialCursor?`: *number*): *object*

useLoadAsyncfunction used to load AssetPanelContent by calling API.

**`author`** Robert Long

#### Parameters:

Name | Type | Default value |
:------ | :------ | :------ |
`callback` | *any* | - |
`initialResults` | *any*[] | - |
`initialCursor` | *number* | 0 |

**Returns:** *object*

Name | Type |
:------ | :------ |
`error` | *any* |
`hasMore` | *boolean* |
`isLoading` | *boolean* |
`loadAsync` | (`params`: *any*) => *void* |
`loadMore` | (`params`: *any*) => *void* |
`results` | *any*[] |
`suggestions` | *any*[] |

Object

Defined in: [packages/client-core/src/world/components/editor/assets/useAssetSearch.tsx:28](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/client-core/src/world/components/editor/assets/useAssetSearch.tsx#L28)
