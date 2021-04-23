---
id: "interaction_types_interactiontypes"
title: "Module: interaction/types/InteractionTypes"
sidebar_label: "interaction/types/InteractionTypes"
custom_edit_url: null
hide_title: true
---

# Module: interaction/types/InteractionTypes

## Type aliases

### InteractBehaviorArguments

Ƭ **InteractBehaviorArguments**: *object*

#### Type declaration:

Name | Type |
:------ | :------ |
`raycastList` | [*Entity*](../classes/ecs_classes_entity.entity.md)[] |

Defined in: [packages/engine/src/interaction/types/InteractionTypes.ts:4](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/interaction/types/InteractionTypes.ts#L4)

___

### InteractionCheckHandler

Ƭ **InteractionCheckHandler**: (`clientEntity`: [*Entity*](../classes/ecs_classes_entity.entity.md), `interactiveEntity`: [*Entity*](../classes/ecs_classes_entity.entity.md), `focusedPart?`: *number*) => *boolean*

#### Type declaration:

▸ (`clientEntity`: [*Entity*](../classes/ecs_classes_entity.entity.md), `interactiveEntity`: [*Entity*](../classes/ecs_classes_entity.entity.md), `focusedPart?`: *number*): *boolean*

#### Parameters:

Name | Type |
:------ | :------ |
`clientEntity` | [*Entity*](../classes/ecs_classes_entity.entity.md) |
`interactiveEntity` | [*Entity*](../classes/ecs_classes_entity.entity.md) |
`focusedPart?` | *number* |

**Returns:** *boolean*

Defined in: [packages/engine/src/interaction/types/InteractionTypes.ts:3](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/interaction/types/InteractionTypes.ts#L3)
