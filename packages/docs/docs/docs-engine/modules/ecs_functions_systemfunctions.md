---
id: "ecs_functions_systemfunctions"
title: "Module: ecs/functions/SystemFunctions"
sidebar_label: "ecs/functions/SystemFunctions"
custom_edit_url: null
hide_title: true
---

# Module: ecs/functions/SystemFunctions

## Functions

### executeSystem

▸ **executeSystem**(`system`: [*System*](../classes/ecs_classes_system.system.md), `delta`: *number*, `time`: *number*, `updateType?`: [*SystemUpdateType*](../enums/ecs_functions_systemupdatetype.systemupdatetype.md)): *void*

Calls execute() function on a system instance.

#### Parameters:

Name | Type | Description |
:------ | :------ | :------ |
`system` | [*System*](../classes/ecs_classes_system.system.md) | System to be executed.   |
`delta` | *number* | Delta of the system.   |
`time` | *number* | Current time of the system.   |
`updateType` | [*SystemUpdateType*](../enums/ecs_functions_systemupdatetype.systemupdatetype.md) | Only system of this Update type will be executed.    |

**Returns:** *void*

Defined in: [packages/engine/src/ecs/functions/SystemFunctions.ts:77](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/functions/SystemFunctions.ts#L77)

___

### getSystem

▸ **getSystem**<S\>(`SystemClass`: [*SystemConstructor*](../interfaces/ecs_classes_system.systemconstructor.md)<S\>): S

Get a system from the simulation.

#### Type parameters:

Name | Type |
:------ | :------ |
`S` | [*System*](../classes/ecs_classes_system.system.md)<S\> |

#### Parameters:

Name | Type | Description |
:------ | :------ | :------ |
`SystemClass` | [*SystemConstructor*](../interfaces/ecs_classes_system.systemconstructor.md)<S\> | Type ot the system.   |

**Returns:** S

System instance.

Defined in: [packages/engine/src/ecs/functions/SystemFunctions.ts:57](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/functions/SystemFunctions.ts#L57)

___

### getSystems

▸ **getSystems**(): [*System*](../classes/ecs_classes_system.system.md)[]

Get all systems from the simulation.

**Returns:** [*System*](../classes/ecs_classes_system.system.md)[]

Array of system instances.

Defined in: [packages/engine/src/ecs/functions/SystemFunctions.ts:65](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/functions/SystemFunctions.ts#L65)

___

### registerSystem

▸ **registerSystem**(`SystemClass`: [*SystemConstructor*](../interfaces/ecs_classes_system.systemconstructor.md)<any\>, `attributes?`: *any*): [*System*](../classes/ecs_classes_system.system.md)

Register a system with the simulation.\
System will automatically register all components in queries and be added to execution queue.

#### Parameters:

Name | Type | Description |
:------ | :------ | :------ |
`SystemClass` | [*SystemConstructor*](../interfaces/ecs_classes_system.systemconstructor.md)<any\> | Type of system to be registered.   |
`attributes?` | *any* | Attributes of the system being created.   |

**Returns:** [*System*](../classes/ecs_classes_system.system.md)

Registered system.

Defined in: [packages/engine/src/ecs/functions/SystemFunctions.ts:16](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/functions/SystemFunctions.ts#L16)

___

### sortSystems

▸ **sortSystems**(): *void*

Sort systems by order if order has been set explicitly.

**Returns:** *void*

Defined in: [packages/engine/src/ecs/functions/SystemFunctions.ts:89](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/functions/SystemFunctions.ts#L89)

___

### unregisterSystem

▸ **unregisterSystem**(`SystemClass`: [*SystemConstructor*](../interfaces/ecs_classes_system.systemconstructor.md)<any\>): *void*

Remove a system from the simulation.\
**NOTE:** System won't unregister components, so make sure you clean up!

#### Parameters:

Name | Type | Description |
:------ | :------ | :------ |
`SystemClass` | [*SystemConstructor*](../interfaces/ecs_classes_system.systemconstructor.md)<any\> | Type of system being unregistered.    |

**Returns:** *void*

Defined in: [packages/engine/src/ecs/functions/SystemFunctions.ts:40](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/functions/SystemFunctions.ts#L40)
