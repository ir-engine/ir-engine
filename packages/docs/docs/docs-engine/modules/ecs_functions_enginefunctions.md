---
id: "ecs_functions_enginefunctions"
title: "Module: ecs/functions/EngineFunctions"
sidebar_label: "ecs/functions/EngineFunctions"
custom_edit_url: null
hide_title: true
---

# Module: ecs/functions/EngineFunctions

## Functions

### execute

▸ **execute**(`delta?`: *number*, `time?`: *number*, `updateType?`: [*SystemUpdateType*](../enums/ecs_functions_systemupdatetype.systemupdatetype.md)): *void*

Execute all systems (a "frame").
This is typically called on a loop.
**WARNING:** This is called by [initializeEngine()](initialize.md#initializeengine).\
You probably don't want to use this.

#### Parameters:

Name | Type |
:------ | :------ |
`delta?` | *number* |
`time?` | *number* |
`updateType` | [*SystemUpdateType*](../enums/ecs_functions_systemupdatetype.systemupdatetype.md) |

**Returns:** *void*

Defined in: [packages/engine/src/ecs/functions/EngineFunctions.ts:94](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/functions/EngineFunctions.ts#L94)

___

### initialize

▸ **initialize**(`options?`: [*EngineOptions*](../interfaces/ecs_interfaces_engineoptions.engineoptions.md)): *void*

Initialize options on the engine object and fire a command for devtools.\
**WARNING:** This is called by [initializeEngine()](initialize.md#initializeengine).\
You probably don't want to use this.

#### Parameters:

Name | Type |
:------ | :------ |
`options?` | [*EngineOptions*](../interfaces/ecs_interfaces_engineoptions.engineoptions.md) |

**Returns:** *void*

Defined in: [packages/engine/src/ecs/functions/EngineFunctions.ts:18](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/functions/EngineFunctions.ts#L18)

___

### pause

▸ **pause**(): *void*

Disable execution of systems without stopping timer.

**Returns:** *void*

Defined in: [packages/engine/src/ecs/functions/EngineFunctions.ts:146](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/functions/EngineFunctions.ts#L146)

___

### reset

▸ **reset**(): *void*

Reset the engine and remove everything from memory.

**Returns:** *void*

Defined in: [packages/engine/src/ecs/functions/EngineFunctions.ts:29](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/functions/EngineFunctions.ts#L29)

___

### resetEngine

▸ **resetEngine**(): *void*

Reset the engine and clear all the timers.

**Returns:** *void*

Defined in: [packages/engine/src/ecs/functions/EngineFunctions.ts:200](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/functions/EngineFunctions.ts#L200)

___

### stats

▸ **stats**(): *object*

Get stats for all entities, components and systems in the simulation.

**Returns:** *object*

Name | Type |
:------ | :------ |
`entities` | *any* |
`system` | *any* |

Defined in: [packages/engine/src/ecs/functions/EngineFunctions.ts:154](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/functions/EngineFunctions.ts#L154)
