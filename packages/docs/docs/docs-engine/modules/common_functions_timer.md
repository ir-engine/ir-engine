---
id: "common_functions_timer"
title: "Module: common/functions/Timer"
sidebar_label: "common/functions/Timer"
custom_edit_url: null
hide_title: true
---

# Module: common/functions/Timer

## Table of contents

### Classes

- [FixedStepsRunner](../classes/common_functions_timer.fixedstepsrunner.md)

## Functions

### Timer

▸ **Timer**(`callbacks`: { `fixedUpdate?`: TimerUpdateCallback ; `networkUpdate?`: TimerUpdateCallback ; `render?`: Function ; `update?`: TimerUpdateCallback  }, `fixedFrameRate?`: *number*, `networkTickRate?`: *number*): *object*

#### Parameters:

Name | Type |
:------ | :------ |
`callbacks` | *object* |
`callbacks.fixedUpdate?` | TimerUpdateCallback |
`callbacks.networkUpdate?` | TimerUpdateCallback |
`callbacks.render?` | Function |
`callbacks.update?` | TimerUpdateCallback |
`fixedFrameRate?` | *number* |
`networkTickRate?` | *number* |

**Returns:** *object*

Name | Type |
:------ | :------ |
`start` | Function |
`stop` | Function |

Defined in: [packages/engine/src/common/functions/Timer.ts:15](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/common/functions/Timer.ts#L15)

___

### createFixedTimestep

▸ **createFixedTimestep**(`updatesPerSecond`: *number*, `callback`: (`time`: *number*) => *void*): *function*

#### Parameters:

Name | Type |
:------ | :------ |
`updatesPerSecond` | *number* |
`callback` | (`time`: *number*) => *void* |

**Returns:** (`delta`: *number*) => *void*

Defined in: [packages/engine/src/common/functions/Timer.ts:289](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/common/functions/Timer.ts#L289)
