---
id: "ecs_classes_system.system"
title: "Class: System"
sidebar_label: "System"
custom_edit_url: null
hide_title: true
---

# Class: System

[ecs/classes/System](../modules/ecs_classes_system.md).System

Abstract class to define System properties.

## Hierarchy

* **System**

  ↳ [*AudioSystem*](audio_systems_audiosystem.audiosystem.md)

  ↳ [*PositionalAudioSystem*](audio_systems_positionalaudiosystem.positionalaudiosystem.md)

  ↳ [*CameraSystem*](camera_systems_camerasystem.camerasystem.md)

  ↳ [*CharacterControllerSystem*](character_charactercontrollersystem.charactercontrollersystem.md)

  ↳ [*DebugHelpersSystem*](debug_systems_debughelperssystem.debughelperssystem.md)

  ↳ [*GameManagerSystem*](game_systems_gamemanagersystem.gamemanagersystem.md)

  ↳ [*ActionSystem*](input_systems_actionsystem.actionsystem.md)

  ↳ [*ClientInputSystem*](input_systems_clientinputsystem.clientinputsystem.md)

  ↳ [*InteractiveSystem*](interaction_systems_interactivesystem.interactivesystem.md)

  ↳ [*ClientNetworkSystem*](networking_systems_clientnetworksystem.clientnetworksystem.md)

  ↳ [*MediaStreamSystem*](networking_systems_mediastreamsystem.mediastreamsystem.md)

  ↳ [*ServerNetworkIncomingSystem*](networking_systems_servernetworkincomingsystem.servernetworkincomingsystem.md)

  ↳ [*ServerNetworkOutgoingSystem*](networking_systems_servernetworkoutgoingsystem.servernetworkoutgoingsystem.md)

  ↳ [*ParticleSystem*](particles_systems_particlesystem.particlesystem.md)

  ↳ [*PhysicsSystem*](physics_systems_physicssystem.physicssystem.md)

  ↳ [*HighlightSystem*](renderer_highlightsystem.highlightsystem.md)

  ↳ [*WebGLRendererSystem*](renderer_webglrenderersystem.webglrenderersystem.md)

  ↳ [*WebXRRendererSystem*](renderer_webxrrenderersystem.webxrrenderersystem.md)

  ↳ [*ServerSpawnSystem*](scene_systems_spawnsystem.serverspawnsystem.md)

  ↳ [*StateSystem*](state_systems_statesystem.statesystem.md)

  ↳ [*TransformSystem*](transform_systems_transformsystem.transformsystem.md)

  ↳ [*XRSystem*](xr_systems_xrsystem.xrsystem.md)

## Indexable

▪ [x: *string*]: *any*

Name of the property.

## Constructors

### constructor

\+ **new System**(`attributes?`: [*SystemAttributes*](../interfaces/ecs_classes_system.systemattributes.md)): [*System*](ecs_classes_system.system.md)

Initializes system

#### Parameters:

Name | Type | Description |
:------ | :------ | :------ |
`attributes?` | [*SystemAttributes*](../interfaces/ecs_classes_system.systemattributes.md) | User defined system attributes.    |

**Returns:** [*System*](ecs_classes_system.system.md)

