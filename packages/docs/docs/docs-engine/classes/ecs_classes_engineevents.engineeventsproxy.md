---
id: "ecs_classes_engineevents.engineeventsproxy"
title: "Class: EngineEventsProxy"
sidebar_label: "EngineEventsProxy"
custom_edit_url: null
hide_title: true
---

# Class: EngineEventsProxy

[ecs/classes/EngineEvents](../modules/ecs_classes_engineevents.md).EngineEventsProxy

## Hierarchy

* [*EngineEvents*](ecs_classes_engineevents.engineevents.md)

  ↳ **EngineEventsProxy**

## Constructors

### constructor

\+ **new EngineEventsProxy**(`messageQueue`: [*MessageQueue*](worker_messagequeue.messagequeue.md)): [*EngineEventsProxy*](ecs_classes_engineevents.engineeventsproxy.md)

#### Parameters:

Name | Type |
:------ | :------ |
`messageQueue` | [*MessageQueue*](worker_messagequeue.messagequeue.md) |

**Returns:** [*EngineEventsProxy*](ecs_classes_engineevents.engineeventsproxy.md)

Overrides: [EngineEvents](ecs_classes_engineevents.engineevents.md)

Defined in: [packages/engine/src/ecs/classes/EngineEvents.ts:91](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/classes/EngineEvents.ts#L91)

## Properties

### \_listeners

• **\_listeners**: *object*

Map to store listeners by event names.

#### Type declaration:

Inherited from: [EngineEvents](ecs_classes_engineevents.engineevents.md).[_listeners](ecs_classes_engineevents.engineevents.md#_listeners)

Defined in: [packages/engine/src/common/classes/EventDispatcher.ts:6](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/common/classes/EventDispatcher.ts#L6)

___

### messageQueue

• **messageQueue**: [*MessageQueue*](worker_messagequeue.messagequeue.md)

Defined in: [packages/engine/src/ecs/classes/EngineEvents.ts:91](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/classes/EngineEvents.ts#L91)

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

Inherited from: [EngineEvents](ecs_classes_engineevents.engineevents.md).[EVENTS](ecs_classes_engineevents.engineevents.md#events)

Defined in: [packages/engine/src/ecs/classes/EngineEvents.ts:41](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/classes/EngineEvents.ts#L41)

___

### instance

▪ `Static` **instance**: [*EngineEvents*](ecs_classes_engineevents.engineevents.md)

Inherited from: [EngineEvents](ecs_classes_engineevents.engineevents.md).[instance](ecs_classes_engineevents.engineevents.md#instance)

Defined in: [packages/engine/src/ecs/classes/EngineEvents.ts:40](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/classes/EngineEvents.ts#L40)

## Methods

### addEventListener

▸ **addEventListener**(`type`: *string*, `listener`: *any*, `fromSelf?`: *boolean*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`type` | *string* |
`listener` | *any* |
`fromSelf?` | *boolean* |

**Returns:** *void*

Overrides: [EngineEvents](ecs_classes_engineevents.engineevents.md)

Defined in: [packages/engine/src/ecs/classes/EngineEvents.ts:119](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/classes/EngineEvents.ts#L119)

___

### dispatchEvent

▸ **dispatchEvent**(`event`: *any*, `fromSelf?`: *boolean*, `transferable?`: Transferable[]): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`event` | *any* |
`fromSelf?` | *boolean* |
`transferable?` | Transferable[] |

**Returns:** *void*

Overrides: [EngineEvents](ecs_classes_engineevents.engineevents.md)

Defined in: [packages/engine/src/ecs/classes/EngineEvents.ts:143](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/classes/EngineEvents.ts#L143)

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

Inherited from: [EngineEvents](ecs_classes_engineevents.engineevents.md)

Defined in: [packages/engine/src/common/classes/EventDispatcher.ts:48](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/common/classes/EventDispatcher.ts#L48)

___

### once

▸ **once**(`type`: *string*, `listener`: *any*, `fromSelf?`: *boolean*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`type` | *string* |
`listener` | *any* |
`fromSelf?` | *boolean* |

**Returns:** *void*

Overrides: [EngineEvents](ecs_classes_engineevents.engineevents.md)

Defined in: [packages/engine/src/ecs/classes/EngineEvents.ts:125](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/classes/EngineEvents.ts#L125)

___

### removeAllListenersForEvent

▸ **removeAllListenersForEvent**(`type`: *string*, `deleteEvent`: *boolean*, `fromSelf?`: *boolean*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`type` | *string* |
`deleteEvent` | *boolean* |
`fromSelf?` | *boolean* |

**Returns:** *void*

Overrides: [EngineEvents](ecs_classes_engineevents.engineevents.md)

Defined in: [packages/engine/src/ecs/classes/EngineEvents.ts:137](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/classes/EngineEvents.ts#L137)

___

### removeEventListener

▸ **removeEventListener**(`type`: *string*, `listener`: *any*, `fromSelf?`: *boolean*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`type` | *string* |
`listener` | *any* |
`fromSelf?` | *boolean* |

**Returns:** *void*

Overrides: [EngineEvents](ecs_classes_engineevents.engineevents.md)

Defined in: [packages/engine/src/ecs/classes/EngineEvents.ts:131](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/classes/EngineEvents.ts#L131)

___

### reset

▸ **reset**(): *void*

Resets the Dispatcher

**Returns:** *void*

Inherited from: [EngineEvents](ecs_classes_engineevents.engineevents.md)

Defined in: [packages/engine/src/common/classes/EventDispatcher.ts:13](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/common/classes/EventDispatcher.ts#L13)
