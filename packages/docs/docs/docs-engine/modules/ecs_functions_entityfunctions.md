---
id: "ecs_functions_entityfunctions"
title: "Module: ecs/functions/EntityFunctions"
sidebar_label: "ecs/functions/EntityFunctions"
custom_edit_url: null
hide_title: true
---

# Module: ecs/functions/EntityFunctions

## Functions

### addComponent

▸ **addComponent**<C\>(`entity`: [*Entity*](../classes/ecs_classes_entity.entity.md), `Component`: [*ComponentConstructor*](../interfaces/ecs_interfaces_componentinterfaces.componentconstructor.md)<C\>, `values?`: *Partial*<Omit<C, keyof [*Component*](../classes/ecs_classes_component.component.md)<C\>\>\>): [*Component*](../classes/ecs_classes_component.component.md)<C\>

Add a component to an entity.

#### Type parameters:

Name | Type |
:------ | :------ |
`C` | [*Component*](../classes/ecs_classes_component.component.md)<C, C\> |

#### Parameters:

Name | Type | Description |
:------ | :------ | :------ |
`entity` | [*Entity*](../classes/ecs_classes_entity.entity.md) | Entity.   |
`Component` | [*ComponentConstructor*](../interfaces/ecs_interfaces_componentinterfaces.componentconstructor.md)<C\> | Type of component which will be added.   |
`values?` | *Partial*<Omit<C, keyof [*Component*](../classes/ecs_classes_component.component.md)<C\>\>\> | values to be passed to the component constructor.   |

**Returns:** [*Component*](../classes/ecs_classes_component.component.md)<C\>

The component added to the entity.

