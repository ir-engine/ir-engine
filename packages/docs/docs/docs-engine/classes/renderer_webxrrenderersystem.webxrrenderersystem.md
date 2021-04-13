---
id: "renderer_webxrrenderersystem.webxrrenderersystem"
title: "Class: WebXRRendererSystem"
sidebar_label: "WebXRRendererSystem"
custom_edit_url: null
hide_title: true
---

# Class: WebXRRendererSystem

[renderer/WebXRRendererSystem](../modules/renderer_webxrrenderersystem.md).WebXRRendererSystem

## Hierarchy

* [*System*](ecs_classes_system.system.md)

  ↳ **WebXRRendererSystem**

## Constructors

### constructor

\+ **new WebXRRendererSystem**(`attributes?`: [*SystemAttributes*](../interfaces/ecs_classes_system.systemattributes.md)): [*WebXRRendererSystem*](renderer_webxrrenderersystem.webxrrenderersystem.md)

#### Parameters:

Name | Type |
:------ | :------ |
`attributes?` | [*SystemAttributes*](../interfaces/ecs_classes_system.systemattributes.md) |

**Returns:** [*WebXRRendererSystem*](renderer_webxrrenderersystem.webxrrenderersystem.md)

Overrides: [System](ecs_classes_system.system.md)

