---
id: "networking_systems_mediastreamsystem.mediastreamsystem"
title: "Class: MediaStreamSystem"
sidebar_label: "MediaStreamSystem"
custom_edit_url: null
hide_title: true
---

# Class: MediaStreamSystem

[networking/systems/MediaStreamSystem](../modules/networking_systems_mediastreamsystem.md).MediaStreamSystem

System class for media streaming.

## Hierarchy

* [*System*](ecs_classes_system.system.md)

  ↳ **MediaStreamSystem**

## Constructors

### constructor

\+ **new MediaStreamSystem**(): [*MediaStreamSystem*](networking_systems_mediastreamsystem.mediastreamsystem.md)

**Returns:** [*MediaStreamSystem*](networking_systems_mediastreamsystem.mediastreamsystem.md)

Overrides: [System](ecs_classes_system.system.md)

Defined in: [packages/engine/src/networking/systems/MediaStreamSystem.ts:43](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/networking/systems/MediaStreamSystem.ts#L43)

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

### audioGainNode

• **audioGainNode**: GainNode= null

Audio Gain to be applied on media stream.

Defined in: [packages/engine/src/networking/systems/MediaStreamSystem.ts:21](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/networking/systems/MediaStreamSystem.ts#L21)

___

### audioPaused

• **audioPaused**: *boolean*= false

Whether the audio is paused or not.

Defined in: [packages/engine/src/networking/systems/MediaStreamSystem.ts:15](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/networking/systems/MediaStreamSystem.ts#L15)

___

### camAudioProducer

• **camAudioProducer**: *any*= null

Producer using camera to get Audio.

Defined in: [packages/engine/src/networking/systems/MediaStreamSystem.ts:28](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/networking/systems/MediaStreamSystem.ts#L28)

___

### camVideoProducer

• **camVideoProducer**: *any*= null

Producer using camera to get Video.

Defined in: [packages/engine/src/networking/systems/MediaStreamSystem.ts:26](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/networking/systems/MediaStreamSystem.ts#L26)

___

### consumers

• **consumers**: *any*[]

List of all consumer nodes.

Defined in: [packages/engine/src/networking/systems/MediaStreamSystem.ts:36](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/networking/systems/MediaStreamSystem.ts#L36)

___

### enabled

• **enabled**: *boolean*

Whether the system will execute during the world tick.

Inherited from: [System](ecs_classes_system.system.md).[enabled](ecs_classes_system.system.md#enabled)

Defined in: [packages/engine/src/ecs/classes/System.ts:92](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/classes/System.ts#L92)

___

### execute

• **execute**: *any*= null

Execute the media stream system.

Overrides: [System](ecs_classes_system.system.md).[execute](ecs_classes_system.system.md#execute)

Defined in: [packages/engine/src/networking/systems/MediaStreamSystem.ts:140](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/networking/systems/MediaStreamSystem.ts#L140)

___

### executeTime

• **executeTime**: *number*

Inherited from: [System](ecs_classes_system.system.md).[executeTime](ecs_classes_system.system.md#executetime)

Defined in: [packages/engine/src/ecs/classes/System.ts:71](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/classes/System.ts#L71)

___

### faceTracking

• **faceTracking**: *boolean*= false

Whether the face tracking is enabled or not.

Defined in: [packages/engine/src/networking/systems/MediaStreamSystem.ts:17](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/networking/systems/MediaStreamSystem.ts#L17)

___

### initialized

• **initialized**: *boolean*= false

Whether the component is initialized or not.

Overrides: [System](ecs_classes_system.system.md).[initialized](ecs_classes_system.system.md#initialized)

Defined in: [packages/engine/src/networking/systems/MediaStreamSystem.ts:43](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/networking/systems/MediaStreamSystem.ts#L43)

___

### localScreen

• **localScreen**: *any*= null

Local screen container.

Defined in: [packages/engine/src/networking/systems/MediaStreamSystem.ts:24](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/networking/systems/MediaStreamSystem.ts#L24)

___

### mediaStream

• **mediaStream**: MediaStream= null

Media stream for streaming data.

Defined in: [packages/engine/src/networking/systems/MediaStreamSystem.ts:19](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/networking/systems/MediaStreamSystem.ts#L19)

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

### producers

• **producers**: *any*[]

List of all producers nodes..

Defined in: [packages/engine/src/networking/systems/MediaStreamSystem.ts:34](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/networking/systems/MediaStreamSystem.ts#L34)

___

### queryResults

• **queryResults**: *object*

The results of the queries.
Should be used inside of execute.

#### Type declaration:

Inherited from: [System](ecs_classes_system.system.md).[queryResults](ecs_classes_system.system.md#queryresults)

Defined in: [packages/engine/src/ecs/classes/System.ts:80](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/classes/System.ts#L80)

___

### screenAudioProducer

• **screenAudioProducer**: *any*= null

Producer using screen to get Audio.

Defined in: [packages/engine/src/networking/systems/MediaStreamSystem.ts:32](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/networking/systems/MediaStreamSystem.ts#L32)

___

### screenShareAudioPaused

• **screenShareAudioPaused**: *boolean*= false

Indication of whether the audio while screen sharing is paused or not.

Defined in: [packages/engine/src/networking/systems/MediaStreamSystem.ts:40](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/networking/systems/MediaStreamSystem.ts#L40)

___

### screenShareVideoPaused

• **screenShareVideoPaused**: *boolean*= false

Indication of whether the video while screen sharing is paused or not.

Defined in: [packages/engine/src/networking/systems/MediaStreamSystem.ts:38](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/networking/systems/MediaStreamSystem.ts#L38)

___

### screenVideoProducer

• **screenVideoProducer**: *any*= null

Producer using screen to get Video.

Defined in: [packages/engine/src/networking/systems/MediaStreamSystem.ts:30](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/networking/systems/MediaStreamSystem.ts#L30)

___

### updateType

• **updateType**: [*SystemUpdateType*](../enums/ecs_functions_systemupdatetype.systemupdatetype.md)

Inherited from: [System](ecs_classes_system.system.md).[updateType](ecs_classes_system.system.md#updatetype)

Defined in: [packages/engine/src/ecs/classes/System.ts:74](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/classes/System.ts#L74)

___

### videoPaused

• **videoPaused**: *boolean*= false

Whether the video is paused or not.

Defined in: [packages/engine/src/networking/systems/MediaStreamSystem.ts:13](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/networking/systems/MediaStreamSystem.ts#L13)

___

### EVENTS

▪ `Static` **EVENTS**: *object*

#### Type declaration:

Name | Type |
:------ | :------ |
`TRIGGER_UPDATE_CONSUMERS` | *string* |

Defined in: [packages/engine/src/networking/systems/MediaStreamSystem.ts:7](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/networking/systems/MediaStreamSystem.ts#L7)

___

### instance

▪ `Static` **instance**: *any*= null

Defines what Components the System will query for.
This needs to be user defined.

Overrides: [System](ecs_classes_system.system.md).[instance](ecs_classes_system.system.md#instance)

Defined in: [packages/engine/src/networking/systems/MediaStreamSystem.ts:10](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/networking/systems/MediaStreamSystem.ts#L10)

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

### cycleCamera

▸ **cycleCamera**(): *Promise*<boolean\>

Switch to sending video from the "next" camera device in device list (if there are multiple cameras).

**Returns:** *Promise*<boolean\>

Whether camera cycled or not.

Defined in: [packages/engine/src/networking/systems/MediaStreamSystem.ts:155](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/networking/systems/MediaStreamSystem.ts#L155)

___

### dispose

▸ **dispose**(): *void*

**Returns:** *void*

Inherited from: [System](ecs_classes_system.system.md)

Defined in: [packages/engine/src/ecs/classes/System.ts:265](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/classes/System.ts#L265)

___

### getCurrentDeviceId

▸ **getCurrentDeviceId**(): *Promise*<string\>

Get device ID of device which is currently streaming media.

**Returns:** *Promise*<string\>

Defined in: [packages/engine/src/networking/systems/MediaStreamSystem.ts:287](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/networking/systems/MediaStreamSystem.ts#L287)

___

### getMediaStream

▸ **getMediaStream**(): *Promise*<boolean\>

Get user media stream.

**Returns:** *Promise*<boolean\>

Whether stream is active or not.

Defined in: [packages/engine/src/networking/systems/MediaStreamSystem.ts:305](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/networking/systems/MediaStreamSystem.ts#L305)

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

### getScreenAudioPausedState

▸ **getScreenAudioPausedState**(): *boolean*

Get whether screen audio paused or not.

**Returns:** *boolean*

Screen audio paused state.

Defined in: [packages/engine/src/networking/systems/MediaStreamSystem.ts:206](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/networking/systems/MediaStreamSystem.ts#L206)

___

### getScreenPausedState

▸ **getScreenPausedState**(): *boolean*

Get whether screen video paused or not.

**Returns:** *boolean*

Screen video paused state.

Defined in: [packages/engine/src/networking/systems/MediaStreamSystem.ts:198](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/networking/systems/MediaStreamSystem.ts#L198)

___

### play

▸ **play**(): *void*

Plays the system.

**Returns:** *void*

Inherited from: [System](ecs_classes_system.system.md)

Defined in: [packages/engine/src/ecs/classes/System.ts:239](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/classes/System.ts#L239)

___

### setAudioPaused

▸ **setAudioPaused**(`state`: *boolean*): *boolean*

Pause/Resume the audio.

#### Parameters:

Name | Type | Description |
:------ | :------ | :------ |
`state` | *boolean* | New Pause state.   |

**Returns:** *boolean*

Updated Pause state.

Defined in: [packages/engine/src/networking/systems/MediaStreamSystem.ts:76](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/networking/systems/MediaStreamSystem.ts#L76)

___

### setFaceTracking

▸ **setFaceTracking**(`state`: *boolean*): *boolean*

Set face tracking state.

#### Parameters:

Name | Type | Description |
:------ | :------ | :------ |
`state` | *boolean* | New face tracking state.   |

**Returns:** *boolean*

Updated face tracking state.

Defined in: [packages/engine/src/networking/systems/MediaStreamSystem.ts:55](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/networking/systems/MediaStreamSystem.ts#L55)

___

### setScreenShareAudioPaused

▸ **setScreenShareAudioPaused**(`state`: *boolean*): *boolean*

Pause/Resume the audio while screen sharing.

#### Parameters:

Name | Type | Description |
:------ | :------ | :------ |
`state` | *boolean* | New Pause state.   |

**Returns:** *boolean*

Updated Pause state.

Defined in: [packages/engine/src/networking/systems/MediaStreamSystem.ts:96](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/networking/systems/MediaStreamSystem.ts#L96)

___

### setScreenShareVideoPaused

▸ **setScreenShareVideoPaused**(`state`: *boolean*): *boolean*

Pause/Resume the video while screen sharing.

#### Parameters:

Name | Type | Description |
:------ | :------ | :------ |
`state` | *boolean* | New Pause state.   |

**Returns:** *boolean*

Updated Pause state.

Defined in: [packages/engine/src/networking/systems/MediaStreamSystem.ts:86](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/networking/systems/MediaStreamSystem.ts#L86)

___

### setVideoPaused

▸ **setVideoPaused**(`state`: *boolean*): *boolean*

Pause/Resume the video.

#### Parameters:

Name | Type | Description |
:------ | :------ | :------ |
`state` | *boolean* | New Pause state.   |

**Returns:** *boolean*

Updated Pause state.

Defined in: [packages/engine/src/networking/systems/MediaStreamSystem.ts:65](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/networking/systems/MediaStreamSystem.ts#L65)

___

### startCamera

▸ **startCamera**(): *Promise*<boolean\>

Start the camera.

**Returns:** *Promise*<boolean\>

Whether the camera is started or not.

Defined in: [packages/engine/src/networking/systems/MediaStreamSystem.ts:145](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/networking/systems/MediaStreamSystem.ts#L145)

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

### toggleAudioPaused

▸ **toggleAudioPaused**(): *boolean*

Toggle Pause state of audio.

**Returns:** *boolean*

Updated Pause state.

Defined in: [packages/engine/src/networking/systems/MediaStreamSystem.ts:116](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/networking/systems/MediaStreamSystem.ts#L116)

___

### toggleScreenShareAudioPaused

▸ **toggleScreenShareAudioPaused**(): *boolean*

Toggle Pause state of audio while screen sharing.

**Returns:** *boolean*

Updated Pause state.

Defined in: [packages/engine/src/networking/systems/MediaStreamSystem.ts:134](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/networking/systems/MediaStreamSystem.ts#L134)

___

### toggleScreenShareVideoPaused

▸ **toggleScreenShareVideoPaused**(): *boolean*

Toggle Pause state of video while screen sharing.

**Returns:** *boolean*

Updated Pause state.

Defined in: [packages/engine/src/networking/systems/MediaStreamSystem.ts:125](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/networking/systems/MediaStreamSystem.ts#L125)

___

### toggleVideoPaused

▸ **toggleVideoPaused**(): *boolean*

Toggle Pause state of video.

**Returns:** *boolean*

Updated Pause state.

Defined in: [packages/engine/src/networking/systems/MediaStreamSystem.ts:105](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/networking/systems/MediaStreamSystem.ts#L105)

___

### addVideoAudio

▸ `Static`**addVideoAudio**(`mediaStream`: { `kind`: *string* ; `track`: { `clone`: () => MediaStreamTrack  }  }, `peerId`: *any*): *void*

Add video and audio node to the consumer.

#### Parameters:

Name | Type | Description |
:------ | :------ | :------ |
`mediaStream` | *object* | Video and/or audio media stream to be added in element.   |
`mediaStream.kind` | *string* | - |
`mediaStream.track` | *object* | - |
`mediaStream.track.clone` | () => MediaStreamTrack | - |
`peerId` | *any* | ID to be used to find peer element in which media stream will be added.    |

**Returns:** *void*

Defined in: [packages/engine/src/networking/systems/MediaStreamSystem.ts:225](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/networking/systems/MediaStreamSystem.ts#L225)

___

### getName

▸ `Static`**getName**(): *string*

Get name of the System

**Returns:** *string*

Inherited from: [System](ecs_classes_system.system.md)

Defined in: [packages/engine/src/ecs/classes/System.ts:214](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/classes/System.ts#L214)

___

### removeVideoAudio

▸ `Static`**removeVideoAudio**(`consumer`: *any*): *void*

Remove video and audio node from the consumer.

#### Parameters:

Name | Type | Description |
:------ | :------ | :------ |
`consumer` | *any* | Consumer from which video and audio node will be removed.    |

**Returns:** *void*

Defined in: [packages/engine/src/networking/systems/MediaStreamSystem.ts:214](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/networking/systems/MediaStreamSystem.ts#L214)
