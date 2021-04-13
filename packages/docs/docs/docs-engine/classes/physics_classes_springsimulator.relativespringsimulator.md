---
id: "physics_classes_springsimulator.relativespringsimulator"
title: "Class: RelativeSpringSimulator"
sidebar_label: "RelativeSpringSimulator"
custom_edit_url: null
hide_title: true
---

# Class: RelativeSpringSimulator

[physics/classes/SpringSimulator](../modules/physics_classes_springsimulator.md).RelativeSpringSimulator

## Hierarchy

* [*SimulatorBase*](physics_classes_simulatorbase.simulatorbase.md)

  ↳ **RelativeSpringSimulator**

## Constructors

### constructor

\+ **new RelativeSpringSimulator**(`fps`: *number*, `mass`: *number*, `damping`: *number*, `startPosition?`: *number*, `startVelocity?`: *number*): [*RelativeSpringSimulator*](physics_classes_springsimulator.relativespringsimulator.md)

#### Parameters:

Name | Type | Default value |
:------ | :------ | :------ |
`fps` | *number* | - |
`mass` | *number* | - |
`damping` | *number* | - |
`startPosition` | *number* | 0 |
`startVelocity` | *number* | 0 |

**Returns:** [*RelativeSpringSimulator*](physics_classes_springsimulator.relativespringsimulator.md)

Overrides: [SimulatorBase](physics_classes_simulatorbase.simulatorbase.md)

Defined in: [packages/engine/src/physics/classes/SpringSimulator.ts:74](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/physics/classes/SpringSimulator.ts#L74)

## Properties

### cache

• **cache**: [*SimulationFrame*](physics_classes_simulationframe.simulationframe.md)[]

Overrides: [SimulatorBase](physics_classes_simulatorbase.simulatorbase.md).[cache](physics_classes_simulatorbase.simulatorbase.md#cache)

Defined in: [packages/engine/src/physics/classes/SpringSimulator.ts:74](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/physics/classes/SpringSimulator.ts#L74)

___

### damping

• **damping**: *any*

Inherited from: [SimulatorBase](physics_classes_simulatorbase.simulatorbase.md).[damping](physics_classes_simulatorbase.simulatorbase.md#damping)

Defined in: [packages/engine/src/physics/classes/SimulatorBase.ts:4](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/physics/classes/SimulatorBase.ts#L4)

___

### frameTime

• **frameTime**: *number*

Inherited from: [SimulatorBase](physics_classes_simulatorbase.simulatorbase.md).[frameTime](physics_classes_simulatorbase.simulatorbase.md#frametime)

Defined in: [packages/engine/src/physics/classes/SimulatorBase.ts:5](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/physics/classes/SimulatorBase.ts#L5)

___

### lastLerp

• **lastLerp**: *number*

Defined in: [packages/engine/src/physics/classes/SpringSimulator.ts:73](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/physics/classes/SpringSimulator.ts#L73)

___

### mass

• **mass**: *any*

Inherited from: [SimulatorBase](physics_classes_simulatorbase.simulatorbase.md).[mass](physics_classes_simulatorbase.simulatorbase.md#mass)

Defined in: [packages/engine/src/physics/classes/SimulatorBase.ts:3](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/physics/classes/SimulatorBase.ts#L3)

___

### offset

• **offset**: *number*

Inherited from: [SimulatorBase](physics_classes_simulatorbase.simulatorbase.md).[offset](physics_classes_simulatorbase.simulatorbase.md#offset)

Defined in: [packages/engine/src/physics/classes/SimulatorBase.ts:6](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/physics/classes/SimulatorBase.ts#L6)

___

### position

• **position**: *number*

Defined in: [packages/engine/src/physics/classes/SpringSimulator.ts:70](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/physics/classes/SpringSimulator.ts#L70)

___

### target

• **target**: *number*

Defined in: [packages/engine/src/physics/classes/SpringSimulator.ts:72](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/physics/classes/SpringSimulator.ts#L72)

___

### velocity

• **velocity**: *number*

Defined in: [packages/engine/src/physics/classes/SpringSimulator.ts:71](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/physics/classes/SpringSimulator.ts#L71)

## Methods

### generateFrames

▸ **generateFrames**(`timeStep`: *number*): *void*

Generates frames between last simulation call and the current one

#### Parameters:

Name | Type |
:------ | :------ |
`timeStep` | *number* |

**Returns:** *void*

Inherited from: [SimulatorBase](physics_classes_simulatorbase.simulatorbase.md)

Defined in: [packages/engine/src/physics/classes/SimulatorBase.ts:31](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/physics/classes/SimulatorBase.ts#L31)

___

### getFrame

▸ **getFrame**(`isLastFrame`: *boolean*): [*SimulationFrame*](physics_classes_simulationframe.simulationframe.md)

Gets another simulation frame

#### Parameters:

Name | Type |
:------ | :------ |
`isLastFrame` | *boolean* |

**Returns:** [*SimulationFrame*](physics_classes_simulationframe.simulationframe.md)

Overrides: [SimulatorBase](physics_classes_simulatorbase.simulatorbase.md)

Defined in: [packages/engine/src/physics/classes/SpringSimulator.ts:124](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/physics/classes/SpringSimulator.ts#L124)

___

### lastFrame

▸ **lastFrame**(): *any*

**Returns:** *any*

Inherited from: [SimulatorBase](physics_classes_simulatorbase.simulatorbase.md)

Defined in: [packages/engine/src/physics/classes/SimulatorBase.ts:22](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/physics/classes/SimulatorBase.ts#L22)

___

### setFPS

▸ **setFPS**(`value`: *number*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`value` | *number* |

**Returns:** *void*

Inherited from: [SimulatorBase](physics_classes_simulatorbase.simulatorbase.md)

Defined in: [packages/engine/src/physics/classes/SimulatorBase.ts:17](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/physics/classes/SimulatorBase.ts#L17)

___

### simulate

▸ **simulate**(`timeStep`: *number*): *void*

Advances the simulation by given time step

#### Parameters:

Name | Type |
:------ | :------ |
`timeStep` | *number* |

**Returns:** *void*

Overrides: [SimulatorBase](physics_classes_simulatorbase.simulatorbase.md)

Defined in: [packages/engine/src/physics/classes/SpringSimulator.ts:106](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/physics/classes/SpringSimulator.ts#L106)
