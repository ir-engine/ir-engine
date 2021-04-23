---
id: "physics_systems_physicssystem.physicssystem"
title: "Class: PhysicsSystem"
sidebar_label: "PhysicsSystem"
custom_edit_url: null
hide_title: true
---

# Class: PhysicsSystem

[physics/systems/PhysicsSystem](../modules/physics_systems_physicssystem.md).PhysicsSystem

## Hierarchy

* [*System*](ecs_classes_system.system.md)

  ↳ **PhysicsSystem**

## Constructors

### constructor

\+ **new PhysicsSystem**(): [*PhysicsSystem*](physics_systems_physicssystem.physicssystem.md)

**Returns:** [*PhysicsSystem*](physics_systems_physicssystem.physicssystem.md)

Overrides: [System](ecs_classes_system.system.md)

Defined in: [packages/engine/src/physics/systems/PhysicsSystem.ts:79](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/physics/systems/PhysicsSystem.ts#L79)

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

### clientSnapshotFreezeTime

• **clientSnapshotFreezeTime**: *number*= 0

Defined in: [packages/engine/src/physics/systems/PhysicsSystem.ts:61](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/physics/systems/PhysicsSystem.ts#L61)

___

### diffSpeed

• **diffSpeed**: *number*

Defined in: [packages/engine/src/physics/systems/PhysicsSystem.ts:53](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/physics/systems/PhysicsSystem.ts#L53)

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

### freezeTimes

• **freezeTimes**: *number*= 0

Defined in: [packages/engine/src/physics/systems/PhysicsSystem.ts:60](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/physics/systems/PhysicsSystem.ts#L60)

___

### groundMaterial

• **groundMaterial**: *Material*

Defined in: [packages/engine/src/physics/systems/PhysicsSystem.ts:64](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/physics/systems/PhysicsSystem.ts#L64)

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

### parallelPairs

• **parallelPairs**: *any*[]

Defined in: [packages/engine/src/physics/systems/PhysicsSystem.ts:76](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/physics/systems/PhysicsSystem.ts#L76)

___

### physicsFrameRate

• **physicsFrameRate**: *number*

Defined in: [packages/engine/src/physics/systems/PhysicsSystem.ts:77](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/physics/systems/PhysicsSystem.ts#L77)

___

### physicsFrameTime

• **physicsFrameTime**: *number*

Defined in: [packages/engine/src/physics/systems/PhysicsSystem.ts:78](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/physics/systems/PhysicsSystem.ts#L78)

___

### physicsMaxPrediction

• **physicsMaxPrediction**: *number*

Defined in: [packages/engine/src/physics/systems/PhysicsSystem.ts:79](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/physics/systems/PhysicsSystem.ts#L79)

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

### serverSnapshotFreezeTime

• **serverSnapshotFreezeTime**: *number*= 0

Defined in: [packages/engine/src/physics/systems/PhysicsSystem.ts:62](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/physics/systems/PhysicsSystem.ts#L62)

___

### trimMeshMaterial

• **trimMeshMaterial**: *Material*

Defined in: [packages/engine/src/physics/systems/PhysicsSystem.ts:66](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/physics/systems/PhysicsSystem.ts#L66)

___

### updateType

• **updateType**: [*SystemUpdateType*](../enums/ecs_functions_systemupdatetype.systemupdatetype.md)

Overrides: [System](ecs_classes_system.system.md).[updateType](ecs_classes_system.system.md#updatetype)

Defined in: [packages/engine/src/physics/systems/PhysicsSystem.ts:51](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/physics/systems/PhysicsSystem.ts#L51)

___

### wheelGroundContactMaterial

• **wheelGroundContactMaterial**: *ContactMaterial*

Defined in: [packages/engine/src/physics/systems/PhysicsSystem.ts:68](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/physics/systems/PhysicsSystem.ts#L68)

___

### wheelMaterial

• **wheelMaterial**: *Material*

Defined in: [packages/engine/src/physics/systems/PhysicsSystem.ts:65](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/physics/systems/PhysicsSystem.ts#L65)

___

### EVENTS

▪ `Static` **EVENTS**: *object*

#### Type declaration:

Name | Type |
:------ | :------ |
`PORTAL_REDIRECT_EVENT` | *string* |

Defined in: [packages/engine/src/physics/systems/PhysicsSystem.ts:48](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/physics/systems/PhysicsSystem.ts#L48)

___

### frame

▪ `Static` **frame**: *number*

Defined in: [packages/engine/src/physics/systems/PhysicsSystem.ts:52](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/physics/systems/PhysicsSystem.ts#L52)

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

### physicsWorld

▪ `Static` **physicsWorld**: *World*

Defined in: [packages/engine/src/physics/systems/PhysicsSystem.ts:55](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/physics/systems/PhysicsSystem.ts#L55)

___

### queries

▪ `Static` **queries**: [*SystemQueries*](../interfaces/ecs_classes_system.systemqueries.md)

Inherited from: [System](ecs_classes_system.system.md).[queries](ecs_classes_system.system.md#queries)

Defined in: [packages/engine/src/ecs/classes/System.ts:63](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/classes/System.ts#L63)

___

### serverCorrectionForRigidBodyTick

▪ `Static` **serverCorrectionForRigidBodyTick**: *number*= 1000

Defined in: [packages/engine/src/physics/systems/PhysicsSystem.ts:58](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/physics/systems/PhysicsSystem.ts#L58)

___

### serverOnlyRigidBodyCollides

▪ `Static` **serverOnlyRigidBodyCollides**: *boolean*

Defined in: [packages/engine/src/physics/systems/PhysicsSystem.ts:57](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/physics/systems/PhysicsSystem.ts#L57)

___

### simulate

▪ `Static` **simulate**: *boolean*

Defined in: [packages/engine/src/physics/systems/PhysicsSystem.ts:56](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/physics/systems/PhysicsSystem.ts#L56)

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

Overrides: [System](ecs_classes_system.system.md)

Defined in: [packages/engine/src/physics/systems/PhysicsSystem.ts:117](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/physics/systems/PhysicsSystem.ts#L117)

___

### execute

▸ **execute**(`delta`: *number*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`delta` | *number* |

**Returns:** *void*

Overrides: [System](ecs_classes_system.system.md)

Defined in: [packages/engine/src/physics/systems/PhysicsSystem.ts:128](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/physics/systems/PhysicsSystem.ts#L128)

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
