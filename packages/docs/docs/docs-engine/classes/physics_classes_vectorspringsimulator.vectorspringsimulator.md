---
id: "physics_classes_vectorspringsimulator.vectorspringsimulator"
title: "Class: VectorSpringSimulator"
sidebar_label: "VectorSpringSimulator"
custom_edit_url: null
hide_title: true
---

# Class: VectorSpringSimulator

[physics/classes/VectorSpringSimulator](../modules/physics_classes_vectorspringsimulator.md).VectorSpringSimulator

## Hierarchy

* [*SimulatorBase*](physics_classes_simulatorbase.simulatorbase.md)

  ↳ **VectorSpringSimulator**

## Constructors

### constructor

\+ **new VectorSpringSimulator**(`fps`: *number*, `mass`: *number*, `damping`: *number*): [*VectorSpringSimulator*](physics_classes_vectorspringsimulator.vectorspringsimulator.md)

#### Parameters:

Name | Type |
:------ | :------ |
`fps` | *number* |
`mass` | *number* |
`damping` | *number* |

**Returns:** [*VectorSpringSimulator*](physics_classes_vectorspringsimulator.vectorspringsimulator.md)

Overrides: [SimulatorBase](physics_classes_simulatorbase.simulatorbase.md)

Defined in: [packages/engine/src/physics/classes/VectorSpringSimulator.ts:21](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/physics/classes/VectorSpringSimulator.ts#L21)

## Properties

### cache

• **cache**: *SimulationFrameVector*[]

Overrides: [SimulatorBase](physics_classes_simulatorbase.simulatorbase.md).[cache](physics_classes_simulatorbase.simulatorbase.md#cache)

Defined in: [packages/engine/src/physics/classes/VectorSpringSimulator.ts:21](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/physics/classes/VectorSpringSimulator.ts#L21)

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

• **position**: *any*

Defined in: [packages/engine/src/physics/classes/VectorSpringSimulator.ts:18](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/physics/classes/VectorSpringSimulator.ts#L18)

___

### target

• **target**: *any*

Defined in: [packages/engine/src/physics/classes/VectorSpringSimulator.ts:20](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/physics/classes/VectorSpringSimulator.ts#L20)

___

### velocity

• **velocity**: *any*

Defined in: [packages/engine/src/physics/classes/VectorSpringSimulator.ts:19](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/physics/classes/VectorSpringSimulator.ts#L19)

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

▸ **getFrame**(`isLastFrame`: *boolean*): *SimulationFrameVector*

Gets another simulation frame

#### Parameters:

Name | Type |
:------ | :------ |
`isLastFrame` | *boolean* |

**Returns:** *SimulationFrameVector*

Overrides: [SimulatorBase](physics_classes_simulatorbase.simulatorbase.md)

Defined in: [packages/engine/src/physics/classes/VectorSpringSimulator.ts:64](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/physics/classes/VectorSpringSimulator.ts#L64)

___

### init

▸ **init**(): *void*

**Returns:** *void*

Defined in: [packages/engine/src/physics/classes/VectorSpringSimulator.ts:31](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/physics/classes/VectorSpringSimulator.ts#L31)

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

Defined in: [packages/engine/src/physics/classes/VectorSpringSimulator.ts:51](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/physics/classes/VectorSpringSimulator.ts#L51)
