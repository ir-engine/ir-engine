---
id: "templates_character_components_charactercomponent.charactercomponent"
title: "Class: CharacterComponent"
sidebar_label: "CharacterComponent"
custom_edit_url: null
hide_title: true
---

# Class: CharacterComponent

[templates/character/components/CharacterComponent](../modules/templates_character_components_charactercomponent.md).CharacterComponent

## Hierarchy

* [*Component*](ecs_classes_component.component.md)<[*CharacterComponent*](templates_character_components_charactercomponent.charactercomponent.md)\>

  ↳ **CharacterComponent**

## Constructors

### constructor

\+ **new CharacterComponent**(`props?`: *false* \| *Partial*<Omit<[*CharacterComponent*](templates_character_components_charactercomponent.charactercomponent.md), keyof [*Component*](ecs_classes_component.component.md)<any\>\>\>): [*CharacterComponent*](templates_character_components_charactercomponent.charactercomponent.md)

Component class constructor.

#### Parameters:

Name | Type |
:------ | :------ |
`props?` | *false* \| *Partial*<Omit<[*CharacterComponent*](templates_character_components_charactercomponent.charactercomponent.md), keyof [*Component*](ecs_classes_component.component.md)<any\>\>\> |

**Returns:** [*CharacterComponent*](templates_character_components_charactercomponent.charactercomponent.md)

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

### acceleration

• **acceleration**: *any*

