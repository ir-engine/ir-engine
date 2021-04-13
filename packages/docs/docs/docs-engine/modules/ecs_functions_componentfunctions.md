---
id: "ecs_functions_componentfunctions"
title: "Module: ecs/functions/ComponentFunctions"
sidebar_label: "ecs/functions/ComponentFunctions"
custom_edit_url: null
hide_title: true
---

# Module: ecs/functions/ComponentFunctions

## Functions

### Not

▸ **Not**<C\>(`Component`: [*ComponentConstructor*](../interfaces/ecs_interfaces_componentinterfaces.componentconstructor.md)<C\>): [*NotComponent*](../interfaces/ecs_classes_system.notcomponent.md)<C\>

Use the Not function to negate a component.

#### Type parameters:

Name | Type |
:------ | :------ |
`C` | [*Component*](../classes/ecs_classes_component.component.md)<any, C\> |

#### Parameters:

Name | Type |
:------ | :------ |
`Component` | [*ComponentConstructor*](../interfaces/ecs_interfaces_componentinterfaces.componentconstructor.md)<C\> |

**Returns:** [*NotComponent*](../interfaces/ecs_classes_system.notcomponent.md)<C\>

Defined in: [packages/engine/src/ecs/functions/ComponentFunctions.ts:24](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/functions/ComponentFunctions.ts#L24)

___

### componentPropertyName

▸ **componentPropertyName**(`Component`: *any*): *string*

Return a valid property name for the Component

#### Parameters:

Name | Type |
:------ | :------ |
`Component` | *any* |

**Returns:** *string*

Defined in: [packages/engine/src/ecs/functions/ComponentFunctions.ts:149](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/functions/ComponentFunctions.ts#L149)

___

### componentRegistered

▸ **componentRegistered**(`T`: *any*): *boolean*

Check if component is registered.

#### Parameters:

Name | Type |
:------ | :------ |
`T` | *any* |

**Returns:** *boolean*

Defined in: [packages/engine/src/ecs/functions/ComponentFunctions.ts:135](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/functions/ComponentFunctions.ts#L135)

___

### getName

▸ **getName**(`Component`: *any*): *string*

Return the name of a component

#### Parameters:

Name | Type |
:------ | :------ |
`Component` | *any* |

**Returns:** *string*

Defined in: [packages/engine/src/ecs/functions/ComponentFunctions.ts:142](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/functions/ComponentFunctions.ts#L142)

___

### getPoolForComponent

▸ **getPoolForComponent**(`component`: [*Component*](../classes/ecs_classes_component.component.md)<any\>): *void*

Return the pool containing all of the objects for this component type.

#### Parameters:

Name | Type | Description |
:------ | :------ | :------ |
`component` | [*Component*](../classes/ecs_classes_component.component.md)<any\> | Component to get pool. This component's type is used to get the pool.    |

**Returns:** *void*

Defined in: [packages/engine/src/ecs/functions/ComponentFunctions.ts:104](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/functions/ComponentFunctions.ts#L104)

___

### hasRegisteredComponent

▸ **hasRegisteredComponent**<C\>(`Component`: [*ComponentConstructor*](../interfaces/ecs_interfaces_componentinterfaces.componentconstructor.md)<C\>): *boolean*

Check if the component has been registered.\
Components will autoregister when added to an entity or included as a member of a query, so don't have to check manually.

#### Type parameters:

Name | Type |
:------ | :------ |
`C` | [*Component*](../classes/ecs_classes_component.component.md)<any, C\> |

#### Parameters:

Name | Type |
:------ | :------ |
`Component` | [*ComponentConstructor*](../interfaces/ecs_interfaces_componentinterfaces.componentconstructor.md)<C\> |

**Returns:** *boolean*

Defined in: [packages/engine/src/ecs/functions/ComponentFunctions.ts:95](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/functions/ComponentFunctions.ts#L95)

___

### queryKeyFromComponents

▸ **queryKeyFromComponents**(`Components`: *any*[]): *string*

Get a key from a list of components.

#### Parameters:

Name | Type | Description |
:------ | :------ | :------ |
`Components` | *any*[] | Array of components to generate the key.    |

**Returns:** *string*

Defined in: [packages/engine/src/ecs/functions/ComponentFunctions.ts:113](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/functions/ComponentFunctions.ts#L113)

___

### registerComponent

▸ **registerComponent**<C\>(`Component`: [*ComponentConstructor*](../interfaces/ecs_interfaces_componentinterfaces.componentconstructor.md)<C\>, `objectPool?`: [*ObjectPool*](../classes/ecs_classes_objectpool.objectpool.md)<C\> \| *false*): *void*

Register a component with the engine.\
**Note:** This happens automatically if a component is a member of a system query.

#### Type parameters:

Name | Type |
:------ | :------ |
`C` | [*Component*](../classes/ecs_classes_component.component.md)<any, C\> |

#### Parameters:

Name | Type |
:------ | :------ |
`Component` | [*ComponentConstructor*](../interfaces/ecs_interfaces_componentinterfaces.componentconstructor.md)<C\> |
`objectPool?` | [*ObjectPool*](../classes/ecs_classes_objectpool.objectpool.md)<C\> \| *false* |

**Returns:** *void*

Defined in: [packages/engine/src/ecs/functions/ComponentFunctions.ts:53](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/functions/ComponentFunctions.ts#L53)

___

### wrapImmutableComponent

▸ **wrapImmutableComponent**<T\>(`component`: [*Component*](../classes/ecs_classes_component.component.md)<T\>): T

Make a component read-only.

#### Type parameters:

Name |
:------ |
`T` |

#### Parameters:

Name | Type |
:------ | :------ |
`component` | [*Component*](../classes/ecs_classes_component.component.md)<T\> |

**Returns:** T

Defined in: [packages/engine/src/ecs/functions/ComponentFunctions.ts:34](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/functions/ComponentFunctions.ts#L34)