Defined in: [packages/engine/src/ecs/functions/EntityFunctions.ts:91](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/functions/EntityFunctions.ts#L91)

___

### createEntity

▸ **createEntity**(): [*Entity*](../classes/ecs_classes_entity.entity.md)

Create a new entity.

**Returns:** [*Entity*](../classes/ecs_classes_entity.entity.md)

Newly created entity.

Defined in: [packages/engine/src/ecs/functions/EntityFunctions.ts:271](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/functions/EntityFunctions.ts#L271)

___

### getComponent

▸ **getComponent**<C\>(`entity`: [*Entity*](../classes/ecs_classes_entity.entity.md), `component`: [*ComponentConstructor*](../interfaces/ecs_interfaces_componentinterfaces.componentconstructor.md)<C\>, `includeRemoved?`: *boolean*): *Readonly*<C\>

Get a component from the entity

#### Type parameters:

Name | Type |
:------ | :------ |
`C` | [*Component*](../classes/ecs_classes_component.component.md)<C, C\> |

#### Parameters:

Name | Type | Description |
:------ | :------ | :------ |
`entity` | [*Entity*](../classes/ecs_classes_entity.entity.md) | Entity to be searched.   |
`component` | [*ComponentConstructor*](../interfaces/ecs_interfaces_componentinterfaces.componentconstructor.md)<C\> | Type of the component to be returned.   |
`includeRemoved?` | *boolean* | Include Components from [Entity.componentsToRemove](../classes/ecs_classes_entity.entity.md#componentstoremove).   |

**Returns:** *Readonly*<C\>

Component.

Defined in: [packages/engine/src/ecs/functions/EntityFunctions.ts:344](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/functions/EntityFunctions.ts#L344)

___

### getComponentTypes

▸ **getComponentTypes**(`entity`: [*Entity*](../classes/ecs_classes_entity.entity.md)): [*Component*](../classes/ecs_classes_component.component.md)<any\>[]

#### Parameters:

Name | Type | Description |
:------ | :------ | :------ |
`entity` | [*Entity*](../classes/ecs_classes_entity.entity.md) | Entity to get component types.   |

**Returns:** [*Component*](../classes/ecs_classes_component.component.md)<any\>[]

An array of component types on this entity.

Defined in: [packages/engine/src/ecs/functions/EntityFunctions.ts:79](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/functions/EntityFunctions.ts#L79)

___

### getComponents

▸ **getComponents**(`entity`: [*Entity*](../classes/ecs_classes_entity.entity.md)): *object*

#### Parameters:

Name | Type | Description |
:------ | :------ | :------ |
`entity` | [*Entity*](../classes/ecs_classes_entity.entity.md) | Entity to get components.   |

**Returns:** *object*

An object with all components on the entity, keyed by component name.

Defined in: [packages/engine/src/ecs/functions/EntityFunctions.ts:63](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/functions/EntityFunctions.ts#L63)

___

### getComponentsToRemove

▸ **getComponentsToRemove**(`entity`: [*Entity*](../classes/ecs_classes_entity.entity.md)): *object*

#### Parameters:

Name | Type | Description |
:------ | :------ | :------ |
`entity` | [*Entity*](../classes/ecs_classes_entity.entity.md) | Entity to get removed component.   |

**Returns:** *object*

All components that are going to be removed from the entity and sent back to the pool at the end of this frame.

Defined in: [packages/engine/src/ecs/functions/EntityFunctions.ts:71](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/functions/EntityFunctions.ts#L71)

___

### getEntityByID

▸ **getEntityByID**(`id`: *number*): [*Entity*](../classes/ecs_classes_entity.entity.md)

Get an entity by it's locally assigned unique ID

#### Parameters:

Name | Type |
:------ | :------ |
`id` | *number* |

**Returns:** [*Entity*](../classes/ecs_classes_entity.entity.md)

Entity.

Defined in: [packages/engine/src/ecs/functions/EntityFunctions.ts:364](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/functions/EntityFunctions.ts#L364)

___

### getMutableComponent

▸ **getMutableComponent**<C\>(`entity`: [*Entity*](../classes/ecs_classes_entity.entity.md), `Component`: [*ComponentConstructor*](../interfaces/ecs_interfaces_componentinterfaces.componentconstructor.md)<C\>): C

Get direct access to component data to modify.\
This will add the entity to any querying system's onChanged result.

#### Type parameters:

Name | Type |
:------ | :------ |
`C` | [*Component*](../classes/ecs_classes_component.component.md)<C, C\> |

#### Parameters:

Name | Type | Description |
:------ | :------ | :------ |
`entity` | [*Entity*](../classes/ecs_classes_entity.entity.md) | Entity.   |
`Component` | [*ComponentConstructor*](../interfaces/ecs_interfaces_componentinterfaces.componentconstructor.md)<C\> | - |

**Returns:** C

Defined in: [packages/engine/src/ecs/functions/EntityFunctions.ts:21](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/functions/EntityFunctions.ts#L21)

___

### getRemovedComponent

▸ **getRemovedComponent**<C\>(`entity`: [*Entity*](../classes/ecs_classes_entity.entity.md), `Component`: [*ComponentConstructor*](../interfaces/ecs_interfaces_componentinterfaces.componentconstructor.md)<C\>): *Readonly*<C\>

Get a component that has been removed from the entity but hasn't been removed this frame.\
This will only work if [Engine.deferredRemovalEnabled](../classes/ecs_classes_engine.engine.md#deferredremovalenabled) is true in the engine (it is by default).

#### Type parameters:

Name | Type |
:------ | :------ |
`C` | [*Component*](../classes/ecs_classes_component.component.md)<C, C\> |

#### Parameters:

Name | Type | Description |
:------ | :------ | :------ |
`entity` | [*Entity*](../classes/ecs_classes_entity.entity.md) | Entity.   |
`Component` | [*ComponentConstructor*](../interfaces/ecs_interfaces_componentinterfaces.componentconstructor.md)<C\> | - |

**Returns:** *Readonly*<C\>

Removed component from the entity which hasn't been removed this frame.

Defined in: [packages/engine/src/ecs/functions/EntityFunctions.ts:50](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/functions/EntityFunctions.ts#L50)

___

### hasAllComponents

▸ **hasAllComponents**(`entity`: [*Entity*](../classes/ecs_classes_entity.entity.md), `Components`: [*ComponentConstructor*](../interfaces/ecs_interfaces_componentinterfaces.componentconstructor.md)<any\>[]): *boolean*

Check if an entity has aall component types in an array.

#### Parameters:

Name | Type | Description |
:------ | :------ | :------ |
`entity` | [*Entity*](../classes/ecs_classes_entity.entity.md) | Entity   |
`Components` | [*ComponentConstructor*](../interfaces/ecs_interfaces_componentinterfaces.componentconstructor.md)<any\>[] | Type of components to check.   |

**Returns:** *boolean*

True if the entity has all components.

Defined in: [packages/engine/src/ecs/functions/EntityFunctions.ts:246](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/functions/EntityFunctions.ts#L246)

___

### hasAnyComponents

▸ **hasAnyComponents**(`entity`: [*Entity*](../classes/ecs_classes_entity.entity.md), `Components`: [*ComponentConstructor*](../interfaces/ecs_interfaces_componentinterfaces.componentconstructor.md)<any\>[]): *boolean*

Check if an entity has any of the component types in an array.

#### Parameters:

Name | Type | Description |
:------ | :------ | :------ |
`entity` | [*Entity*](../classes/ecs_classes_entity.entity.md) | Entity.   |
`Components` | [*ComponentConstructor*](../interfaces/ecs_interfaces_componentinterfaces.componentconstructor.md)<any\>[] | Type of components to check.   |

**Returns:** *boolean*

True if the entity has any of the components.

Defined in: [packages/engine/src/ecs/functions/EntityFunctions.ts:260](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/functions/EntityFunctions.ts#L260)

___

### hasComponent

▸ **hasComponent**<C\>(`entity`: [*Entity*](../classes/ecs_classes_entity.entity.md), `Component`: [*ComponentConstructor*](../interfaces/ecs_interfaces_componentinterfaces.componentconstructor.md)<C\>, `includeRemoved?`: *boolean*): *boolean*

Check if an entity has a component type.

#### Type parameters:

Name | Type |
:------ | :------ |
`C` | [*Component*](../classes/ecs_classes_component.component.md)<C, C\> |

#### Parameters:

Name | Type | Description |
:------ | :------ | :------ |
`entity` | [*Entity*](../classes/ecs_classes_entity.entity.md) | Entity being checked.   |
`Component` | [*ComponentConstructor*](../interfaces/ecs_interfaces_componentinterfaces.componentconstructor.md)<C\> | - |
`includeRemoved?` | *boolean* | Also check in [Entity.componentTypesToRemove](../classes/ecs_classes_entity.entity.md#componenttypestoremove).   |

**Returns:** *boolean*

True if the entity has the component.

Defined in: [packages/engine/src/ecs/functions/EntityFunctions.ts:215](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/functions/EntityFunctions.ts#L215)

___

### hasRemovedComponent

▸ **hasRemovedComponent**<C\>(`entity`: [*Entity*](../classes/ecs_classes_entity.entity.md), `Component`: [*ComponentConstructor*](../interfaces/ecs_interfaces_componentinterfaces.componentconstructor.md)<C\>): *boolean*

Check if an entity had a component type removed this frame.

#### Type parameters:

Name | Type |
:------ | :------ |
`C` | [*Component*](../classes/ecs_classes_component.component.md)<any, C\> |

#### Parameters:

Name | Type | Description |
:------ | :------ | :------ |
`entity` | [*Entity*](../classes/ecs_classes_entity.entity.md) | Entity.   |
`Component` | [*ComponentConstructor*](../interfaces/ecs_interfaces_componentinterfaces.componentconstructor.md)<C\> | - |

**Returns:** *boolean*

True if the entity had the component removed this frame.

Defined in: [packages/engine/src/ecs/functions/EntityFunctions.ts:233](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/functions/EntityFunctions.ts#L233)

___

### removeAllComponents

▸ **removeAllComponents**(`entity`: [*Entity*](../classes/ecs_classes_entity.entity.md), `immediately?`: *boolean*): *void*

Remove all components from an entity.

#### Parameters:

Name | Type | Description |
:------ | :------ | :------ |
`entity` | [*Entity*](../classes/ecs_classes_entity.entity.md) | Entity whose components will be removed.   |
`immediately?` | *boolean* | Remove immediately or wait for the frame to complete.    |

**Returns:** *void*

Defined in: [packages/engine/src/ecs/functions/EntityFunctions.ts:320](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/functions/EntityFunctions.ts#L320)

___

### removeAllEntities

▸ **removeAllEntities**(): *void*

Remove all entities from the simulation.

**Returns:** *void*

Defined in: [packages/engine/src/ecs/functions/EntityFunctions.ts:330](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/functions/EntityFunctions.ts#L330)

___

### removeComponent

▸ **removeComponent**<C\>(`entity`: [*Entity*](../classes/ecs_classes_entity.entity.md), `Component`: [*ComponentConstructor*](../interfaces/ecs_interfaces_componentinterfaces.componentconstructor.md)<C\>, `forceImmediate?`: *boolean*): [*Component*](../classes/ecs_classes_component.component.md)<C\>

Remove a component from an entity.

#### Type parameters:

Name | Type |
:------ | :------ |
`C` | [*Component*](../classes/ecs_classes_component.component.md)<C, C\> |

#### Parameters:

Name | Type | Description |
:------ | :------ | :------ |
`entity` | [*Entity*](../classes/ecs_classes_entity.entity.md) | Entity.   |
`Component` | [*ComponentConstructor*](../interfaces/ecs_interfaces_componentinterfaces.componentconstructor.md)<C\> | Type of component which will be removed.   |
`forceImmediate?` | *boolean* | Remove immediately or wait for the frame to complete.   |

**Returns:** [*Component*](../classes/ecs_classes_component.component.md)<C\>

The component removed from the entity (you probably don't need this).

Defined in: [packages/engine/src/ecs/functions/EntityFunctions.ts:154](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/functions/EntityFunctions.ts#L154)

___

### removeEntity

▸ **removeEntity**(`entity`: [*Entity*](../classes/ecs_classes_entity.entity.md), `immediately?`: *boolean*): *void*

Remove the entity from the simulation and return it to the pool.

#### Parameters:

Name | Type | Description |
:------ | :------ | :------ |
`entity` | [*Entity*](../classes/ecs_classes_entity.entity.md) | Entity which will be removed.   |
`immediately?` | *boolean* | Remove immediately or wait for the frame to complete.    |

**Returns:** *void*

Defined in: [packages/engine/src/ecs/functions/EntityFunctions.ts:285](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/functions/EntityFunctions.ts#L285)
