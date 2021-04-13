---
id: "scene_constants_sceneobjectloadingschema"
title: "Module: scene/constants/SceneObjectLoadingSchema"
sidebar_label: "scene/constants/SceneObjectLoadingSchema"
custom_edit_url: null
hide_title: true
---

# Module: scene/constants/SceneObjectLoadingSchema

## Variables

### SceneObjectLoadingSchema

• `Const` **SceneObjectLoadingSchema**: [*LoadingSchema*](../interfaces/scene_interfaces_loadingschema.loadingschema.md)

Defined in: [packages/engine/src/scene/constants/SceneObjectLoadingSchema.ts:62](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/scene/constants/SceneObjectLoadingSchema.ts#L62)

## Functions

### addComponentFromBehavior

▸ **addComponentFromBehavior**<C\>(`entity`: [*Entity*](../classes/ecs_classes_entity.entity.md), `args`: { `component`: [*ComponentConstructor*](../interfaces/ecs_interfaces_componentinterfaces.componentconstructor.md)<[*Component*](../classes/ecs_classes_component.component.md)<C\>\> ; `objArgs`: *any*  }): *void*

Add Component into Entity from the Behavior.

#### Type parameters:

Name |
:------ |
`C` |

#### Parameters:

Name | Type | Description |
:------ | :------ | :------ |
`entity` | [*Entity*](../classes/ecs_classes_entity.entity.md) | Entity in which component will be added.   |
`args` | *object* | Args contains Component and args of Component which will be added into the Entity.    |
`args.component` | [*ComponentConstructor*](../interfaces/ecs_interfaces_componentinterfaces.componentconstructor.md)<[*Component*](../classes/ecs_classes_component.component.md)<C\>\> | - |
`args.objArgs` | *any* | - |

**Returns:** *void*

Defined in: [packages/engine/src/scene/constants/SceneObjectLoadingSchema.ts:38](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/scene/constants/SceneObjectLoadingSchema.ts#L38)

___

### addTagComponentFromBehavior

▸ **addTagComponentFromBehavior**<C\>(`entity`: [*Entity*](../classes/ecs_classes_entity.entity.md), `args`: { `component`: [*ComponentConstructor*](../interfaces/ecs_interfaces_componentinterfaces.componentconstructor.md)<[*Component*](../classes/ecs_classes_component.component.md)<C\>\>  }): *void*

Add Tag Component with into Entity from the Behavior.

#### Type parameters:

Name |
:------ |
`C` |

#### Parameters:

Name | Type | Description |
:------ | :------ | :------ |
`entity` | [*Entity*](../classes/ecs_classes_entity.entity.md) | Entity in which component will be added.   |
`args` | *object* | Args contains Component which will be added into the Entity.    |
`args.component` | [*ComponentConstructor*](../interfaces/ecs_interfaces_componentinterfaces.componentconstructor.md)<[*Component*](../classes/ecs_classes_component.component.md)<C\>\> | - |

**Returns:** *void*

Defined in: [packages/engine/src/scene/constants/SceneObjectLoadingSchema.ts:53](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/scene/constants/SceneObjectLoadingSchema.ts#L53)
