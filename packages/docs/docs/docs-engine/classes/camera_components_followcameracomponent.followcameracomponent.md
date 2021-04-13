---
id: "camera_components_followcameracomponent.followcameracomponent"
title: "Class: FollowCameraComponent"
sidebar_label: "FollowCameraComponent"
custom_edit_url: null
hide_title: true
---

# Class: FollowCameraComponent

[camera/components/FollowCameraComponent](../modules/camera_components_followcameracomponent.md).FollowCameraComponent

The component is added to any entity and hangs the camera watching it.

## Hierarchy

* [*Component*](ecs_classes_component.component.md)<[*FollowCameraComponent*](camera_components_followcameracomponent.followcameracomponent.md)\>

  ↳ **FollowCameraComponent**

## Constructors

### constructor

\+ **new FollowCameraComponent**(`props?`: *false* \| *Partial*<Omit<[*FollowCameraComponent*](camera_components_followcameracomponent.followcameracomponent.md), keyof [*Component*](ecs_classes_component.component.md)<any\>\>\>): [*FollowCameraComponent*](camera_components_followcameracomponent.followcameracomponent.md)

Component class constructor.

#### Parameters:

Name | Type |
:------ | :------ |
`props?` | *false* \| *Partial*<Omit<[*FollowCameraComponent*](camera_components_followcameracomponent.followcameracomponent.md), keyof [*Component*](ecs_classes_component.component.md)<any\>\>\> |

**Returns:** [*FollowCameraComponent*](camera_components_followcameracomponent.followcameracomponent.md)

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

### distance

• **distance**: *number*

**Default** value is 3.

Defined in: [packages/engine/src/camera/components/FollowCameraComponent.ts:12](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/camera/components/FollowCameraComponent.ts#L12)

___

### entity

• **entity**: *any*= ""

The "entity" this component is attached to.

Inherited from: [Component](ecs_classes_component.component.md).[entity](ecs_classes_component.component.md#entity)

Defined in: [packages/engine/src/ecs/classes/Component.ts:39](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/classes/Component.ts#L39)

___

### farDistance

• **farDistance**: *number*

Distance to which interactive objects from the camera will be highlighted. **Default** value is 5.

Defined in: [packages/engine/src/camera/components/FollowCameraComponent.ts:31](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/camera/components/FollowCameraComponent.ts#L31)

___

### locked

• **locked**: *boolean*

Whether the camera auto-rotates toward the target **Default** value is true.

Defined in: [packages/engine/src/camera/components/FollowCameraComponent.ts:41](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/camera/components/FollowCameraComponent.ts#L41)

___

### maxDistance

• **maxDistance**: *number*

**Default** value is 7.

Defined in: [packages/engine/src/camera/components/FollowCameraComponent.ts:16](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/camera/components/FollowCameraComponent.ts#L16)

___

### minDistance

• **minDistance**: *number*

**Default** value is 2.

Defined in: [packages/engine/src/camera/components/FollowCameraComponent.ts:14](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/camera/components/FollowCameraComponent.ts#L14)

___

### mode

• **mode**: *string*

**Default** value is ```'thirdPerson'```.

Defined in: [packages/engine/src/camera/components/FollowCameraComponent.ts:10](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/camera/components/FollowCameraComponent.ts#L10)

___

### name

• **name**: *any*= ""

The name of the component instance, derived from the class name.

Inherited from: [Component](ecs_classes_component.component.md).[name](ecs_classes_component.component.md#name)

Defined in: [packages/engine/src/ecs/classes/Component.ts:34](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/classes/Component.ts#L34)

___

### offset

• **offset**: *any*

Stores the shoulder offset amount

Defined in: [packages/engine/src/camera/components/FollowCameraComponent.ts:33](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/camera/components/FollowCameraComponent.ts#L33)

___

### phi

• **phi**: *number*

Rotation around Z axis

Defined in: [packages/engine/src/camera/components/FollowCameraComponent.ts:37](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/camera/components/FollowCameraComponent.ts#L37)

___

### rayHasHit

• **rayHasHit**: *boolean*= false

Camera physics raycast has hit

Defined in: [packages/engine/src/camera/components/FollowCameraComponent.ts:45](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/camera/components/FollowCameraComponent.ts#L45)

___

### rayResult

• **rayResult**: *RaycastResult*

Camera physics raycast data

Defined in: [packages/engine/src/camera/components/FollowCameraComponent.ts:43](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/camera/components/FollowCameraComponent.ts#L43)

___

### raycastBoxOn

• **raycastBoxOn**: *boolean*

**Default** value is ```true```.

Defined in: [packages/engine/src/camera/components/FollowCameraComponent.ts:18](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/camera/components/FollowCameraComponent.ts#L18)

___

### rx1

• **rx1**: *number*

First right x point of screen, two-dimensional square on the screen, hitting which the interactive objects are highlighted.\
**Default** value is -0.1.

Defined in: [packages/engine/src/camera/components/FollowCameraComponent.ts:23](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/camera/components/FollowCameraComponent.ts#L23)

___

### rx2

• **rx2**: *number*

Second right x point of screen. **Default** value is 0.1.

Defined in: [packages/engine/src/camera/components/FollowCameraComponent.ts:27](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/camera/components/FollowCameraComponent.ts#L27)

___

### ry1

• **ry1**: *number*

First right y point of screen. **Default** value is -0.1.

Defined in: [packages/engine/src/camera/components/FollowCameraComponent.ts:25](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/camera/components/FollowCameraComponent.ts#L25)

___

### ry2

• **ry2**: *number*

Second right y point of screen. **Default** value is 0.1.

Defined in: [packages/engine/src/camera/components/FollowCameraComponent.ts:29](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/camera/components/FollowCameraComponent.ts#L29)

___

### shoulderSide

• **shoulderSide**: *boolean*

Whether looking over left or right shoulder

Defined in: [packages/engine/src/camera/components/FollowCameraComponent.ts:39](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/camera/components/FollowCameraComponent.ts#L39)

___

### theta

• **theta**: *number*

Rotation around Y axis

Defined in: [packages/engine/src/camera/components/FollowCameraComponent.ts:35](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/camera/components/FollowCameraComponent.ts#L35)

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

Put the component back into it's component pool.
Called when component is removed from an entity.

**Returns:** *void*

Inherited from: [Component](ecs_classes_component.component.md)

Defined in: [packages/engine/src/ecs/classes/Component.ts:125](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/classes/Component.ts#L125)

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
