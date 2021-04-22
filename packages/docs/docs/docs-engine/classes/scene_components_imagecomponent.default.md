---
id: "scene_components_imagecomponent.default"
title: "Class: default"
sidebar_label: "default"
custom_edit_url: null
hide_title: true
---

# Class: default

[scene/components/ImageComponent](../modules/scene_components_imagecomponent.md).default

## Hierarchy

* [*Component*](ecs_classes_component.component.md)<[*default*](scene_components_imagecomponent.default.md)\>

  ↳ **default**

## Constructors

### constructor

\+ **new default**(`props?`: *false* \| *Partial*<Omit<[*default*](scene_components_imagecomponent.default.md), keyof [*Component*](ecs_classes_component.component.md)<any\>\>\>): [*default*](scene_components_imagecomponent.default.md)

Component class constructor.

#### Parameters:

Name | Type |
:------ | :------ |
`props?` | *false* \| *Partial*<Omit<[*default*](scene_components_imagecomponent.default.md), keyof [*Component*](ecs_classes_component.component.md)<any\>\>\> |

**Returns:** [*default*](scene_components_imagecomponent.default.md)

Inherited from: [Component](ecs_classes_component.component.md)

Defined in: [packages/engine/src/ecs/classes/Component.ts:39](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/classes/Component.ts#L39)

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

### parent

• **parent**: *any*

Defined in: [packages/engine/src/scene/components/ImageComponent.ts:7](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/scene/components/ImageComponent.ts#L7)

___

### projection

• **projection**: *string*

Defined in: [packages/engine/src/scene/components/ImageComponent.ts:6](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/scene/components/ImageComponent.ts#L6)

___

### src

• **src**: *string*

Defined in: [packages/engine/src/scene/components/ImageComponent.ts:5](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/scene/components/ImageComponent.ts#L5)

___

### \_schema

▪ `Static` **\_schema**: *object*

Defines the attributes and attribute types on the constructed component class.\
All component variables should be reflected in the component schema.

#### Type declaration:

Name | Type |
:------ | :------ |
`parent` | *object* |
`parent.default` | *any* |
`parent.type` | [*PropType*](../interfaces/ecs_types_types.proptype.md)<unknown, any\> |
`projection` | *object* |
`projection.default` | *string* |
`projection.type` | [*PropType*](../interfaces/ecs_types_types.proptype.md)<unknown, string\> |
`src` | *object* |
`src.default` | *string* |
`src.type` | [*PropType*](../interfaces/ecs_types_types.proptype.md)<unknown, string\> |

Overrides: [Component](ecs_classes_component.component.md).[_schema](ecs_classes_component.component.md#_schema)

Defined in: [packages/engine/src/scene/components/ImageComponent.ts:9](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/scene/components/ImageComponent.ts#L9)

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

▸ **copy**(`source`: *any*): *any*

Default logic for copying component.
Each component class can override this.

#### Parameters:

Name | Type | Description |
:------ | :------ | :------ |
`source` | *any* | Source Component.   |

**Returns:** *any*

this new component as a copy of the source.

Inherited from: [Component](ecs_classes_component.component.md)

Defined in: [packages/engine/src/ecs/classes/Component.ts:78](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/classes/Component.ts#L78)

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
