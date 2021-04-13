---
id: "ecs_interfaces_componentinterfaces.componentconstructor"
title: "Interface: ComponentConstructor<C>"
sidebar_label: "ComponentConstructor"
custom_edit_url: null
hide_title: true
---

# Interface: ComponentConstructor<C\>

[ecs/interfaces/ComponentInterfaces](../modules/ecs_interfaces_componentinterfaces.md).ComponentConstructor

Interface for defining new component.

## Type parameters

Name | Type |
:------ | :------ |
`C` | [*Component*](../classes/ecs_classes_component.component.md)<C\> |

## Hierarchy

* **ComponentConstructor**

  ↳ [*SystemStateComponentConstructor*](ecs_classes_systemstatecomponent.systemstatecomponentconstructor.md)

## Constructors

### constructor

\+ **new ComponentConstructor**(`props?`: *false* \| *Partial*<Omit<C, keyof [*Component*](../classes/ecs_classes_component.component.md)<C\>\>\>): C

#### Parameters:

Name | Type |
:------ | :------ |
`props?` | *false* \| *Partial*<Omit<C, keyof [*Component*](../classes/ecs_classes_component.component.md)<C\>\>\> |

**Returns:** C

Defined in: [packages/engine/src/ecs/interfaces/ComponentInterfaces.ts:24](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/interfaces/ComponentInterfaces.ts#L24)

## Properties

### \_schema

• **\_schema**: [*ComponentSchema*](ecs_interfaces_componentinterfaces.componentschema.md)

Schema for the Component.

Defined in: [packages/engine/src/ecs/interfaces/ComponentInterfaces.ts:22](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/interfaces/ComponentInterfaces.ts#L22)

___

### \_typeId

• **\_typeId**: *any*

Type of the Component.

Defined in: [packages/engine/src/ecs/interfaces/ComponentInterfaces.ts:24](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/interfaces/ComponentInterfaces.ts#L24)
