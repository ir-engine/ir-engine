---
id: "client_core_redux_instanceconnection_actions"
title: "Module: client-core/redux/instanceConnection/actions"
sidebar_label: "client-core/redux/instanceConnection/actions"
custom_edit_url: null
hide_title: true
---

# Module: client-core/redux/instanceConnection/actions

## Table of contents

### Interfaces

- [InstanceServerConnectedAction](../interfaces/client_core_redux_instanceconnection_actions.instanceserverconnectedaction.md)
- [InstanceServerConnectingAction](../interfaces/client_core_redux_instanceconnection_actions.instanceserverconnectingaction.md)
- [InstanceServerDisconnectedAction](../interfaces/client_core_redux_instanceconnection_actions.instanceserverdisconnectedaction.md)
- [InstanceServerProvisionedAction](../interfaces/client_core_redux_instanceconnection_actions.instanceserverprovisionedaction.md)
- [InstanceServerProvisioningAction](../interfaces/client_core_redux_instanceconnection_actions.instanceserverprovisioningaction.md)
- [SocketCreatedAction](../interfaces/client_core_redux_instanceconnection_actions.socketcreatedaction.md)

## Type aliases

### InstanceServerAction

Ƭ **InstanceServerAction**: [*InstanceServerProvisionedAction*](../interfaces/client_core_redux_instanceconnection_actions.instanceserverprovisionedaction.md) \| [*InstanceServerProvisioningAction*](../interfaces/client_core_redux_instanceconnection_actions.instanceserverprovisioningaction.md) \| [*InstanceServerConnectingAction*](../interfaces/client_core_redux_instanceconnection_actions.instanceserverconnectingaction.md) \| [*InstanceServerConnectedAction*](../interfaces/client_core_redux_instanceconnection_actions.instanceserverconnectedaction.md) \| [*InstanceServerDisconnectedAction*](../interfaces/client_core_redux_instanceconnection_actions.instanceserverdisconnectedaction.md) \| [*SocketCreatedAction*](../interfaces/client_core_redux_instanceconnection_actions.socketcreatedaction.md)

Defined in: [packages/client-core/redux/instanceConnection/actions.ts:41](https://github.com/xr3ngine/xr3ngine/blob/5a0f83ed8/packages/client-core/redux/instanceConnection/actions.ts#L41)

## Functions

### instanceServerConnected

▸ **instanceServerConnected**(): [*InstanceServerConnectedAction*](../interfaces/client_core_redux_instanceconnection_actions.instanceserverconnectedaction.md)

**Returns:** [*InstanceServerConnectedAction*](../interfaces/client_core_redux_instanceconnection_actions.instanceserverconnectedaction.md)

Defined in: [packages/client-core/redux/instanceConnection/actions.ts:70](https://github.com/xr3ngine/xr3ngine/blob/5a0f83ed8/packages/client-core/redux/instanceConnection/actions.ts#L70)

___

### instanceServerConnecting

▸ **instanceServerConnecting**(): [*InstanceServerConnectingAction*](../interfaces/client_core_redux_instanceconnection_actions.instanceserverconnectingaction.md)

**Returns:** [*InstanceServerConnectingAction*](../interfaces/client_core_redux_instanceconnection_actions.instanceserverconnectingaction.md)

Defined in: [packages/client-core/redux/instanceConnection/actions.ts:64](https://github.com/xr3ngine/xr3ngine/blob/5a0f83ed8/packages/client-core/redux/instanceConnection/actions.ts#L64)

___

### instanceServerDisconnected

▸ **instanceServerDisconnected**(): [*InstanceServerDisconnectedAction*](../interfaces/client_core_redux_instanceconnection_actions.instanceserverdisconnectedaction.md)

**Returns:** [*InstanceServerDisconnectedAction*](../interfaces/client_core_redux_instanceconnection_actions.instanceserverdisconnectedaction.md)

Defined in: [packages/client-core/redux/instanceConnection/actions.ts:76](https://github.com/xr3ngine/xr3ngine/blob/5a0f83ed8/packages/client-core/redux/instanceConnection/actions.ts#L76)

___

### instanceServerProvisioned

▸ **instanceServerProvisioned**(`provisionResult`: InstanceServerProvisionResult, `locationId`: *string* \| *null*, `sceneId`: *string* \| *null*): [*InstanceServerProvisionedAction*](../interfaces/client_core_redux_instanceconnection_actions.instanceserverprovisionedaction.md)

#### Parameters:

Name | Type |
:------ | :------ |
`provisionResult` | InstanceServerProvisionResult |
`locationId` | *string* \| *null* |
`sceneId` | *string* \| *null* |

**Returns:** [*InstanceServerProvisionedAction*](../interfaces/client_core_redux_instanceconnection_actions.instanceserverprovisionedaction.md)

Defined in: [packages/client-core/redux/instanceConnection/actions.ts:54](https://github.com/xr3ngine/xr3ngine/blob/5a0f83ed8/packages/client-core/redux/instanceConnection/actions.ts#L54)

___

### instanceServerProvisioning

▸ **instanceServerProvisioning**(): [*InstanceServerProvisioningAction*](../interfaces/client_core_redux_instanceconnection_actions.instanceserverprovisioningaction.md)

**Returns:** [*InstanceServerProvisioningAction*](../interfaces/client_core_redux_instanceconnection_actions.instanceserverprovisioningaction.md)

Defined in: [packages/client-core/redux/instanceConnection/actions.ts:49](https://github.com/xr3ngine/xr3ngine/blob/5a0f83ed8/packages/client-core/redux/instanceConnection/actions.ts#L49)

___

### socketCreated

▸ **socketCreated**(`socket`: *any*): [*SocketCreatedAction*](../interfaces/client_core_redux_instanceconnection_actions.socketcreatedaction.md)

#### Parameters:

Name | Type |
:------ | :------ |
`socket` | *any* |

**Returns:** [*SocketCreatedAction*](../interfaces/client_core_redux_instanceconnection_actions.socketcreatedaction.md)

Defined in: [packages/client-core/redux/instanceConnection/actions.ts:82](https://github.com/xr3ngine/xr3ngine/blob/5a0f83ed8/packages/client-core/redux/instanceConnection/actions.ts#L82)
