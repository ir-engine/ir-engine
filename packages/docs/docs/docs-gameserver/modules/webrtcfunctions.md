---
id: "webrtcfunctions"
title: "Module: WebRTCFunctions"
sidebar_label: "WebRTCFunctions"
custom_edit_url: null
hide_title: true
---

# Module: WebRTCFunctions

## Functions

### closeConsumer

▸ **closeConsumer**(`consumer`: *any*): *Promise*<void\>

#### Parameters:

Name | Type |
:------ | :------ |
`consumer` | *any* |

**Returns:** *Promise*<void\>

Defined in: [WebRTCFunctions.ts:161](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/gameserver/src/WebRTCFunctions.ts#L161)

___

### closeProducer

▸ **closeProducer**(`producer`: *any*): *Promise*<void\>

#### Parameters:

Name | Type |
:------ | :------ |
`producer` | *any* |

**Returns:** *Promise*<void\>

Defined in: [WebRTCFunctions.ts:133](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/gameserver/src/WebRTCFunctions.ts#L133)

___

### closeProducerAndAllPipeProducers

▸ **closeProducerAndAllPipeProducers**(`producer`: *any*, `peerId`: *any*): *Promise*<void\>

#### Parameters:

Name | Type |
:------ | :------ |
`producer` | *any* |
`peerId` | *any* |

**Returns:** *Promise*<void\>

Defined in: [WebRTCFunctions.ts:142](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/gameserver/src/WebRTCFunctions.ts#L142)

___

### closeTransport

▸ **closeTransport**(`transport`: *any*): *Promise*<void\>

#### Parameters:

Name | Type |
:------ | :------ |
`transport` | *any* |

**Returns:** *Promise*<void\>

Defined in: [WebRTCFunctions.ts:125](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/gameserver/src/WebRTCFunctions.ts#L125)

___

### createInternalDataConsumer

▸ **createInternalDataConsumer**(`dataProducer`: DataProducer, `userId`: *string*): *Promise*<DataConsumer\>

#### Parameters:

Name | Type |
:------ | :------ |
`dataProducer` | DataProducer |
`userId` | *string* |

**Returns:** *Promise*<DataConsumer\>

Defined in: [WebRTCFunctions.ts:200](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/gameserver/src/WebRTCFunctions.ts#L200)

___

### createWebRtcTransport

▸ **createWebRtcTransport**(`__namedParameters`: WebRtcTransportParams): *Promise*<WebRtcTransport\>

#### Parameters:

Name | Type |
:------ | :------ |
`__namedParameters` | WebRtcTransportParams |

**Returns:** *Promise*<WebRtcTransport\>

Defined in: [WebRTCFunctions.ts:173](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/gameserver/src/WebRTCFunctions.ts#L173)

___

### handleConsumeDataEvent

▸ `Const`**handleConsumeDataEvent**(`socket`: *Socket*): *function*

#### Parameters:

Name | Type |
:------ | :------ |
`socket` | *Socket* |

**Returns:** (`dataProducer`: *DataProducer*) => *Promise*<void\>

Defined in: [WebRTCFunctions.ts:83](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/gameserver/src/WebRTCFunctions.ts#L83)

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

Defined in: [WebRTCFunctions.ts:472](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/gameserver/src/WebRTCFunctions.ts#L472)

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

Defined in: [WebRTCFunctions.ts:328](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/gameserver/src/WebRTCFunctions.ts#L328)

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

Defined in: [WebRTCFunctions.ts:480](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/gameserver/src/WebRTCFunctions.ts#L480)

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

Defined in: [WebRTCFunctions.ts:534](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/gameserver/src/WebRTCFunctions.ts#L534)

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

Defined in: [WebRTCFunctions.ts:452](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/gameserver/src/WebRTCFunctions.ts#L452)

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

Defined in: [WebRTCFunctions.ts:507](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/gameserver/src/WebRTCFunctions.ts#L507)

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

Defined in: [WebRTCFunctions.ts:273](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/gameserver/src/WebRTCFunctions.ts#L273)

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

Defined in: [WebRTCFunctions.ts:373](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/gameserver/src/WebRTCFunctions.ts#L373)

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

Defined in: [WebRTCFunctions.ts:527](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/gameserver/src/WebRTCFunctions.ts#L527)

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

Defined in: [WebRTCFunctions.ts:462](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/gameserver/src/WebRTCFunctions.ts#L462)

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

Defined in: [WebRTCFunctions.ts:488](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/gameserver/src/WebRTCFunctions.ts#L488)

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

Defined in: [WebRTCFunctions.ts:335](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/gameserver/src/WebRTCFunctions.ts#L335)

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

Defined in: [WebRTCFunctions.ts:307](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/gameserver/src/WebRTCFunctions.ts#L307)

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

Defined in: [WebRTCFunctions.ts:316](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/gameserver/src/WebRTCFunctions.ts#L316)

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

Defined in: [WebRTCFunctions.ts:215](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/gameserver/src/WebRTCFunctions.ts#L215)

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

Defined in: [WebRTCFunctions.ts:48](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/gameserver/src/WebRTCFunctions.ts#L48)

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

Defined in: [WebRTCFunctions.ts:67](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/gameserver/src/WebRTCFunctions.ts#L67)

___

### startWebRTC

▸ **startWebRTC**(): *Promise*<void\>

**Returns:** *Promise*<void\>

Defined in: [WebRTCFunctions.ts:23](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/gameserver/src/WebRTCFunctions.ts#L23)
