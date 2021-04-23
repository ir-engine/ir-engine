---
id: "editor_functions_serializecolor"
title: "Module: editor/functions/serializeColor"
sidebar_label: "editor/functions/serializeColor"
custom_edit_url: null
hide_title: true
---

# Module: editor/functions/serializeColor

## Functions

### default

▸ **default**(`color`: *any*): *string*

TODO: THREE.Color's .toJSON method returns a number. Editor's format currently expects hex strings.
In a future serialization format we should avoid having to call this method when serializing color props.

#### Parameters:

Name | Type |
:------ | :------ |
`color` | *any* |

**Returns:** *string*

Defined in: [packages/engine/src/editor/functions/serializeColor.ts:5](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/functions/serializeColor.ts#L5)
