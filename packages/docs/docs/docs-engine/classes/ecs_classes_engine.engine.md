---
id: "ecs_classes_engine.engine"
title: "Class: Engine"
sidebar_label: "Engine"
custom_edit_url: null
hide_title: true
---

# Class: Engine

[ecs/classes/Engine](../modules/ecs_classes_engine.md).Engine

This is the base class which holds all the data related to the scene, camera,system etc.\
Data is holded statically hence will be available everywhere.

## Constructors

### constructor

\+ **new Engine**(): [*Engine*](ecs_classes_engine.engine.md)

**Returns:** [*Engine*](ecs_classes_engine.engine.md)

## Properties

### accumulator

▪ `Static` **accumulator**: *number*

Defined in: [packages/engine/src/ecs/classes/Engine.ts:76](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/classes/Engine.ts#L76)

___

### audioListener

▪ `Static` **audioListener**: *any*= null

Reference to the audioListener.
This is a virtual listner for all positional and non-positional audio.

Defined in: [packages/engine/src/ecs/classes/Engine.ts:118](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/classes/Engine.ts#L118)

___

### camera

▪ `Static` **camera**: *any*= null

Reference to the three.js perspective camera object.
This is set in [initializeEngine()](../modules/initialize.md#initializeengine).

Defined in: [packages/engine/src/ecs/classes/Engine.ts:105](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/classes/Engine.ts#L105)

___

### cameraTransform

▪ `Static` **cameraTransform**: [*TransformComponent*](transform_components_transformcomponent.transformcomponent.md)= null

Reference to the Transform component of the three.js camera object.
This holds data related to camera position, angle etc.
This is set in [initializeEngine()](../modules/initialize.md#initializeengine).

Defined in: [packages/engine/src/ecs/classes/Engine.ts:112](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/classes/Engine.ts#L112)

___

### clock

▪ `Static` **clock**: *any*

Defined in: [packages/engine/src/ecs/classes/Engine.ts:83](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/classes/Engine.ts#L83)

___

### componentPool

▪ `Static` **componentPool**: *object*

List of component pools, one for each component class.

#### Type declaration:

Defined in: [packages/engine/src/ecs/classes/Engine.ts:193](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/classes/Engine.ts#L193)

___

### components

▪ `Static` **components**: *any*[]

List of registered components.

Defined in: [packages/engine/src/ecs/classes/Engine.ts:168](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/classes/Engine.ts#L168)

___

### componentsMap

▪ `Static` **componentsMap**: *object*

Map of component classes to their type ID.

#### Type declaration:

Defined in: [packages/engine/src/ecs/classes/Engine.ts:188](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/classes/Engine.ts#L188)

___

### context

▪ `Static` **context**: *any*= null

Defined in: [packages/engine/src/ecs/classes/Engine.ts:92](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/classes/Engine.ts#L92)

___

### createElement

▪ `Static` **createElement**: *any*

Defined in: [packages/engine/src/ecs/classes/Engine.ts:225](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/classes/Engine.ts#L225)

___

### csm

▪ `Static` **csm**: *any*= null

Defined in: [packages/engine/src/ecs/classes/Engine.ts:90](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/classes/Engine.ts#L90)

___

### deferredRemovalEnabled

▪ `Static` **deferredRemovalEnabled**: *boolean*= true

Controls whether components should be removed immediately or after all systems execute.

**`default`** true

Defined in: [packages/engine/src/ecs/classes/Engine.ts:143](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/classes/Engine.ts#L143)

___

### enabled

▪ `Static` **enabled**: *boolean*= true

Controls whether engine should execute this frame.
Engine can be paused by setting enabled to false.

**`default`** true

Defined in: [packages/engine/src/ecs/classes/Engine.ts:137](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/classes/Engine.ts#L137)

___

### engineTimer

▪ `Static` **engineTimer**: *object*= null

#### Type declaration:

Name | Type |
:------ | :------ |
`start` | Function |
`stop` | Function |

Defined in: [packages/engine/src/ecs/classes/Engine.ts:52](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/classes/Engine.ts#L52)

___

### engineTimerTimeout

▪ `Static` **engineTimerTimeout**: *any*= null

Defined in: [packages/engine/src/ecs/classes/Engine.ts:53](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/classes/Engine.ts#L53)

___

### entities

▪ `Static` **entities**: [*Entity*](ecs_classes_entity.entity.md)[]

List of registered entities.

Defined in: [packages/engine/src/ecs/classes/Engine.ts:153](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/classes/Engine.ts#L153)

___

### entitiesToRemove

▪ `Static` **entitiesToRemove**: *any*[]

List of entities that will be removed at the end of this frame.

**`todo`** replace with a ring buffer and set buffer size in default options

Defined in: [packages/engine/src/ecs/classes/Engine.ts:210](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/classes/Engine.ts#L210)

___

### entitiesWithComponentsToRemove

▪ `Static` **entitiesWithComponentsToRemove**: *any*[]

List of entities with components that will be removed at the end of this frame.

**`todo`** replace with a ring buffer and set buffer size in default options

Defined in: [packages/engine/src/ecs/classes/Engine.ts:204](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/classes/Engine.ts#L204)

___

### entityMap

▪ `Static` **entityMap**: *Map*<string, [*Entity*](ecs_classes_entity.entity.md)\>

Map of registered entities by ID

Defined in: [packages/engine/src/ecs/classes/Engine.ts:158](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/classes/Engine.ts#L158)

___

### entityPool

▪ `Static` **entityPool**: [*EntityPool*](ecs_classes_entitypool.entitypool.md)

Pool of available entities.

Defined in: [packages/engine/src/ecs/classes/Engine.ts:183](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/classes/Engine.ts#L183)

___

### eventDispatcher

▪ `Static` **eventDispatcher**: [*EntityEventDispatcher*](ecs_classes_entityeventdispatcher.entityeventdispatcher.md)

Event dispatcher manages sending events which can be interpreted by devtools.

Defined in: [packages/engine/src/ecs/classes/Engine.ts:123](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/classes/Engine.ts#L123)

___

### gamepadButtons

▪ `Static` **gamepadButtons**: [*BinaryType*](../modules/common_types_numericaltypes.md#binarytype)[]

Defined in: [packages/engine/src/ecs/classes/Engine.ts:244](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/classes/Engine.ts#L244)

___

### gamepadConnected

▪ `Static` **gamepadConnected**: *boolean*= false

Input inherits from BehaviorComponent, which adds .map and .data

**`property`** {Boolean} gamepadConnected Connection a new gamepad

**`property`** {Number} gamepadThreshold Threshold value from 0 to 1

**`property`** {Binary[]} gamepadButtons Map gamepad buttons

**`property`** {Number[]} gamepadInput Map gamepad buttons to abstract input

Defined in: [packages/engine/src/ecs/classes/Engine.ts:242](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/classes/Engine.ts#L242)

___

### gamepadInput

▪ `Static` **gamepadInput**: *number*[]

Defined in: [packages/engine/src/ecs/classes/Engine.ts:245](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/classes/Engine.ts#L245)

___

### gamepadThreshold

▪ `Static` **gamepadThreshold**: *number*= 0.1

Defined in: [packages/engine/src/ecs/classes/Engine.ts:243](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/classes/Engine.ts#L243)

___

### hasUserEngaged

▪ `Static` **hasUserEngaged**: *boolean*= false

Defined in: [packages/engine/src/ecs/classes/Engine.ts:227](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/classes/Engine.ts#L227)

___

### inputState

▪ `Static` **inputState**: *Map*<any, any\>

Defined in: [packages/engine/src/ecs/classes/Engine.ts:231](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/classes/Engine.ts#L231)

___

### isExecuting

▪ `Static` **isExecuting**: *boolean*= false

Indicates whether engine is currently executing or not.

Defined in: [packages/engine/src/ecs/classes/Engine.ts:62](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/classes/Engine.ts#L62)

___

### justExecuted

▪ `Static` **justExecuted**: *boolean*

Defined in: [packages/engine/src/ecs/classes/Engine.ts:77](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/classes/Engine.ts#L77)

___

### lastTime

▪ `Static` **lastTime**: *number*

Defined in: [packages/engine/src/ecs/classes/Engine.ts:218](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/classes/Engine.ts#L218)

___

### networkFramerate

▪ `Static` **networkFramerate**: *number*= 20

Frame rate for network system.

**`default`** 20

Defined in: [packages/engine/src/ecs/classes/Engine.ts:74](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/classes/Engine.ts#L74)

___

### nextComponentId

▪ `Static` **nextComponentId**: *number*= 0

Next component created will have this ID.

Defined in: [packages/engine/src/ecs/classes/Engine.ts:178](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/classes/Engine.ts#L178)

___

### nextEntityId

▪ `Static` **nextEntityId**: *number*= 0

Next entity created will have this ID.

Defined in: [packages/engine/src/ecs/classes/Engine.ts:173](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/classes/Engine.ts#L173)

___

### numComponents

▪ `Static` **numComponents**: *object*

Stores a count for each component type.

#### Type declaration:

Defined in: [packages/engine/src/ecs/classes/Engine.ts:198](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/classes/Engine.ts#L198)

___

### options

▪ `Static` **options**: { `entityPoolSize`: *number*  } & [*EngineOptions*](../interfaces/ecs_interfaces_engineoptions.engineoptions.md)

Initialization options.

Defined in: [packages/engine/src/ecs/classes/Engine.ts:128](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/classes/Engine.ts#L128)

___

### params

▪ `Static` **params**: *any*

Defined in: [packages/engine/src/ecs/classes/Engine.ts:78](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/classes/Engine.ts#L78)

___

### physicsFrameRate

▪ `Static` **physicsFrameRate**: *number*= 60

Frame rate for physics system.

**`default`** 60

Defined in: [packages/engine/src/ecs/classes/Engine.ts:68](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/classes/Engine.ts#L68)

___

### prevInputState

▪ `Static` **prevInputState**: *Map*<any, any\>

Defined in: [packages/engine/src/ecs/classes/Engine.ts:232](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/classes/Engine.ts#L232)

___

### publicPath

▪ `Static` **publicPath**: *string*

Defined in: [packages/engine/src/ecs/classes/Engine.ts:247](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/classes/Engine.ts#L247)

___

### queries

▪ `Static` **queries**: [*Query*](ecs_classes_query.query.md)[]

List of registered queries.

Defined in: [packages/engine/src/ecs/classes/Engine.ts:163](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/classes/Engine.ts#L163)

___

### renderer

▪ `Static` **renderer**: *any*= null

Reference to the three.js renderer object.
This is set in [initializeEngine()](../modules/initialize.md#initializeengine).

Defined in: [packages/engine/src/ecs/classes/Engine.ts:89](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/classes/Engine.ts#L89)

___

### scene

▪ `Static` **scene**: *any*= null

Reference to the three.js scene object.
This is set in [initializeEngine()](../modules/initialize.md#initializeengine).

Defined in: [packages/engine/src/ecs/classes/Engine.ts:98](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/classes/Engine.ts#L98)

___

### sceneLoaded

▪ `Static` **sceneLoaded**: *boolean*= false

Defined in: [packages/engine/src/ecs/classes/Engine.ts:99](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/classes/Engine.ts#L99)

___

### spawnSystem

▪ `Static` **spawnSystem**: [*ServerSpawnSystem*](scene_systems_spawnsystem.serverspawnsystem.md)

Defined in: [packages/engine/src/ecs/classes/Engine.ts:223](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/classes/Engine.ts#L223)

___

### systems

▪ `Static` **systems**: *any*[]

List of registered systems.

Defined in: [packages/engine/src/ecs/classes/Engine.ts:148](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/classes/Engine.ts#L148)

___

### systemsToExecute

▪ `Static` **systemsToExecute**: *any*[]

List of systems to execute this frame.

**`todo`** replace with a ring buffer and set buffer size in default options

Defined in: [packages/engine/src/ecs/classes/Engine.ts:216](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/classes/Engine.ts#L216)

___

### tick

▪ `Static` **tick**: *number*= 0

Defined in: [packages/engine/src/ecs/classes/Engine.ts:219](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/classes/Engine.ts#L219)

___

### timeScaleTarget

▪ `Static` **timeScaleTarget**: *number*= 1

**`default`** 1

Defined in: [packages/engine/src/ecs/classes/Engine.ts:82](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/classes/Engine.ts#L82)

___

### useAudioSystem

▪ `Static` **useAudioSystem**: *boolean*= false

Defined in: [packages/engine/src/ecs/classes/Engine.ts:229](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/classes/Engine.ts#L229)

___

### vehicles

▪ `Static` **vehicles**: *any*

Defined in: [packages/engine/src/ecs/classes/Engine.ts:217](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/classes/Engine.ts#L217)

___

### viewportElement

▪ `Static` **viewportElement**: HTMLElement

HTML Element in which Engine renders.

Defined in: [packages/engine/src/ecs/classes/Engine.ts:221](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/classes/Engine.ts#L221)

___

### xrSession

▪ `Static` **xrSession**: *any*= null

Defined in: [packages/engine/src/ecs/classes/Engine.ts:91](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/classes/Engine.ts#L91)

___

### xrSupported

▪ `Static` **xrSupported**: *boolean*= false

Defined in: [packages/engine/src/ecs/classes/Engine.ts:55](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/classes/Engine.ts#L55)
