---
id: "networking_systems_clientnetworksystem.clientnetworksystem"
title: "Class: ClientNetworkSystem"
sidebar_label: "ClientNetworkSystem"
custom_edit_url: null
hide_title: true
---

# Class: ClientNetworkSystem

[networking/systems/ClientNetworkSystem](../modules/networking_systems_clientnetworksystem.md).ClientNetworkSystem

System class for network system of client.

## Hierarchy

* [*System*](ecs_classes_system.system.md)

  ↳ **ClientNetworkSystem**

## Constructors

### constructor

\+ **new ClientNetworkSystem**(`attributes`: { `app`: *any* ; `schema`: [*NetworkSchema*](../interfaces/networking_interfaces_networkschema.networkschema.md)  }): [*ClientNetworkSystem*](networking_systems_clientnetworksystem.clientnetworksystem.md)

Constructs the system. Adds Network Components, initializes transport and initializes server.

#### Parameters:

Name | Type | Description |
:------ | :------ | :------ |
`attributes` | *object* | Attributes to be passed to super class constructor.    |
`attributes.app` | *any* | - |
`attributes.schema` | [*NetworkSchema*](../interfaces/networking_interfaces_networkschema.networkschema.md) | - |

**Returns:** [*ClientNetworkSystem*](networking_systems_clientnetworksystem.clientnetworksystem.md)

Overrides: [System](ecs_classes_system.system.md)

