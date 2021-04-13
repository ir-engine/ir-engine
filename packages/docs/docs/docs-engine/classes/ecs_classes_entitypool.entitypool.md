---
id: "ecs_classes_entitypool.entitypool"
title: "Class: EntityPool"
sidebar_label: "EntityPool"
custom_edit_url: null
hide_title: true
---

# Class: EntityPool

[ecs/classes/EntityPool](../modules/ecs_classes_entitypool.md).EntityPool

Pool of entities that grows as needed.\
Entities are pulled from the pool on [createEntity()](../modules/ecs_functions_entityfunctions.md#createentity),
and added to the pool on [removeEntity()](../modules/ecs_functions_entityfunctions.md#removeentity).

## Hierarchy

* [*ObjectPool*](ecs_classes_objectpool.objectpool.md)<[*Entity*](ecs_classes_entity.entity.md)\>

  ↳ **EntityPool**

## Constructors

### constructor

\+ **new EntityPool**(`type`: *any*): [*EntityPool*](ecs_classes_entitypool.entitypool.md)

Constructs Entity pool with given type.

#### Parameters:

Name | Type | Description |
:------ | :------ | :------ |
`type` | *any* | Type of the pool.    |

**Returns:** [*EntityPool*](ecs_classes_entitypool.entitypool.md)

Overrides: [ObjectPool](ecs_classes_objectpool.objectpool.md)

Defined in: [packages/engine/src/ecs/classes/EntityPool.ts:26](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/classes/EntityPool.ts#L26)

## Properties

### freeList

• **freeList**: *any*

List of free entities in the pool.

**`todo:`** maybe convert to a sparse map

Overrides: [ObjectPool](ecs_classes_objectpool.objectpool.md).[freeList](ecs_classes_objectpool.objectpool.md#freelist)

Defined in: [packages/engine/src/ecs/classes/EntityPool.ts:21](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/classes/EntityPool.ts#L21)

___

### poolSize

• **poolSize**: *number*

Current total size of the entity pool.

Overrides: [ObjectPool](ecs_classes_objectpool.objectpool.md).[poolSize](ecs_classes_objectpool.objectpool.md#poolsize)

Defined in: [packages/engine/src/ecs/classes/EntityPool.ts:26](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/classes/EntityPool.ts#L26)

___

### type

• **type**: *any*

Type of the pool.

**`todo`** we can probably remove this

Overrides: [ObjectPool](ecs_classes_objectpool.objectpool.md).[type](ecs_classes_objectpool.objectpool.md#type)

Defined in: [packages/engine/src/ecs/classes/EntityPool.ts:15](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/classes/EntityPool.ts#L15)

## Methods

### acquire

▸ **acquire**(): [*Entity*](ecs_classes_entity.entity.md)

Get an object from [freeList](ecs_classes_entitypool.entitypool.md#freelist) of the pool.\
If [freeList](ecs_classes_entitypool.entitypool.md#freelist) is empty then expands the pool first and them retrieves the object.

**`typeparam`** [Entity](ecs_classes_entity.entity.md),
    [Component](ecs_classes_component.component.md) or Subclass of any of these.

**Returns:** [*Entity*](ecs_classes_entity.entity.md)

an available item.

Inherited from: [ObjectPool](ecs_classes_objectpool.objectpool.md)

Defined in: [packages/engine/src/ecs/classes/ObjectPool.ts:47](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/classes/ObjectPool.ts#L47)

___

### expand

▸ **expand**(`count`: *number*): *void*

Expand the size of the pool with more entities.

#### Parameters:

Name | Type | Description |
:------ | :------ | :------ |
`count` | *number* | Number of entities to increase.    |

**Returns:** *void*

Overrides: [ObjectPool](ecs_classes_objectpool.objectpool.md)

Defined in: [packages/engine/src/ecs/classes/EntityPool.ts:41](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/classes/EntityPool.ts#L41)

___

### release

▸ **release**(`item`: [*Entity*](ecs_classes_entity.entity.md)): *void*

Put on object back in the pool.

**`typeparam`** [Entity](ecs_classes_entity.entity.md),
    [Component](ecs_classes_component.component.md) or Subclass of any of these.

#### Parameters:

Name | Type | Description |
:------ | :------ | :------ |
`item` | [*Entity*](ecs_classes_entity.entity.md) | Object to be released.   |

**Returns:** *void*

Inherited from: [ObjectPool](ecs_classes_objectpool.objectpool.md)

Defined in: [packages/engine/src/ecs/classes/ObjectPool.ts:65](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/classes/ObjectPool.ts#L65)
