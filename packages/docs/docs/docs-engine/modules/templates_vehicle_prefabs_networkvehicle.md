---
id: "templates_vehicle_prefabs_networkvehicle"
title: "Module: templates/vehicle/prefabs/NetworkVehicle"
sidebar_label: "templates/vehicle/prefabs/NetworkVehicle"
custom_edit_url: null
hide_title: true
---

# Module: templates/vehicle/prefabs/NetworkVehicle

## Variables

### NetworkVehicle

• `Const` **NetworkVehicle**: [*NetworkPrefab*](../interfaces/networking_interfaces_networkprefab.networkprefab.md)

Defined in: [packages/engine/src/templates/vehicle/prefabs/NetworkVehicle.ts:263](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/templates/vehicle/prefabs/NetworkVehicle.ts#L263)

## Functions

### addCollidersToNetworkVehicle

▸ **addCollidersToNetworkVehicle**(`args`: { `entity?`: [*Entity*](../classes/ecs_classes_entity.entity.md) ; `parameters?`: *any*  }): *object*

#### Parameters:

Name | Type |
:------ | :------ |
`args` | *object* |
`args.entity?` | [*Entity*](../classes/ecs_classes_entity.entity.md) |
`args.parameters?` | *any* |

**Returns:** *object*

Name | Type |
:------ | :------ |
`position` | *any* |
`shape` | *any* |

Defined in: [packages/engine/src/templates/vehicle/prefabs/NetworkVehicle.ts:142](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/templates/vehicle/prefabs/NetworkVehicle.ts#L142)

___

### createNetworkVehicle

▸ **createNetworkVehicle**(`args`: { `entity?`: [*Entity*](../classes/ecs_classes_entity.entity.md) ; `networkId?`: *string* \| *number* ; `parameters?`: *any* ; `uniqueId`: *string*  }): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`args` | *object* |
`args.entity?` | [*Entity*](../classes/ecs_classes_entity.entity.md) |
`args.networkId?` | *string* \| *number* |
`args.parameters?` | *any* |
`args.uniqueId` | *string* |

**Returns:** *void*

Defined in: [packages/engine/src/templates/vehicle/prefabs/NetworkVehicle.ts:219](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/templates/vehicle/prefabs/NetworkVehicle.ts#L219)

___

### createVehicleFromModel

▸ **createVehicleFromModel**(`entity`: [*Entity*](../classes/ecs_classes_entity.entity.md), `mesh`: *any*, `sceneEntityId`: *string*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`entity` | [*Entity*](../classes/ecs_classes_entity.entity.md) |
`mesh` | *any* |
`sceneEntityId` | *string* |

**Returns:** *void*

Defined in: [packages/engine/src/templates/vehicle/prefabs/NetworkVehicle.ts:196](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/templates/vehicle/prefabs/NetworkVehicle.ts#L196)

___

### createVehicleFromSceneData

▸ **createVehicleFromSceneData**(`entity`: [*Entity*](../classes/ecs_classes_entity.entity.md), `args`: *any*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`entity` | [*Entity*](../classes/ecs_classes_entity.entity.md) |
`args` | *any* |

**Returns:** *void*

Defined in: [packages/engine/src/templates/vehicle/prefabs/NetworkVehicle.ts:176](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/templates/vehicle/prefabs/NetworkVehicle.ts#L176)

___

### parseCarModel

▸ `Const`**parseCarModel**(`groupMeshes`: *any*, `notEditor?`: *boolean*): *object*

#### Parameters:

Name | Type | Default value |
:------ | :------ | :------ |
`groupMeshes` | *any* | - |
`notEditor` | *boolean* | true |

**Returns:** *object*

Name | Type |
:------ | :------ |
`arrayWheelsMesh` | *any*[] |
`arrayWheelsPosition` | *any*[] |
`entrancesArray` | *any*[] |
`interactionPartsPosition` | *any*[] |
`mass` | *number* |
`seatsArray` | *any*[] |
`startPosition` | *any*[] |
`startQuaternion` | *any*[] |
`suspensionRestLength` | *number* |
`vehicleDoorsArray` | *any*[] |
`vehicleMesh` | *boolean* |
`vehicleSphereColliders` | *any*[] |

Defined in: [packages/engine/src/templates/vehicle/prefabs/NetworkVehicle.ts:28](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/templates/vehicle/prefabs/NetworkVehicle.ts#L28)
