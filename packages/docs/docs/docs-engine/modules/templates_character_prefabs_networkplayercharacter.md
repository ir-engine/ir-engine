---
id: "templates_character_prefabs_networkplayercharacter"
title: "Module: templates/character/prefabs/NetworkPlayerCharacter"
sidebar_label: "templates/character/prefabs/NetworkPlayerCharacter"
custom_edit_url: null
hide_title: true
---

# Module: templates/character/prefabs/NetworkPlayerCharacter

## Table of contents

### Classes

- [AnimationManager](../classes/templates_character_prefabs_networkplayercharacter.animationmanager.md)

## Variables

### NetworkPlayerCharacter

• `Const` **NetworkPlayerCharacter**: [*NetworkPrefab*](../interfaces/networking_interfaces_networkprefab.networkprefab.md)

Defined in: [packages/engine/src/templates/character/prefabs/NetworkPlayerCharacter.ts:270](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/templates/character/prefabs/NetworkPlayerCharacter.ts#L270)

## Functions

### createNetworkPlayer

▸ **createNetworkPlayer**(`args`: { `entity?`: [*Entity*](../classes/ecs_classes_entity.entity.md) ; `networkId?`: *number* ; `ownerId`: *string* \| *number*  }): [*NetworkObject*](../classes/networking_components_networkobject.networkobject.md)

#### Parameters:

Name | Type |
:------ | :------ |
`args` | *object* |
`args.entity?` | [*Entity*](../classes/ecs_classes_entity.entity.md) |
`args.networkId?` | *number* |
`args.ownerId` | *string* \| *number* |

**Returns:** [*NetworkObject*](../classes/networking_components_networkobject.networkobject.md)

Defined in: [packages/engine/src/templates/character/prefabs/NetworkPlayerCharacter.ts:233](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/templates/character/prefabs/NetworkPlayerCharacter.ts#L233)

___

### loadActorAvatar

▸ `Const`**loadActorAvatar**(`entity`: [*Entity*](../classes/ecs_classes_entity.entity.md), `args?`: *any*, `delta?`: *number*, `entityOut?`: [*Entity*](../classes/ecs_classes_entity.entity.md), `time?`: *number*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`entity` | [*Entity*](../classes/ecs_classes_entity.entity.md) |
`args?` | *any* |
`delta?` | *number* |
`entityOut?` | [*Entity*](../classes/ecs_classes_entity.entity.md) |
`time?` | *number* |

**Returns:** *void*

Defined in: [packages/engine/src/templates/character/prefabs/NetworkPlayerCharacter.ts:98](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/templates/character/prefabs/NetworkPlayerCharacter.ts#L98)

___

### loadActorAvatarFromURL

▸ `Const`**loadActorAvatarFromURL**(`entity`: [*Entity*](../classes/ecs_classes_entity.entity.md), `args?`: *any*, `delta?`: *number*, `entityOut?`: [*Entity*](../classes/ecs_classes_entity.entity.md), `time?`: *number*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`entity` | [*Entity*](../classes/ecs_classes_entity.entity.md) |
`args?` | *any* |
`delta?` | *number* |
`entityOut?` | [*Entity*](../classes/ecs_classes_entity.entity.md) |
`time?` | *number* |

**Returns:** *void*

Defined in: [packages/engine/src/templates/character/prefabs/NetworkPlayerCharacter.ts:105](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/templates/character/prefabs/NetworkPlayerCharacter.ts#L105)

___

### loadDefaultActorAvatar

▸ `Const`**loadDefaultActorAvatar**(`entity`: [*Entity*](../classes/ecs_classes_entity.entity.md), `args?`: *any*, `delta?`: *number*, `entityOut?`: [*Entity*](../classes/ecs_classes_entity.entity.md), `time?`: *number*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`entity` | [*Entity*](../classes/ecs_classes_entity.entity.md) |
`args?` | *any* |
`delta?` | *number* |
`entityOut?` | [*Entity*](../classes/ecs_classes_entity.entity.md) |
`time?` | *number* |

**Returns:** *void*

Defined in: [packages/engine/src/templates/character/prefabs/NetworkPlayerCharacter.ts:89](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/templates/character/prefabs/NetworkPlayerCharacter.ts#L89)
