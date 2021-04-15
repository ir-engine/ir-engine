---
id: "src_world_components_editor_contexts_dialogcontext"
title: "Module: src/world/components/editor/contexts/DialogContext"
sidebar_label: "src/world/components/editor/contexts/DialogContext"
custom_edit_url: null
hide_title: true
---

# Module: src/world/components/editor/contexts/DialogContext

## Variables

### DialogContext

• `Const` **DialogContext**: *Context*<{ `hideDialog`: () => *void* ; `showDialog`: (`DialogComponent`: *any*, `props`: *any*) => *void*  }\>

DialogContext creating context using react.

**`author`** Robert Long

Defined in: [packages/client-core/src/world/components/editor/contexts/DialogContext.tsx:8](https://github.com/xr3ngine/xr3ngine/blob/673ad6a5f/packages/client-core/src/world/components/editor/contexts/DialogContext.tsx#L8)

___

### DialogContextProvider

• `Const` **DialogContextProvider**: *Provider*<{ `hideDialog`: () => *void* ; `showDialog`: (`DialogComponent`: *any*, `props`: *any*) => *void*  }\>

DialogContextProvider provides component context value.

**`author`** Robert Long

Defined in: [packages/client-core/src/world/components/editor/contexts/DialogContext.tsx:18](https://github.com/xr3ngine/xr3ngine/blob/673ad6a5f/packages/client-core/src/world/components/editor/contexts/DialogContext.tsx#L18)

## Functions

### withDialog

▸ **withDialog**(`DialogComponent`: *any*): *function*

withDialog used to customize component using context.

**`author`** Robert Long

#### Parameters:

Name | Type |
:------ | :------ |
`DialogComponent` | *any* |

**Returns:** (`props`: *any*) => *Element*

Defined in: [packages/client-core/src/world/components/editor/contexts/DialogContext.tsx:25](https://github.com/xr3ngine/xr3ngine/blob/673ad6a5f/packages/client-core/src/world/components/editor/contexts/DialogContext.tsx#L25)
