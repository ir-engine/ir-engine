---
id: "src_gameserver_transports_webrtcfunctions"
title: "Module: src/gameserver/transports/WebRTCFunctions"
sidebar_label: "src/gameserver/transports/WebRTCFunctions"
custom_edit_url: null
hide_title: true
---

# Module: src/gameserver/transports/WebRTCFunctions

## Functions

### closeConsumer

▸ **closeConsumer**(`consumer`: *any*): *Promise*<void\>

#### Parameters:

Name | Type |
:------ | :------ |
`consumer` | *any* |

**Returns:** *Promise*<void\>

Defined in: [packages/server/src/gameserver/transports/WebRTCFunctions.ts:162](https://github.com/xr3ngine/xr3ngine/blob/66a84a950/packages/server/src/gameserver/transports/WebRTCFunctions.ts#L162)

___

### closeProducer

▸ **closeProducer**(`producer`: *any*): *Promise*<void\>

#### Parameters:

Name | Type |
:------ | :------ |
`producer` | *any* |

**Returns:** *Promise*<void\>

Defined in: [packages/server/src/gameserver/transports/WebRTCFunctions.ts:134](https://github.com/xr3ngine/xr3ngine/blob/66a84a950/packages/server/src/gameserver/transports/WebRTCFunctions.ts#L134)

___

### closeProducerAndAllPipeProducers

▸ **closeProducerAndAllPipeProducers**(`producer`: *any*, `peerId`: *any*): *Promise*<void\>

#### Parameters:

Name | Type |
:------ | :------ |
`producer` | *any* |
`peerId` | *any* |

**Returns:** *Promise*<void\>

Defined in: [packages/server/src/gameserver/transports/WebRTCFunctions.ts:143](https://github.com/xr3ngine/xr3ngine/blob/66a84a950/packages/server/src/gameserver/transports/WebRTCFunctions.ts#L143)

___

### closeTransport

▸ **closeTransport**(`transport`: *any*): *Promise*<void\>

#### Parameters:

Name | Type |
:------ | :------ |
`transport` | *any* |

**Returns:** *Promise*<void\>

Defined in: [packages/server/src/gameserver/transports/WebRTCFunctions.ts:126](https://github.com/xr3ngine/xr3ngine/blob/66a84a950/packages/server/src/gameserver/transports/WebRTCFunctions.ts#L126)

___

### createInternalDataConsumer

▸ **createInternalDataConsumer**(`dataProducer`: DataProducer, `userId`: *string*): *Promise*<DataConsumer\>

#### Parameters:

Name | Type |
:------ | :------ |
`dataProducer` | DataProducer |
`userId` | *string* |

**Returns:** *Promise*<DataConsumer\>

Defined in: [packages/server/src/gameserver/transports/WebRTCFunctions.ts:201](https://github.com/xr3ngine/xr3ngine/blob/66a84a950/packages/server/src/gameserver/transports/WebRTCFunctions.ts#L201)

___

### createWebRtcTransport

▸ **createWebRtcTransport**(`__namedParameters`: WebRtcTransportParams): *Promise*<WebRtcTransport\>

#### Parameters:

Name | Type |
:------ | :------ |
`__namedParameters` | WebRtcTransportParams |

**Returns:** *Promise*<WebRtcTransport\>

Defined in: [packages/server/src/gameserver/transports/WebRTCFunctions.ts:174](https://github.com/xr3ngine/xr3ngine/blob/66a84a950/packages/server/src/gameserver/transports/WebRTCFunctions.ts#L174)

___

### handleConsumeDataEvent

▸ `Const`**handleConsumeDataEvent**(`socket`: *Socket*): *function*

#### Parameters:

Name | Type |
:------ | :------ |
`socket` | *Socket* |

**Returns:** (`dataProducer`: *DataProducer*) => *Promise*<void\>

Defined in: [packages/server/src/gameserver/transports/WebRTCFunctions.ts:84](https://github.com/xr3ngine/xr3ngine/blob/66a84a950/packages/server/src/gameserver/transports/WebRTCFunctions.ts#L84)

___

### handleWebRtcCloseConsumer

▸ **handleWebRtcCloseConsumer**(`socket`: *any*, `data`: *any*, `callback`: *any*): *Promise*<any\>

#### Parameters:

Name | Type |
:------ | :------ |
`socket` | *any* |
`data` | *any* |
`callback` | *any* |

**Returns:** *Promise*<any\>

Defined in: [packages/server/src/gameserver/transports/WebRTCFunctions.ts:471](https://github.com/xr3ngine/xr3ngine/blob/66a84a950/packages/server/src/gameserver/transports/WebRTCFunctions.ts#L471)

___

### handleWebRtcCloseProducer

▸ **handleWebRtcCloseProducer**(`socket`: *any*, `data`: *any*, `callback`: *any*): *Promise*<any\>

#### Parameters:

Name | Type |
:------ | :------ |
`socket` | *any* |
`data` | *any* |
`callback` | *any* |

**Returns:** *Promise*<any\>

Defined in: [packages/server/src/gameserver/transports/WebRTCFunctions.ts:327](https://github.com/xr3ngine/xr3ngine/blob/66a84a950/packages/server/src/gameserver/transports/WebRTCFunctions.ts#L327)

___

### handleWebRtcConsumerSetLayers

▸ **handleWebRtcConsumerSetLayers**(`socket`: *any*, `data`: *any*, `callback`: *any*): *Promise*<any\>

#### Parameters:

Name | Type |
:------ | :------ |
`socket` | *any* |
`data` | *any* |
`callback` | *any* |

**Returns:** *Promise*<any\>

Defined in: [packages/server/src/gameserver/transports/WebRTCFunctions.ts:479](https://github.com/xr3ngine/xr3ngine/blob/66a84a950/packages/server/src/gameserver/transports/WebRTCFunctions.ts#L479)

___

### handleWebRtcInitializeRouter

▸ **handleWebRtcInitializeRouter**(`socket`: *any*, `data`: *any*, `callback`: *any*): *Promise*<any\>

#### Parameters:

Name | Type |
:------ | :------ |
`socket` | *any* |
`data` | *any* |
`callback` | *any* |

**Returns:** *Promise*<any\>

Defined in: [packages/server/src/gameserver/transports/WebRTCFunctions.ts:533](https://github.com/xr3ngine/xr3ngine/blob/66a84a950/packages/server/src/gameserver/transports/WebRTCFunctions.ts#L533)

___

### handleWebRtcPauseConsumer

▸ **handleWebRtcPauseConsumer**(`socket`: *any*, `data`: *any*, `callback`: *any*): *Promise*<any\>

#### Parameters:

Name | Type |
:------ | :------ |
`socket` | *any* |
`data` | *any* |
`callback` | *any* |

**Returns:** *Promise*<any\>

Defined in: [packages/server/src/gameserver/transports/WebRTCFunctions.ts:451](https://github.com/xr3ngine/xr3ngine/blob/66a84a950/packages/server/src/gameserver/transports/WebRTCFunctions.ts#L451)

___

### handleWebRtcPauseProducer

▸ **handleWebRtcPauseProducer**(`socket`: *any*, `data`: *any*, `callback`: *any*): *Promise*<any\>

#### Parameters:

Name | Type |
:------ | :------ |
`socket` | *any* |
`data` | *any* |
`callback` | *any* |

**Returns:** *Promise*<any\>

Defined in: [packages/server/src/gameserver/transports/WebRTCFunctions.ts:506](https://github.com/xr3ngine/xr3ngine/blob/66a84a950/packages/server/src/gameserver/transports/WebRTCFunctions.ts#L506)

___

### handleWebRtcProduceData

▸ **handleWebRtcProduceData**(`socket`: *any*, `data`: *any*, `callback`: *any*): *Promise*<any\>

#### Parameters:

Name | Type |
:------ | :------ |
`socket` | *any* |
`data` | *any* |
`callback` | *any* |

**Returns:** *Promise*<any\>

Defined in: [packages/server/src/gameserver/transports/WebRTCFunctions.ts:272](https://github.com/xr3ngine/xr3ngine/blob/66a84a950/packages/server/src/gameserver/transports/WebRTCFunctions.ts#L272)

___

### handleWebRtcReceiveTrack

▸ **handleWebRtcReceiveTrack**(`socket`: *any*, `data`: *any*, `callback`: *any*): *Promise*<any\>

#### Parameters:

Name | Type |
:------ | :------ |
`socket` | *any* |
`data` | *any* |
`callback` | *any* |

**Returns:** *Promise*<any\>

Defined in: [packages/server/src/gameserver/transports/WebRTCFunctions.ts:372](https://github.com/xr3ngine/xr3ngine/blob/66a84a950/packages/server/src/gameserver/transports/WebRTCFunctions.ts#L372)

___

### handleWebRtcRequestCurrentProducers

▸ **handleWebRtcRequestCurrentProducers**(`socket`: *any*, `data`: *any*, `callback`: *any*): *Promise*<any\>

#### Parameters:

Name | Type |
:------ | :------ |
`socket` | *any* |
`data` | *any* |
`callback` | *any* |

**Returns:** *Promise*<any\>

Defined in: [packages/server/src/gameserver/transports/WebRTCFunctions.ts:526](https://github.com/xr3ngine/xr3ngine/blob/66a84a950/packages/server/src/gameserver/transports/WebRTCFunctions.ts#L526)

___

### handleWebRtcResumeConsumer

▸ **handleWebRtcResumeConsumer**(`socket`: *any*, `data`: *any*, `callback`: *any*): *Promise*<any\>

#### Parameters:

Name | Type |
:------ | :------ |
`socket` | *any* |
`data` | *any* |
`callback` | *any* |

**Returns:** *Promise*<any\>

Defined in: [packages/server/src/gameserver/transports/WebRTCFunctions.ts:461](https://github.com/xr3ngine/xr3ngine/blob/66a84a950/packages/server/src/gameserver/transports/WebRTCFunctions.ts#L461)

___

### handleWebRtcResumeProducer

▸ **handleWebRtcResumeProducer**(`socket`: *any*, `data`: *any*, `callback`: *any*): *Promise*<any\>

#### Parameters:

Name | Type |
:------ | :------ |
`socket` | *any* |
`data` | *any* |
`callback` | *any* |

**Returns:** *Promise*<any\>

Defined in: [packages/server/src/gameserver/transports/WebRTCFunctions.ts:487](https://github.com/xr3ngine/xr3ngine/blob/66a84a950/packages/server/src/gameserver/transports/WebRTCFunctions.ts#L487)

___

### handleWebRtcSendTrack

▸ **handleWebRtcSendTrack**(`socket`: *any*, `data`: *any*, `callback`: *any*): *Promise*<any\>

#### Parameters:

Name | Type |
:------ | :------ |
`socket` | *any* |
`data` | *any* |
`callback` | *any* |

**Returns:** *Promise*<any\>

Defined in: [packages/server/src/gameserver/transports/WebRTCFunctions.ts:334](https://github.com/xr3ngine/xr3ngine/blob/66a84a950/packages/server/src/gameserver/transports/WebRTCFunctions.ts#L334)

___

### handleWebRtcTransportClose

▸ **handleWebRtcTransportClose**(`socket`: *any*, `data`: *any*, `callback`: *any*): *Promise*<any\>

#### Parameters:

Name | Type |
:------ | :------ |
`socket` | *any* |
`data` | *any* |
`callback` | *any* |

**Returns:** *Promise*<any\>

Defined in: [packages/server/src/gameserver/transports/WebRTCFunctions.ts:306](https://github.com/xr3ngine/xr3ngine/blob/66a84a950/packages/server/src/gameserver/transports/WebRTCFunctions.ts#L306)

___

### handleWebRtcTransportConnect

▸ **handleWebRtcTransportConnect**(`socket`: *any*, `data`: *any*, `callback`: *any*): *Promise*<any\>

#### Parameters:

Name | Type |
:------ | :------ |
`socket` | *any* |
`data` | *any* |
`callback` | *any* |

**Returns:** *Promise*<any\>

Defined in: [packages/server/src/gameserver/transports/WebRTCFunctions.ts:315](https://github.com/xr3ngine/xr3ngine/blob/66a84a950/packages/server/src/gameserver/transports/WebRTCFunctions.ts#L315)

___

### handleWebRtcTransportCreate

▸ **handleWebRtcTransportCreate**(`socket`: *any*, `data`: WebRtcTransportParams, `callback`: *any*): *Promise*<any\>

#### Parameters:

Name | Type |
:------ | :------ |
`socket` | *any* |
`data` | WebRtcTransportParams |
`callback` | *any* |

**Returns:** *Promise*<any\>

Defined in: [packages/server/src/gameserver/transports/WebRTCFunctions.ts:216](https://github.com/xr3ngine/xr3ngine/blob/66a84a950/packages/server/src/gameserver/transports/WebRTCFunctions.ts#L216)

___

### sendCurrentProducers

▸ `Const`**sendCurrentProducers**(`socket`: *Socket*, `channelType`: *string*, `channelId?`: *string*): *function*

#### Parameters:

Name | Type |
:------ | :------ |
`socket` | *Socket* |
`channelType` | *string* |
`channelId?` | *string* |

**Returns:** (`producer`: *Producer*) => *Promise*<void\>

Defined in: [packages/server/src/gameserver/transports/WebRTCFunctions.ts:49](https://github.com/xr3ngine/xr3ngine/blob/66a84a950/packages/server/src/gameserver/transports/WebRTCFunctions.ts#L49)

___

### sendInitialProducers

▸ `Const`**sendInitialProducers**(`socket`: *Socket*, `channelType`: *string*, `channelId?`: *string*): *Promise*<void\>

#### Parameters:

Name | Type |
:------ | :------ |
`socket` | *Socket* |
`channelType` | *string* |
`channelId?` | *string* |

**Returns:** *Promise*<void\>

Defined in: [packages/server/src/gameserver/transports/WebRTCFunctions.ts:68](https://github.com/xr3ngine/xr3ngine/blob/66a84a950/packages/server/src/gameserver/transports/WebRTCFunctions.ts#L68)

___

### startWebRTC

▸ **startWebRTC**(): *Promise*<void\>

**Returns:** *Promise*<void\>

Defined in: [packages/server/src/gameserver/transports/WebRTCFunctions.ts:24](https://github.com/xr3ngine/xr3ngine/blob/66a84a950/packages/server/src/gameserver/transports/WebRTCFunctions.ts#L24)
