---
id: "socketwebrtcservertransport.socketwebrtcservertransport-1"
title: "Class: SocketWebRTCServerTransport"
sidebar_label: "SocketWebRTCServerTransport"
custom_edit_url: null
hide_title: true
---

# Class: SocketWebRTCServerTransport

[SocketWebRTCServerTransport](../modules/socketwebrtcservertransport.md).SocketWebRTCServerTransport

## Implements

* *NetworkTransport*

## Constructors

### constructor

\+ **new SocketWebRTCServerTransport**(`app`: *any*): [*SocketWebRTCServerTransport*](socketwebrtcservertransport.socketwebrtcservertransport-1.md)

#### Parameters:

| Name | Type |
| :------ | :------ |
| `app` | *any* |

**Returns:** [*SocketWebRTCServerTransport*](socketwebrtcservertransport.socketwebrtcservertransport-1.md)

Defined in: [SocketWebRTCServerTransport.ts:60](https://github.com/xr3ngine/xr3ngine/blob/7e8e151f1/packages/gameserver/src/SocketWebRTCServerTransport.ts#L60)

## Properties

### app

• **app**: *any*

Defined in: [SocketWebRTCServerTransport.ts:56](https://github.com/xr3ngine/xr3ngine/blob/7e8e151f1/packages/gameserver/src/SocketWebRTCServerTransport.ts#L56)

___

### dataProducers

• **dataProducers**: *DataProducer*[]= []

Defined in: [SocketWebRTCServerTransport.ts:57](https://github.com/xr3ngine/xr3ngine/blob/7e8e151f1/packages/gameserver/src/SocketWebRTCServerTransport.ts#L57)

___

### gameServer

• **gameServer**: *any*

Defined in: [SocketWebRTCServerTransport.ts:60](https://github.com/xr3ngine/xr3ngine/blob/7e8e151f1/packages/gameserver/src/SocketWebRTCServerTransport.ts#L60)

___

### outgoingDataProducer

• **outgoingDataProducer**: *DataProducer*

Defined in: [SocketWebRTCServerTransport.ts:59](https://github.com/xr3ngine/xr3ngine/blob/7e8e151f1/packages/gameserver/src/SocketWebRTCServerTransport.ts#L59)

___

### outgoingDataTransport

• **outgoingDataTransport**: *Transport*

Defined in: [SocketWebRTCServerTransport.ts:58](https://github.com/xr3ngine/xr3ngine/blob/7e8e151f1/packages/gameserver/src/SocketWebRTCServerTransport.ts#L58)

___

### routers

• **routers**: *Record*<string, Router\>

Defined in: [SocketWebRTCServerTransport.ts:54](https://github.com/xr3ngine/xr3ngine/blob/7e8e151f1/packages/gameserver/src/SocketWebRTCServerTransport.ts#L54)

___

### server

• **server**: *Server*

Defined in: [SocketWebRTCServerTransport.ts:51](https://github.com/xr3ngine/xr3ngine/blob/7e8e151f1/packages/gameserver/src/SocketWebRTCServerTransport.ts#L51)

___

### socketIO

• **socketIO**: Server

Defined in: [SocketWebRTCServerTransport.ts:52](https://github.com/xr3ngine/xr3ngine/blob/7e8e151f1/packages/gameserver/src/SocketWebRTCServerTransport.ts#L52)

___

### transport

• **transport**: *Transport*

Defined in: [SocketWebRTCServerTransport.ts:55](https://github.com/xr3ngine/xr3ngine/blob/7e8e151f1/packages/gameserver/src/SocketWebRTCServerTransport.ts#L55)

___

### worker

• **worker**: *Worker*

Defined in: [SocketWebRTCServerTransport.ts:53](https://github.com/xr3ngine/xr3ngine/blob/7e8e151f1/packages/gameserver/src/SocketWebRTCServerTransport.ts#L53)

## Methods

### handleKick

▸ **handleKick**(`socket`: *any*): *void*

#### Parameters:

| Name | Type |
| :------ | :------ |
| `socket` | *any* |

**Returns:** *void*

Implementation of: NetworkTransport.handleKick

Defined in: [SocketWebRTCServerTransport.ts:87](https://github.com/xr3ngine/xr3ngine/blob/7e8e151f1/packages/gameserver/src/SocketWebRTCServerTransport.ts#L87)

___

### initialize

▸ **initialize**(): *Promise*<void\>

**Returns:** *Promise*<void\>

Implementation of: NetworkTransport.initialize

Defined in: [SocketWebRTCServerTransport.ts:94](https://github.com/xr3ngine/xr3ngine/blob/7e8e151f1/packages/gameserver/src/SocketWebRTCServerTransport.ts#L94)

___

### sendData

▸ **sendData**(`data`: *any*): *void*

#### Parameters:

| Name | Type |
| :------ | :------ |
| `data` | *any* |

**Returns:** *void*

Implementation of: NetworkTransport.sendData

Defined in: [SocketWebRTCServerTransport.ts:83](https://github.com/xr3ngine/xr3ngine/blob/7e8e151f1/packages/gameserver/src/SocketWebRTCServerTransport.ts#L83)

___

### sendNetworkStatUpdateMessage

▸ **sendNetworkStatUpdateMessage**(`message`: *any*): *any*

#### Parameters:

| Name | Type |
| :------ | :------ |
| `message` | *any* |

**Returns:** *any*

Defined in: [SocketWebRTCServerTransport.ts:70](https://github.com/xr3ngine/xr3ngine/blob/7e8e151f1/packages/gameserver/src/SocketWebRTCServerTransport.ts#L70)

___

### sendReliableData

▸ **sendReliableData**(`message`: *any*): *any*

#### Parameters:

| Name | Type |
| :------ | :------ |
| `message` | *any* |

**Returns:** *any*

Implementation of: NetworkTransport.sendReliableData

Defined in: [SocketWebRTCServerTransport.ts:66](https://github.com/xr3ngine/xr3ngine/blob/7e8e151f1/packages/gameserver/src/SocketWebRTCServerTransport.ts#L66)

___

### toBuffer

▸ **toBuffer**(`ab`: *any*): *any*

#### Parameters:

| Name | Type |
| :------ | :------ |
| `ab` | *any* |

**Returns:** *any*

Defined in: [SocketWebRTCServerTransport.ts:74](https://github.com/xr3ngine/xr3ngine/blob/7e8e151f1/packages/gameserver/src/SocketWebRTCServerTransport.ts#L74)
