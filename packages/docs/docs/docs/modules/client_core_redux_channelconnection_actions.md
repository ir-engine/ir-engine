---
id: "client_core_redux_channelconnection_actions"
title: "Module: client-core/redux/channelConnection/actions"
sidebar_label: "client-core/redux/channelConnection/actions"
custom_edit_url: null
hide_title: true
---

# Module: client-core/redux/channelConnection/actions

## Table of contents

### Interfaces

- [ChannelServerConnectedAction](../interfaces/client_core_redux_channelconnection_actions.channelserverconnectedaction.md)
- [ChannelServerConnectingAction](../interfaces/client_core_redux_channelconnection_actions.channelserverconnectingaction.md)
- [ChannelServerDisconnectedAction](../interfaces/client_core_redux_channelconnection_actions.channelserverdisconnectedaction.md)
- [ChannelServerProvisionedAction](../interfaces/client_core_redux_channelconnection_actions.channelserverprovisionedaction.md)
- [ChannelServerProvisioningAction](../interfaces/client_core_redux_channelconnection_actions.channelserverprovisioningaction.md)
- [SocketCreatedAction](../interfaces/client_core_redux_channelconnection_actions.socketcreatedaction.md)

## Type aliases

### ChannelServerAction

Ƭ **ChannelServerAction**: [*ChannelServerProvisionedAction*](../interfaces/client_core_redux_channelconnection_actions.channelserverprovisionedaction.md) \| [*ChannelServerProvisioningAction*](../interfaces/client_core_redux_channelconnection_actions.channelserverprovisioningaction.md) \| [*ChannelServerConnectingAction*](../interfaces/client_core_redux_channelconnection_actions.channelserverconnectingaction.md) \| [*ChannelServerConnectedAction*](../interfaces/client_core_redux_channelconnection_actions.channelserverconnectedaction.md) \| [*ChannelServerDisconnectedAction*](../interfaces/client_core_redux_channelconnection_actions.channelserverdisconnectedaction.md) \| [*SocketCreatedAction*](../interfaces/client_core_redux_channelconnection_actions.socketcreatedaction.md)

Defined in: [packages/client-core/redux/channelConnection/actions.ts:40](https://github.com/xr3ngine/xr3ngine/blob/5a0f83ed8/packages/client-core/redux/channelConnection/actions.ts#L40)

## Functions

### channelServerConnected

▸ **channelServerConnected**(): [*ChannelServerConnectedAction*](../interfaces/client_core_redux_channelconnection_actions.channelserverconnectedaction.md)

**Returns:** [*ChannelServerConnectedAction*](../interfaces/client_core_redux_channelconnection_actions.channelserverconnectedaction.md)

Defined in: [packages/client-core/redux/channelConnection/actions.ts:68](https://github.com/xr3ngine/xr3ngine/blob/5a0f83ed8/packages/client-core/redux/channelConnection/actions.ts#L68)

___

### channelServerConnecting

▸ **channelServerConnecting**(): [*ChannelServerConnectingAction*](../interfaces/client_core_redux_channelconnection_actions.channelserverconnectingaction.md)

**Returns:** [*ChannelServerConnectingAction*](../interfaces/client_core_redux_channelconnection_actions.channelserverconnectingaction.md)

Defined in: [packages/client-core/redux/channelConnection/actions.ts:62](https://github.com/xr3ngine/xr3ngine/blob/5a0f83ed8/packages/client-core/redux/channelConnection/actions.ts#L62)

___

### channelServerDisconnected

▸ **channelServerDisconnected**(): [*ChannelServerDisconnectedAction*](../interfaces/client_core_redux_channelconnection_actions.channelserverdisconnectedaction.md)

**Returns:** [*ChannelServerDisconnectedAction*](../interfaces/client_core_redux_channelconnection_actions.channelserverdisconnectedaction.md)

Defined in: [packages/client-core/redux/channelConnection/actions.ts:74](https://github.com/xr3ngine/xr3ngine/blob/5a0f83ed8/packages/client-core/redux/channelConnection/actions.ts#L74)

___

### channelServerProvisioned

▸ **channelServerProvisioned**(`provisionResult`: InstanceServerProvisionResult, `channelId`: *string* \| *null*): [*ChannelServerProvisionedAction*](../interfaces/client_core_redux_channelconnection_actions.channelserverprovisionedaction.md)

#### Parameters:

Name | Type |
:------ | :------ |
`provisionResult` | InstanceServerProvisionResult |
`channelId` | *string* \| *null* |

**Returns:** [*ChannelServerProvisionedAction*](../interfaces/client_core_redux_channelconnection_actions.channelserverprovisionedaction.md)

Defined in: [packages/client-core/redux/channelConnection/actions.ts:53](https://github.com/xr3ngine/xr3ngine/blob/5a0f83ed8/packages/client-core/redux/channelConnection/actions.ts#L53)

___

### channelServerProvisioning

▸ **channelServerProvisioning**(): [*ChannelServerProvisioningAction*](../interfaces/client_core_redux_channelconnection_actions.channelserverprovisioningaction.md)

**Returns:** [*ChannelServerProvisioningAction*](../interfaces/client_core_redux_channelconnection_actions.channelserverprovisioningaction.md)

Defined in: [packages/client-core/redux/channelConnection/actions.ts:48](https://github.com/xr3ngine/xr3ngine/blob/5a0f83ed8/packages/client-core/redux/channelConnection/actions.ts#L48)

___

### socketCreated

▸ **socketCreated**(`socket`: *any*): [*SocketCreatedAction*](../interfaces/client_core_redux_channelconnection_actions.socketcreatedaction.md)

#### Parameters:

Name | Type |
:------ | :------ |
`socket` | *any* |

**Returns:** [*SocketCreatedAction*](../interfaces/client_core_redux_channelconnection_actions.socketcreatedaction.md)

Defined in: [packages/client-core/redux/channelConnection/actions.ts:80](https://github.com/xr3ngine/xr3ngine/blob/5a0f83ed8/packages/client-core/redux/channelConnection/actions.ts#L80)
