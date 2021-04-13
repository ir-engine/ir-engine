---
id: "audio_systems_audiosystem.audiosystem"
title: "Class: AudioSystem"
sidebar_label: "AudioSystem"
custom_edit_url: null
hide_title: true
---

# Class: AudioSystem

[audio/systems/AudioSystem](../modules/audio_systems_audiosystem.md).AudioSystem

System class which provides methods for Audio system.

## Hierarchy

* [*System*](ecs_classes_system.system.md)

  ↳ **AudioSystem**

## Constructors

### constructor

\+ **new AudioSystem**(): [*AudioSystem*](audio_systems_audiosystem.audiosystem.md)

Constructs Audio System.

**Returns:** [*AudioSystem*](audio_systems_audiosystem.audiosystem.md)

Overrides: [System](ecs_classes_system.system.md)

Defined in: [packages/engine/src/audio/systems/AudioSystem.ts:25](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/audio/systems/AudioSystem.ts#L25)

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

### audio

• **audio**: *any*

Audio Element.

Defined in: [packages/engine/src/audio/systems/AudioSystem.ts:21](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/audio/systems/AudioSystem.ts#L21)

___

### audioReady

• **audioReady**: *boolean*

Indicates whether the system is ready or not.

Defined in: [packages/engine/src/audio/systems/AudioSystem.ts:15](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/audio/systems/AudioSystem.ts#L15)

___

### callbacks

• **callbacks**: *any*[]

Callbacks to be called after system is ready.

Defined in: [packages/engine/src/audio/systems/AudioSystem.ts:17](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/audio/systems/AudioSystem.ts#L17)

___

### context

• **context**: AudioContext

Audio Context.

Defined in: [packages/engine/src/audio/systems/AudioSystem.ts:23](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/audio/systems/AudioSystem.ts#L23)

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

### queries

• **queries**: *any*

Queries for different events related to Audio System.

Defined in: [packages/engine/src/audio/systems/AudioSystem.ts:19](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/audio/systems/AudioSystem.ts#L19)

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

Defined in: [packages/engine/src/audio/systems/AudioSystem.ts:12](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/audio/systems/AudioSystem.ts#L12)

___

### world

• **world**: *any*

World Object.

Defined in: [packages/engine/src/audio/systems/AudioSystem.ts:25](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/audio/systems/AudioSystem.ts#L25)

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

▪ `Static` **queries**: [*SystemQueries*](../interfaces/ecs_classes_system.systemqueries.md)

Inherited from: [System](ecs_classes_system.system.md).[queries](ecs_classes_system.system.md#queries)

Defined in: [packages/engine/src/ecs/classes/System.ts:63](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/classes/System.ts#L63)

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

Dispose audio system and remove event listeners.

**Returns:** *void*

Overrides: [System](ecs_classes_system.system.md)

Defined in: [packages/engine/src/audio/systems/AudioSystem.ts:39](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/audio/systems/AudioSystem.ts#L39)

___

### execute

▸ **execute**(`delta`: *any*, `time`: *any*): *void*

Execute the audio system for different events of queries.

#### Parameters:

Name | Type | Description |
:------ | :------ | :------ |
`delta` | *any* | time since last frame.   |
`time` | *any* | current time.    |

**Returns:** *void*

Overrides: [System](ecs_classes_system.system.md)

Defined in: [packages/engine/src/audio/systems/AudioSystem.ts:52](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/audio/systems/AudioSystem.ts#L52)

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

### log

▸ **log**(`str`: *string*): *void*

Log messages on console and on document if available.

#### Parameters:

Name | Type | Description |
:------ | :------ | :------ |
`str` | *string* | Message to be logged.    |

**Returns:** *void*

Defined in: [packages/engine/src/audio/systems/AudioSystem.ts:119](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/audio/systems/AudioSystem.ts#L119)

___

### play

▸ **play**(): *void*

Plays the system.

**Returns:** *void*

Inherited from: [System](ecs_classes_system.system.md)

Defined in: [packages/engine/src/ecs/classes/System.ts:239](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/classes/System.ts#L239)

___

### playSoundEffect

▸ **playSoundEffect**(`ent`: *any*): *void*

Play sound effect.

#### Parameters:

Name | Type | Description |
:------ | :------ | :------ |
`ent` | *any* | Entity to get the [PlaySoundEffect](audio_components_playsoundeffect.playsoundeffect.md) Component.    |

**Returns:** *void*

Defined in: [packages/engine/src/audio/systems/AudioSystem.ts:160](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/audio/systems/AudioSystem.ts#L160)

___

### startAudio

▸ **startAudio**(): *void*

Enable and start audio system.

**Returns:** *void*

Defined in: [packages/engine/src/audio/systems/AudioSystem.ts:89](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/audio/systems/AudioSystem.ts#L89)

___

### startBackgroundMusic

▸ **startBackgroundMusic**(`ent`: *any*): *void*

Start Background music if available.

#### Parameters:

Name | Type | Description |
:------ | :------ | :------ |
`ent` | *any* | Entity to get the [BackgroundMusic](audio_components_backgroundmusic.backgroundmusic.md) Component.    |

**Returns:** *void*

Defined in: [packages/engine/src/audio/systems/AudioSystem.ts:129](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/audio/systems/AudioSystem.ts#L129)

___

### stop

▸ **stop**(): *void*

Stop the system.

**Returns:** *void*

Inherited from: [System](ecs_classes_system.system.md)

Defined in: [packages/engine/src/ecs/classes/System.ts:233](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/classes/System.ts#L233)

___

### stopBackgroundMusic

▸ **stopBackgroundMusic**(`ent`: *any*): *void*

Stop Background Music.

#### Parameters:

Name | Type | Description |
:------ | :------ | :------ |
`ent` | *any* | Entity to get the [BackgroundMusic](audio_components_backgroundmusic.backgroundmusic.md) Component.    |

**Returns:** *void*

Defined in: [packages/engine/src/audio/systems/AudioSystem.ts:149](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/audio/systems/AudioSystem.ts#L149)

___

### toJSON

▸ **toJSON**(): *any*

Serialize the System

**Returns:** *any*

Inherited from: [System](ecs_classes_system.system.md)

Defined in: [packages/engine/src/ecs/classes/System.ts:268](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/classes/System.ts#L268)

___

### whenReady

▸ **whenReady**(`cb`: *any*): *void*

Call the callbacks when system is ready or push callbacks in array otherwise.

#### Parameters:

Name | Type | Description |
:------ | :------ | :------ |
`cb` | *any* | Callback to be called when system is ready.    |

**Returns:** *void*

Defined in: [packages/engine/src/audio/systems/AudioSystem.ts:80](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/audio/systems/AudioSystem.ts#L80)

___

### getName

▸ `Static`**getName**(): *string*

Get name of the System

**Returns:** *string*

Inherited from: [System](ecs_classes_system.system.md)

Defined in: [packages/engine/src/ecs/classes/System.ts:214](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/classes/System.ts#L214)
