---
id: "client_core_redux_scenes_actions"
title: "Module: client-core/redux/scenes/actions"
sidebar_label: "client-core/redux/scenes/actions"
custom_edit_url: null
hide_title: true
---

# Module: client-core/redux/scenes/actions

## Table of contents

### Interfaces

- [CollectionsFetchedAction](../interfaces/client_core_redux_scenes_actions.collectionsfetchedaction.md)
- [PublicScene](../interfaces/client_core_redux_scenes_actions.publicscene.md)
- [PublicScenesState](../interfaces/client_core_redux_scenes_actions.publicscenesstate.md)
- [ScenesFetchedAction](../interfaces/client_core_redux_scenes_actions.scenesfetchedaction.md)

## Functions

### collectionsFetched

▸ **collectionsFetched**(`collections`: *any*[]): [*CollectionsFetchedAction*](../interfaces/client_core_redux_scenes_actions.collectionsfetchedaction.md)

#### Parameters:

Name | Type |
:------ | :------ |
`collections` | *any*[] |

**Returns:** [*CollectionsFetchedAction*](../interfaces/client_core_redux_scenes_actions.collectionsfetchedaction.md)

Defined in: [packages/client-core/redux/scenes/actions.ts:46](https://github.com/xr3ngine/xr3ngine/blob/9d253dc38/packages/client-core/redux/scenes/actions.ts#L46)

___

### scenesFetchedError

▸ **scenesFetchedError**(`err`: *string*): [*ScenesFetchedAction*](../interfaces/client_core_redux_scenes_actions.scenesfetchedaction.md)

#### Parameters:

Name | Type |
:------ | :------ |
`err` | *string* |

**Returns:** [*ScenesFetchedAction*](../interfaces/client_core_redux_scenes_actions.scenesfetchedaction.md)

Defined in: [packages/client-core/redux/scenes/actions.ts:39](https://github.com/xr3ngine/xr3ngine/blob/9d253dc38/packages/client-core/redux/scenes/actions.ts#L39)

___

### scenesFetchedSuccess

▸ **scenesFetchedSuccess**(`scenes`: [*PublicScene*](../interfaces/client_core_redux_scenes_actions.publicscene.md)[]): [*ScenesFetchedAction*](../interfaces/client_core_redux_scenes_actions.scenesfetchedaction.md)

#### Parameters:

Name | Type |
:------ | :------ |
`scenes` | [*PublicScene*](../interfaces/client_core_redux_scenes_actions.publicscene.md)[] |

**Returns:** [*ScenesFetchedAction*](../interfaces/client_core_redux_scenes_actions.scenesfetchedaction.md)

Defined in: [packages/client-core/redux/scenes/actions.ts:32](https://github.com/xr3ngine/xr3ngine/blob/9d253dc38/packages/client-core/redux/scenes/actions.ts#L32)

___

### setCurrentScene

▸ **setCurrentScene**(`scene`: [*PublicScene*](../interfaces/client_core_redux_scenes_actions.publicscene.md)): [*ScenesFetchedAction*](../interfaces/client_core_redux_scenes_actions.scenesfetchedaction.md)

#### Parameters:

Name | Type |
:------ | :------ |
`scene` | [*PublicScene*](../interfaces/client_core_redux_scenes_actions.publicscene.md) |

**Returns:** [*ScenesFetchedAction*](../interfaces/client_core_redux_scenes_actions.scenesfetchedaction.md)

Defined in: [packages/client-core/redux/scenes/actions.ts:53](https://github.com/xr3ngine/xr3ngine/blob/9d253dc38/packages/client-core/redux/scenes/actions.ts#L53)
