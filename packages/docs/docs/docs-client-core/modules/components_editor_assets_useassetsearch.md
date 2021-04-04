---
id: "components_editor_assets_useassetsearch"
title: "Module: components/editor/assets/useAssetSearch"
sidebar_label: "components/editor/assets/useAssetSearch"
custom_edit_url: null
hide_title: true
---

# Module: components/editor/assets/useAssetSearch

## Functions

### useAddRemoveItems

▸ **useAddRemoveItems**(`items`: *any*, `dependencies?`: *any*[]): *any*[]

[useAddRemoveItems function component provides callback function for adding and removing items]

#### Parameters:

Name | Type |
:------ | :------ |
`items` | *any* |
`dependencies` | *any*[] |

**Returns:** *any*[]

[returns array containing finalItems, addItem, removeItem]

Defined in: [packages/client-core/components/editor/assets/useAssetSearch.tsx:224](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/components/editor/assets/useAssetSearch.tsx#L224)

___

### useAssetSearch

▸ **useAssetSearch**(`source`: *any*, `initialParams?`: {}, `initialResults?`: *any*[], `initialCursor?`: *number*): *object*

useAssetSearch used for providing search on MediaSourcePanel

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

Defined in: [packages/client-core/components/editor/assets/useAssetSearch.tsx:148](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/components/editor/assets/useAssetSearch.tsx#L148)

___

### useLoadAsync

▸ **useLoadAsync**(`callback`: *any*, `initialResults?`: *any*[], `initialCursor?`: *number*): *object*

useLoadAsyncfunction used to load AssetPanelContent by calling API.

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

Defined in: [packages/client-core/components/editor/assets/useAssetSearch.tsx:24](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/components/editor/assets/useAssetSearch.tsx#L24)
