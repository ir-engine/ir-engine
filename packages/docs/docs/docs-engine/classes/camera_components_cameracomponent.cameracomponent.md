---
id: "camera_components_cameracomponent.cameracomponent"
title: "Class: CameraComponent"
sidebar_label: "CameraComponent"
custom_edit_url: null
hide_title: true
---

# Class: CameraComponent

[camera/components/CameraComponent](../modules/camera_components_cameracomponent.md).CameraComponent

Component class for Camera.

## Hierarchy

* [*Component*](ecs_classes_component.component.md)<any\>

  ↳ **CameraComponent**

## Constructors

### constructor

\+ **new CameraComponent**(): [*CameraComponent*](camera_components_cameracomponent.cameracomponent.md)

Constructs Camera Component.

**Returns:** [*CameraComponent*](camera_components_cameracomponent.cameracomponent.md)

Overrides: [Component](ecs_classes_component.component.md)

Defined in: [packages/engine/src/camera/components/CameraComponent.ts:27](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/camera/components/CameraComponent.ts#L27)

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

### aspect

• **aspect**: *number*

Aspect Ration - Width / Height

Defined in: [packages/engine/src/camera/components/CameraComponent.ts:17](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/camera/components/CameraComponent.ts#L17)

___

### entity

• **entity**: [*Entity*](ecs_classes_entity.entity.md)= null

Entity object for this component.

Overrides: [Component](ecs_classes_component.component.md).[entity](ecs_classes_component.component.md#entity)

Defined in: [packages/engine/src/camera/components/CameraComponent.ts:27](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/camera/components/CameraComponent.ts#L27)

___

### far

• **far**: *number*

Geometry farther than this gets removed.

Defined in: [packages/engine/src/camera/components/CameraComponent.ts:21](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/camera/components/CameraComponent.ts#L21)

___

### followTarget

• **followTarget**: *any*= null

Reference to the object that should be followed.

Defined in: [packages/engine/src/camera/components/CameraComponent.ts:13](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/camera/components/CameraComponent.ts#L13)

___

### fov

• **fov**: *number*

Field of view.

Defined in: [packages/engine/src/camera/components/CameraComponent.ts:15](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/camera/components/CameraComponent.ts#L15)

___

### handleResize

• **handleResize**: *boolean*

Should the camera resize if the window does?

Defined in: [packages/engine/src/camera/components/CameraComponent.ts:25](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/camera/components/CameraComponent.ts#L25)

___

### layers

• **layers**: *number*

Bitmask of layers the camera can see, converted to an int.

Defined in: [packages/engine/src/camera/components/CameraComponent.ts:23](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/camera/components/CameraComponent.ts#L23)

___

### name

• **name**: *any*= ""

The name of the component instance, derived from the class name.

Inherited from: [Component](ecs_classes_component.component.md).[name](ecs_classes_component.component.md#name)

Defined in: [packages/engine/src/ecs/classes/Component.ts:34](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/classes/Component.ts#L34)

___

### near

• **near**: *number*

Geometry closer than this gets removed.

Defined in: [packages/engine/src/camera/components/CameraComponent.ts:19](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/camera/components/CameraComponent.ts#L19)

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

___

### instance

▪ `Static` **instance**: [*CameraComponent*](camera_components_cameracomponent.cameracomponent.md)= null

Static instance of the camera.

Defined in: [packages/engine/src/camera/components/CameraComponent.ts:10](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/camera/components/CameraComponent.ts#L10)

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

Dispose the component.

**Returns:** *void*

Overrides: [Component](ecs_classes_component.component.md)

Defined in: [packages/engine/src/camera/components/CameraComponent.ts:36](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/camera/components/CameraComponent.ts#L36)

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
