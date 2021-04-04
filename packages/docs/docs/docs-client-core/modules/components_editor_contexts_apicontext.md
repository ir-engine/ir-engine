---
id: "components_editor_contexts_apicontext"
title: "Module: components/editor/contexts/ApiContext"
sidebar_label: "components/editor/contexts/ApiContext"
custom_edit_url: null
hide_title: true
---

# Module: components/editor/contexts/ApiContext

## Variables

### ApiContext

• `Const` **ApiContext**: *Context*<[*default*](../classes/components_editor_api.default.md)\>

[
Context lets us pass a value deep into the component tree
without explicitly threading it through every component.
ApiContext used to context API component
   ]

Defined in: [packages/client-core/components/editor/contexts/ApiContext.tsx:12](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/components/editor/contexts/ApiContext.tsx#L12)

## Functions

### withApi

▸ **withApi**(`Component`: *any*): *function*

[withApi used to provide component context value by calling api ]

#### Parameters:

Name | Type |
:------ | :------ |
`Component` | *any* |

**Returns:** (`props`: *any*) => *Element*

Defined in: [packages/client-core/components/editor/contexts/ApiContext.tsx:17](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/components/editor/contexts/ApiContext.tsx#L17)
