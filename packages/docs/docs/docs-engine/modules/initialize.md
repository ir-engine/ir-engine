---
id: "initialize"
title: "Module: initialize"
sidebar_label: "initialize"
custom_edit_url: null
hide_title: true
---

# Module: initialize

## Variables

### DefaultInitializationOptions

• `Const` **DefaultInitializationOptions**: *object*

#### Type declaration:

Name | Type |
:------ | :------ |
`input` | *object* |
`input.schema` | [*InputSchema*](../interfaces/input_interfaces_inputschema.inputschema.md) |
`networking` | *object* |
`networking.schema` | [*NetworkSchema*](../interfaces/networking_interfaces_networkschema.networkschema.md) |
`postProcessing` | *boolean* |
`publicPath` | *string* |
`useOfflineMode` | *boolean* |

Defined in: [packages/engine/src/initialize.ts:48](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/initialize.ts#L48)

## Functions

### initializeEngine

▸ `Const`**initializeEngine**(`initOptions?`: *any*): *Promise*<void\>

#### Parameters:

Name | Type |
:------ | :------ |
`initOptions` | *any* |

**Returns:** *Promise*<void\>

Defined in: [packages/engine/src/initialize.ts:60](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/initialize.ts#L60)

___

### initializeServer

▸ `Const`**initializeServer**(`initOptions?`: *any*): *Promise*<void\>

#### Parameters:

Name | Type |
:------ | :------ |
`initOptions` | *any* |

**Returns:** *Promise*<void\>

Defined in: [packages/engine/src/initialize.ts:152](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/initialize.ts#L152)
