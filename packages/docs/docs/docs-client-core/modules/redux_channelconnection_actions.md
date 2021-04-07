---
id: "redux_channelconnection_actions"
title: "Module: redux/channelConnection/actions"
sidebar_label: "redux/channelConnection/actions"
custom_edit_url: null
hide_title: true
---

# Module: redux/channelConnection/actions

## Table of contents

### Interfaces

- [ChannelServerConnectedAction](../interfaces/redux_channelconnection_actions.channelserverconnectedaction.md)
- [ChannelServerConnectingAction](../interfaces/redux_channelconnection_actions.channelserverconnectingaction.md)
- [ChannelServerDisconnectedAction](../interfaces/redux_channelconnection_actions.channelserverdisconnectedaction.md)
- [ChannelServerProvisionedAction](../interfaces/redux_channelconnection_actions.channelserverprovisionedaction.md)
- [ChannelServerProvisioningAction](../interfaces/redux_channelconnection_actions.channelserverprovisioningaction.md)
- [SocketCreatedAction](../interfaces/redux_channelconnection_actions.socketcreatedaction.md)

## Type aliases

### ChannelServerAction

Ƭ **ChannelServerAction**: [*ChannelServerProvisionedAction*](../interfaces/redux_channelconnection_actions.channelserverprovisionedaction.md) \| [*ChannelServerProvisioningAction*](../interfaces/redux_channelconnection_actions.channelserverprovisioningaction.md) \| [*ChannelServerConnectingAction*](../interfaces/redux_channelconnection_actions.channelserverconnectingaction.md) \| [*ChannelServerConnectedAction*](../interfaces/redux_channelconnection_actions.channelserverconnectedaction.md) \| [*ChannelServerDisconnectedAction*](../interfaces/redux_channelconnection_actions.channelserverdisconnectedaction.md) \| [*SocketCreatedAction*](../interfaces/redux_channelconnection_actions.socketcreatedaction.md)

Defined in: [packages/client-core/redux/channelConnection/actions.ts:40](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/channelConnection/actions.ts#L40)

## Functions

### channelServerConnected

▸ **channelServerConnected**(): [*ChannelServerConnectedAction*](../interfaces/redux_channelconnection_actions.channelserverconnectedaction.md)

**Returns:** [*ChannelServerConnectedAction*](../interfaces/redux_channelconnection_actions.channelserverconnectedaction.md)

Defined in: [packages/client-core/redux/channelConnection/actions.ts:68](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/channelConnection/actions.ts#L68)

___

### channelServerConnecting

▸ **channelServerConnecting**(): [*ChannelServerConnectingAction*](../interfaces/redux_channelconnection_actions.channelserverconnectingaction.md)

**Returns:** [*ChannelServerConnectingAction*](../interfaces/redux_channelconnection_actions.channelserverconnectingaction.md)

Defined in: [packages/client-core/redux/channelConnection/actions.ts:62](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/channelConnection/actions.ts#L62)

___

### channelServerDisconnected

▸ **channelServerDisconnected**(): [*ChannelServerDisconnectedAction*](../interfaces/redux_channelconnection_actions.channelserverdisconnectedaction.md)

**Returns:** [*ChannelServerDisconnectedAction*](../interfaces/redux_channelconnection_actions.channelserverdisconnectedaction.md)

Defined in: [packages/client-core/redux/channelConnection/actions.ts:74](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/channelConnection/actions.ts#L74)

___

### channelServerProvisioned

▸ **channelServerProvisioned**(`provisionResult`: InstanceServerProvisionResult, `channelId`: *string* \| *null*): [*ChannelServerProvisionedAction*](../interfaces/redux_channelconnection_actions.channelserverprovisionedaction.md)

#### Parameters:

Name | Type |
:------ | :------ |
`provisionResult` | InstanceServerProvisionResult |
`channelId` | *string* \| *null* |

**Returns:** [*ChannelServerProvisionedAction*](../interfaces/redux_channelconnection_actions.channelserverprovisionedaction.md)

Defined in: [packages/client-core/redux/channelConnection/actions.ts:53](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/channelConnection/actions.ts#L53)

___

### channelServerProvisioning

▸ **channelServerProvisioning**(): [*ChannelServerProvisioningAction*](../interfaces/redux_channelconnection_actions.channelserverprovisioningaction.md)

**Returns:** [*ChannelServerProvisioningAction*](../interfaces/redux_channelconnection_actions.channelserverprovisioningaction.md)

Defined in: [packages/client-core/redux/channelConnection/actions.ts:48](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/channelConnection/actions.ts#L48)

___

### socketCreated

▸ **socketCreated**(`socket`: *any*): [*SocketCreatedAction*](../interfaces/redux_channelconnection_actions.socketcreatedaction.md)

#### Parameters:

Name | Type |
:------ | :------ |
`socket` | *any* |

**Returns:** [*SocketCreatedAction*](../interfaces/redux_channelconnection_actions.socketcreatedaction.md)

Defined in: [packages/client-core/redux/channelConnection/actions.ts:80](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/channelConnection/actions.ts#L80)
