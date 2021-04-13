---
id: "ecs_classes_systemstatecomponent.systemstatecomponentconstructor"
title: "Interface: SystemStateComponentConstructor<C>"
sidebar_label: "SystemStateComponentConstructor"
custom_edit_url: null
hide_title: true
---

# Interface: SystemStateComponentConstructor<C\>

[ecs/classes/SystemStateComponent](../modules/ecs_classes_systemstatecomponent.md).SystemStateComponentConstructor

Interface for System state components

## Type parameters

Name | Type |
:------ | :------ |
`C` | [*Component*](../classes/ecs_classes_component.component.md)<any\> |

## Hierarchy

* [*ComponentConstructor*](ecs_interfaces_componentinterfaces.componentconstructor.md)<C\>

  ↳ **SystemStateComponentConstructor**

## Constructors

### constructor

\+ **new SystemStateComponentConstructor**(): C

**Returns:** C

Inherited from: [ComponentConstructor](ecs_interfaces_componentinterfaces.componentconstructor.md)

Defined in: [packages/engine/src/ecs/classes/SystemStateComponent.ts:8](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/classes/SystemStateComponent.ts#L8)

\+ **new SystemStateComponentConstructor**(`props?`: *false* \| *Partial*<Omit<C, keyof [*Component*](../classes/ecs_classes_component.component.md)<C\>\>\>): C

#### Parameters:

Name | Type |
:------ | :------ |
`props?` | *false* \| *Partial*<Omit<C, keyof [*Component*](../classes/ecs_classes_component.component.md)<C\>\>\> |

**Returns:** C

Inherited from: void

Defined in: [packages/engine/src/ecs/interfaces/ComponentInterfaces.ts:24](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/interfaces/ComponentInterfaces.ts#L24)

## Properties

### \_schema

• **\_schema**: [*ComponentSchema*](ecs_interfaces_componentinterfaces.componentschema.md)

Schema for the Component.

Inherited from: [ComponentConstructor](ecs_interfaces_componentinterfaces.componentconstructor.md).[_schema](ecs_interfaces_componentinterfaces.componentconstructor.md#_schema)

Defined in: [packages/engine/src/ecs/interfaces/ComponentInterfaces.ts:22](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/interfaces/ComponentInterfaces.ts#L22)

___

### \_typeId

• **\_typeId**: *any*

Type of the Component.

Inherited from: [ComponentConstructor](ecs_interfaces_componentinterfaces.componentconstructor.md).[_typeId](ecs_interfaces_componentinterfaces.componentconstructor.md#_typeid)

Defined in: [packages/engine/src/ecs/interfaces/ComponentInterfaces.ts:24](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/interfaces/ComponentInterfaces.ts#L24)

___

### isSystemStateComponent

• **isSystemStateComponent**: *true*

Defined in: [packages/engine/src/ecs/classes/SystemStateComponent.ts:8](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/classes/SystemStateComponent.ts#L8)
