---
id: "templates_vehicle_components_vehiclecomponent.vehiclecomponent"
title: "Class: VehicleComponent"
sidebar_label: "VehicleComponent"
custom_edit_url: null
hide_title: true
---

# Class: VehicleComponent

[templates/vehicle/components/VehicleComponent](../modules/templates_vehicle_components_vehiclecomponent.md).VehicleComponent

## Hierarchy

* [*Component*](ecs_classes_component.component.md)<[*VehicleComponent*](templates_vehicle_components_vehiclecomponent.vehiclecomponent.md)\>

  ↳ **VehicleComponent**

## Constructors

### constructor

\+ **new VehicleComponent**(`props?`: *false* \| *Partial*<Omit<[*VehicleComponent*](templates_vehicle_components_vehiclecomponent.vehiclecomponent.md), keyof [*Component*](ecs_classes_component.component.md)<any\>\>\>): [*VehicleComponent*](templates_vehicle_components_vehiclecomponent.vehiclecomponent.md)

Component class constructor.

#### Parameters:

Name | Type |
:------ | :------ |
`props?` | *false* \| *Partial*<Omit<[*VehicleComponent*](templates_vehicle_components_vehiclecomponent.vehiclecomponent.md), keyof [*Component*](ecs_classes_component.component.md)<any\>\>\> |

**Returns:** [*VehicleComponent*](templates_vehicle_components_vehiclecomponent.vehiclecomponent.md)

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

### addShapeArray

• **addShapeArray**: *any*

