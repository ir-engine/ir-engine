---
id: "networking_schema_worldstateschema.worldstatemodel"
title: "Class: WorldStateModel"
sidebar_label: "WorldStateModel"
custom_edit_url: null
hide_title: true
---

# Class: WorldStateModel

[networking/schema/worldStateSchema](../modules/networking_schema_worldstateschema.md).WorldStateModel

Class for holding world state.

## Constructors

### constructor

\+ **new WorldStateModel**(): [*WorldStateModel*](networking_schema_worldstateschema.worldstatemodel.md)

**Returns:** [*WorldStateModel*](networking_schema_worldstateschema.worldstatemodel.md)

## Properties

### model

▪ `Static` **model**: *Model*<Record<string, unknown\>\>

Model holding client input.

Defined in: [packages/engine/src/networking/schema/worldStateSchema.ts:112](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/networking/schema/worldStateSchema.ts#L112)

## Methods

### fromBuffer

▸ `Static`**fromBuffer**(`buffer`: *any*): [*WorldStateInterface*](../interfaces/networking_interfaces_worldstate.worldstateinterface.md)

Read from buffer.

#### Parameters:

Name | Type |
:------ | :------ |
`buffer` | *any* |

**Returns:** [*WorldStateInterface*](../interfaces/networking_interfaces_worldstate.worldstateinterface.md)

Defined in: [packages/engine/src/networking/schema/worldStateSchema.ts:167](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/networking/schema/worldStateSchema.ts#L167)

___

### toBuffer

▸ `Static`**toBuffer**(`worldState`: [*WorldStateInterface*](../interfaces/networking_interfaces_worldstate.worldstateinterface.md), `type`: String): ArrayBuffer

Convert to buffer.

#### Parameters:

Name | Type |
:------ | :------ |
`worldState` | [*WorldStateInterface*](../interfaces/networking_interfaces_worldstate.worldstateinterface.md) |
`type` | String |

**Returns:** ArrayBuffer

Defined in: [packages/engine/src/networking/schema/worldStateSchema.ts:115](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/networking/schema/worldStateSchema.ts#L115)
