---
id: "client_core_components_editor_assets_useselection"
title: "Module: client-core/components/editor/assets/useSelection"
sidebar_label: "client-core/components/editor/assets/useSelection"
custom_edit_url: null
hide_title: true
---

# Module: client-core/components/editor/assets/useSelection

## Functions

### useSelection

▸ **useSelection**(`items`: *any*, `initialSelection?`: *any*[], `multiselect?`: *boolean*): *object*

[useSelection ]

#### Parameters:

Name | Type | Default value |
:------ | :------ | :------ |
`items` | *any* | - |
`initialSelection` | *any*[] | - |
`multiselect` | *boolean* | false |

**Returns:** *object*

Name | Type |
:------ | :------ |
`clearSelection` | (`item`: *any*, `e`: *any*) => *void* |
`onSelect` | (`item`: *any*, `e`: *any*) => *void* |
`selectedItems` | *any*[] |
`setSelectedItems` | *Dispatch*<SetStateAction<any[]\>\> |

[returns object containing selectedItems array, setSelectedItems  onSelect clearSelection  function callbacks]

Defined in: [packages/client-core/components/editor/assets/useSelection.tsx:60](https://github.com/xr3ngine/xr3ngine/blob/9d253dc38/packages/client-core/components/editor/assets/useSelection.tsx#L60)

___

### useSelectionHandler

▸ **useSelectionHandler**(`items`: *any*, `selectedItems`: *any*, `setSelectedItems`: *any*, `multiselect?`: *boolean*): (`item`: *any*, `e`: *any*) => *void*[]

useSelectionHandler function component used to set items selected.

#### Parameters:

Name | Type | Default value |
:------ | :------ | :------ |
`items` | *any* | - |
`selectedItems` | *any* | - |
`setSelectedItems` | *any* | - |
`multiselect` | *boolean* | false |

**Returns:** (`item`: *any*, `e`: *any*) => *void*[]

containing callback handlers onSelect and clearSelection.

Defined in: [packages/client-core/components/editor/assets/useSelection.tsx:11](https://github.com/xr3ngine/xr3ngine/blob/9d253dc38/packages/client-core/components/editor/assets/useSelection.tsx#L11)
