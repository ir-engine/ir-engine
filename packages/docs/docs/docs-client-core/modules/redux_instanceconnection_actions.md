---
id: "redux_instanceconnection_actions"
title: "Module: redux/instanceConnection/actions"
sidebar_label: "redux/instanceConnection/actions"
custom_edit_url: null
hide_title: true
---

# Module: redux/instanceConnection/actions

## Table of contents

### Interfaces

- [InstanceServerConnectedAction](../interfaces/redux_instanceconnection_actions.instanceserverconnectedaction.md)
- [InstanceServerConnectingAction](../interfaces/redux_instanceconnection_actions.instanceserverconnectingaction.md)
- [InstanceServerDisconnectedAction](../interfaces/redux_instanceconnection_actions.instanceserverdisconnectedaction.md)
- [InstanceServerProvisionedAction](../interfaces/redux_instanceconnection_actions.instanceserverprovisionedaction.md)
- [InstanceServerProvisioningAction](../interfaces/redux_instanceconnection_actions.instanceserverprovisioningaction.md)
- [SocketCreatedAction](../interfaces/redux_instanceconnection_actions.socketcreatedaction.md)

## Type aliases

### InstanceServerAction

Ƭ **InstanceServerAction**: [*InstanceServerProvisionedAction*](../interfaces/redux_instanceconnection_actions.instanceserverprovisionedaction.md) \| [*InstanceServerProvisioningAction*](../interfaces/redux_instanceconnection_actions.instanceserverprovisioningaction.md) \| [*InstanceServerConnectingAction*](../interfaces/redux_instanceconnection_actions.instanceserverconnectingaction.md) \| [*InstanceServerConnectedAction*](../interfaces/redux_instanceconnection_actions.instanceserverconnectedaction.md) \| [*InstanceServerDisconnectedAction*](../interfaces/redux_instanceconnection_actions.instanceserverdisconnectedaction.md) \| [*SocketCreatedAction*](../interfaces/redux_instanceconnection_actions.socketcreatedaction.md)

Defined in: [packages/client-core/redux/instanceConnection/actions.ts:41](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/instanceConnection/actions.ts#L41)

## Functions

### instanceServerConnected

▸ **instanceServerConnected**(): [*InstanceServerConnectedAction*](../interfaces/redux_instanceconnection_actions.instanceserverconnectedaction.md)

**Returns:** [*InstanceServerConnectedAction*](../interfaces/redux_instanceconnection_actions.instanceserverconnectedaction.md)

Defined in: [packages/client-core/redux/instanceConnection/actions.ts:70](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/instanceConnection/actions.ts#L70)

___

### instanceServerConnecting

▸ **instanceServerConnecting**(): [*InstanceServerConnectingAction*](../interfaces/redux_instanceconnection_actions.instanceserverconnectingaction.md)

**Returns:** [*InstanceServerConnectingAction*](../interfaces/redux_instanceconnection_actions.instanceserverconnectingaction.md)

Defined in: [packages/client-core/redux/instanceConnection/actions.ts:64](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/instanceConnection/actions.ts#L64)

___

### instanceServerDisconnected

▸ **instanceServerDisconnected**(): [*InstanceServerDisconnectedAction*](../interfaces/redux_instanceconnection_actions.instanceserverdisconnectedaction.md)

**Returns:** [*InstanceServerDisconnectedAction*](../interfaces/redux_instanceconnection_actions.instanceserverdisconnectedaction.md)

Defined in: [packages/client-core/redux/instanceConnection/actions.ts:76](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/instanceConnection/actions.ts#L76)

___

### instanceServerProvisioned

▸ **instanceServerProvisioned**(`provisionResult`: InstanceServerProvisionResult, `locationId`: *string* \| *null*, `sceneId`: *string* \| *null*): [*InstanceServerProvisionedAction*](../interfaces/redux_instanceconnection_actions.instanceserverprovisionedaction.md)

#### Parameters:

Name | Type |
:------ | :------ |
`provisionResult` | InstanceServerProvisionResult |
`locationId` | *string* \| *null* |
`sceneId` | *string* \| *null* |

**Returns:** [*InstanceServerProvisionedAction*](../interfaces/redux_instanceconnection_actions.instanceserverprovisionedaction.md)

Defined in: [packages/client-core/redux/instanceConnection/actions.ts:54](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/instanceConnection/actions.ts#L54)

___

### instanceServerProvisioning

▸ **instanceServerProvisioning**(): [*InstanceServerProvisioningAction*](../interfaces/redux_instanceconnection_actions.instanceserverprovisioningaction.md)

**Returns:** [*InstanceServerProvisioningAction*](../interfaces/redux_instanceconnection_actions.instanceserverprovisioningaction.md)

Defined in: [packages/client-core/redux/instanceConnection/actions.ts:49](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/instanceConnection/actions.ts#L49)

___

### socketCreated

▸ **socketCreated**(`socket`: *any*): [*SocketCreatedAction*](../interfaces/redux_instanceconnection_actions.socketcreatedaction.md)

#### Parameters:

Name | Type |
:------ | :------ |
`socket` | *any* |

**Returns:** [*SocketCreatedAction*](../interfaces/redux_instanceconnection_actions.socketcreatedaction.md)

Defined in: [packages/client-core/redux/instanceConnection/actions.ts:82](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/instanceConnection/actions.ts#L82)
