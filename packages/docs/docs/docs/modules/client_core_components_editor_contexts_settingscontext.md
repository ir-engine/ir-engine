---
id: "client_core_components_editor_contexts_settingscontext"
title: "Module: client-core/components/editor/contexts/SettingsContext"
sidebar_label: "client-core/components/editor/contexts/SettingsContext"
custom_edit_url: null
hide_title: true
---

# Module: client-core/components/editor/contexts/SettingsContext

## Variables

### SettingsContextProvider

• `Const` **SettingsContextProvider**: *Provider*<{ `settings`: {} ; `updateSetting`: () => *void*  }\>

[SettingsContextProvider provides component context value]

Defined in: [packages/client-core/components/editor/contexts/SettingsContext.tsx:21](https://github.com/xr3ngine/xr3ngine/blob/9d253dc38/packages/client-core/components/editor/contexts/SettingsContext.tsx#L21)

___

### defaultSettings

• `Const` **defaultSettings**: *object*

[initializing defaultSettings with empty context]

#### Type declaration:

Defined in: [packages/client-core/components/editor/contexts/SettingsContext.tsx:7](https://github.com/xr3ngine/xr3ngine/blob/9d253dc38/packages/client-core/components/editor/contexts/SettingsContext.tsx#L7)

## Functions

### withSettings

▸ **withSettings**(`Component`: *any*): *function*

[withSettings setting component context value]

#### Parameters:

Name | Type |
:------ | :------ |
`Component` | *any* |

**Returns:** (`props`: *any*) => *Element*

Defined in: [packages/client-core/components/editor/contexts/SettingsContext.tsx:26](https://github.com/xr3ngine/xr3ngine/blob/9d253dc38/packages/client-core/components/editor/contexts/SettingsContext.tsx#L26)
