---
id: "networking_interfaces_worldstate.worldstateinterface"
title: "Interface: WorldStateInterface"
sidebar_label: "WorldStateInterface"
custom_edit_url: null
hide_title: true
---

# Interface: WorldStateInterface

[networking/interfaces/WorldState](../modules/networking_interfaces_worldstate.md).WorldStateInterface

Interface for world state.

## Properties

### clientsConnected

• **clientsConnected**: [*NetworkClientDataInterface*](networking_interfaces_worldstate.networkclientdatainterface.md)[]

List of connected clients.

Defined in: [packages/engine/src/networking/interfaces/WorldState.ts:132](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/networking/interfaces/WorldState.ts#L132)

___

### clientsDisconnected

• **clientsDisconnected**: [*NetworkClientDataInterface*](networking_interfaces_worldstate.networkclientdatainterface.md)[]

List of disconnected clients.

Defined in: [packages/engine/src/networking/interfaces/WorldState.ts:134](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/networking/interfaces/WorldState.ts#L134)

___

### createObjects

• **createObjects**: [*NetworkObjectCreateInterface*](networking_interfaces_worldstate.networkobjectcreateinterface.md)[]

List of created objects.

Defined in: [packages/engine/src/networking/interfaces/WorldState.ts:136](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/networking/interfaces/WorldState.ts#L136)

___

### destroyObjects

• **destroyObjects**: [*NetworkObjectRemoveInterface*](networking_interfaces_worldstate.networkobjectremoveinterface.md)[]

List of destroyed objects.

Defined in: [packages/engine/src/networking/interfaces/WorldState.ts:140](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/networking/interfaces/WorldState.ts#L140)

___

### editObjects

• **editObjects**: [*NetworkObjectEditInterface*](networking_interfaces_worldstate.networkobjecteditinterface.md)[]

List of created objects.

Defined in: [packages/engine/src/networking/interfaces/WorldState.ts:138](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/networking/interfaces/WorldState.ts#L138)

___

### gameState

• **gameState**: *any*

Defined in: [packages/engine/src/networking/interfaces/WorldState.ts:141](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/networking/interfaces/WorldState.ts#L141)

___

### gameStateActions

• **gameStateActions**: [*GameStateActionMessage*](game_types_gamestateactionmessage.gamestateactionmessage.md)[]

Defined in: [packages/engine/src/networking/interfaces/WorldState.ts:142](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/networking/interfaces/WorldState.ts#L142)

___

### ikTransforms

• **ikTransforms**: [*StateEntityIKGroup*](../modules/networking_types_snapshotdatatypes.md#stateentityikgroup)

transform of ik avatars.

Defined in: [packages/engine/src/networking/interfaces/WorldState.ts:127](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/networking/interfaces/WorldState.ts#L127)

___

### inputs

• **inputs**: [*NetworkInputInterface*](networking_interfaces_worldstate.networkinputinterface.md)[]

Inputs received.

Defined in: [packages/engine/src/networking/interfaces/WorldState.ts:130](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/networking/interfaces/WorldState.ts#L130)

___

### tick

• **tick**: *number*

Current world tick.

Defined in: [packages/engine/src/networking/interfaces/WorldState.ts:121](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/networking/interfaces/WorldState.ts#L121)

___

### time

• **time**: *number*

For interpolation.

Defined in: [packages/engine/src/networking/interfaces/WorldState.ts:123](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/networking/interfaces/WorldState.ts#L123)

___

### transforms

• **transforms**: [*StateEntityGroup*](../modules/networking_types_snapshotdatatypes.md#stateentitygroup)

transform of world.

Defined in: [packages/engine/src/networking/interfaces/WorldState.ts:125](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/networking/interfaces/WorldState.ts#L125)