Defined in: [packages/engine/src/ecs/classes/System.ts:101](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/classes/System.ts#L101)

## Properties

### \_mandatoryQueries

• **\_mandatoryQueries**: *any*

Defined in: [packages/engine/src/ecs/classes/System.ts:69](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/classes/System.ts#L69)

___

### \_queries

• **\_queries**: *object*

Queries of system instances.

#### Type declaration:

Defined in: [packages/engine/src/ecs/classes/System.ts:98](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/classes/System.ts#L98)

___

### enabled

• **enabled**: *boolean*

Whether the system will execute during the world tick.

Defined in: [packages/engine/src/ecs/classes/System.ts:92](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/classes/System.ts#L92)

___

### executeTime

• **executeTime**: *number*

Defined in: [packages/engine/src/ecs/classes/System.ts:71](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/classes/System.ts#L71)

___

### initialized

• **initialized**: *boolean*

Defined in: [packages/engine/src/ecs/classes/System.ts:72](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/classes/System.ts#L72)

___

### name

• **name**: *string*

Name of the System.

Defined in: [packages/engine/src/ecs/classes/System.ts:95](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/classes/System.ts#L95)

___

### priority

• **priority**: *number*

Defined in: [packages/engine/src/ecs/classes/System.ts:70](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/classes/System.ts#L70)

___

### queryResults

• **queryResults**: *object*

The results of the queries.
Should be used inside of execute.

#### Type declaration:

Defined in: [packages/engine/src/ecs/classes/System.ts:80](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/classes/System.ts#L80)

___

### updateType

• **updateType**: [*SystemUpdateType*](../enums/ecs_functions_systemupdatetype.systemupdatetype.md)

Defined in: [packages/engine/src/ecs/classes/System.ts:74](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/classes/System.ts#L74)

___

### instance

▪ `Static` **instance**: [*System*](ecs_classes_system.system.md)

Defines what Components the System will query for.
This needs to be user defined.

Defined in: [packages/engine/src/ecs/classes/System.ts:62](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/classes/System.ts#L62)

___

### isSystem

▪ `Static` **isSystem**: *true*

Defined in: [packages/engine/src/ecs/classes/System.ts:68](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/classes/System.ts#L68)

___

### queries

▪ `Static` **queries**: [*SystemQueries*](../interfaces/ecs_classes_system.systemqueries.md)

Defined in: [packages/engine/src/ecs/classes/System.ts:63](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/classes/System.ts#L63)

## Methods

### clearEventQueues

▸ **clearEventQueues**(): *void*

Clears event queues.

**Returns:** *void*

Defined in: [packages/engine/src/ecs/classes/System.ts:244](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/classes/System.ts#L244)

___

### dispose

▸ **dispose**(): *void*

**Returns:** *void*

Defined in: [packages/engine/src/ecs/classes/System.ts:265](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/classes/System.ts#L265)

___

### execute

▸ `Optional`**execute**(`delta`: *number*, `time`: *number*): *void*

Execute Method definition.

#### Parameters:

Name | Type |
:------ | :------ |
`delta` | *number* |
`time` | *number* |

**Returns:** *void*

Defined in: [packages/engine/src/ecs/classes/System.ts:101](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/classes/System.ts#L101)

___

### getQuery

▸ **getQuery**(`components`: ([*ComponentConstructor*](../interfaces/ecs_interfaces_componentinterfaces.componentconstructor.md)<any\> \| [*NotComponent*](../interfaces/ecs_classes_system.notcomponent.md)<any\>)[]): [*Query*](ecs_classes_query.query.md)

Get query from the component.

#### Parameters:

Name | Type | Description |
:------ | :------ | :------ |
`components` | ([*ComponentConstructor*](../interfaces/ecs_interfaces_componentinterfaces.componentconstructor.md)<any\> \| [*NotComponent*](../interfaces/ecs_classes_system.notcomponent.md)<any\>)[] | List of components either component or not component.    |

**Returns:** [*Query*](ecs_classes_query.query.md)

Defined in: [packages/engine/src/ecs/classes/System.ts:223](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/classes/System.ts#L223)

___

### play

▸ **play**(): *void*

Plays the system.

**Returns:** *void*

Defined in: [packages/engine/src/ecs/classes/System.ts:239](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/classes/System.ts#L239)

___

### stop

▸ **stop**(): *void*

Stop the system.

**Returns:** *void*

Defined in: [packages/engine/src/ecs/classes/System.ts:233](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/classes/System.ts#L233)

___

### toJSON

▸ **toJSON**(): *any*

Serialize the System

**Returns:** *any*

Defined in: [packages/engine/src/ecs/classes/System.ts:268](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/classes/System.ts#L268)

___

### getName

▸ `Static`**getName**(): *string*

Get name of the System

**Returns:** *string*

Defined in: [packages/engine/src/ecs/classes/System.ts:214](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/classes/System.ts#L214)
