---
id: "src_gameserver_transports_socketwebrtcservertransport.socketwebrtcservertransport"
title: "Class: SocketWebRTCServerTransport"
sidebar_label: "SocketWebRTCServerTransport"
custom_edit_url: null
hide_title: true
---

# Class: SocketWebRTCServerTransport

[src/gameserver/transports/SocketWebRTCServerTransport](../modules/src_gameserver_transports_socketwebrtcservertransport.md).SocketWebRTCServerTransport

## Implements

* *NetworkTransport*

## Constructors

### constructor

\+ **new SocketWebRTCServerTransport**(`app`: *any*): [*SocketWebRTCServerTransport*](src_gameserver_transports_socketwebrtcservertransport.socketwebrtcservertransport.md)

#### Parameters:

Name | Type |
:------ | :------ |
`app` | *any* |

**Returns:** [*SocketWebRTCServerTransport*](src_gameserver_transports_socketwebrtcservertransport.socketwebrtcservertransport.md)

Defined in: [packages/server/src/gameserver/transports/SocketWebRTCServerTransport.ts:61](https://github.com/xr3ngine/xr3ngine/blob/66a84a950/packages/server/src/gameserver/transports/SocketWebRTCServerTransport.ts#L61)

## Properties

### app

• **app**: *any*

Defined in: [packages/server/src/gameserver/transports/SocketWebRTCServerTransport.ts:57](https://github.com/xr3ngine/xr3ngine/blob/66a84a950/packages/server/src/gameserver/transports/SocketWebRTCServerTransport.ts#L57)

___

### dataProducers

• **dataProducers**: *DataProducer*[]

Defined in: [packages/server/src/gameserver/transports/SocketWebRTCServerTransport.ts:58](https://github.com/xr3ngine/xr3ngine/blob/66a84a950/packages/server/src/gameserver/transports/SocketWebRTCServerTransport.ts#L58)

___

### gameServer

• **gameServer**: *any*

Defined in: [packages/server/src/gameserver/transports/SocketWebRTCServerTransport.ts:61](https://github.com/xr3ngine/xr3ngine/blob/66a84a950/packages/server/src/gameserver/transports/SocketWebRTCServerTransport.ts#L61)

___

### isServer

• **isServer**: *boolean*= true

Implementation of: void

Defined in: [packages/server/src/gameserver/transports/SocketWebRTCServerTransport.ts:51](https://github.com/xr3ngine/xr3ngine/blob/66a84a950/packages/server/src/gameserver/transports/SocketWebRTCServerTransport.ts#L51)

___

### outgoingDataProducer

• **outgoingDataProducer**: *DataProducer*

Defined in: [packages/server/src/gameserver/transports/SocketWebRTCServerTransport.ts:60](https://github.com/xr3ngine/xr3ngine/blob/66a84a950/packages/server/src/gameserver/transports/SocketWebRTCServerTransport.ts#L60)

___

### outgoingDataTransport

• **outgoingDataTransport**: *Transport*

Defined in: [packages/server/src/gameserver/transports/SocketWebRTCServerTransport.ts:59](https://github.com/xr3ngine/xr3ngine/blob/66a84a950/packages/server/src/gameserver/transports/SocketWebRTCServerTransport.ts#L59)

___

### routers

• **routers**: *Record*<string, Router\>

Defined in: [packages/server/src/gameserver/transports/SocketWebRTCServerTransport.ts:55](https://github.com/xr3ngine/xr3ngine/blob/66a84a950/packages/server/src/gameserver/transports/SocketWebRTCServerTransport.ts#L55)

___

### server

• **server**: *Server*

Defined in: [packages/server/src/gameserver/transports/SocketWebRTCServerTransport.ts:52](https://github.com/xr3ngine/xr3ngine/blob/66a84a950/packages/server/src/gameserver/transports/SocketWebRTCServerTransport.ts#L52)

___

### socketIO

• **socketIO**: Server

Defined in: [packages/server/src/gameserver/transports/SocketWebRTCServerTransport.ts:53](https://github.com/xr3ngine/xr3ngine/blob/66a84a950/packages/server/src/gameserver/transports/SocketWebRTCServerTransport.ts#L53)

___

### transport

• **transport**: *Transport*

Defined in: [packages/server/src/gameserver/transports/SocketWebRTCServerTransport.ts:56](https://github.com/xr3ngine/xr3ngine/blob/66a84a950/packages/server/src/gameserver/transports/SocketWebRTCServerTransport.ts#L56)

___

### worker

• **worker**: *Worker*

Defined in: [packages/server/src/gameserver/transports/SocketWebRTCServerTransport.ts:54](https://github.com/xr3ngine/xr3ngine/blob/66a84a950/packages/server/src/gameserver/transports/SocketWebRTCServerTransport.ts#L54)

## Methods

### handleKick

▸ **handleKick**(`socket`: *any*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`socket` | *any* |

**Returns:** *void*

Implementation of: void

Defined in: [packages/server/src/gameserver/transports/SocketWebRTCServerTransport.ts:88](https://github.com/xr3ngine/xr3ngine/blob/66a84a950/packages/server/src/gameserver/transports/SocketWebRTCServerTransport.ts#L88)

___

### initialize

▸ **initialize**(): *Promise*<void\>

**Returns:** *Promise*<void\>

Implementation of: void

Defined in: [packages/server/src/gameserver/transports/SocketWebRTCServerTransport.ts:94](https://github.com/xr3ngine/xr3ngine/blob/66a84a950/packages/server/src/gameserver/transports/SocketWebRTCServerTransport.ts#L94)

___

### sendData

▸ **sendData**(`data`: *any*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`data` | *any* |

**Returns:** *void*

Implementation of: void

Defined in: [packages/server/src/gameserver/transports/SocketWebRTCServerTransport.ts:84](https://github.com/xr3ngine/xr3ngine/blob/66a84a950/packages/server/src/gameserver/transports/SocketWebRTCServerTransport.ts#L84)

___

### sendNetworkStatUpdateMessage

▸ **sendNetworkStatUpdateMessage**(`message`: *any*): *any*

#### Parameters:

Name | Type |
:------ | :------ |
`message` | *any* |

**Returns:** *any*

Defined in: [packages/server/src/gameserver/transports/SocketWebRTCServerTransport.ts:71](https://github.com/xr3ngine/xr3ngine/blob/66a84a950/packages/server/src/gameserver/transports/SocketWebRTCServerTransport.ts#L71)

___

### sendReliableData

▸ **sendReliableData**(`message`: *any*): *any*

#### Parameters:

Name | Type |
:------ | :------ |
`message` | *any* |

**Returns:** *any*

Implementation of: void

Defined in: [packages/server/src/gameserver/transports/SocketWebRTCServerTransport.ts:67](https://github.com/xr3ngine/xr3ngine/blob/66a84a950/packages/server/src/gameserver/transports/SocketWebRTCServerTransport.ts#L67)

___

### toBuffer

▸ **toBuffer**(`ab`: *any*): *any*

#### Parameters:

Name | Type |
:------ | :------ |
`ab` | *any* |

**Returns:** *any*

Defined in: [packages/server/src/gameserver/transports/SocketWebRTCServerTransport.ts:75](https://github.com/xr3ngine/xr3ngine/blob/66a84a950/packages/server/src/gameserver/transports/SocketWebRTCServerTransport.ts#L75)
