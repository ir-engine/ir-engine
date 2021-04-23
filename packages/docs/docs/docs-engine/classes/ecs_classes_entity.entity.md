---
id: "ecs_classes_entity.entity"
title: "Class: Entity"
sidebar_label: "Entity"
custom_edit_url: null
hide_title: true
---

# Class: Entity

[ecs/classes/Entity](../modules/ecs_classes_entity.md).Entity

Entity Class defines the structure for every entities.\
Entity are basic elements of the Entity Component System.
Every item in the engine is an Entity and different components will be assigned to them.
Hence Entity acts as a container which holds different components.

## Constructors

### constructor

\+ **new Entity**(): [*Entity*](ecs_classes_entity.entity.md)

Constructor is called when component created.\
Since [addComponent()](../modules/ecs_functions_entityfunctions.md#addcomponent) pulls from the pool, it doesn't invoke constructor.

**Returns:** [*Entity*](ecs_classes_entity.entity.md)

Defined in: [packages/engine/src/ecs/classes/Entity.ts:44](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/classes/Entity.ts#L44)

## Properties

### componentTypes

• **componentTypes**: *any*[]

List of component types currently attached to the entity.

Defined in: [packages/engine/src/ecs/classes/Entity.ts:19](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/classes/Entity.ts#L19)

___

### componentTypesToRemove

• **componentTypesToRemove**: *any*[]

List of component tye to remove at the end of this frame from the entity.

Defined in: [packages/engine/src/ecs/classes/Entity.ts:29](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/classes/Entity.ts#L29)

___

### components

• **components**: *object*

List of components attached to the entity.

#### Type declaration:

Defined in: [packages/engine/src/ecs/classes/Entity.ts:24](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/classes/Entity.ts#L24)

___

### componentsToRemove

• **componentsToRemove**: *object*

List of components to remove this at the end of frame from the entity.

#### Type declaration:

Defined in: [packages/engine/src/ecs/classes/Entity.ts:33](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/classes/Entity.ts#L33)

___

### id

• **id**: *number*

Unique ID for this instance.

Defined in: [packages/engine/src/ecs/classes/Entity.ts:14](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/classes/Entity.ts#L14)

___

### numStateComponents

• **numStateComponents**: *number*= 0

Keep count of our state components for handling entity removal.\
System state components live on the entity until the entity is deleted.

Defined in: [packages/engine/src/ecs/classes/Entity.ts:44](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/classes/Entity.ts#L44)

___

### queries

• **queries**: *any*[]

List of queries this entity is part of.

Defined in: [packages/engine/src/ecs/classes/Entity.ts:38](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/classes/Entity.ts#L38)

## Methods

### clone

▸ **clone**(): [*Entity*](ecs_classes_entity.entity.md)

Default logic for clone entity.

**Returns:** [*Entity*](ecs_classes_entity.entity.md)

new entity as a clone of the source.

Defined in: [packages/engine/src/ecs/classes/Entity.ts:81](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/classes/Entity.ts#L81)

___

### copy

▸ **copy**(`src`: [*Entity*](ecs_classes_entity.entity.md)): [*Entity*](ecs_classes_entity.entity.md)

Default logic for copying entity.

#### Parameters:

Name | Type | Description |
:------ | :------ | :------ |
`src` | [*Entity*](ecs_classes_entity.entity.md) | Source entity to copy from.   |

**Returns:** [*Entity*](ecs_classes_entity.entity.md)

this new entity as a copy of the source.

Defined in: [packages/engine/src/ecs/classes/Entity.ts:67](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/classes/Entity.ts#L67)

___

### reset

▸ **reset**(): *void*

Reset the entity.\
Called when entity is returned to pool.

**Returns:** *void*

Defined in: [packages/engine/src/ecs/classes/Entity.ts:89](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/classes/Entity.ts#L89)
