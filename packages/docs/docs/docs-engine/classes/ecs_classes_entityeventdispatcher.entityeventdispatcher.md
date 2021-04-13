---
id: "ecs_classes_entityeventdispatcher.entityeventdispatcher"
title: "Class: EntityEventDispatcher"
sidebar_label: "EntityEventDispatcher"
custom_edit_url: null
hide_title: true
---

# Class: EntityEventDispatcher

[ecs/classes/EntityEventDispatcher](../modules/ecs_classes_entityeventdispatcher.md).EntityEventDispatcher

This class provides methods to manage events dispatches.

## Constructors

### constructor

\+ **new EntityEventDispatcher**(): [*EntityEventDispatcher*](ecs_classes_entityeventdispatcher.entityeventdispatcher.md)

**Returns:** [*EntityEventDispatcher*](ecs_classes_entityeventdispatcher.entityeventdispatcher.md)

Defined in: [packages/engine/src/ecs/classes/EntityEventDispatcher.ts:12](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/classes/EntityEventDispatcher.ts#L12)

## Properties

### \_listeners

• **\_listeners**: *object*

Map to store listeners by event names.

#### Type declaration:

Defined in: [packages/engine/src/ecs/classes/EntityEventDispatcher.ts:9](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/classes/EntityEventDispatcher.ts#L9)

___

### stats

• **stats**: *object*

Keeps count of fired and handled events.

#### Type declaration:

Name | Type |
:------ | :------ |
`fired` | *number* |
`handled` | *number* |

Defined in: [packages/engine/src/ecs/classes/EntityEventDispatcher.ts:12](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/classes/EntityEventDispatcher.ts#L12)

## Methods

### addEventListener

▸ **addEventListener**(`eventName`: *string* \| *number*, `listener`: Function): *void*

Adds an event listener.

#### Parameters:

Name | Type | Description |
:------ | :------ | :------ |
`eventName` | *string* \| *number* | Name of the event to listen.   |
`listener` | Function | Callback to trigger when the event is fired.    |

**Returns:** *void*

Defined in: [packages/engine/src/ecs/classes/EntityEventDispatcher.ts:35](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/classes/EntityEventDispatcher.ts#L35)

___

### dispatchEvent

▸ **dispatchEvent**(`eventName`: *string* \| *number*, `entity`: [*Entity*](ecs_classes_entity.entity.md), `component?`: [*Component*](ecs_classes_component.component.md)<any\>): *void*

Dispatches an event with given Entity and Component and increases fired event's count.

#### Parameters:

Name | Type | Description |
:------ | :------ | :------ |
`eventName` | *string* \| *number* | Name of the event to dispatch.   |
`entity` | [*Entity*](ecs_classes_entity.entity.md) | Entity to emit.   |
`component?` | [*Component*](ecs_classes_component.component.md)<any\> | Component to emit.    |

**Returns:** *void*

Defined in: [packages/engine/src/ecs/classes/EntityEventDispatcher.ts:76](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/classes/EntityEventDispatcher.ts#L76)

___

### hasEventListener

▸ **hasEventListener**(`eventName`: *string* \| *number*, `listener`: Function): *boolean*

Checks if an event listener is already added to the list of listeners.

#### Parameters:

Name | Type | Description |
:------ | :------ | :------ |
`eventName` | *string* \| *number* | Name of the event to check.   |
`listener` | Function | Callback for the specified event.    |

**Returns:** *boolean*

Defined in: [packages/engine/src/ecs/classes/EntityEventDispatcher.ts:51](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/classes/EntityEventDispatcher.ts#L51)

___

### removeEventListener

▸ **removeEventListener**(`eventName`: *string* \| *number*, `listener`: Function): *void*

Removes an event listener.

#### Parameters:

Name | Type | Description |
:------ | :------ | :------ |
`eventName` | *string* \| *number* | Name of the event to remove.   |
`listener` | Function | Callback for the specified event.    |

**Returns:** *void*

Defined in: [packages/engine/src/ecs/classes/EntityEventDispatcher.ts:60](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/classes/EntityEventDispatcher.ts#L60)

___

### reset

▸ **reset**(): *void*

Resets the Dispatcher

**Returns:** *void*

Defined in: [packages/engine/src/ecs/classes/EntityEventDispatcher.ts:23](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/classes/EntityEventDispatcher.ts#L23)

___

### resetCounters

▸ **resetCounters**(): *void*

Reset stats counters.

**Returns:** *void*

Defined in: [packages/engine/src/ecs/classes/EntityEventDispatcher.ts:92](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/classes/EntityEventDispatcher.ts#L92)
