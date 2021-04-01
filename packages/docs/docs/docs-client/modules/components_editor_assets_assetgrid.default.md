---
id: "components_editor_assets_assetgrid.default"
title: "Namespace: default"
sidebar_label: "default"
custom_edit_url: null
hide_title: true
---

# Namespace: default

[components/editor/assets/AssetGrid](components_editor_assets_assetgrid.md).default

## Variables

### defaultProps

• **defaultProps**: *object*

#### Type declaration:

Name | Type |
:------ | :------ |
`items` | *any*[] |
`onSelect` | () => *void* |
`selectedItems` | *any*[] |
`tooltip` | *typeof* [*default*](components_editor_assets_assettooltip.md#default) |

___

### propTypes

• **propTypes**: *object*

#### Type declaration:

Name | Type |
:------ | :------ |
`hasMore` | *Requireable*<boolean\> |
`isLoading` | *Requireable*<boolean\> |
`items` | *Validator*<InferProps<{ `id`: *Validator*<any\> ; `label`: *Requireable*<string\> ; `thumbnailUrl`: *Requireable*<string\>  }\>[]\> |
`onLoadMore` | *Validator*<(...`args`: *any*[]) => *any*\> |
`onSelect` | *Requireable*<(...`args`: *any*[]) => *any*\> |
`selectedItems` | *Validator*<InferProps<{ `id`: *Validator*<any\> ; `label`: *Requireable*<string\> ; `thumbnailUrl`: *Requireable*<string\>  }\>[]\> |
`source` | *Requireable*<object\> |
`tooltip` | *Requireable*<(...`args`: *any*[]) => *any*\> |
