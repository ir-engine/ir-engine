---
id: "src_world_components_editor_dnd"
title: "Module: src/world/components/editor/dnd"
sidebar_label: "src/world/components/editor/dnd"
custom_edit_url: null
hide_title: true
---

# Module: src/world/components/editor/dnd

## Variables

### AssetTypes

• `Const` **AssetTypes**: *string*[]

AssetTypes array containing types of items used.

**`author`** Robert Long

Defined in: [packages/client-core/src/world/components/editor/dnd/index.tsx:26](https://github.com/xr3ngine/xr3ngine/blob/7e8e151f1/packages/client-core/src/world/components/editor/dnd/index.tsx#L26)

___

### ItemTypes

• `Const` **ItemTypes**: *object*

ItemTypes object containing types of items used.

**`author`** Robert Long

#### Type declaration:

| Name | Type |
| :------ | :------ |
| `Audio` | *string* |
| `Element` | *string* |
| `File` | *string* |
| `Image` | *string* |
| `Model` | *string* |
| `Node` | *string* |
| `Video` | *string* |
| `Volumetric` | *string* |

Defined in: [packages/client-core/src/world/components/editor/dnd/index.tsx:9](https://github.com/xr3ngine/xr3ngine/blob/7e8e151f1/packages/client-core/src/world/components/editor/dnd/index.tsx#L9)

## Functions

### addAssetAtCursorPositionOnDrop

▸ **addAssetAtCursorPositionOnDrop**(`editor`: *any*, `item`: *any*, `mousePos`: *any*): *boolean*

addAssetAtCursorPositionOnDrop used to add element on editor scene position using cursor.

**`author`** Robert Long

#### Parameters:

| Name | Type |
| :------ | :------ |
| `editor` | *any* |
| `item` | *any* |
| `mousePos` | *any* |

**Returns:** *boolean*

Defined in: [packages/client-core/src/world/components/editor/dnd/index.tsx:75](https://github.com/xr3ngine/xr3ngine/blob/7e8e151f1/packages/client-core/src/world/components/editor/dnd/index.tsx#L75)

___

### addAssetOnDrop

▸ **addAssetOnDrop**(`editor`: *any*, `item`: *any*, `parent?`: *any*, `before?`: *any*): *boolean*

addAssetOnDrop used to adding assets to the editor scene.

**`author`** Robert Long

#### Parameters:

| Name | Type |
| :------ | :------ |
| `editor` | *any* |
| `item` | *any* |
| `parent?` | *any* |
| `before?` | *any* |

**Returns:** *boolean*

Defined in: [packages/client-core/src/world/components/editor/dnd/index.tsx:54](https://github.com/xr3ngine/xr3ngine/blob/7e8e151f1/packages/client-core/src/world/components/editor/dnd/index.tsx#L54)

___

### isAsset

▸ **isAsset**(`item`: *any*): *boolean*

isAsset function to check item exists in array types or not.

**`author`** Robert Long

#### Parameters:

| Name | Type |
| :------ | :------ |
| `item` | *any* |

**Returns:** *boolean*

Defined in: [packages/client-core/src/world/components/editor/dnd/index.tsx:41](https://github.com/xr3ngine/xr3ngine/blob/7e8e151f1/packages/client-core/src/world/components/editor/dnd/index.tsx#L41)
