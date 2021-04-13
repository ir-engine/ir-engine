---
id: "networking_interfaces_worldstate.networkclientinputinterface"
title: "Interface: NetworkClientInputInterface"
sidebar_label: "NetworkClientInputInterface"
custom_edit_url: null
hide_title: true
---

# Interface: NetworkClientInputInterface

[networking/interfaces/WorldState](../modules/networking_interfaces_worldstate.md).NetworkClientInputInterface

Interface for handling client network input.

## Hierarchy

* [*NetworkInputInterface*](networking_interfaces_worldstate.networkinputinterface.md)

  ↳ **NetworkClientInputInterface**

## Properties

### axes1d

• **axes1d**: { `input`: [*InputAlias*](../modules/input_types_inputalias.md#inputalias) ; `lifecycleState`: [*LifecycleValue*](../enums/common_enums_lifecyclevalue.lifecyclevalue.md) ; `value`: *any*  }[]

Axes 1D input received over the network.

Inherited from: [NetworkInputInterface](networking_interfaces_worldstate.networkinputinterface.md).[axes1d](networking_interfaces_worldstate.networkinputinterface.md#axes1d)

Defined in: [packages/engine/src/networking/interfaces/WorldState.ts:18](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/networking/interfaces/WorldState.ts#L18)

___

### axes2d

• **axes2d**: { `input`: [*InputAlias*](../modules/input_types_inputalias.md#inputalias) ; `lifecycleState`: [*LifecycleValue*](../enums/common_enums_lifecyclevalue.lifecyclevalue.md) ; `value`: *any*  }[]

Axes 2D input received over the network.

Inherited from: [NetworkInputInterface](networking_interfaces_worldstate.networkinputinterface.md).[axes2d](networking_interfaces_worldstate.networkinputinterface.md#axes2d)

Defined in: [packages/engine/src/networking/interfaces/WorldState.ts:24](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/networking/interfaces/WorldState.ts#L24)

___

### axes6DOF

• **axes6DOF**: { `input`: [*InputAlias*](../modules/input_types_inputalias.md#inputalias) ; `qW`: *number* ; `qX`: *number* ; `qY`: *number* ; `qZ`: *number* ; `x`: *number* ; `y`: *number* ; `z`: *number*  }[]

Axes 2D input received over the network.

Inherited from: [NetworkInputInterface](networking_interfaces_worldstate.networkinputinterface.md).[axes6DOF](networking_interfaces_worldstate.networkinputinterface.md#axes6dof)

Defined in: [packages/engine/src/networking/interfaces/WorldState.ts:30](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/networking/interfaces/WorldState.ts#L30)

___

### buttons

• **buttons**: { `input`: [*InputAlias*](../modules/input_types_inputalias.md#inputalias) ; `lifecycleState`: [*LifecycleValue*](../enums/common_enums_lifecyclevalue.lifecyclevalue.md) ; `value`: *any*  }[]

Button input received over the network.

Inherited from: [NetworkInputInterface](networking_interfaces_worldstate.networkinputinterface.md).[buttons](networking_interfaces_worldstate.networkinputinterface.md#buttons)

Defined in: [packages/engine/src/networking/interfaces/WorldState.ts:12](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/networking/interfaces/WorldState.ts#L12)

___

### characterState

• **characterState**: *number*

Overrides: [NetworkInputInterface](networking_interfaces_worldstate.networkinputinterface.md).[characterState](networking_interfaces_worldstate.networkinputinterface.md#characterstate)

Defined in: [packages/engine/src/networking/interfaces/WorldState.ts:52](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/networking/interfaces/WorldState.ts#L52)

___

### networkId

• **networkId**: *number*

ID of network.

Inherited from: [NetworkInputInterface](networking_interfaces_worldstate.networkinputinterface.md).[networkId](networking_interfaces_worldstate.networkinputinterface.md#networkid)

Defined in: [packages/engine/src/networking/interfaces/WorldState.ts:10](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/networking/interfaces/WorldState.ts#L10)

___

### snapShotTime

• **snapShotTime**: *number*

Time of the snapshot.

Overrides: [NetworkInputInterface](networking_interfaces_worldstate.networkinputinterface.md).[snapShotTime](networking_interfaces_worldstate.networkinputinterface.md#snapshottime)

Defined in: [packages/engine/src/networking/interfaces/WorldState.ts:50](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/networking/interfaces/WorldState.ts#L50)

___

### viewVector

• **viewVector**: *object*

Viewport vector of the client.

#### Type declaration:

Name | Type |
:------ | :------ |
`x` | *number* |
`y` | *number* |
`z` | *number* |

Inherited from: [NetworkInputInterface](networking_interfaces_worldstate.networkinputinterface.md).[viewVector](networking_interfaces_worldstate.networkinputinterface.md#viewvector)

Defined in: [packages/engine/src/networking/interfaces/WorldState.ts:41](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/networking/interfaces/WorldState.ts#L41)