Defined in: [packages/engine/src/templates/character/components/CharacterComponent.ts:49](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/templates/character/components/CharacterComponent.ts#L49)

___

### actions

• **actions**: *any*

Defined in: [packages/engine/src/templates/character/components/CharacterComponent.ts:76](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/templates/character/components/CharacterComponent.ts#L76)

___

### actorCapsule

• **actorCapsule**: [*CapsuleCollider*](physics_components_capsulecollider.capsulecollider.md)

Defined in: [packages/engine/src/templates/character/components/CharacterComponent.ts:77](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/templates/character/components/CharacterComponent.ts#L77)

___

### actorHeight

• **actorHeight**: *number*= 1

Defined in: [packages/engine/src/templates/character/components/CharacterComponent.ts:81](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/templates/character/components/CharacterComponent.ts#L81)

___

### actorMass

• **actorMass**: *number*= 1

Defined in: [packages/engine/src/templates/character/components/CharacterComponent.ts:80](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/templates/character/components/CharacterComponent.ts#L80)

___

### alreadyJumped

• **alreadyJumped**: *boolean*

Defined in: [packages/engine/src/templates/character/components/CharacterComponent.ts:112](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/templates/character/components/CharacterComponent.ts#L112)

___

### angularVelocity

• **angularVelocity**: *number*= 0

Defined in: [packages/engine/src/templates/character/components/CharacterComponent.ts:68](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/templates/character/components/CharacterComponent.ts#L68)

___

### animationVectorSimulator

• **animationVectorSimulator**: [*VectorSpringSimulator*](physics_classes_vectorspringsimulator.vectorspringsimulator.md)

Defined in: [packages/engine/src/templates/character/components/CharacterComponent.ts:64](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/templates/character/components/CharacterComponent.ts#L64)

___

### animationVelocity

• **animationVelocity**: *any*

Defined in: [packages/engine/src/templates/character/components/CharacterComponent.ts:100](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/templates/character/components/CharacterComponent.ts#L100)

___

### animations

• **animations**: *any*[]

Defined in: [packages/engine/src/templates/character/components/CharacterComponent.ts:40](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/templates/character/components/CharacterComponent.ts#L40)

___

### animationsTimeScale

• **animationsTimeScale**: *number*= .5

Defined in: [packages/engine/src/templates/character/components/CharacterComponent.ts:31](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/templates/character/components/CharacterComponent.ts#L31)

___

### arcadeVelocityInfluence

• **arcadeVelocityInfluence**: *any*

Defined in: [packages/engine/src/templates/character/components/CharacterComponent.ts:55](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/templates/character/components/CharacterComponent.ts#L55)

___

### arcadeVelocityIsAdditive

• **arcadeVelocityIsAdditive**: *boolean*

Defined in: [packages/engine/src/templates/character/components/CharacterComponent.ts:57](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/templates/character/components/CharacterComponent.ts#L57)

___

### avatarId

• **avatarId**: *string*

Defined in: [packages/engine/src/templates/character/components/CharacterComponent.ts:32](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/templates/character/components/CharacterComponent.ts#L32)

___

### avatarURL

• **avatarURL**: *string*

Defined in: [packages/engine/src/templates/character/components/CharacterComponent.ts:33](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/templates/character/components/CharacterComponent.ts#L33)

___

### canEnterVehicles

• **canEnterVehicles**: *boolean*

Defined in: [packages/engine/src/templates/character/components/CharacterComponent.ts:110](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/templates/character/components/CharacterComponent.ts#L110)

___

### canFindVehiclesToEnter

• **canFindVehiclesToEnter**: *boolean*

Defined in: [packages/engine/src/templates/character/components/CharacterComponent.ts:109](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/templates/character/components/CharacterComponent.ts#L109)

___

### canLeaveVehicles

• **canLeaveVehicles**: *boolean*

Defined in: [packages/engine/src/templates/character/components/CharacterComponent.ts:111](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/templates/character/components/CharacterComponent.ts#L111)

___

### capsuleFriction

• **capsuleFriction**: *number*= 0.1

Defined in: [packages/engine/src/templates/character/components/CharacterComponent.ts:84](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/templates/character/components/CharacterComponent.ts#L84)

___

### capsulePosition

• **capsulePosition**: *Vec3*

Defined in: [packages/engine/src/templates/character/components/CharacterComponent.ts:85](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/templates/character/components/CharacterComponent.ts#L85)

___

### capsuleRadius

• **capsuleRadius**: *number*= 0.25

Defined in: [packages/engine/src/templates/character/components/CharacterComponent.ts:82](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/templates/character/components/CharacterComponent.ts#L82)

___

### capsuleSegments

• **capsuleSegments**: *number*= 8

Defined in: [packages/engine/src/templates/character/components/CharacterComponent.ts:83](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/templates/character/components/CharacterComponent.ts#L83)

___

### changedViewAngle

• **changedViewAngle**: *number*= 0

Defined in: [packages/engine/src/templates/character/components/CharacterComponent.ts:75](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/templates/character/components/CharacterComponent.ts#L75)

___

### controlledObject

• **controlledObject**: *any*

Defined in: [packages/engine/src/templates/character/components/CharacterComponent.ts:103](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/templates/character/components/CharacterComponent.ts#L103)

___

### currentAnimationAction

• **currentAnimationAction**: *any*[]

Defined in: [packages/engine/src/templates/character/components/CharacterComponent.ts:28](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/templates/character/components/CharacterComponent.ts#L28)

___

### currentAnimationLength

• **currentAnimationLength**: *number*= 0

Defined in: [packages/engine/src/templates/character/components/CharacterComponent.ts:29](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/templates/character/components/CharacterComponent.ts#L29)

___

### currentInputHash

• **currentInputHash**: *any*= ""

Defined in: [packages/engine/src/templates/character/components/CharacterComponent.ts:59](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/templates/character/components/CharacterComponent.ts#L59)

___

### defaultRotationSimulatorDamping

• **defaultRotationSimulatorDamping**: *number*= 0.5

Defined in: [packages/engine/src/templates/character/components/CharacterComponent.ts:71](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/templates/character/components/CharacterComponent.ts#L71)

___

### defaultRotationSimulatorMass

• **defaultRotationSimulatorMass**: *number*= 10

Defined in: [packages/engine/src/templates/character/components/CharacterComponent.ts:72](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/templates/character/components/CharacterComponent.ts#L72)

___

### defaultVelocitySimulatorDamping

• **defaultVelocitySimulatorDamping**: *number*= 0.8

Defined in: [packages/engine/src/templates/character/components/CharacterComponent.ts:61](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/templates/character/components/CharacterComponent.ts#L61)

___

### defaultVelocitySimulatorMass

• **defaultVelocitySimulatorMass**: *number*= 50

Defined in: [packages/engine/src/templates/character/components/CharacterComponent.ts:62](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/templates/character/components/CharacterComponent.ts#L62)

___

### entity

• **entity**: *any*= ""

The "entity" this component is attached to.

Inherited from: [Component](ecs_classes_component.component.md).[entity](ecs_classes_component.component.md#entity)

Defined in: [packages/engine/src/ecs/classes/Component.ts:39](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/classes/Component.ts#L39)

___

### groundImpactVelocity

• **groundImpactVelocity**: *any*

Defined in: [packages/engine/src/templates/character/components/CharacterComponent.ts:101](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/templates/character/components/CharacterComponent.ts#L101)

___

### height

• **height**: *number*= 0

Defined in: [packages/engine/src/templates/character/components/CharacterComponent.ts:34](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/templates/character/components/CharacterComponent.ts#L34)

___

### initJumpSpeed

• **initJumpSpeed**: *number*= -1

Defined in: [packages/engine/src/templates/character/components/CharacterComponent.ts:98](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/templates/character/components/CharacterComponent.ts#L98)

___

### initialized

• **initialized**: *boolean*= false

Defined in: [packages/engine/src/templates/character/components/CharacterComponent.ts:24](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/templates/character/components/CharacterComponent.ts#L24)

___

### localMovementDirection

• **localMovementDirection**: *any*

desired moving direction from user inputs

Defined in: [packages/engine/src/templates/character/components/CharacterComponent.ts:48](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/templates/character/components/CharacterComponent.ts#L48)

___

### materials

• **materials**: *any*[]

Defined in: [packages/engine/src/templates/character/components/CharacterComponent.ts:37](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/templates/character/components/CharacterComponent.ts#L37)

___

### mixer

• **mixer**: *any*

Defined in: [packages/engine/src/templates/character/components/CharacterComponent.ts:39](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/templates/character/components/CharacterComponent.ts#L39)

___

### modelContainer

• **modelContainer**: *any*

Defined in: [packages/engine/src/templates/character/components/CharacterComponent.ts:36](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/templates/character/components/CharacterComponent.ts#L36)

___

### moveSpeed

• **moveSpeed**: *number*

Defined in: [packages/engine/src/templates/character/components/CharacterComponent.ts:66](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/templates/character/components/CharacterComponent.ts#L66)

___

### moveVectorSmooth

• **moveVectorSmooth**: [*VectorSpringSimulator*](physics_classes_vectorspringsimulator.vectorspringsimulator.md)

Defined in: [packages/engine/src/templates/character/components/CharacterComponent.ts:65](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/templates/character/components/CharacterComponent.ts#L65)

___

### movementEnabled

• **movementEnabled**: *boolean*= false

Defined in: [packages/engine/src/templates/character/components/CharacterComponent.ts:23](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/templates/character/components/CharacterComponent.ts#L23)

___

### name

• **name**: *any*= ""

The name of the component instance, derived from the class name.

Inherited from: [Component](ecs_classes_component.component.md).[name](ecs_classes_component.component.md#name)

Defined in: [packages/engine/src/ecs/classes/Component.ts:34](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/classes/Component.ts#L34)

___

### occupyingSeat

• **occupyingSeat**: *any*

Defined in: [packages/engine/src/templates/character/components/CharacterComponent.ts:107](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/templates/character/components/CharacterComponent.ts#L107)

___

### orientation

• **orientation**: *any*

Defined in: [packages/engine/src/templates/character/components/CharacterComponent.ts:69](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/templates/character/components/CharacterComponent.ts#L69)

___

### orientationTarget

• **orientationTarget**: *any*

Defined in: [packages/engine/src/templates/character/components/CharacterComponent.ts:70](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/templates/character/components/CharacterComponent.ts#L70)

___

### otherPlayerMaxSpeedCount

• **otherPlayerMaxSpeedCount**: *number*= 0

Defined in: [packages/engine/src/templates/character/components/CharacterComponent.ts:67](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/templates/character/components/CharacterComponent.ts#L67)

___

### physicsEnabled

• **physicsEnabled**: *boolean*= true

Defined in: [packages/engine/src/templates/character/components/CharacterComponent.ts:43](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/templates/character/components/CharacterComponent.ts#L43)

___

### playerInPortal

• **playerInPortal**: *number*= 0

Defined in: [packages/engine/src/templates/character/components/CharacterComponent.ts:99](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/templates/character/components/CharacterComponent.ts#L99)

___

### quaternion

• **quaternion**: *any*

Defined in: [packages/engine/src/templates/character/components/CharacterComponent.ts:108](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/templates/character/components/CharacterComponent.ts#L108)

___

### rayCastLength

• **rayCastLength**: *number*= 0.85

Defined in: [packages/engine/src/templates/character/components/CharacterComponent.ts:95](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/templates/character/components/CharacterComponent.ts#L95)

___

### rayDontStuckX

• **rayDontStuckX**: *RaycastResult*

Defined in: [packages/engine/src/templates/character/components/CharacterComponent.ts:88](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/templates/character/components/CharacterComponent.ts#L88)

___

### rayDontStuckXm

• **rayDontStuckXm**: *RaycastResult*

Defined in: [packages/engine/src/templates/character/components/CharacterComponent.ts:90](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/templates/character/components/CharacterComponent.ts#L90)

___

### rayDontStuckZ

• **rayDontStuckZ**: *RaycastResult*

Defined in: [packages/engine/src/templates/character/components/CharacterComponent.ts:89](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/templates/character/components/CharacterComponent.ts#L89)

___

### rayDontStuckZm

• **rayDontStuckZm**: *RaycastResult*

Defined in: [packages/engine/src/templates/character/components/CharacterComponent.ts:91](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/templates/character/components/CharacterComponent.ts#L91)

___

### rayGroundHit

• **rayGroundHit**: *boolean*= false

Defined in: [packages/engine/src/templates/character/components/CharacterComponent.ts:93](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/templates/character/components/CharacterComponent.ts#L93)

___

### rayGroundY

• **rayGroundY**: *any*= null

Defined in: [packages/engine/src/templates/character/components/CharacterComponent.ts:94](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/templates/character/components/CharacterComponent.ts#L94)

___

### rayHasHit

• **rayHasHit**: *boolean*= false

Defined in: [packages/engine/src/templates/character/components/CharacterComponent.ts:92](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/templates/character/components/CharacterComponent.ts#L92)

___

### rayResult

• **rayResult**: *RaycastResult*

Defined in: [packages/engine/src/templates/character/components/CharacterComponent.ts:87](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/templates/character/components/CharacterComponent.ts#L87)

___

### raySafeOffset

• **raySafeOffset**: *number*= 0.03

Defined in: [packages/engine/src/templates/character/components/CharacterComponent.ts:96](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/templates/character/components/CharacterComponent.ts#L96)

___

### raycastBox

• **raycastBox**: *any*

Defined in: [packages/engine/src/templates/character/components/CharacterComponent.ts:105](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/templates/character/components/CharacterComponent.ts#L105)

___

### rotationSimulator

• **rotationSimulator**: [*RelativeSpringSimulator*](physics_classes_springsimulator.relativespringsimulator.md)

Defined in: [packages/engine/src/templates/character/components/CharacterComponent.ts:73](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/templates/character/components/CharacterComponent.ts#L73)

___

### rotationSpeed

• **rotationSpeed**: *any*

Defined in: [packages/engine/src/templates/character/components/CharacterComponent.ts:113](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/templates/character/components/CharacterComponent.ts#L113)

___

### state

• **state**: *number*= 0

Defined in: [packages/engine/src/templates/character/components/CharacterComponent.ts:25](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/templates/character/components/CharacterComponent.ts#L25)

___

### tiltContainer

• **tiltContainer**: *any*

Defined in: [packages/engine/src/templates/character/components/CharacterComponent.ts:35](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/templates/character/components/CharacterComponent.ts#L35)

___

### timer

• **timer**: *number*= 0

Defined in: [packages/engine/src/templates/character/components/CharacterComponent.ts:30](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/templates/character/components/CharacterComponent.ts#L30)

___

### vehicleEntryInstance

• **vehicleEntryInstance**: *any*

Defined in: [packages/engine/src/templates/character/components/CharacterComponent.ts:106](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/templates/character/components/CharacterComponent.ts#L106)

___

### velocity

• **velocity**: *any*

this needs to be multiplied by moveSpeed to get real speed;
probably does not represent real physics speed

Defined in: [packages/engine/src/templates/character/components/CharacterComponent.ts:54](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/templates/character/components/CharacterComponent.ts#L54)

___

### velocitySimulator

• **velocitySimulator**: [*VectorSpringSimulator*](physics_classes_vectorspringsimulator.vectorspringsimulator.md)

Defined in: [packages/engine/src/templates/character/components/CharacterComponent.ts:63](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/templates/character/components/CharacterComponent.ts#L63)

___

### velocityTarget

• **velocityTarget**: *any*

Defined in: [packages/engine/src/templates/character/components/CharacterComponent.ts:56](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/templates/character/components/CharacterComponent.ts#L56)

___

### viewVector

• **viewVector**: *any*

Defined in: [packages/engine/src/templates/character/components/CharacterComponent.ts:74](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/templates/character/components/CharacterComponent.ts#L74)

___

### visible

• **visible**: *boolean*= true

Defined in: [packages/engine/src/templates/character/components/CharacterComponent.ts:38](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/templates/character/components/CharacterComponent.ts#L38)

___

### wantsToJump

• **wantsToJump**: *boolean*= false

Defined in: [packages/engine/src/templates/character/components/CharacterComponent.ts:97](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/templates/character/components/CharacterComponent.ts#L97)

___

### \_schema

▪ `Static` **\_schema**: [*ComponentSchema*](../interfaces/ecs_interfaces_componentinterfaces.componentschema.md)

Defines the attributes and attribute types on the constructed component class.\
All component variables should be reflected in the component schema.

Inherited from: [Component](ecs_classes_component.component.md).[_schema](ecs_classes_component.component.md#_schema)

Defined in: [packages/engine/src/ecs/classes/Component.ts:13](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/classes/Component.ts#L13)

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

**Returns:** *void*

Overrides: [Component](ecs_classes_component.component.md)

Defined in: [packages/engine/src/templates/character/components/CharacterComponent.ts:17](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/templates/character/components/CharacterComponent.ts#L17)

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
