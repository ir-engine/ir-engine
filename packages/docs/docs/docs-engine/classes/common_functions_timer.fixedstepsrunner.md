---
id: "common_functions_timer.fixedstepsrunner"
title: "Class: FixedStepsRunner"
sidebar_label: "FixedStepsRunner"
custom_edit_url: null
hide_title: true
---

# Class: FixedStepsRunner

[common/functions/Timer](../modules/common_functions_timer.md).FixedStepsRunner

## Constructors

### constructor

\+ **new FixedStepsRunner**(`updatesPerSecond`: *number*, `callback`: (`time`: *number*) => *void*): [*FixedStepsRunner*](common_functions_timer.fixedstepsrunner.md)

#### Parameters:

Name | Type |
:------ | :------ |
`updatesPerSecond` | *number* |
`callback` | (`time`: *number*) => *void* |

**Returns:** [*FixedStepsRunner*](common_functions_timer.fixedstepsrunner.md)

Defined in: [packages/engine/src/common/functions/Timer.ts:230](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/common/functions/Timer.ts#L230)

## Properties

### accumulator

• `Private` **accumulator**: *number*= 0

Defined in: [packages/engine/src/common/functions/Timer.ts:229](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/common/functions/Timer.ts#L229)

___

### callback

• `Readonly` **callback**: (`time`: *number*) => *void*

#### Type declaration:

▸ (`time`: *number*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`time` | *number* |

**Returns:** *void*

Defined in: [packages/engine/src/common/functions/Timer.ts:230](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/common/functions/Timer.ts#L230)

Defined in: [packages/engine/src/common/functions/Timer.ts:230](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/common/functions/Timer.ts#L230)

___

### limit

• **limit**: *number*

Defined in: [packages/engine/src/common/functions/Timer.ts:222](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/common/functions/Timer.ts#L222)

___

### shownErrorPreviously

• `Private` **shownErrorPreviously**: *boolean*= false

Defined in: [packages/engine/src/common/functions/Timer.ts:228](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/common/functions/Timer.ts#L228)

___

### subsequentErrorsLimit

• `Readonly` **subsequentErrorsLimit**: *10*= 10

Defined in: [packages/engine/src/common/functions/Timer.ts:225](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/common/functions/Timer.ts#L225)

___

### subsequentErrorsResetLimit

• `Readonly` **subsequentErrorsResetLimit**: *1000*= 1000

Defined in: [packages/engine/src/common/functions/Timer.ts:226](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/common/functions/Timer.ts#L226)

___

### subsequentErrorsShown

• `Private` **subsequentErrorsShown**: *number*= 0

Defined in: [packages/engine/src/common/functions/Timer.ts:227](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/common/functions/Timer.ts#L227)

___

### timestep

• **timestep**: *number*

Defined in: [packages/engine/src/common/functions/Timer.ts:221](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/common/functions/Timer.ts#L221)

___

### updatesLimit

• **updatesLimit**: *number*

Defined in: [packages/engine/src/common/functions/Timer.ts:223](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/common/functions/Timer.ts#L223)

## Methods

### canRun

▸ **canRun**(`delta`: *number*): *boolean*

#### Parameters:

Name | Type |
:------ | :------ |
`delta` | *number* |

**Returns:** *boolean*

Defined in: [packages/engine/src/common/functions/Timer.ts:239](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/common/functions/Timer.ts#L239)

___

### run

▸ **run**(`delta`: *number*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`delta` | *number* |

**Returns:** *void*

Defined in: [packages/engine/src/common/functions/Timer.ts:243](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/common/functions/Timer.ts#L243)
