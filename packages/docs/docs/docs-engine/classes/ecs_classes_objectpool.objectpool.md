---
id: "ecs_classes_objectpool.objectpool"
title: "Class: ObjectPool<T>"
sidebar_label: "ObjectPool"
custom_edit_url: null
hide_title: true
---

# Class: ObjectPool<T\>

[ecs/classes/ObjectPool](../modules/ecs_classes_objectpool.md).ObjectPool

Base class for [Entity](ecs_classes_entity.entity.md) and [Component](ecs_classes_component.component.md) pools.

## Type parameters

Name | Description |
:------ | :------ |
`T` | [Entity](ecs_classes_entity.entity.md),     [Component](ecs_classes_component.component.md) or Subclass of any of these.    |

## Hierarchy

* **ObjectPool**

  ↳ [*EntityPool*](ecs_classes_entitypool.entitypool.md)

## Constructors

### constructor

\+ **new ObjectPool**<T\>(`baseObject`: *any*, `initialSize?`: *number*): [*ObjectPool*](ecs_classes_objectpool.objectpool.md)<T\>

**`todo`** Add initial size

#### Type parameters:

Name | Description |
:------ | :------ |
`T` | [Entity](ecs_classes_entity.entity.md),     [Component](ecs_classes_component.component.md) or Subclass of any of these.   |

#### Parameters:

Name | Type | Description |
:------ | :------ | :------ |
`baseObject` | *any* | Type of the pool will be the type of this object.   |
`initialSize?` | *number* | Initial size of the pool when created.    |

**Returns:** [*ObjectPool*](ecs_classes_objectpool.objectpool.md)<T\>

Defined in: [packages/engine/src/ecs/classes/ObjectPool.ts:21](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/classes/ObjectPool.ts#L21)

## Properties

### freeList

• **freeList**: *any*[]

Objects in pool that are available for allocation.

**`todo:`** make this a sparse array or ring buffer

Defined in: [packages/engine/src/ecs/classes/ObjectPool.ts:11](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/classes/ObjectPool.ts#L11)

___

### poolSize

• **poolSize**: *number*= 0

Current size of the pool.

Defined in: [packages/engine/src/ecs/classes/ObjectPool.ts:16](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/classes/ObjectPool.ts#L16)

___

### type

• **type**: (...`args`: *any*[]) => T

Type is set on construction.

#### Type declaration:

\+ **new ObjectPool**(...`args`: *any*[]): T

#### Parameters:

Name | Type |
:------ | :------ |
`...args` | *any*[] |

**Returns:** T

Defined in: [packages/engine/src/ecs/classes/ObjectPool.ts:21](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/classes/ObjectPool.ts#L21)

Defined in: [packages/engine/src/ecs/classes/ObjectPool.ts:21](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/classes/ObjectPool.ts#L21)

## Methods

### acquire

▸ **acquire**(): T

Get an object from [freeList](ecs_classes_objectpool.objectpool.md#freelist) of the pool.\
If [freeList](ecs_classes_objectpool.objectpool.md#freelist) is empty then expands the pool first and them retrieves the object.

**`typeparam`** [Entity](ecs_classes_entity.entity.md),
    [Component](ecs_classes_component.component.md) or Subclass of any of these.

**Returns:** T

an available item.

Defined in: [packages/engine/src/ecs/classes/ObjectPool.ts:47](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/classes/ObjectPool.ts#L47)

___

### expand

▸ **expand**(`count`: *number*): *void*

Make the pool bigger.

#### Parameters:

Name | Type | Description |
:------ | :------ | :------ |
`count` | *number* | Number of entities to increase.    |

**Returns:** *void*

Defined in: [packages/engine/src/ecs/classes/ObjectPool.ts:75](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/classes/ObjectPool.ts#L75)

___

### release

▸ **release**(`item`: T): *void*

Put on object back in the pool.

**`typeparam`** [Entity](ecs_classes_entity.entity.md),
    [Component](ecs_classes_component.component.md) or Subclass of any of these.

#### Parameters:

Name | Type | Description |
:------ | :------ | :------ |
`item` | T | Object to be released.   |

**Returns:** *void*

Defined in: [packages/engine/src/ecs/classes/ObjectPool.ts:65](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/classes/ObjectPool.ts#L65)
