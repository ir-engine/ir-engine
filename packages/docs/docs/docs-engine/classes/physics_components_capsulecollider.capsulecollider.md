---
id: "physics_components_capsulecollider.capsulecollider"
title: "Class: CapsuleCollider"
sidebar_label: "CapsuleCollider"
custom_edit_url: null
hide_title: true
---

# Class: CapsuleCollider

[physics/components/CapsuleCollider](../modules/physics_components_capsulecollider.md).CapsuleCollider

## Hierarchy

* [*Component*](ecs_classes_component.component.md)<[*CapsuleCollider*](physics_components_capsulecollider.capsulecollider.md)\>

  ↳ **CapsuleCollider**

## Constructors

### constructor

\+ **new CapsuleCollider**(`options`: *any*): [*CapsuleCollider*](physics_components_capsulecollider.capsulecollider.md)

#### Parameters:

Name | Type |
:------ | :------ |
`options` | *any* |

**Returns:** [*CapsuleCollider*](physics_components_capsulecollider.capsulecollider.md)

Overrides: [Component](ecs_classes_component.component.md)

Defined in: [packages/engine/src/physics/components/CapsuleCollider.ts:18](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/physics/components/CapsuleCollider.ts#L18)

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

### body

• **body**: *Body*

Defined in: [packages/engine/src/physics/components/CapsuleCollider.ts:10](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/physics/components/CapsuleCollider.ts#L10)

___

### entity

• **entity**: *any*= ""

The "entity" this component is attached to.

Inherited from: [Component](ecs_classes_component.component.md).[entity](ecs_classes_component.component.md#entity)

Defined in: [packages/engine/src/ecs/classes/Component.ts:39](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/classes/Component.ts#L39)

___

### friction

• **friction**: *number*

Defined in: [packages/engine/src/physics/components/CapsuleCollider.ts:16](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/physics/components/CapsuleCollider.ts#L16)

___

### height

• **height**: *number*

Defined in: [packages/engine/src/physics/components/CapsuleCollider.ts:13](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/physics/components/CapsuleCollider.ts#L13)

___

### mass

• **mass**: *number*

Defined in: [packages/engine/src/physics/components/CapsuleCollider.ts:11](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/physics/components/CapsuleCollider.ts#L11)

___

### moreRaysIchTurn

• **moreRaysIchTurn**: *number*= 0

Defined in: [packages/engine/src/physics/components/CapsuleCollider.ts:18](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/physics/components/CapsuleCollider.ts#L18)

___

### name

• **name**: *any*= ""

The name of the component instance, derived from the class name.

Inherited from: [Component](ecs_classes_component.component.md).[name](ecs_classes_component.component.md#name)

Defined in: [packages/engine/src/ecs/classes/Component.ts:34](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/classes/Component.ts#L34)

___

### options

• **options**: *any*

Defined in: [packages/engine/src/physics/components/CapsuleCollider.ts:9](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/physics/components/CapsuleCollider.ts#L9)

___

### playerStuck

• **playerStuck**: *number*

Defined in: [packages/engine/src/physics/components/CapsuleCollider.ts:17](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/physics/components/CapsuleCollider.ts#L17)

___

### position

• **position**: *Vec3*

Defined in: [packages/engine/src/physics/components/CapsuleCollider.ts:12](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/physics/components/CapsuleCollider.ts#L12)

___

### radius

• **radius**: *number*

Defined in: [packages/engine/src/physics/components/CapsuleCollider.ts:14](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/physics/components/CapsuleCollider.ts#L14)

___

### segments

• **segments**: *number*

Defined in: [packages/engine/src/physics/components/CapsuleCollider.ts:15](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/physics/components/CapsuleCollider.ts#L15)

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

▸ **copy**(`options`: *any*): *any*

#### Parameters:

Name | Type |
:------ | :------ |
`options` | *any* |

**Returns:** *any*

Overrides: [Component](ecs_classes_component.component.md)

Defined in: [packages/engine/src/physics/components/CapsuleCollider.ts:26](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/physics/components/CapsuleCollider.ts#L26)

___

### dispose

▸ **dispose**(): *void*

Put the component back into it's component pool.
Called when component is removed from an entity.

**Returns:** *void*

Inherited from: [Component](ecs_classes_component.component.md)

Defined in: [packages/engine/src/ecs/classes/Component.ts:125](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/classes/Component.ts#L125)

___

### reapplyOptions

▸ **reapplyOptions**(`options`: *any*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`options` | *any* |

**Returns:** *void*

Defined in: [packages/engine/src/physics/components/CapsuleCollider.ts:35](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/physics/components/CapsuleCollider.ts#L35)

___

### reset

▸ **reset**(): *void*

Default logic for resetting attributes to default schema values.
Each component class can override this.

**Returns:** *void*

Inherited from: [Component](ecs_classes_component.component.md)

Defined in: [packages/engine/src/ecs/classes/Component.ts:106](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/classes/Component.ts#L106)

___

### getName

▸ `Static`**getName**(): *string*

Get the name of this component class.
Useful for JSON serialization, etc.

**Returns:** *string*

Inherited from: [Component](ecs_classes_component.component.md)

Defined in: [packages/engine/src/ecs/classes/Component.ts:135](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/classes/Component.ts#L135)
