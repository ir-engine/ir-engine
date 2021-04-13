---
id: "physics_classes_simulatorbase.simulatorbase"
title: "Class: SimulatorBase"
sidebar_label: "SimulatorBase"
custom_edit_url: null
hide_title: true
---

# Class: SimulatorBase

[physics/classes/SimulatorBase](../modules/physics_classes_simulatorbase.md).SimulatorBase

## Hierarchy

* **SimulatorBase**

  ↳ [*SpringSimulator*](physics_classes_springsimulator.springsimulator.md)

  ↳ [*RelativeSpringSimulator*](physics_classes_springsimulator.relativespringsimulator.md)

  ↳ [*VectorSpringSimulator*](physics_classes_vectorspringsimulator.vectorspringsimulator.md)

## Constructors

### constructor

\+ **new SimulatorBase**(`fps`: *number*, `mass`: *number*, `damping`: *number*): [*SimulatorBase*](physics_classes_simulatorbase.simulatorbase.md)

#### Parameters:

Name | Type |
:------ | :------ |
`fps` | *number* |
`mass` | *number* |
`damping` | *number* |

**Returns:** [*SimulatorBase*](physics_classes_simulatorbase.simulatorbase.md)

Defined in: [packages/engine/src/physics/classes/SimulatorBase.ts:7](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/physics/classes/SimulatorBase.ts#L7)

## Properties

### cache

• `Abstract` **cache**: *any*[]

Defined in: [packages/engine/src/physics/classes/SimulatorBase.ts:7](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/physics/classes/SimulatorBase.ts#L7)

___

### damping

• **damping**: *any*

Defined in: [packages/engine/src/physics/classes/SimulatorBase.ts:4](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/physics/classes/SimulatorBase.ts#L4)

___

### frameTime

• **frameTime**: *number*

Defined in: [packages/engine/src/physics/classes/SimulatorBase.ts:5](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/physics/classes/SimulatorBase.ts#L5)

___

### mass

• **mass**: *any*

Defined in: [packages/engine/src/physics/classes/SimulatorBase.ts:3](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/physics/classes/SimulatorBase.ts#L3)

___

### offset

• **offset**: *number*

Defined in: [packages/engine/src/physics/classes/SimulatorBase.ts:6](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/physics/classes/SimulatorBase.ts#L6)

## Methods

### generateFrames

▸ **generateFrames**(`timeStep`: *number*): *void*

Generates frames between last simulation call and the current one

#### Parameters:

Name | Type |
:------ | :------ |
`timeStep` | *number* |

**Returns:** *void*

Defined in: [packages/engine/src/physics/classes/SimulatorBase.ts:31](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/physics/classes/SimulatorBase.ts#L31)

___

### getFrame

▸ `Abstract`**getFrame**(`isLastFrame`: *boolean*): *any*

#### Parameters:

Name | Type |
:------ | :------ |
`isLastFrame` | *boolean* |

**Returns:** *any*

Defined in: [packages/engine/src/physics/classes/SimulatorBase.ts:50](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/physics/classes/SimulatorBase.ts#L50)

___

### lastFrame

▸ **lastFrame**(): *any*

**Returns:** *any*

Defined in: [packages/engine/src/physics/classes/SimulatorBase.ts:22](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/physics/classes/SimulatorBase.ts#L22)

___

### setFPS

▸ **setFPS**(`value`: *number*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`value` | *number* |

**Returns:** *void*

Defined in: [packages/engine/src/physics/classes/SimulatorBase.ts:17](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/physics/classes/SimulatorBase.ts#L17)

___

### simulate

▸ `Abstract`**simulate**(`timeStep`: *number*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`timeStep` | *number* |

**Returns:** *void*

Defined in: [packages/engine/src/physics/classes/SimulatorBase.ts:51](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/physics/classes/SimulatorBase.ts#L51)
