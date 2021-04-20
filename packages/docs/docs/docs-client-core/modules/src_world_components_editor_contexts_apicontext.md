---
id: "src_world_components_editor_contexts_apicontext"
title: "Module: src/world/components/editor/contexts/ApiContext"
sidebar_label: "src/world/components/editor/contexts/ApiContext"
custom_edit_url: null
hide_title: true
---

# Module: src/world/components/editor/contexts/ApiContext

## Variables

### ApiContext

• `Const` **ApiContext**: *Context*<[*Api*](../classes/src_world_components_editor_api.api.md)\>

Context lets us pass a value deep into the component tree
without explicitly threading it through every component.
ApiContext used to context API component.

**`author`** Robert Long

Defined in: [packages/client-core/src/world/components/editor/contexts/ApiContext.tsx:12](https://github.com/xr3ngine/xr3ngine/blob/65dfcf39a/packages/client-core/src/world/components/editor/contexts/ApiContext.tsx#L12)

## Functions

### withApi

▸ **withApi**(`Component`: *any*): *function*

withApi used to provide component context value by calling api.

**`author`** Robert Long

#### Parameters:

Name | Type |
:------ | :------ |
`Component` | *any* |

**Returns:** (`props`: *any*) => *Element*

Defined in: [packages/client-core/src/world/components/editor/contexts/ApiContext.tsx:19](https://github.com/xr3ngine/xr3ngine/blob/65dfcf39a/packages/client-core/src/world/components/editor/contexts/ApiContext.tsx#L19)