Defined in: [packages/engine/src/networking/systems/ClientNetworkSystem.ts:22](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/networking/systems/ClientNetworkSystem.ts#L22)

## Properties

### \_mandatoryQueries

• **\_mandatoryQueries**: *any*

Inherited from: [System](ecs_classes_system.system.md).[_mandatoryQueries](ecs_classes_system.system.md#_mandatoryqueries)

Defined in: [packages/engine/src/ecs/classes/System.ts:69](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/classes/System.ts#L69)

___

### \_queries

• **\_queries**: *object*

Queries of system instances.

#### Type declaration:

Inherited from: [System](ecs_classes_system.system.md).[_queries](ecs_classes_system.system.md#_queries)

Defined in: [packages/engine/src/ecs/classes/System.ts:98](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/classes/System.ts#L98)

___

### enabled

• **enabled**: *boolean*

Whether the system will execute during the world tick.

Inherited from: [System](ecs_classes_system.system.md).[enabled](ecs_classes_system.system.md#enabled)

Defined in: [packages/engine/src/ecs/classes/System.ts:92](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/classes/System.ts#L92)

___

### executeTime

• **executeTime**: *number*

Inherited from: [System](ecs_classes_system.system.md).[executeTime](ecs_classes_system.system.md#executetime)

Defined in: [packages/engine/src/ecs/classes/System.ts:71](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/classes/System.ts#L71)

___

### initialized

• **initialized**: *boolean*

Inherited from: [System](ecs_classes_system.system.md).[initialized](ecs_classes_system.system.md#initialized)

Defined in: [packages/engine/src/ecs/classes/System.ts:72](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/classes/System.ts#L72)

___

### name

• **name**: *string*

Name of the System.

Inherited from: [System](ecs_classes_system.system.md).[name](ecs_classes_system.system.md#name)

Defined in: [packages/engine/src/ecs/classes/System.ts:95](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/classes/System.ts#L95)

___

### priority

• **priority**: *number*

Inherited from: [System](ecs_classes_system.system.md).[priority](ecs_classes_system.system.md#priority)

Defined in: [packages/engine/src/ecs/classes/System.ts:70](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/classes/System.ts#L70)

___

### queryResults

• **queryResults**: *object*

The results of the queries.
Should be used inside of execute.

#### Type declaration:

Inherited from: [System](ecs_classes_system.system.md).[queryResults](ecs_classes_system.system.md#queryresults)

Defined in: [packages/engine/src/ecs/classes/System.ts:80](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/classes/System.ts#L80)

___

### updateType

• **updateType**: [*SystemUpdateType*](../enums/ecs_functions_systemupdatetype.systemupdatetype.md)

Update type of this system. **Default** to
[Fixed](../enums/ecs_functions_systemupdatetype.systemupdatetype.md#fixed) type.

Overrides: [System](ecs_classes_system.system.md).[updateType](ecs_classes_system.system.md#updatetype)

Defined in: [packages/engine/src/networking/systems/ClientNetworkSystem.ts:22](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/networking/systems/ClientNetworkSystem.ts#L22)

___

### EVENTS

▪ `Static` **EVENTS**: *object*

#### Type declaration:

Name | Type |
:------ | :------ |
`CONNECT` | *string* |
`RECEIVE_DATA` | *string* |
`SEND_DATA` | *string* |

Defined in: [packages/engine/src/networking/systems/ClientNetworkSystem.ts:15](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/networking/systems/ClientNetworkSystem.ts#L15)

___

### instance

▪ `Static` **instance**: [*System*](ecs_classes_system.system.md)

Defines what Components the System will query for.
This needs to be user defined.

Inherited from: [System](ecs_classes_system.system.md).[instance](ecs_classes_system.system.md#instance)

Defined in: [packages/engine/src/ecs/classes/System.ts:62](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/classes/System.ts#L62)

___

### isSystem

▪ `Static` **isSystem**: *true*

Inherited from: [System](ecs_classes_system.system.md).[isSystem](ecs_classes_system.system.md#issystem)

Defined in: [packages/engine/src/ecs/classes/System.ts:68](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/classes/System.ts#L68)

___

### queries

▪ `Static` **queries**: *any*

Queries for the system.

Overrides: [System](ecs_classes_system.system.md).[queries](ecs_classes_system.system.md#queries)

Defined in: [packages/engine/src/networking/systems/ClientNetworkSystem.ts:56](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/networking/systems/ClientNetworkSystem.ts#L56)

## Methods

### clearEventQueues

▸ **clearEventQueues**(): *void*

Clears event queues.

**Returns:** *void*

Inherited from: [System](ecs_classes_system.system.md)

Defined in: [packages/engine/src/ecs/classes/System.ts:244](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/classes/System.ts#L244)

___

### dispose

▸ **dispose**(): *void*

**Returns:** *void*

Inherited from: [System](ecs_classes_system.system.md)

Defined in: [packages/engine/src/ecs/classes/System.ts:265](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/classes/System.ts#L265)

___

### execute

▸ **execute**(`delta`: *number*): *void*

Executes the system.
Call logic based on whether system is on the server or on the client.

#### Parameters:

Name | Type | Description |
:------ | :------ | :------ |
`delta` | *number* | Time since last frame.    |

**Returns:** *void*

Overrides: [System](ecs_classes_system.system.md)

Defined in: [packages/engine/src/networking/systems/ClientNetworkSystem.ts:42](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/networking/systems/ClientNetworkSystem.ts#L42)

___

### getQuery

▸ **getQuery**(`components`: ([*ComponentConstructor*](../interfaces/ecs_interfaces_componentinterfaces.componentconstructor.md)<any\> \| [*NotComponent*](../interfaces/ecs_classes_system.notcomponent.md)<any\>)[]): [*Query*](ecs_classes_query.query.md)

Get query from the component.

#### Parameters:

Name | Type | Description |
:------ | :------ | :------ |
`components` | ([*ComponentConstructor*](../interfaces/ecs_interfaces_componentinterfaces.componentconstructor.md)<any\> \| [*NotComponent*](../interfaces/ecs_classes_system.notcomponent.md)<any\>)[] | List of components either component or not component.    |

**Returns:** [*Query*](ecs_classes_query.query.md)

Inherited from: [System](ecs_classes_system.system.md)

Defined in: [packages/engine/src/ecs/classes/System.ts:223](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/classes/System.ts#L223)

___

### play

▸ **play**(): *void*

Plays the system.

**Returns:** *void*

Inherited from: [System](ecs_classes_system.system.md)

Defined in: [packages/engine/src/ecs/classes/System.ts:239](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/classes/System.ts#L239)

___

### stop

▸ **stop**(): *void*

Stop the system.

**Returns:** *void*

Inherited from: [System](ecs_classes_system.system.md)

Defined in: [packages/engine/src/ecs/classes/System.ts:233](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/classes/System.ts#L233)

___

### toJSON

▸ **toJSON**(): *any*

Serialize the System

**Returns:** *any*

Inherited from: [System](ecs_classes_system.system.md)

Defined in: [packages/engine/src/ecs/classes/System.ts:268](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/classes/System.ts#L268)

___

### getName

▸ `Static`**getName**(): *string*

Get name of the System

**Returns:** *string*

Inherited from: [System](ecs_classes_system.system.md)

Defined in: [packages/engine/src/ecs/classes/System.ts:214](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/classes/System.ts#L214)
