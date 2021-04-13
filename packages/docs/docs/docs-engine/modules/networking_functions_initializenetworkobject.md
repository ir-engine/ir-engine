---
id: "networking_functions_initializenetworkobject"
title: "Module: networking/functions/initializeNetworkObject"
sidebar_label: "networking/functions/initializeNetworkObject"
custom_edit_url: null
hide_title: true
---

# Module: networking/functions/initializeNetworkObject

## Functions

### initializeNetworkObject

▸ **initializeNetworkObject**(`args`: { `entity?`: [*Entity*](../classes/ecs_classes_entity.entity.md) ; `networkId?`: *number* ; `override?`: *any* ; `ownerId?`: *string* ; `prefabType?`: *string* \| *number* ; `uniqueId?`: *string*  }): [*NetworkObject*](../classes/networking_components_networkobject.networkobject.md)

Initialize Network object

#### Parameters:

Name | Type |
:------ | :------ |
`args` | *object* |
`args.entity?` | [*Entity*](../classes/ecs_classes_entity.entity.md) |
`args.networkId?` | *number* |
`args.override?` | *any* |
`args.ownerId?` | *string* |
`args.prefabType?` | *string* \| *number* |
`args.uniqueId?` | *string* |

**Returns:** [*NetworkObject*](../classes/networking_components_networkobject.networkobject.md)

Newly created object.

Defined in: [packages/engine/src/networking/functions/initializeNetworkObject.ts:137](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/networking/functions/initializeNetworkObject.ts#L137)
