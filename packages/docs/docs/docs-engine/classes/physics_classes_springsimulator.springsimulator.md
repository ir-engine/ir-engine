---
id: "physics_classes_springsimulator.springsimulator"
title: "Class: SpringSimulator"
sidebar_label: "SpringSimulator"
custom_edit_url: null
hide_title: true
---

# Class: SpringSimulator

[physics/classes/SpringSimulator](../modules/physics_classes_springsimulator.md).SpringSimulator

## Hierarchy

* [*SimulatorBase*](physics_classes_simulatorbase.simulatorbase.md)

  ↳ **SpringSimulator**

## Constructors

### constructor

\+ **new SpringSimulator**(`fps`: *number*, `mass`: *number*, `damping`: *number*, `startPosition?`: *number*, `startVelocity?`: *number*): [*SpringSimulator*](physics_classes_springsimulator.springsimulator.md)

#### Parameters:

Name | Type | Default value |
:------ | :------ | :------ |
`fps` | *number* | - |
`mass` | *number* | - |
`damping` | *number* | - |
`startPosition` | *number* | 0 |
`startVelocity` | *number* | 0 |

**Returns:** [*SpringSimulator*](physics_classes_springsimulator.springsimulator.md)

Overrides: [SimulatorBase](physics_classes_simulatorbase.simulatorbase.md)

Defined in: [packages/engine/src/physics/classes/SpringSimulator.ts:21](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/physics/classes/SpringSimulator.ts#L21)

## Properties

### cache

• **cache**: [*SimulationFrame*](physics_classes_simulationframe.simulationframe.md)[]

Overrides: [SimulatorBase](physics_classes_simulatorbase.simulatorbase.md).[cache](physics_classes_simulatorbase.simulatorbase.md#cache)

Defined in: [packages/engine/src/physics/classes/SpringSimulator.ts:21](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/physics/classes/SpringSimulator.ts#L21)

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

Defined in: [packages/engine/src/physics/classes/SpringSimulator.ts:18](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/physics/classes/SpringSimulator.ts#L18)

___

### target

• **target**: *number*

Defined in: [packages/engine/src/physics/classes/SpringSimulator.ts:20](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/physics/classes/SpringSimulator.ts#L20)

___

### velocity

• **velocity**: *number*

Defined in: [packages/engine/src/physics/classes/SpringSimulator.ts:19](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/physics/classes/SpringSimulator.ts#L19)

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

Defined in: [packages/engine/src/physics/classes/SpringSimulator.ts:62](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/physics/classes/SpringSimulator.ts#L62)

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

Defined in: [packages/engine/src/physics/classes/SpringSimulator.ts:49](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/physics/classes/SpringSimulator.ts#L49)
