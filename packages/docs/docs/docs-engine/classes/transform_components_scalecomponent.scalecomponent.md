---
id: "transform_components_scalecomponent.scalecomponent"
title: "Class: ScaleComponent"
sidebar_label: "ScaleComponent"
custom_edit_url: null
hide_title: true
---

# Class: ScaleComponent

[transform/components/ScaleComponent](../modules/transform_components_scalecomponent.md).ScaleComponent

## Hierarchy

* [*Component*](ecs_classes_component.component.md)<[*ScaleComponent*](transform_components_scalecomponent.scalecomponent.md)\>

  ↳ **ScaleComponent**

## Constructors

### constructor

\+ **new ScaleComponent**(): [*ScaleComponent*](transform_components_scalecomponent.scalecomponent.md)

**Returns:** [*ScaleComponent*](transform_components_scalecomponent.scalecomponent.md)

Overrides: [Component](ecs_classes_component.component.md)

Defined in: [packages/engine/src/transform/components/ScaleComponent.ts:10](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/transform/components/ScaleComponent.ts#L10)

## Properties

### \_pool

• **\_pool**: *any*

The pool an individual instantiated component is attached to.
Each component type has a pool, pool size is set on engine initialization.

Inherited from: [Component](ecs_classes_component.component.md).[_pool](ecs_classes_component.component.md#_pool)

Defined in: [packages/engine/src/ecs/classes/Component.ts:24](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/classes/Component.ts#L24)

___

### \_typeId

• **\_typeId**: *any*= -1

The type ID of this component, should be the same as the component's constructed class.

Inherited from: [Component](ecs_classes_component.component.md).[_typeId](ecs_classes_component.component.md#_typeid)

Defined in: [packages/engine/src/ecs/classes/Component.ts:29](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/classes/Component.ts#L29)

___

### entity

• **entity**: *any*= ""

The "entity" this component is attached to.

Inherited from: [Component](ecs_classes_component.component.md).[entity](ecs_classes_component.component.md#entity)

Defined in: [packages/engine/src/ecs/classes/Component.ts:39](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/classes/Component.ts#L39)

___

### name

• **name**: *any*= ""

The name of the component instance, derived from the class name.

Inherited from: [Component](ecs_classes_component.component.md).[name](ecs_classes_component.component.md#name)

Defined in: [packages/engine/src/ecs/classes/Component.ts:34](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/classes/Component.ts#L34)

___

### scale

• **scale**: *number*[]

Defined in: [packages/engine/src/transform/components/ScaleComponent.ts:10](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/transform/components/ScaleComponent.ts#L10)

___

### \_schema

▪ `Static` **\_schema**: [*ComponentSchema*](../interfaces/ecs_interfaces_componentinterfaces.componentschema.md)

Defines the attributes and attribute types on the constructed component class.\
All component variables should be reflected in the component schema.

Inherited from: [Component](ecs_classes_component.component.md).[_schema](ecs_classes_component.component.md#_schema)

Defined in: [packages/engine/src/ecs/classes/Component.ts:13](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/classes/Component.ts#L13)

___

### \_typeId

▪ `Static` **\_typeId**: *number*

The unique ID for this type of component (C).

Inherited from: [Component](ecs_classes_component.component.md).[_typeId](ecs_classes_component.component.md#_typeid)

Defined in: [packages/engine/src/ecs/classes/Component.ts:18](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/classes/Component.ts#L18)

## Methods

### checkUndefinedAttributes

▸ **checkUndefinedAttributes**(`src`: *any*): *void*

Make sure attributes on this component have been defined in the schema

#### Parameters:

Name | Type |
:------ | :------ |
`src` | *any* |

**Returns:** *void*

Inherited from: [Component](ecs_classes_component.component.md)

Defined in: [packages/engine/src/ecs/classes/Component.ts:142](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/classes/Component.ts#L142)

___

### clone

▸ **clone**(): *any*

Default logic for cloning component.
Each component class can override this.

**Returns:** *any*

a new component as a clone of itself.

Inherited from: [Component](ecs_classes_component.component.md)

Defined in: [packages/engine/src/ecs/classes/Component.ts:98](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/classes/Component.ts#L98)

___

### copy

▸ **copy**(`src`: [*ScaleComponent*](transform_components_scalecomponent.scalecomponent.md)): [*ScaleComponent*](transform_components_scalecomponent.scalecomponent.md)

#### Parameters:

Name | Type |
:------ | :------ |
`src` | [*ScaleComponent*](transform_components_scalecomponent.scalecomponent.md) |

**Returns:** [*ScaleComponent*](transform_components_scalecomponent.scalecomponent.md)

Overrides: [Component](ecs_classes_component.component.md)

Defined in: [packages/engine/src/transform/components/ScaleComponent.ts:17](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/transform/components/ScaleComponent.ts#L17)

___

### dispose

▸ **dispose**(): *void*

Put the component back into it's component pool.
Called when component is removed from an entity.

**Returns:** *void*

Inherited from: [Component](ecs_classes_component.component.md)

Defined in: [packages/engine/src/ecs/classes/Component.ts:125](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/classes/Component.ts#L125)

___

### reset

▸ **reset**(): *void*

**Returns:** *void*

Overrides: [Component](ecs_classes_component.component.md)

Defined in: [packages/engine/src/transform/components/ScaleComponent.ts:22](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/transform/components/ScaleComponent.ts#L22)

___

### getName

▸ `Static`**getName**(): *string*

Get the name of this component class.
Useful for JSON serialization, etc.

**Returns:** *string*

Inherited from: [Component](ecs_classes_component.component.md)

Defined in: [packages/engine/src/ecs/classes/Component.ts:135](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/classes/Component.ts#L135)
