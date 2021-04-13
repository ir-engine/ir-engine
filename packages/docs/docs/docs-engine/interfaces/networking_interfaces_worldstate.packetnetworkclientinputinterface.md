---
id: "networking_interfaces_worldstate.packetnetworkclientinputinterface"
title: "Interface: PacketNetworkClientInputInterface"
sidebar_label: "PacketNetworkClientInputInterface"
custom_edit_url: null
hide_title: true
---

# Interface: PacketNetworkClientInputInterface

[networking/interfaces/WorldState](../modules/networking_interfaces_worldstate.md).PacketNetworkClientInputInterface

Interface for network client input packet.

## Hierarchy

* [*PacketNetworkInputInterface*](networking_interfaces_worldstate.packetnetworkinputinterface.md)

  ↳ **PacketNetworkClientInputInterface**

## Properties

### axes1d

• **axes1d**: { `input`: [*InputAlias*](../modules/input_types_inputalias.md#inputalias) ; `lifecycleState`: [*LifecycleValue*](../enums/common_enums_lifecyclevalue.lifecyclevalue.md) ; `value`: *any*  }[]

Axes 1D input received over the network.

Inherited from: [PacketNetworkInputInterface](networking_interfaces_worldstate.packetnetworkinputinterface.md).[axes1d](networking_interfaces_worldstate.packetnetworkinputinterface.md#axes1d)

Defined in: [packages/engine/src/networking/interfaces/WorldState.ts:155](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/networking/interfaces/WorldState.ts#L155)

___

### axes2d

• **axes2d**: { `input`: [*InputAlias*](../modules/input_types_inputalias.md#inputalias) ; `lifecycleState`: [*LifecycleValue*](../enums/common_enums_lifecyclevalue.lifecyclevalue.md) ; `value`: *any*  }[]

Axes 2D input received over the network.

Inherited from: [PacketNetworkInputInterface](networking_interfaces_worldstate.packetnetworkinputinterface.md).[axes2d](networking_interfaces_worldstate.packetnetworkinputinterface.md#axes2d)

Defined in: [packages/engine/src/networking/interfaces/WorldState.ts:161](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/networking/interfaces/WorldState.ts#L161)

___

### axes6DOF

• **axes6DOF**: { `input`: [*InputAlias*](../modules/input_types_inputalias.md#inputalias) ; `qW`: *number* ; `qX`: *number* ; `qY`: *number* ; `qZ`: *number* ; `x`: *number* ; `y`: *number* ; `z`: *number*  }[]

Axes 2D input received over the network.

Inherited from: [PacketNetworkInputInterface](networking_interfaces_worldstate.packetnetworkinputinterface.md).[axes6DOF](networking_interfaces_worldstate.packetnetworkinputinterface.md#axes6dof)

Defined in: [packages/engine/src/networking/interfaces/WorldState.ts:167](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/networking/interfaces/WorldState.ts#L167)

___

### buttons

• **buttons**: { `input`: [*InputAlias*](../modules/input_types_inputalias.md#inputalias) ; `lifecycleState`: [*LifecycleValue*](../enums/common_enums_lifecyclevalue.lifecyclevalue.md) ; `value`: *any*  }[]

Button input received over the network.

Inherited from: [PacketNetworkInputInterface](networking_interfaces_worldstate.packetnetworkinputinterface.md).[buttons](networking_interfaces_worldstate.packetnetworkinputinterface.md#buttons)

Defined in: [packages/engine/src/networking/interfaces/WorldState.ts:149](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/networking/interfaces/WorldState.ts#L149)

___

### networkId

• **networkId**: *number*

ID of the network.

Inherited from: [PacketNetworkInputInterface](networking_interfaces_worldstate.packetnetworkinputinterface.md).[networkId](networking_interfaces_worldstate.packetnetworkinputinterface.md#networkid)

Defined in: [packages/engine/src/networking/interfaces/WorldState.ts:147](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/networking/interfaces/WorldState.ts#L147)

___

### snapShotTime

• **snapShotTime**: *number*

Time of the snapshot.

Defined in: [packages/engine/src/networking/interfaces/WorldState.ts:58](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/networking/interfaces/WorldState.ts#L58)

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

Inherited from: [PacketNetworkInputInterface](networking_interfaces_worldstate.packetnetworkinputinterface.md).[viewVector](networking_interfaces_worldstate.packetnetworkinputinterface.md#viewvector)

Defined in: [packages/engine/src/networking/interfaces/WorldState.ts:178](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/networking/interfaces/WorldState.ts#L178)
