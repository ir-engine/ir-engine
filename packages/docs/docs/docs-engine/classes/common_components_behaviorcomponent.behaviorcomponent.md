---
id: "common_components_behaviorcomponent.behaviorcomponent"
title: "Class: BehaviorComponent<TDataType, BehaviorSchema, TValue>"
sidebar_label: "BehaviorComponent"
custom_edit_url: null
hide_title: true
---

# Class: BehaviorComponent<TDataType, BehaviorSchema, TValue\>

[common/components/BehaviorComponent](../modules/common_components_behaviorcomponent.md).BehaviorComponent

Constructs a component with a map and data values.\
Data contains a Map of arbitrary data.

## Type parameters

Name | Type | Description |
:------ | :------ | :------ |
`TDataType` | *string* \| *number* \| *symbol* | Type of Keys in the Behavior map.   |
`BehaviorSchema` | - | Type of the map.   |
`TValue` | - | Type of Values in the Behavior map.    |

## Hierarchy

* [*Component*](ecs_classes_component.component.md)<[*PropTypes*](../interfaces/common_components_behaviorcomponent.proptypes.md)<TDataType, BehaviorSchema, TValue\>\>

  ↳ **BehaviorComponent**

  ↳↳ [*Input*](input_components_input.input.md)

  ↳↳ [*State*](state_components_state.state.md)

## Constructors

### constructor

\+ **new BehaviorComponent**<TDataType, BehaviorSchema, TValue\>(): [*BehaviorComponent*](common_components_behaviorcomponent.behaviorcomponent.md)<TDataType, BehaviorSchema, TValue\>

Constructs a component an empty map.

#### Type parameters:

Name | Type |
:------ | :------ |
`TDataType` | *string* \| *number* \| *symbol* |
`BehaviorSchema` | - |
`TValue` | - |

**Returns:** [*BehaviorComponent*](common_components_behaviorcomponent.behaviorcomponent.md)<TDataType, BehaviorSchema, TValue\>

Overrides: [Component](ecs_classes_component.component.md)

Defined in: [packages/engine/src/common/components/BehaviorComponent.ts:36](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/common/components/BehaviorComponent.ts#L36)

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

### data

• **data**: *BehaviorMapType*<TDataType, TValue\>

Holds current state related data of the component.

Defined in: [packages/engine/src/common/components/BehaviorComponent.ts:36](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/common/components/BehaviorComponent.ts#L36)

___

### entity

• **entity**: *any*= ""

The "entity" this component is attached to.

Inherited from: [Component](ecs_classes_component.component.md).[entity](ecs_classes_component.component.md#entity)

Defined in: [packages/engine/src/ecs/classes/Component.ts:39](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/classes/Component.ts#L39)

___

### lastData

• **lastData**: *BehaviorMapType*<TDataType, TValue\>

Holds previous state related data of the component.

Defined in: [packages/engine/src/common/components/BehaviorComponent.ts:34](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/common/components/BehaviorComponent.ts#L34)

___

### name

• **name**: *any*= ""

The name of the component instance, derived from the class name.

Inherited from: [Component](ecs_classes_component.component.md).[name](ecs_classes_component.component.md#name)

Defined in: [packages/engine/src/ecs/classes/Component.ts:34](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/classes/Component.ts#L34)

___

### schema

• **schema**: BehaviorSchema

Behavior Schema of the component.

Defined in: [packages/engine/src/common/components/BehaviorComponent.ts:32](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/common/components/BehaviorComponent.ts#L32)

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

▸ **copy**(`src`: [*BehaviorComponent*](common_components_behaviorcomponent.behaviorcomponent.md)<TDataType, BehaviorSchema, TValue\>): [*BehaviorComponent*](common_components_behaviorcomponent.behaviorcomponent.md)<TDataType, BehaviorSchema, TValue\>

Make Copy of the given Component.

#### Parameters:

Name | Type | Description |
:------ | :------ | :------ |
`src` | [*BehaviorComponent*](common_components_behaviorcomponent.behaviorcomponent.md)<TDataType, BehaviorSchema, TValue\> | Source Component to make copy.    |

**Returns:** [*BehaviorComponent*](common_components_behaviorcomponent.behaviorcomponent.md)<TDataType, BehaviorSchema, TValue\>

Copied Component.

Overrides: [Component](ecs_classes_component.component.md)

Defined in: [packages/engine/src/common/components/BehaviorComponent.ts:52](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/common/components/BehaviorComponent.ts#L52)

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

Clear the Component.

**Returns:** *void*

Overrides: [Component](ecs_classes_component.component.md)

Defined in: [packages/engine/src/common/components/BehaviorComponent.ts:59](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/common/components/BehaviorComponent.ts#L59)

___

### getName

▸ `Static`**getName**(): *string*

Get the name of this component class.
Useful for JSON serialization, etc.

**Returns:** *string*

Inherited from: [Component](ecs_classes_component.component.md)

Defined in: [packages/engine/src/ecs/classes/Component.ts:135](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/classes/Component.ts#L135)
