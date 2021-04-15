---
id: "src_world_components_editor_contexts_settingscontext"
title: "Module: src/world/components/editor/contexts/SettingsContext"
sidebar_label: "src/world/components/editor/contexts/SettingsContext"
custom_edit_url: null
hide_title: true
---

# Module: src/world/components/editor/contexts/SettingsContext

## Variables

### SettingsContextProvider

• `Const` **SettingsContextProvider**: *Provider*<{ `settings`: {} ; `updateSetting`: () => *void*  }\>

SettingsContextProvider provides component context value.

**`author`** Robert Long

Defined in: [packages/client-core/src/world/components/editor/contexts/SettingsContext.tsx:27](https://github.com/xr3ngine/xr3ngine/blob/673ad6a5f/packages/client-core/src/world/components/editor/contexts/SettingsContext.tsx#L27)

___

### defaultSettings

• `Const` **defaultSettings**: *object*= {}

initializing defaultSettings with empty context.

**`author`** Robert Long

#### Type declaration:

Defined in: [packages/client-core/src/world/components/editor/contexts/SettingsContext.tsx:9](https://github.com/xr3ngine/xr3ngine/blob/673ad6a5f/packages/client-core/src/world/components/editor/contexts/SettingsContext.tsx#L9)

## Functions

### withSettings

▸ **withSettings**(`Component`: *any*): *function*

withSettings setting component context value.

**`author`** Robert Long

#### Parameters:

Name | Type |
:------ | :------ |
`Component` | *any* |

**Returns:** (`props`: *any*) => *Element*

Defined in: [packages/client-core/src/world/components/editor/contexts/SettingsContext.tsx:34](https://github.com/xr3ngine/xr3ngine/blob/673ad6a5f/packages/client-core/src/world/components/editor/contexts/SettingsContext.tsx#L34)
