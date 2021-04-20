---
id: "src_world_reducers_scenes_actions"
title: "Module: src/world/reducers/scenes/actions"
sidebar_label: "src/world/reducers/scenes/actions"
custom_edit_url: null
hide_title: true
---

# Module: src/world/reducers/scenes/actions

## Table of contents

### Interfaces

- [CollectionsFetchedAction](../interfaces/src_world_reducers_scenes_actions.collectionsfetchedaction.md)
- [PublicScene](../interfaces/src_world_reducers_scenes_actions.publicscene.md)
- [PublicScenesState](../interfaces/src_world_reducers_scenes_actions.publicscenesstate.md)
- [ScenesFetchedAction](../interfaces/src_world_reducers_scenes_actions.scenesfetchedaction.md)

## Functions

### collectionsFetched

▸ **collectionsFetched**(`collections`: *any*[]): [*CollectionsFetchedAction*](../interfaces/src_world_reducers_scenes_actions.collectionsfetchedaction.md)

#### Parameters:

Name | Type |
:------ | :------ |
`collections` | *any*[] |

**Returns:** [*CollectionsFetchedAction*](../interfaces/src_world_reducers_scenes_actions.collectionsfetchedaction.md)

Defined in: [packages/client-core/src/world/reducers/scenes/actions.ts:46](https://github.com/xr3ngine/xr3ngine/blob/65dfcf39a/packages/client-core/src/world/reducers/scenes/actions.ts#L46)

___

### scenesFetchedError

▸ **scenesFetchedError**(`err`: *string*): [*ScenesFetchedAction*](../interfaces/src_world_reducers_scenes_actions.scenesfetchedaction.md)

#### Parameters:

Name | Type |
:------ | :------ |
`err` | *string* |

**Returns:** [*ScenesFetchedAction*](../interfaces/src_world_reducers_scenes_actions.scenesfetchedaction.md)

Defined in: [packages/client-core/src/world/reducers/scenes/actions.ts:39](https://github.com/xr3ngine/xr3ngine/blob/65dfcf39a/packages/client-core/src/world/reducers/scenes/actions.ts#L39)

___

### scenesFetchedSuccess

▸ **scenesFetchedSuccess**(`scenes`: [*PublicScene*](../interfaces/src_world_reducers_scenes_actions.publicscene.md)[]): [*ScenesFetchedAction*](../interfaces/src_world_reducers_scenes_actions.scenesfetchedaction.md)

#### Parameters:

Name | Type |
:------ | :------ |
`scenes` | [*PublicScene*](../interfaces/src_world_reducers_scenes_actions.publicscene.md)[] |

**Returns:** [*ScenesFetchedAction*](../interfaces/src_world_reducers_scenes_actions.scenesfetchedaction.md)

Defined in: [packages/client-core/src/world/reducers/scenes/actions.ts:32](https://github.com/xr3ngine/xr3ngine/blob/65dfcf39a/packages/client-core/src/world/reducers/scenes/actions.ts#L32)

___

### setCurrentScene

▸ **setCurrentScene**(`scene`: [*PublicScene*](../interfaces/src_world_reducers_scenes_actions.publicscene.md)): [*ScenesFetchedAction*](../interfaces/src_world_reducers_scenes_actions.scenesfetchedaction.md)

#### Parameters:

Name | Type |
:------ | :------ |
`scene` | [*PublicScene*](../interfaces/src_world_reducers_scenes_actions.publicscene.md) |

**Returns:** [*ScenesFetchedAction*](../interfaces/src_world_reducers_scenes_actions.scenesfetchedaction.md)

Defined in: [packages/client-core/src/world/reducers/scenes/actions.ts:53](https://github.com/xr3ngine/xr3ngine/blob/65dfcf39a/packages/client-core/src/world/reducers/scenes/actions.ts#L53)
