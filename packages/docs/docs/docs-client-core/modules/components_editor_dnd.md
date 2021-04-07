---
id: "components_editor_dnd"
title: "Module: components/editor/dnd"
sidebar_label: "components/editor/dnd"
custom_edit_url: null
hide_title: true
---

# Module: components/editor/dnd

## Variables

### AssetTypes

• `Const` **AssetTypes**: *string*[]

[AssetTypes array containing types of items used]

Defined in: [packages/client-core/components/editor/dnd/index.tsx:22](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/components/editor/dnd/index.tsx#L22)

___

### ItemTypes

• `Const` **ItemTypes**: *object*

[ItemTypes object containing types of items used]

#### Type declaration:

Name | Type |
:------ | :------ |
`Audio` | *string* |
`Element` | *string* |
`File` | *string* |
`Image` | *string* |
`Model` | *string* |
`Node` | *string* |
`Video` | *string* |
`Volumetric` | *string* |

Defined in: [packages/client-core/components/editor/dnd/index.tsx:7](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/components/editor/dnd/index.tsx#L7)

## Functions

### addAssetAtCursorPositionOnDrop

▸ **addAssetAtCursorPositionOnDrop**(`editor`: *any*, `item`: *any*, `mousePos`: *any*): *boolean*

[addAssetAtCursorPositionOnDrop used to add element on editor scene position using cursor]

#### Parameters:

Name | Type |
:------ | :------ |
`editor` | *any* |
`item` | *any* |
`mousePos` | *any* |

**Returns:** *boolean*

Defined in: [packages/client-core/components/editor/dnd/index.tsx:65](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/components/editor/dnd/index.tsx#L65)

___

### addAssetOnDrop

▸ **addAssetOnDrop**(`editor`: *any*, `item`: *any*, `parent?`: *any*, `before?`: *any*): *boolean*

[addAssetOnDrop used to adding assets to the editor scene]

#### Parameters:

Name | Type |
:------ | :------ |
`editor` | *any* |
`item` | *any* |
`parent?` | *any* |
`before?` | *any* |

**Returns:** *boolean*

Defined in: [packages/client-core/components/editor/dnd/index.tsx:46](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/components/editor/dnd/index.tsx#L46)

___

### isAsset

▸ **isAsset**(`item`: *any*): *boolean*

[isAsset function to check item exists in array types or not]

#### Parameters:

Name | Type |
:------ | :------ |
`item` | *any* |

**Returns:** *boolean*

Defined in: [packages/client-core/components/editor/dnd/index.tsx:35](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/components/editor/dnd/index.tsx#L35)
