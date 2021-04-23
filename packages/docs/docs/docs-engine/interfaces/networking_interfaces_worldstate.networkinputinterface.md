---
id: "networking_interfaces_worldstate.networkinputinterface"
title: "Interface: NetworkInputInterface"
sidebar_label: "NetworkInputInterface"
custom_edit_url: null
hide_title: true
---

# Interface: NetworkInputInterface

[networking/interfaces/WorldState](../modules/networking_interfaces_worldstate.md).NetworkInputInterface

Interface for handling network input.

## Hierarchy

* **NetworkInputInterface**

  ↳ [*NetworkClientInputInterface*](networking_interfaces_worldstate.networkclientinputinterface.md)

## Properties

### axes1d

• **axes1d**: { `input`: [*InputAlias*](../modules/input_types_inputalias.md#inputalias) ; `lifecycleState`: [*LifecycleValue*](../enums/common_enums_lifecyclevalue.lifecyclevalue.md) ; `value`: *any*  }[]

Axes 1D input received over the network.

Defined in: [packages/engine/src/networking/interfaces/WorldState.ts:18](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/networking/interfaces/WorldState.ts#L18)

___

### axes2d

• **axes2d**: { `input`: [*InputAlias*](../modules/input_types_inputalias.md#inputalias) ; `lifecycleState`: [*LifecycleValue*](../enums/common_enums_lifecyclevalue.lifecyclevalue.md) ; `value`: *any*  }[]

Axes 2D input received over the network.

Defined in: [packages/engine/src/networking/interfaces/WorldState.ts:24](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/networking/interfaces/WorldState.ts#L24)

___

### axes6DOF

• **axes6DOF**: { `input`: [*InputAlias*](../modules/input_types_inputalias.md#inputalias) ; `qW`: *number* ; `qX`: *number* ; `qY`: *number* ; `qZ`: *number* ; `x`: *number* ; `y`: *number* ; `z`: *number*  }[]

Axes 2D input received over the network.

Defined in: [packages/engine/src/networking/interfaces/WorldState.ts:30](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/networking/interfaces/WorldState.ts#L30)

___

### buttons

• **buttons**: { `input`: [*InputAlias*](../modules/input_types_inputalias.md#inputalias) ; `lifecycleState`: [*LifecycleValue*](../enums/common_enums_lifecyclevalue.lifecyclevalue.md) ; `value`: *any*  }[]

Button input received over the network.

Defined in: [packages/engine/src/networking/interfaces/WorldState.ts:12](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/networking/interfaces/WorldState.ts#L12)

___

### characterState

• **characterState**: *number*

Defined in: [packages/engine/src/networking/interfaces/WorldState.ts:43](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/networking/interfaces/WorldState.ts#L43)

___

### networkId

• **networkId**: *number*

ID of network.

Defined in: [packages/engine/src/networking/interfaces/WorldState.ts:10](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/networking/interfaces/WorldState.ts#L10)

___

### snapShotTime

• **snapShotTime**: *number*

Defined in: [packages/engine/src/networking/interfaces/WorldState.ts:42](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/networking/interfaces/WorldState.ts#L42)

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

Defined in: [packages/engine/src/networking/interfaces/WorldState.ts:41](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/networking/interfaces/WorldState.ts#L41)
