---
id: "networking_interfaces_networktransport.networktransport"
title: "Interface: NetworkTransport"
sidebar_label: "NetworkTransport"
custom_edit_url: null
hide_title: true
---

# Interface: NetworkTransport

[networking/interfaces/NetworkTransport](../modules/networking_interfaces_networktransport.md).NetworkTransport

Interface for the Transport.

## Methods

### handleKick

▸ **handleKick**(`socket`: *any*): *any*

Handle kick event.

#### Parameters:

Name | Type | Description |
:------ | :------ | :------ |
`socket` | *any* | Socket on which this event occurred.    |

**Returns:** *any*

Defined in: [packages/engine/src/networking/interfaces/NetworkTransport.ts:7](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/networking/interfaces/NetworkTransport.ts#L7)

___

### initialize

▸ **initialize**(`address?`: *string*, `port?`: *number*, `instance?`: *boolean*, `opts?`: Object): *void* \| *Promise*<void\>

Initialize the transport.

#### Parameters:

Name | Type | Description |
:------ | :------ | :------ |
`address?` | *string* | Address of this transport.   |
`port?` | *number* | Port of this transport.   |
`instance?` | *boolean* | Whether this is a connection to an instance server or not (i.e. channel server)   |
`opts?` | Object | Options.    |

**Returns:** *void* \| *Promise*<void\>

Defined in: [packages/engine/src/networking/interfaces/NetworkTransport.ts:16](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/networking/interfaces/NetworkTransport.ts#L16)

___

### sendData

▸ **sendData**(`data`: *any*): *void*

Send data over transport.

#### Parameters:

Name | Type | Description |
:------ | :------ | :------ |
`data` | *any* | Data to be sent.    |

**Returns:** *void*

Defined in: [packages/engine/src/networking/interfaces/NetworkTransport.ts:22](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/networking/interfaces/NetworkTransport.ts#L22)

___

### sendReliableData

▸ **sendReliableData**(`data`: *any*): *void*

Send data through reliable channel over transport.

#### Parameters:

Name | Type | Description |
:------ | :------ | :------ |
`data` | *any* | Data to be sent.    |

**Returns:** *void*

Defined in: [packages/engine/src/networking/interfaces/NetworkTransport.ts:28](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/networking/interfaces/NetworkTransport.ts#L28)
