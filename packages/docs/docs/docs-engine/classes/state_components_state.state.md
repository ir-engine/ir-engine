---
id: "state_components_state.state"
title: "Class: State"
sidebar_label: "State"
custom_edit_url: null
hide_title: true
---

# Class: State

[state/components/State](../modules/state_components_state.md).State

## Hierarchy

* [*BehaviorComponent*](common_components_behaviorcomponent.behaviorcomponent.md)<[*StateAlias*](../modules/state_types_statealias.md#statealias), [*StateSchema*](../interfaces/state_interfaces_stateschema.stateschema.md), [*StateValue*](../interfaces/state_interfaces_statevalue.statevalue.md)<[*NumericalType*](../modules/common_types_numericaltypes.md#numericaltype)\>\>

  ↳ **State**

## Constructors

### constructor

\+ **new State**(): [*State*](state_components_state.state.md)

Constructs a component an empty map.

**Returns:** [*State*](state_components_state.state.md)

Inherited from: [BehaviorComponent](common_components_behaviorcomponent.behaviorcomponent.md)

Defined in: [packages/engine/src/common/components/BehaviorComponent.ts:36](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/common/components/BehaviorComponent.ts#L36)

## Properties

### \_pool

• **\_pool**: *any*

The pool an individual instantiated component is attached to.
Each component type has a pool, pool size is set on engine initialization.

Inherited from: [BehaviorComponent](common_components_behaviorcomponent.behaviorcomponent.md).[_pool](common_components_behaviorcomponent.behaviorcomponent.md#_pool)

Defined in: [packages/engine/src/ecs/classes/Component.ts:24](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/classes/Component.ts#L24)

___

### \_typeId

• **\_typeId**: *any*= -1

The type ID of this component, should be the same as the component's constructed class.

Inherited from: [BehaviorComponent](common_components_behaviorcomponent.behaviorcomponent.md).[_typeId](common_components_behaviorcomponent.behaviorcomponent.md#_typeid)

Defined in: [packages/engine/src/ecs/classes/Component.ts:29](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/classes/Component.ts#L29)

___

### data

• **data**: *BehaviorMapType*<[*StateAlias*](../modules/state_types_statealias.md#statealias), [*StateValue*](../interfaces/state_interfaces_statevalue.statevalue.md)<any\>\>

Holds current state related data of the component.

Inherited from: [BehaviorComponent](common_components_behaviorcomponent.behaviorcomponent.md).[data](common_components_behaviorcomponent.behaviorcomponent.md#data)

Defined in: [packages/engine/src/common/components/BehaviorComponent.ts:36](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/common/components/BehaviorComponent.ts#L36)

___

### entity

• **entity**: *any*= ""

The "entity" this component is attached to.

Inherited from: [BehaviorComponent](common_components_behaviorcomponent.behaviorcomponent.md).[entity](common_components_behaviorcomponent.behaviorcomponent.md#entity)

Defined in: [packages/engine/src/ecs/classes/Component.ts:39](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/classes/Component.ts#L39)

___

### lastData

• **lastData**: *BehaviorMapType*<[*StateAlias*](../modules/state_types_statealias.md#statealias), [*StateValue*](../interfaces/state_interfaces_statevalue.statevalue.md)<any\>\>

Holds previous state related data of the component.

Inherited from: [BehaviorComponent](common_components_behaviorcomponent.behaviorcomponent.md).[lastData](common_components_behaviorcomponent.behaviorcomponent.md#lastdata)

Defined in: [packages/engine/src/common/components/BehaviorComponent.ts:34](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/common/components/BehaviorComponent.ts#L34)

___

### name

• **name**: *any*= ""

The name of the component instance, derived from the class name.

Inherited from: [BehaviorComponent](common_components_behaviorcomponent.behaviorcomponent.md).[name](common_components_behaviorcomponent.behaviorcomponent.md#name)

Defined in: [packages/engine/src/ecs/classes/Component.ts:34](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/classes/Component.ts#L34)

___

### schema

• **schema**: [*StateSchema*](../interfaces/state_interfaces_stateschema.stateschema.md)

Behavior Schema of the component.

Inherited from: [BehaviorComponent](common_components_behaviorcomponent.behaviorcomponent.md).[schema](common_components_behaviorcomponent.behaviorcomponent.md#schema)

Defined in: [packages/engine/src/common/components/BehaviorComponent.ts:32](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/common/components/BehaviorComponent.ts#L32)

___

### timer

• **timer**: *number*

Defined in: [packages/engine/src/state/components/State.ts:9](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/state/components/State.ts#L9)

___

### \_schema

▪ `Static` **\_schema**: [*ComponentSchema*](../interfaces/ecs_interfaces_componentinterfaces.componentschema.md)

Defines the attributes and attribute types on the constructed component class.\
All component variables should be reflected in the component schema.

Inherited from: [BehaviorComponent](common_components_behaviorcomponent.behaviorcomponent.md).[_schema](common_components_behaviorcomponent.behaviorcomponent.md#_schema)

Defined in: [packages/engine/src/ecs/classes/Component.ts:13](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/classes/Component.ts#L13)

___

### \_typeId

▪ `Static` **\_typeId**: *number*

The unique ID for this type of component (C).

Inherited from: [BehaviorComponent](common_components_behaviorcomponent.behaviorcomponent.md).[_typeId](common_components_behaviorcomponent.behaviorcomponent.md#_typeid)

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

Inherited from: [BehaviorComponent](common_components_behaviorcomponent.behaviorcomponent.md)

Defined in: [packages/engine/src/ecs/classes/Component.ts:142](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/classes/Component.ts#L142)

___

### clone

▸ **clone**(): *any*

Default logic for cloning component.
Each component class can override this.

**Returns:** *any*

a new component as a clone of itself.

Inherited from: [BehaviorComponent](common_components_behaviorcomponent.behaviorcomponent.md)

Defined in: [packages/engine/src/ecs/classes/Component.ts:98](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/classes/Component.ts#L98)

___

### copy

▸ **copy**(`src`: [*State*](state_components_state.state.md)): [*State*](state_components_state.state.md)

Make Copy of the given Component.

#### Parameters:

Name | Type | Description |
:------ | :------ | :------ |
`src` | [*State*](state_components_state.state.md) | Source Component to make copy.    |

**Returns:** [*State*](state_components_state.state.md)

Copied Component.

Inherited from: [BehaviorComponent](common_components_behaviorcomponent.behaviorcomponent.md)

Defined in: [packages/engine/src/common/components/BehaviorComponent.ts:52](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/common/components/BehaviorComponent.ts#L52)

___

### dispose

▸ **dispose**(): *void*

Put the component back into it's component pool.
Called when component is removed from an entity.

**Returns:** *void*

Inherited from: [BehaviorComponent](common_components_behaviorcomponent.behaviorcomponent.md)

Defined in: [packages/engine/src/ecs/classes/Component.ts:125](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/classes/Component.ts#L125)

___

### reset

▸ **reset**(): *void*

Clear the Component.

**Returns:** *void*

Inherited from: [BehaviorComponent](common_components_behaviorcomponent.behaviorcomponent.md)

Defined in: [packages/engine/src/common/components/BehaviorComponent.ts:59](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/common/components/BehaviorComponent.ts#L59)

___

### getName

▸ `Static`**getName**(): *string*

Get the name of this component class.
Useful for JSON serialization, etc.

**Returns:** *string*

Inherited from: [BehaviorComponent](common_components_behaviorcomponent.behaviorcomponent.md)

Defined in: [packages/engine/src/ecs/classes/Component.ts:135](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/classes/Component.ts#L135)
