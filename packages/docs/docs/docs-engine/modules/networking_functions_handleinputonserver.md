---
id: "networking_functions_handleinputonserver"
title: "Module: networking/functions/handleInputOnServer"
sidebar_label: "networking/functions/handleInputOnServer"
custom_edit_url: null
hide_title: true
---

# Module: networking/functions/handleInputOnServer

## Functions

### handleInputFromNonLocalClients

▸ `Const`**handleInputFromNonLocalClients**(`entity`: [*Entity*](../classes/ecs_classes_entity.entity.md), `args?`: *any*, `delta?`: *number*, `entityOut?`: [*Entity*](../classes/ecs_classes_entity.entity.md), `time?`: *number*): *void*

Call all behaviors associated with current input in it's current lifecycle phase
i.e. if the player has pressed some buttons that have added the value to the input queue,
call behaviors (move, jump, drive, etc) associated with that input.\
There are two cycles:
- Call behaviors according to value.lifecycleState.
- Clean processed LifecycleValue.ENDED inputs.

#### Parameters:

Name | Type | Description |
:------ | :------ | :------ |
`entity` | [*Entity*](../classes/ecs_classes_entity.entity.md) | The entity   |
`args?` | *any* |  |
`delta?` | *number* | Time since last frame    |
`entityOut?` | [*Entity*](../classes/ecs_classes_entity.entity.md) | - |
`time?` | *number* | - |

**Returns:** *void*

Defined in: [packages/engine/src/networking/functions/handleInputOnServer.ts:24](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/networking/functions/handleInputOnServer.ts#L24)
