---
id: "src_world_components_editor_assets_useselection"
title: "Module: src/world/components/editor/assets/useSelection"
sidebar_label: "src/world/components/editor/assets/useSelection"
custom_edit_url: null
hide_title: true
---

# Module: src/world/components/editor/assets/useSelection

## Functions

### useSelection

▸ **useSelection**(`items`: *any*, `initialSelection?`: *any*[], `multiselect?`: *boolean*): *object*

useSelection

**`author`** Robert Long

#### Parameters:

Name | Type | Default value |
:------ | :------ | :------ |
`items` | *any* | - |
`initialSelection` | *any*[] | [] |
`multiselect` | *boolean* | false |

**Returns:** *object*

Name | Type |
:------ | :------ |
`clearSelection` | (`item`: *any*, `e`: *any*) => *void* |
`onSelect` | (`item`: *any*, `e`: *any*) => *void* |
`selectedItems` | *any*[] |
`setSelectedItems` | *Dispatch*<SetStateAction<any[]\>\> |

[returns object containing selectedItems array, setSelectedItems  onSelect clearSelection  function callbacks]

Defined in: [packages/client-core/src/world/components/editor/assets/useSelection.tsx:64](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/client-core/src/world/components/editor/assets/useSelection.tsx#L64)

___

### useSelectionHandler

▸ **useSelectionHandler**(`items`: *any*, `selectedItems`: *any*, `setSelectedItems`: *any*, `multiselect?`: *boolean*): (`item`: *any*, `e`: *any*) => *void*[]

useSelectionHandler function component used to set items selected.

**`author`** Robert Long

#### Parameters:

Name | Type | Default value |
:------ | :------ | :------ |
`items` | *any* | - |
`selectedItems` | *any* | - |
`setSelectedItems` | *any* | - |
`multiselect` | *boolean* | false |

**Returns:** (`item`: *any*, `e`: *any*) => *void*[]

containing callback handlers onSelect and clearSelection.

Defined in: [packages/client-core/src/world/components/editor/assets/useSelection.tsx:13](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/client-core/src/world/components/editor/assets/useSelection.tsx#L13)
