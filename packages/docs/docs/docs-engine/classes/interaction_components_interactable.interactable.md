---
id: "interaction_components_interactable.interactable"
title: "Class: Interactable"
sidebar_label: "Interactable"
custom_edit_url: null
hide_title: true
---

# Class: Interactable

[interaction/components/Interactable](../modules/interaction_components_interactable.md).Interactable

## Hierarchy

* [*Component*](ecs_classes_component.component.md)<[*Interactable*](interaction_components_interactable.interactable.md)\>

  ↳ **Interactable**

## Constructors

### constructor

\+ **new Interactable**(`props?`: *false* \| *Partial*<Omit<[*Interactable*](interaction_components_interactable.interactable.md), keyof [*Component*](ecs_classes_component.component.md)<any\>\>\>): [*Interactable*](interaction_components_interactable.interactable.md)

Component class constructor.

#### Parameters:

Name | Type |
:------ | :------ |
`props?` | *false* \| *Partial*<Omit<[*Interactable*](interaction_components_interactable.interactable.md), keyof [*Component*](ecs_classes_component.component.md)<any\>\>\> |

**Returns:** [*Interactable*](interaction_components_interactable.interactable.md)

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

### data

• **data**: *any*

Defined in: [packages/engine/src/interaction/components/Interactable.ts:23](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/interaction/components/Interactable.ts#L23)

___

### entity

• **entity**: *any*= ""

The "entity" this component is attached to.

Inherited from: [Component](ecs_classes_component.component.md).[entity](ecs_classes_component.component.md#entity)

Defined in: [packages/engine/src/ecs/classes/Component.ts:39](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/classes/Component.ts#L39)

___

### interactionParts

• **interactionParts**: *any*[]

Defined in: [packages/engine/src/interaction/components/Interactable.ts:21](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/interaction/components/Interactable.ts#L21)

___

### interactionPartsPosition

• **interactionPartsPosition**: *any*[]

Defined in: [packages/engine/src/interaction/components/Interactable.ts:22](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/interaction/components/Interactable.ts#L22)

___

### interactiveDistance

• **interactiveDistance**: *number*

Defined in: [packages/engine/src/interaction/components/Interactable.ts:20](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/interaction/components/Interactable.ts#L20)

___

### name

• **name**: *any*= ""

The name of the component instance, derived from the class name.

Inherited from: [Component](ecs_classes_component.component.md).[name](ecs_classes_component.component.md#name)

Defined in: [packages/engine/src/ecs/classes/Component.ts:34](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/classes/Component.ts#L34)

___

### onInteraction

• **onInteraction**: [*Behavior*](../modules/common_interfaces_behavior.md#behavior)

Defined in: [packages/engine/src/interaction/components/Interactable.ts:18](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/interaction/components/Interactable.ts#L18)

___

### onInteractionCheck

• **onInteractionCheck**: [*InteractionCheckHandler*](../modules/interaction_types_interactiontypes.md#interactioncheckhandler)

Defined in: [packages/engine/src/interaction/components/Interactable.ts:17](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/interaction/components/Interactable.ts#L17)

___

### onInteractionFocused

• **onInteractionFocused**: [*Behavior*](../modules/common_interfaces_behavior.md#behavior)

Defined in: [packages/engine/src/interaction/components/Interactable.ts:19](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/interaction/components/Interactable.ts#L19)

___

### \_schema

▪ `Static` **\_schema**: *object*

Defines the attributes and attribute types on the constructed component class.\
All component variables should be reflected in the component schema.

#### Type declaration:

Name | Type |
:------ | :------ |
`data` | *object* |
`data.type` | [*PropType*](../interfaces/ecs_types_types.proptype.md)<unknown, any\> |
`interactionParts` | *object* |
`interactionParts.type` | [*PropType*](../interfaces/ecs_types_types.proptype.md)<unknown, any[]\> |
`interactionPartsPosition` | *object* |
`interactionPartsPosition.type` | [*PropType*](../interfaces/ecs_types_types.proptype.md)<unknown, any[]\> |
`interactiveDistance` | *object* |
`interactiveDistance.default` | *number* |
`interactiveDistance.type` | [*PropType*](../interfaces/ecs_types_types.proptype.md)<unknown, number\> |
`onInteraction` | *object* |
`onInteraction.type` | [*PropType*](../interfaces/ecs_types_types.proptype.md)<unknown, any\> |
`onInteractionCheck` | *object* |
`onInteractionCheck.type` | [*PropType*](../interfaces/ecs_types_types.proptype.md)<unknown, any\> |
`onInteractionFocused` | *object* |
`onInteractionFocused.type` | [*PropType*](../interfaces/ecs_types_types.proptype.md)<unknown, any\> |

Overrides: [Component](ecs_classes_component.component.md).[_schema](ecs_classes_component.component.md#_schema)

Defined in: [packages/engine/src/interaction/components/Interactable.ts:7](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/interaction/components/Interactable.ts#L7)

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
