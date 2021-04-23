---
id: "input_components_xrinputreceiver.xrinputreceiver"
title: "Class: XRInputReceiver"
sidebar_label: "XRInputReceiver"
custom_edit_url: null
hide_title: true
---

# Class: XRInputReceiver

[input/components/XRInputReceiver](../modules/input_components_xrinputreceiver.md).XRInputReceiver

## Hierarchy

* [*Component*](ecs_classes_component.component.md)<[*XRInputReceiver*](input_components_xrinputreceiver.xrinputreceiver.md)\>

  ↳ **XRInputReceiver**

## Constructors

### constructor

\+ **new XRInputReceiver**(`props?`: *false* \| *Partial*<Omit<[*XRInputReceiver*](input_components_xrinputreceiver.xrinputreceiver.md), keyof [*Component*](ecs_classes_component.component.md)<any\>\>\>): [*XRInputReceiver*](input_components_xrinputreceiver.xrinputreceiver.md)

Component class constructor.

#### Parameters:

Name | Type |
:------ | :------ |
`props?` | *false* \| *Partial*<Omit<[*XRInputReceiver*](input_components_xrinputreceiver.xrinputreceiver.md), keyof [*Component*](ecs_classes_component.component.md)<any\>\>\> |

**Returns:** [*XRInputReceiver*](input_components_xrinputreceiver.xrinputreceiver.md)

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

### controllerGripLeft

• **controllerGripLeft**: *any*

Defined in: [packages/engine/src/input/components/XRInputReceiver.ts:15](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/input/components/XRInputReceiver.ts#L15)

___

### controllerGripRight

• **controllerGripRight**: *any*

Defined in: [packages/engine/src/input/components/XRInputReceiver.ts:16](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/input/components/XRInputReceiver.ts#L16)

___

### controllerLeft

• **controllerLeft**: *any*

Defined in: [packages/engine/src/input/components/XRInputReceiver.ts:9](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/input/components/XRInputReceiver.ts#L9)

___

### controllerRight

• **controllerRight**: *any*

Defined in: [packages/engine/src/input/components/XRInputReceiver.ts:10](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/input/components/XRInputReceiver.ts#L10)

___

### entity

• **entity**: *any*= ""

The "entity" this component is attached to.

Inherited from: [Component](ecs_classes_component.component.md).[entity](ecs_classes_component.component.md#entity)

Defined in: [packages/engine/src/ecs/classes/Component.ts:39](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/classes/Component.ts#L39)

___

### head

• **head**: *any*

Defined in: [packages/engine/src/input/components/XRInputReceiver.ts:8](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/input/components/XRInputReceiver.ts#L8)

___

### name

• **name**: *any*= ""

The name of the component instance, derived from the class name.

Inherited from: [Component](ecs_classes_component.component.md).[name](ecs_classes_component.component.md#name)

Defined in: [packages/engine/src/ecs/classes/Component.ts:34](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/classes/Component.ts#L34)

___

### \_schema

▪ `Static` **\_schema**: *object*

Defines the attributes and attribute types on the constructed component class.\
All component variables should be reflected in the component schema.

#### Type declaration:

Name | Type |
:------ | :------ |
`controllerGripLeft` | *object* |
`controllerGripLeft.default` | *any* |
`controllerGripLeft.type` | [*PropType*](../interfaces/ecs_types_types.proptype.md)<unknown, any\> |
`controllerGripRight` | *object* |
`controllerGripRight.default` | *any* |
`controllerGripRight.type` | [*PropType*](../interfaces/ecs_types_types.proptype.md)<unknown, any\> |
`controllerLeft` | *object* |
`controllerLeft.default` | *any* |
`controllerLeft.type` | [*PropType*](../interfaces/ecs_types_types.proptype.md)<unknown, any\> |
`controllerRight` | *object* |
`controllerRight.default` | *any* |
`controllerRight.type` | [*PropType*](../interfaces/ecs_types_types.proptype.md)<unknown, any\> |
`head` | *object* |
`head.default` | *any* |
`head.type` | [*PropType*](../interfaces/ecs_types_types.proptype.md)<unknown, any\> |

Overrides: [Component](ecs_classes_component.component.md).[_schema](ecs_classes_component.component.md#_schema)

Defined in: [packages/engine/src/input/components/XRInputReceiver.ts:20](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/input/components/XRInputReceiver.ts#L20)

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
