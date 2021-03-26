---
id: "client_core_components_editor_contexts_dialogcontext"
title: "Module: client-core/components/editor/contexts/DialogContext"
sidebar_label: "client-core/components/editor/contexts/DialogContext"
custom_edit_url: null
hide_title: true
---

# Module: client-core/components/editor/contexts/DialogContext

## Variables

### DialogContext

• `Const` **DialogContext**: *Context*<{ `hideDialog`: () => *void* ; `showDialog`: (`DialogComponent`: *any*, `props`: *any*) => *void*  }\>

[DialogContext creating context using react]

Defined in: [packages/client-core/components/editor/contexts/DialogContext.tsx:6](https://github.com/xr3ngine/xr3ngine/blob/9d253dc38/packages/client-core/components/editor/contexts/DialogContext.tsx#L6)

___

### DialogContextProvider

• `Const` **DialogContextProvider**: *Provider*<{ `hideDialog`: () => *void* ; `showDialog`: (`DialogComponent`: *any*, `props`: *any*) => *void*  }\>

[DialogContextProvider provides component context value]

Defined in: [packages/client-core/components/editor/contexts/DialogContext.tsx:14](https://github.com/xr3ngine/xr3ngine/blob/9d253dc38/packages/client-core/components/editor/contexts/DialogContext.tsx#L14)

## Functions

### withDialog

▸ **withDialog**(`DialogComponent`: *any*): *function*

[withDialog used to customize component using context]

#### Parameters:

Name | Type |
:------ | :------ |
`DialogComponent` | *any* |

**Returns:** (`props`: *any*) => *Element*

Defined in: [packages/client-core/components/editor/contexts/DialogContext.tsx:19](https://github.com/xr3ngine/xr3ngine/blob/9d253dc38/packages/client-core/components/editor/contexts/DialogContext.tsx#L19)
