---
id: "ecs_classes_query.query"
title: "Class: Query"
sidebar_label: "Query"
custom_edit_url: null
hide_title: true
---

# Class: Query

[ecs/classes/Query](../modules/ecs_classes_query.md).Query

Class to handle a system query.\
Queries are how systems identify entities with specified components.

## Constructors

### constructor

\+ **new Query**(`Components`: ([*ComponentConstructor*](../interfaces/ecs_interfaces_componentinterfaces.componentconstructor.md)<any\> \| [*NotComponent*](../interfaces/ecs_classes_system.notcomponent.md)<any\>)[]): [*Query*](ecs_classes_query.query.md)

Constructor called when system creates query.

#### Parameters:

Name | Type | Description |
:------ | :------ | :------ |
`Components` | ([*ComponentConstructor*](../interfaces/ecs_interfaces_componentinterfaces.componentconstructor.md)<any\> \| [*NotComponent*](../interfaces/ecs_classes_system.notcomponent.md)<any\>)[] | List of Components. At least one component object is required to create query.    |

**Returns:** [*Query*](ecs_classes_query.query.md)

Defined in: [packages/engine/src/ecs/classes/Query.ts:71](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/classes/Query.ts#L71)

## Properties

### components

• **components**: *any*[]

List of components to look for in this query.

Defined in: [packages/engine/src/ecs/classes/Query.ts:44](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/classes/Query.ts#L44)

___

### entities

• **entities**: *any*[]

List of entities currently attached to this query.

**`todo:`** This could be optimized with a ringbuffer or sparse array

Defined in: [packages/engine/src/ecs/classes/Query.ts:55](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/classes/Query.ts#L55)

___

### eventDispatcher

• **eventDispatcher**: [*EntityEventDispatcher*](ecs_classes_entityeventdispatcher.entityeventdispatcher.md)

Event dispatcher associated with this query.

Defined in: [packages/engine/src/ecs/classes/Query.ts:60](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/classes/Query.ts#L60)

___

### key

• **key**: *any*

Key for looking up the query.

Defined in: [packages/engine/src/ecs/classes/Query.ts:71](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/classes/Query.ts#L71)

___

### notComponents

• **notComponents**: *any*[]

List of components to use to filter out entities.

Defined in: [packages/engine/src/ecs/classes/Query.ts:49](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/classes/Query.ts#L49)

___

### reactive

• **reactive**: *boolean*

Is the query reactive?\
Reactive queries respond to listener events - onChanged, onAdded and onRemoved.

Defined in: [packages/engine/src/ecs/classes/Query.ts:66](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/classes/Query.ts#L66)

## Methods

### addEntity

▸ **addEntity**(`entity`: [*Entity*](ecs_classes_entity.entity.md)): *void*

Add entity to this query.

#### Parameters:

Name | Type | Description |
:------ | :------ | :------ |
`entity` | [*Entity*](ecs_classes_entity.entity.md) | Entity to be added.    |

**Returns:** *void*

Defined in: [packages/engine/src/ecs/classes/Query.ts:117](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/classes/Query.ts#L117)

___

### match

▸ **match**(`entity`: [*Entity*](ecs_classes_entity.entity.md)): *boolean*

Check if an entity matches this query.

#### Parameters:

Name | Type | Description |
:------ | :------ | :------ |
`entity` | [*Entity*](ecs_classes_entity.entity.md) | Entity to be matched for this query.    |

**Returns:** *boolean*

Defined in: [packages/engine/src/ecs/classes/Query.ts:145](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/classes/Query.ts#L145)

___

### removeEntity

▸ **removeEntity**(`entity`: [*Entity*](ecs_classes_entity.entity.md)): *void*

Remove entity from this query.

#### Parameters:

Name | Type | Description |
:------ | :------ | :------ |
`entity` | [*Entity*](ecs_classes_entity.entity.md) | Entity to be removed.    |

**Returns:** *void*

Defined in: [packages/engine/src/ecs/classes/Query.ts:128](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/classes/Query.ts#L128)

___

### stats

▸ **stats**(): [*QueryStatType*](../interfaces/ecs_classes_query.querystattype.md)

Return stats for this query.

**Returns:** [*QueryStatType*](../interfaces/ecs_classes_query.querystattype.md)

Defined in: [packages/engine/src/ecs/classes/Query.ts:167](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/classes/Query.ts#L167)

___

### toJSON

▸ **toJSON**(): [*QuerySerializeType*](../interfaces/ecs_classes_query.queryserializetype.md)

Serialize query to JSON.

**Returns:** [*QuerySerializeType*](../interfaces/ecs_classes_query.queryserializetype.md)

Defined in: [packages/engine/src/ecs/classes/Query.ts:152](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/classes/Query.ts#L152)