Defined in: [packages/engine/src/templates/vehicle/components/VehicleComponent.ts:17](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/templates/vehicle/components/VehicleComponent.ts#L17)

___

### arrayWheelsMesh

• **arrayWheelsMesh**: *any*

Defined in: [packages/engine/src/templates/vehicle/components/VehicleComponent.ts:26](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/templates/vehicle/components/VehicleComponent.ts#L26)

___

### arrayWheelsPosition

• **arrayWheelsPosition**: *any*

Defined in: [packages/engine/src/templates/vehicle/components/VehicleComponent.ts:27](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/templates/vehicle/components/VehicleComponent.ts#L27)

___

### brakeForce

• **brakeForce**: *number*= 1000000

Defined in: [packages/engine/src/templates/vehicle/components/VehicleComponent.ts:38](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/templates/vehicle/components/VehicleComponent.ts#L38)

___

### colliderTrimOffset

• **colliderTrimOffset**: *Vec3*

Defined in: [packages/engine/src/templates/vehicle/components/VehicleComponent.ts:23](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/templates/vehicle/components/VehicleComponent.ts#L23)

___

### collidersSphereOffset

• **collidersSphereOffset**: *Vec3*

Defined in: [packages/engine/src/templates/vehicle/components/VehicleComponent.ts:24](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/templates/vehicle/components/VehicleComponent.ts#L24)

___

### driver

• **driver**: *number*

Defined in: [packages/engine/src/templates/vehicle/components/VehicleComponent.ts:10](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/templates/vehicle/components/VehicleComponent.ts#L10)

___

### entity

• **entity**: *any*= ""

The "entity" this component is attached to.

Inherited from: [Component](ecs_classes_component.component.md).[entity](ecs_classes_component.component.md#entity)

Defined in: [packages/engine/src/ecs/classes/Component.ts:39](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/classes/Component.ts#L39)

___

### entrancesArray

• **entrancesArray**: *any*

Defined in: [packages/engine/src/templates/vehicle/components/VehicleComponent.ts:30](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/templates/vehicle/components/VehicleComponent.ts#L30)

___

### isMoved

• **isMoved**: *boolean*

Defined in: [packages/engine/src/templates/vehicle/components/VehicleComponent.ts:33](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/templates/vehicle/components/VehicleComponent.ts#L33)

___

### mass

• **mass**: *number*

Defined in: [packages/engine/src/templates/vehicle/components/VehicleComponent.ts:39](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/templates/vehicle/components/VehicleComponent.ts#L39)

___

### maxForce

• **maxForce**: *number*= 300

Defined in: [packages/engine/src/templates/vehicle/components/VehicleComponent.ts:37](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/templates/vehicle/components/VehicleComponent.ts#L37)

___

### maxSteerVal

• **maxSteerVal**: *number*= 0.5

Defined in: [packages/engine/src/templates/vehicle/components/VehicleComponent.ts:36](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/templates/vehicle/components/VehicleComponent.ts#L36)

___

### name

• **name**: *any*= ""

The name of the component instance, derived from the class name.

Inherited from: [Component](ecs_classes_component.component.md).[name](ecs_classes_component.component.md#name)

Defined in: [packages/engine/src/ecs/classes/Component.ts:34](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/classes/Component.ts#L34)

___

### passenger

• **passenger**: *number*

Defined in: [packages/engine/src/templates/vehicle/components/VehicleComponent.ts:9](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/templates/vehicle/components/VehicleComponent.ts#L9)

___

### seatPlane

• **seatPlane**: *any*

Defined in: [packages/engine/src/templates/vehicle/components/VehicleComponent.ts:11](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/templates/vehicle/components/VehicleComponent.ts#L11)

___

### seatsArray

• **seatsArray**: *any*

Defined in: [packages/engine/src/templates/vehicle/components/VehicleComponent.ts:31](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/templates/vehicle/components/VehicleComponent.ts#L31)

___

### startPosition

• **startPosition**: *any*

Defined in: [packages/engine/src/templates/vehicle/components/VehicleComponent.ts:20](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/templates/vehicle/components/VehicleComponent.ts#L20)

___

### startQuaternion

• **startQuaternion**: *any*

Defined in: [packages/engine/src/templates/vehicle/components/VehicleComponent.ts:21](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/templates/vehicle/components/VehicleComponent.ts#L21)

___

### suspensionRestLength

• **suspensionRestLength**: *any*

Defined in: [packages/engine/src/templates/vehicle/components/VehicleComponent.ts:22](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/templates/vehicle/components/VehicleComponent.ts#L22)

___

### vehicle

• **vehicle**: *RaycastVehicle*

Defined in: [packages/engine/src/templates/vehicle/components/VehicleComponent.ts:40](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/templates/vehicle/components/VehicleComponent.ts#L40)

___

### vehicleCollider

• **vehicleCollider**: *any*

Defined in: [packages/engine/src/templates/vehicle/components/VehicleComponent.ts:15](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/templates/vehicle/components/VehicleComponent.ts#L15)

___

### vehicleDoorsArray

• **vehicleDoorsArray**: *any*

Defined in: [packages/engine/src/templates/vehicle/components/VehicleComponent.ts:18](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/templates/vehicle/components/VehicleComponent.ts#L18)

___

### vehicleMesh

• **vehicleMesh**: *boolean*

Defined in: [packages/engine/src/templates/vehicle/components/VehicleComponent.ts:13](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/templates/vehicle/components/VehicleComponent.ts#L13)

___

### vehiclePhysics

• **vehiclePhysics**: *RaycastVehicle*

Defined in: [packages/engine/src/templates/vehicle/components/VehicleComponent.ts:14](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/templates/vehicle/components/VehicleComponent.ts#L14)

___

### vehicleSphereColliders

• **vehicleSphereColliders**: *any*

Defined in: [packages/engine/src/templates/vehicle/components/VehicleComponent.ts:16](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/templates/vehicle/components/VehicleComponent.ts#L16)

___

### wantsExit

• **wantsExit**: *any*

Defined in: [packages/engine/src/templates/vehicle/components/VehicleComponent.ts:8](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/templates/vehicle/components/VehicleComponent.ts#L8)

___

### wheelRadius

• **wheelRadius**: *number*

Defined in: [packages/engine/src/templates/vehicle/components/VehicleComponent.ts:28](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/templates/vehicle/components/VehicleComponent.ts#L28)

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