Defined in: [packages/engine/src/renderer/WebXRRendererSystem.ts:47](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/WebXRRendererSystem.ts#L47)

## Properties

### \_mandatoryQueries

• **\_mandatoryQueries**: *any*

Inherited from: [System](ecs_classes_system.system.md).[_mandatoryQueries](ecs_classes_system.system.md#_mandatoryqueries)

Defined in: [packages/engine/src/ecs/classes/System.ts:69](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/classes/System.ts#L69)

___

### \_queries

• **\_queries**: *object*

Queries of system instances.

#### Type declaration:

Inherited from: [System](ecs_classes_system.system.md).[_queries](ecs_classes_system.system.md#_queries)

Defined in: [packages/engine/src/ecs/classes/System.ts:98](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/classes/System.ts#L98)

___

### baseLayer

• **baseLayer**: [*XRWebGLLayer*](../interfaces/input_types_webxr.xrwebgllayer.md)

Defined in: [packages/engine/src/renderer/WebXRRendererSystem.ts:37](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/WebXRRendererSystem.ts#L37)

___

### cameraDolly

• **cameraDolly**: *any*

Defined in: [packages/engine/src/renderer/WebXRRendererSystem.ts:46](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/WebXRRendererSystem.ts#L46)

___

### context

• **context**: *any*

Defined in: [packages/engine/src/renderer/WebXRRendererSystem.ts:38](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/WebXRRendererSystem.ts#L38)

___

### controllerUpdateHook

• **controllerUpdateHook**: *any*

Defined in: [packages/engine/src/renderer/WebXRRendererSystem.ts:41](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/WebXRRendererSystem.ts#L41)

___

### enabled

• **enabled**: *boolean*

Whether the system will execute during the world tick.

Inherited from: [System](ecs_classes_system.system.md).[enabled](ecs_classes_system.system.md#enabled)

Defined in: [packages/engine/src/ecs/classes/System.ts:92](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/classes/System.ts#L92)

___

### executeTime

• **executeTime**: *number*

Inherited from: [System](ecs_classes_system.system.md).[executeTime](ecs_classes_system.system.md#executetime)

Defined in: [packages/engine/src/ecs/classes/System.ts:71](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/classes/System.ts#L71)

___

### initialized

• **initialized**: *boolean*

Inherited from: [System](ecs_classes_system.system.md).[initialized](ecs_classes_system.system.md#initialized)

Defined in: [packages/engine/src/ecs/classes/System.ts:72](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/classes/System.ts#L72)

___

### isRenderering

• **isRenderering**: *boolean*= false

Defined in: [packages/engine/src/renderer/WebXRRendererSystem.ts:36](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/WebXRRendererSystem.ts#L36)

___

### name

• **name**: *string*

Name of the System.

Inherited from: [System](ecs_classes_system.system.md).[name](ecs_classes_system.system.md#name)

Defined in: [packages/engine/src/ecs/classes/System.ts:95](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/classes/System.ts#L95)

___

### offscreen

• **offscreen**: *boolean*

Defined in: [packages/engine/src/renderer/WebXRRendererSystem.ts:33](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/WebXRRendererSystem.ts#L33)

___

### playerPosition

• **playerPosition**: *any*

Defined in: [packages/engine/src/renderer/WebXRRendererSystem.ts:45](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/WebXRRendererSystem.ts#L45)

___

### priority

• **priority**: *number*

Inherited from: [System](ecs_classes_system.system.md).[priority](ecs_classes_system.system.md#priority)

Defined in: [packages/engine/src/ecs/classes/System.ts:70](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/classes/System.ts#L70)

___

### queryResults

• **queryResults**: *object*

The results of the queries.
Should be used inside of execute.

#### Type declaration:

Inherited from: [System](ecs_classes_system.system.md).[queryResults](ecs_classes_system.system.md#queryresults)

Defined in: [packages/engine/src/ecs/classes/System.ts:80](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/classes/System.ts#L80)

___

### referenceSpace

• **referenceSpace**: [*XRReferenceSpace*](../interfaces/input_types_webxr.xrreferencespace.md)

Defined in: [packages/engine/src/renderer/WebXRRendererSystem.ts:44](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/WebXRRendererSystem.ts#L44)

___

### referenceSpaceType

• **referenceSpaceType**: [*XRReferenceSpaceType*](../modules/input_types_webxr.md#xrreferencespacetype)= 'local-floor'

Defined in: [packages/engine/src/renderer/WebXRRendererSystem.ts:43](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/WebXRRendererSystem.ts#L43)

___

### renderbuffer

• **renderbuffer**: WebGLRenderbuffer

Defined in: [packages/engine/src/renderer/WebXRRendererSystem.ts:39](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/WebXRRendererSystem.ts#L39)

___

### updateType

• **updateType**: [*SystemUpdateType*](../enums/ecs_functions_systemupdatetype.systemupdatetype.md)

Inherited from: [System](ecs_classes_system.system.md).[updateType](ecs_classes_system.system.md#updatetype)

Defined in: [packages/engine/src/ecs/classes/System.ts:74](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/classes/System.ts#L74)

___

### EVENTS

▪ `Static` **EVENTS**: *object*

#### Type declaration:

Name | Type |
:------ | :------ |
`XR_END` | *string* |
`XR_SESSION` | *string* |
`XR_START` | *string* |

Defined in: [packages/engine/src/renderer/WebXRRendererSystem.ts:24](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/WebXRRendererSystem.ts#L24)

___

### instance

▪ `Static` **instance**: [*WebXRRendererSystem*](renderer_webxrrenderersystem.webxrrenderersystem.md)

Defines what Components the System will query for.
This needs to be user defined.

Overrides: [System](ecs_classes_system.system.md).[instance](ecs_classes_system.system.md#instance)

Defined in: [packages/engine/src/renderer/WebXRRendererSystem.ts:47](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/WebXRRendererSystem.ts#L47)

___

### isSystem

▪ `Static` **isSystem**: *true*

Inherited from: [System](ecs_classes_system.system.md).[isSystem](ecs_classes_system.system.md#issystem)

Defined in: [packages/engine/src/ecs/classes/System.ts:68](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/classes/System.ts#L68)

___

### queries

▪ `Static` **queries**: [*SystemQueries*](../interfaces/ecs_classes_system.systemqueries.md)

Inherited from: [System](ecs_classes_system.system.md).[queries](ecs_classes_system.system.md#queries)

Defined in: [packages/engine/src/ecs/classes/System.ts:63](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/classes/System.ts#L63)

___

### xrFrame

▪ `Static` **xrFrame**: [*XRFrame*](../interfaces/input_types_webxr.xrframe.md)

Defined in: [packages/engine/src/renderer/WebXRRendererSystem.ts:34](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/WebXRRendererSystem.ts#L34)

## Methods

### clearEventQueues

▸ **clearEventQueues**(): *void*

Clears event queues.

**Returns:** *void*

Inherited from: [System](ecs_classes_system.system.md)

Defined in: [packages/engine/src/ecs/classes/System.ts:244](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/classes/System.ts#L244)

___

### dispose

▸ **dispose**(): *void*

Removes resize listener.

**Returns:** *void*

Overrides: [System](ecs_classes_system.system.md)

Defined in: [packages/engine/src/renderer/WebXRRendererSystem.ts:125](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/WebXRRendererSystem.ts#L125)

___

### execute

▸ **execute**(`delta`: *number*): *void*

Executes the system. Called each frame by default from the Engine.

#### Parameters:

Name | Type | Description |
:------ | :------ | :------ |
`delta` | *number* | Time since last frame.    |

**Returns:** *void*

Overrides: [System](ecs_classes_system.system.md)

Defined in: [packages/engine/src/renderer/WebXRRendererSystem.ts:133](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/WebXRRendererSystem.ts#L133)

___

### getQuery

▸ **getQuery**(`components`: ([*ComponentConstructor*](../interfaces/ecs_interfaces_componentinterfaces.componentconstructor.md)<any\> \| [*NotComponent*](../interfaces/ecs_classes_system.notcomponent.md)<any\>)[]): [*Query*](ecs_classes_query.query.md)

Get query from the component.

#### Parameters:

Name | Type | Description |
:------ | :------ | :------ |
`components` | ([*ComponentConstructor*](../interfaces/ecs_interfaces_componentinterfaces.componentconstructor.md)<any\> \| [*NotComponent*](../interfaces/ecs_classes_system.notcomponent.md)<any\>)[] | List of components either component or not component.    |

**Returns:** [*Query*](ecs_classes_query.query.md)

Inherited from: [System](ecs_classes_system.system.md)

Defined in: [packages/engine/src/ecs/classes/System.ts:223](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/classes/System.ts#L223)

___

### play

▸ **play**(): *void*

Plays the system.

**Returns:** *void*

Inherited from: [System](ecs_classes_system.system.md)

Defined in: [packages/engine/src/ecs/classes/System.ts:239](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/classes/System.ts#L239)

___

### stop

▸ **stop**(): *void*

Stop the system.

**Returns:** *void*

Inherited from: [System](ecs_classes_system.system.md)

Defined in: [packages/engine/src/ecs/classes/System.ts:233](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/classes/System.ts#L233)

___

### toJSON

▸ **toJSON**(): *any*

Serialize the System

**Returns:** *any*

Inherited from: [System](ecs_classes_system.system.md)

Defined in: [packages/engine/src/ecs/classes/System.ts:268](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/classes/System.ts#L268)

___

### getName

▸ `Static`**getName**(): *string*

Get name of the System

**Returns:** *string*

Inherited from: [System](ecs_classes_system.system.md)

Defined in: [packages/engine/src/ecs/classes/System.ts:214](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/classes/System.ts#L214)
