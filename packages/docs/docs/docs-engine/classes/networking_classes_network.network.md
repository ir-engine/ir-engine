---
id: "networking_classes_network.network"
title: "Class: Network"
sidebar_label: "Network"
custom_edit_url: null
hide_title: true
---

# Class: Network

[networking/classes/Network](../modules/networking_classes_network.md).Network

Component Class for Network.

## Constructors

### constructor

\+ **new Network**(): [*Network*](networking_classes_network.network.md)

**Returns:** [*Network*](networking_classes_network.network.md)

## Properties

### accessToken

• **accessToken**: *string*

Access tocken of the User.

Defined in: [packages/engine/src/networking/classes/Network.ts:90](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/networking/classes/Network.ts#L90)

___

### channelSocketId

• **channelSocketId**: *string*

Socket id of the network channel connection.

Defined in: [packages/engine/src/networking/classes/Network.ts:84](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/networking/classes/Network.ts#L84)

___

### clients

• **clients**: [*NetworkClientList*](../interfaces/networking_classes_network.networkclientlist.md)

Clients connected over this network.

Defined in: [packages/engine/src/networking/classes/Network.ts:53](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/networking/classes/Network.ts#L53)

___

### clientsConnected

• **clientsConnected**: *any*[]

Newly connected clients over this network in this frame.

Defined in: [packages/engine/src/networking/classes/Network.ts:55](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/networking/classes/Network.ts#L55)

___

### clientsDisconnected

• **clientsDisconnected**: *any*[]

Disconnected client in this frame.

Defined in: [packages/engine/src/networking/classes/Network.ts:57](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/networking/classes/Network.ts#L57)

___

### createObjects

• **createObjects**: *any*[]

Newly created Network Objects in this frame.

Defined in: [packages/engine/src/networking/classes/Network.ts:73](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/networking/classes/Network.ts#L73)

___

### dataConsumers

• **dataConsumers**: *Map*<string, any\>

List of data consumer nodes.

Defined in: [packages/engine/src/networking/classes/Network.ts:61](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/networking/classes/Network.ts#L61)

___

### dataProducers

• **dataProducers**: *Map*<string, any\>

List of data producer nodes.

Defined in: [packages/engine/src/networking/classes/Network.ts:59](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/networking/classes/Network.ts#L59)

___

### destroyObjects

• **destroyObjects**: *any*[]

Destroyed Network Objects in this frame.

Defined in: [packages/engine/src/networking/classes/Network.ts:77](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/networking/classes/Network.ts#L77)

___

### editObjects

• **editObjects**: *any*[]

Destroyed Network Objects in this frame.

Defined in: [packages/engine/src/networking/classes/Network.ts:75](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/networking/classes/Network.ts#L75)

___

### gameModeSchema

• **gameModeSchema**: [*GameMode*](../interfaces/game_types_gamemode.gamemode.md)

Game mode mapping schema

Defined in: [packages/engine/src/networking/classes/Network.ts:67](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/networking/classes/Network.ts#L67)

___

### gameState

• **gameState**: *object*

Current game state

#### Type declaration:

Defined in: [packages/engine/src/networking/classes/Network.ts:64](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/networking/classes/Network.ts#L64)

___

### gameStateActions

• **gameStateActions**: [*GameStateActionMessage*](../interfaces/game_types_gamestateactionmessage.gamestateactionmessage.md)[]

Game actions that happened this frame

Defined in: [packages/engine/src/networking/classes/Network.ts:70](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/networking/classes/Network.ts#L70)

___

### incomingMessageQueue

• **incomingMessageQueue**: [*RingBuffer*](common_classes_ringbuffer.ringbuffer.md)<any\>

Buffer holding all incoming Messages.

Defined in: [packages/engine/src/networking/classes/Network.ts:106](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/networking/classes/Network.ts#L106)

___

### instanceSocketId

• **instanceSocketId**: *string*

Socket id of the network instance connection.

Defined in: [packages/engine/src/networking/classes/Network.ts:82](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/networking/classes/Network.ts#L82)

___

### isInitialized

• **isInitialized**: *boolean*

Indication of whether the network is initialized or not.

Defined in: [packages/engine/src/networking/classes/Network.ts:41](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/networking/classes/Network.ts#L41)

___

### localAvatarNetworkId

• **localAvatarNetworkId**: *number*

Network id of the local User.

Defined in: [packages/engine/src/networking/classes/Network.ts:88](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/networking/classes/Network.ts#L88)

___

### localClientEntity

• **localClientEntity**: [*Entity*](ecs_classes_entity.entity.md)= null

Defined in: [packages/engine/src/networking/classes/Network.ts:80](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/networking/classes/Network.ts#L80)

___

### networkObjects

• **networkObjects**: [*NetworkObjectList*](../interfaces/networking_interfaces_networkobjectlist.networkobjectlist.md)

Map of Network Objects.

Defined in: [packages/engine/src/networking/classes/Network.ts:79](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/networking/classes/Network.ts#L79)

___

### packetCompression

• **packetCompression**: *boolean*= true

Whether to apply compression on packet or not.

Defined in: [packages/engine/src/networking/classes/Network.ts:43](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/networking/classes/Network.ts#L43)

___

### schema

• **schema**: [*NetworkSchema*](../interfaces/networking_interfaces_networkschema.networkschema.md)

Schema of the component.

Defined in: [packages/engine/src/networking/classes/Network.ts:51](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/networking/classes/Network.ts#L51)

___

### snapshot

• **snapshot**: [*Snapshot*](../interfaces/networking_types_snapshotdatatypes.snapshot.md)

Snapshot of the network.

Defined in: [packages/engine/src/networking/classes/Network.ts:92](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/networking/classes/Network.ts#L92)

___

### timeSnaphotCorrection

• **timeSnaphotCorrection**: *number*

we dont senr unit64 now, then its a value to -minus from time to get a little value for unit32

Defined in: [packages/engine/src/networking/classes/Network.ts:45](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/networking/classes/Network.ts#L45)

___

### transport

• **transport**: [*NetworkTransport*](../interfaces/networking_interfaces_networktransport.networktransport.md)

Object holding transport details over network.

Defined in: [packages/engine/src/networking/classes/Network.ts:47](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/networking/classes/Network.ts#L47)

___

### transports

• **transports**: *any*[]

Network transports.

Defined in: [packages/engine/src/networking/classes/Network.ts:49](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/networking/classes/Network.ts#L49)

___

### userId

• **userId**: *string*

User id hosting this network.

Defined in: [packages/engine/src/networking/classes/Network.ts:86](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/networking/classes/Network.ts#L86)

___

### worldState

• **worldState**: [*WorldStateInterface*](../interfaces/networking_interfaces_worldstate.worldstateinterface.md)

State of the world.

Defined in: [packages/engine/src/networking/classes/Network.ts:109](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/networking/classes/Network.ts#L109)

___

### Network

▪ `Static` **Network**: *any*

Network.

Defined in: [packages/engine/src/networking/classes/Network.ts:130](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/networking/classes/Network.ts#L130)

___

### \_schemas

▪ `Static` **\_schemas**: *Map*<string, Schema<Record<string, unknown\>\>\>

Schema of the network.

Defined in: [packages/engine/src/networking/classes/Network.ts:103](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/networking/classes/Network.ts#L103)

___

### availableNetworkId

▪ `Private` `Static` **availableNetworkId**: *number*= 0

ID of last network created.

Defined in: [packages/engine/src/networking/classes/Network.ts:95](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/networking/classes/Network.ts#L95)

___

### instance

▪ `Static` **instance**: [*Network*](networking_classes_network.network.md)

Static instance to access everywhere.

Defined in: [packages/engine/src/networking/classes/Network.ts:39](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/networking/classes/Network.ts#L39)

___

### sceneId

▪ `Static` **sceneId**: *string*= '547Y45f7'

Attached ID of scene attached with this network.

**`default`** 547Y45f7

Defined in: [packages/engine/src/networking/classes/Network.ts:128](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/networking/classes/Network.ts#L128)

___

### tick

▪ `Static` **tick**: *any*= 0

Tick of the network.

Defined in: [packages/engine/src/networking/classes/Network.ts:132](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/networking/classes/Network.ts#L132)

## Methods

### dispose

▸ **dispose**(): *void*

Disposes the network.

**Returns:** *void*

Defined in: [packages/engine/src/networking/classes/Network.ts:135](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/networking/classes/Network.ts#L135)

___

### getNetworkId

▸ `Static`**getNetworkId**(): *number*

Get next network id.

**Returns:** *number*

Defined in: [packages/engine/src/networking/classes/Network.ts:98](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/networking/classes/Network.ts#L98)
