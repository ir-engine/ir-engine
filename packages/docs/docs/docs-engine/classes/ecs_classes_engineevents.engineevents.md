---
id: "ecs_classes_engineevents.engineevents"
title: "Class: EngineEvents"
sidebar_label: "EngineEvents"
custom_edit_url: null
hide_title: true
---

# Class: EngineEvents

[ecs/classes/EngineEvents](../modules/ecs_classes_engineevents.md).EngineEvents

## Hierarchy

* [*EventDispatcher*](common_classes_eventdispatcher.eventdispatcher.md)

  ↳ **EngineEvents**

  ↳↳ [*EngineEventsProxy*](ecs_classes_engineevents.engineeventsproxy.md)

## Constructors

### constructor

\+ **new EngineEvents**(): [*EngineEvents*](ecs_classes_engineevents.engineevents.md)

**Returns:** [*EngineEvents*](ecs_classes_engineevents.engineevents.md)

Overrides: [EventDispatcher](common_classes_eventdispatcher.eventdispatcher.md)

Defined in: [packages/engine/src/ecs/classes/EngineEvents.ts:41](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/classes/EngineEvents.ts#L41)

## Properties

### \_listeners

• **\_listeners**: *object*

Map to store listeners by event names.

#### Type declaration:

Inherited from: [EventDispatcher](common_classes_eventdispatcher.eventdispatcher.md).[_listeners](common_classes_eventdispatcher.eventdispatcher.md#_listeners)

Defined in: [packages/engine/src/common/classes/EventDispatcher.ts:6](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/common/classes/EventDispatcher.ts#L6)

___

### EVENTS

▪ `Static` **EVENTS**: *object*

#### Type declaration:

Name | Type |
:------ | :------ |
`ASSET_LOADER` | *string* |
`CONNECT_TO_WORLD` | *string* |
`CONNECT_TO_WORLD_TIMEOUT` | *string* |
`ENABLE_SCENE` | *string* |
`ENTITY_DEBUG_DATA` | *string* |
`ENTITY_LOADED` | *string* |
`JOINED_WORLD` | *string* |
`LEAVE_WORLD` | *string* |
`LOAD_AVATAR` | *string* |
`LOAD_SCENE` | *string* |
`SCENE_LOADED` | *string* |
`USER_ENGAGE` | *string* |

Defined in: [packages/engine/src/ecs/classes/EngineEvents.ts:41](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/classes/EngineEvents.ts#L41)

___

### instance

▪ `Static` **instance**: [*EngineEvents*](ecs_classes_engineevents.engineevents.md)

Defined in: [packages/engine/src/ecs/classes/EngineEvents.ts:40](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/classes/EngineEvents.ts#L40)

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

Inherited from: [EventDispatcher](common_classes_eventdispatcher.eventdispatcher.md)

Defined in: [packages/engine/src/common/classes/EventDispatcher.ts:32](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/common/classes/EventDispatcher.ts#L32)

___

### dispatchEvent

▸ **dispatchEvent**(`event`: { [attachment: string]: *any*; `type`: *string*  }, ...`args`: *any*): *void*

Fire an event type.

#### Parameters:

Name | Type |
:------ | :------ |
`event` | *object* |
`event.type` | *string* |
`...args` | *any* |

**Returns:** *void*

Inherited from: [EventDispatcher](common_classes_eventdispatcher.eventdispatcher.md)

Defined in: [packages/engine/src/common/classes/EventDispatcher.ts:87](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/common/classes/EventDispatcher.ts#L87)

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

Inherited from: [EventDispatcher](common_classes_eventdispatcher.eventdispatcher.md)

Defined in: [packages/engine/src/common/classes/EventDispatcher.ts:48](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/common/classes/EventDispatcher.ts#L48)

___

### once

▸ **once**(`eventName`: *string* \| *number*, `listener`: Function): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`eventName` | *string* \| *number* |
`listener` | Function |

**Returns:** *void*

Inherited from: [EventDispatcher](common_classes_eventdispatcher.eventdispatcher.md)

Defined in: [packages/engine/src/common/classes/EventDispatcher.ts:19](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/common/classes/EventDispatcher.ts#L19)

___

### removeAllListenersForEvent

▸ **removeAllListenersForEvent**(`eventName`: *string*, `deleteEvent?`: *boolean*): *void*

Removes all listeners for an event.

#### Parameters:

Name | Type | Description |
:------ | :------ | :------ |
`eventName` | *string* | Name of the event to remove.    |
`deleteEvent?` | *boolean* | - |

**Returns:** *void*

Inherited from: [EventDispatcher](common_classes_eventdispatcher.eventdispatcher.md)

Defined in: [packages/engine/src/common/classes/EventDispatcher.ts:71](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/common/classes/EventDispatcher.ts#L71)

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

Inherited from: [EventDispatcher](common_classes_eventdispatcher.eventdispatcher.md)

Defined in: [packages/engine/src/common/classes/EventDispatcher.ts:57](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/common/classes/EventDispatcher.ts#L57)

___

### reset

▸ **reset**(): *void*

Resets the Dispatcher

**Returns:** *void*

Inherited from: [EventDispatcher](common_classes_eventdispatcher.eventdispatcher.md)

Defined in: [packages/engine/src/common/classes/EventDispatcher.ts:13](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/common/classes/EventDispatcher.ts#L13)
