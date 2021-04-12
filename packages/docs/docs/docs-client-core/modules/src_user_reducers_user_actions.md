---
id: "src_user_reducers_user_actions"
title: "Module: src/user/reducers/user/actions"
sidebar_label: "src/user/reducers/user/actions"
custom_edit_url: null
hide_title: true
---

# Module: src/user/reducers/user/actions

## Table of contents

### Interfaces

- [AddedLayerUserAction](../interfaces/src_user_reducers_user_actions.addedlayeruseraction.md)
- [ChangedRelationAction](../interfaces/src_user_reducers_user_actions.changedrelationaction.md)
- [ClearLayersUsersAction](../interfaces/src_user_reducers_user_actions.clearlayersusersaction.md)
- [LoadedLayerUsersAction](../interfaces/src_user_reducers_user_actions.loadedlayerusersaction.md)
- [LoadedUserRelationshipAction](../interfaces/src_user_reducers_user_actions.loadeduserrelationshipaction.md)
- [LoadedUsersAction](../interfaces/src_user_reducers_user_actions.loadedusersaction.md)
- [RemovedLayerUserAction](../interfaces/src_user_reducers_user_actions.removedlayeruseraction.md)
- [UserCreatedAction](../interfaces/src_user_reducers_user_actions.usercreatedaction.md)
- [UserRemovedInstance](../interfaces/src_user_reducers_user_actions.userremovedinstance.md)
- [UserToastAction](../interfaces/src_user_reducers_user_actions.usertoastaction.md)

## Type aliases

### UserAction

Ƭ **UserAction**: [*LoadedUserRelationshipAction*](../interfaces/src_user_reducers_user_actions.loadeduserrelationshipaction.md) \| [*LoadedUsersAction*](../interfaces/src_user_reducers_user_actions.loadedusersaction.md) \| [*LoadedLayerUsersAction*](../interfaces/src_user_reducers_user_actions.loadedlayerusersaction.md) \| [*ClearLayersUsersAction*](../interfaces/src_user_reducers_user_actions.clearlayersusersaction.md)

Defined in: [packages/client-core/src/user/reducers/user/actions.ts:54](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/client-core/src/user/reducers/user/actions.ts#L54)

## Functions

### addedChannelLayerUser

▸ **addedChannelLayerUser**(`user`: User): [*AddedLayerUserAction*](../interfaces/src_user_reducers_user_actions.addedlayeruseraction.md)

#### Parameters:

Name | Type |
:------ | :------ |
`user` | User |

**Returns:** [*AddedLayerUserAction*](../interfaces/src_user_reducers_user_actions.addedlayeruseraction.md)

Defined in: [packages/client-core/src/user/reducers/user/actions.ts:141](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/client-core/src/user/reducers/user/actions.ts#L141)

___

### addedLayerUser

▸ **addedLayerUser**(`user`: User): [*AddedLayerUserAction*](../interfaces/src_user_reducers_user_actions.addedlayeruseraction.md)

#### Parameters:

Name | Type |
:------ | :------ |
`user` | User |

**Returns:** [*AddedLayerUserAction*](../interfaces/src_user_reducers_user_actions.addedlayeruseraction.md)

Defined in: [packages/client-core/src/user/reducers/user/actions.ts:114](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/client-core/src/user/reducers/user/actions.ts#L114)

___

### changedRelation

▸ **changedRelation**(): [*ChangedRelationAction*](../interfaces/src_user_reducers_user_actions.changedrelationaction.md)

**Returns:** [*ChangedRelationAction*](../interfaces/src_user_reducers_user_actions.changedrelationaction.md)

Defined in: [packages/client-core/src/user/reducers/user/actions.ts:95](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/client-core/src/user/reducers/user/actions.ts#L95)

___

### clearChannelLayerUsers

▸ **clearChannelLayerUsers**(): [*ClearLayersUsersAction*](../interfaces/src_user_reducers_user_actions.clearlayersusersaction.md)

**Returns:** [*ClearLayersUsersAction*](../interfaces/src_user_reducers_user_actions.clearlayersusersaction.md)

Defined in: [packages/client-core/src/user/reducers/user/actions.ts:135](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/client-core/src/user/reducers/user/actions.ts#L135)

___

### clearLayerUsers

▸ **clearLayerUsers**(): [*ClearLayersUsersAction*](../interfaces/src_user_reducers_user_actions.clearlayersusersaction.md)

**Returns:** [*ClearLayersUsersAction*](../interfaces/src_user_reducers_user_actions.clearlayersusersaction.md)

Defined in: [packages/client-core/src/user/reducers/user/actions.ts:108](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/client-core/src/user/reducers/user/actions.ts#L108)

___

### displayUserToast

▸ **displayUserToast**(`user`: User, `args`: *any*): [*UserToastAction*](../interfaces/src_user_reducers_user_actions.usertoastaction.md)

#### Parameters:

Name | Type |
:------ | :------ |
`user` | User |
`args` | *any* |

**Returns:** [*UserToastAction*](../interfaces/src_user_reducers_user_actions.usertoastaction.md)

Defined in: [packages/client-core/src/user/reducers/user/actions.ts:155](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/client-core/src/user/reducers/user/actions.ts#L155)

___

### loadedChannelLayerUsers

▸ **loadedChannelLayerUsers**(`users`: User[]): [*LoadedLayerUsersAction*](../interfaces/src_user_reducers_user_actions.loadedlayerusersaction.md)

#### Parameters:

Name | Type |
:------ | :------ |
`users` | User[] |

**Returns:** [*LoadedLayerUsersAction*](../interfaces/src_user_reducers_user_actions.loadedlayerusersaction.md)

Defined in: [packages/client-core/src/user/reducers/user/actions.ts:128](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/client-core/src/user/reducers/user/actions.ts#L128)

___

### loadedLayerUsers

▸ **loadedLayerUsers**(`users`: User[]): [*LoadedLayerUsersAction*](../interfaces/src_user_reducers_user_actions.loadedlayerusersaction.md)

#### Parameters:

Name | Type |
:------ | :------ |
`users` | User[] |

**Returns:** [*LoadedLayerUsersAction*](../interfaces/src_user_reducers_user_actions.loadedlayerusersaction.md)

Defined in: [packages/client-core/src/user/reducers/user/actions.ts:101](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/client-core/src/user/reducers/user/actions.ts#L101)

___

### loadedUserRelationship

▸ **loadedUserRelationship**(`relationship`: Relationship): [*LoadedUserRelationshipAction*](../interfaces/src_user_reducers_user_actions.loadeduserrelationshipaction.md)

#### Parameters:

Name | Type |
:------ | :------ |
`relationship` | Relationship |

**Returns:** [*LoadedUserRelationshipAction*](../interfaces/src_user_reducers_user_actions.loadeduserrelationshipaction.md)

Defined in: [packages/client-core/src/user/reducers/user/actions.ts:81](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/client-core/src/user/reducers/user/actions.ts#L81)

___

### loadedUsers

▸ **loadedUsers**(`users`: User[]): [*LoadedUsersAction*](../interfaces/src_user_reducers_user_actions.loadedusersaction.md)

#### Parameters:

Name | Type |
:------ | :------ |
`users` | User[] |

**Returns:** [*LoadedUsersAction*](../interfaces/src_user_reducers_user_actions.loadedusersaction.md)

Defined in: [packages/client-core/src/user/reducers/user/actions.ts:88](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/client-core/src/user/reducers/user/actions.ts#L88)

___

### removedChannelLayerUser

▸ **removedChannelLayerUser**(`user`: User): [*RemovedLayerUserAction*](../interfaces/src_user_reducers_user_actions.removedlayeruseraction.md)

#### Parameters:

Name | Type |
:------ | :------ |
`user` | User |

**Returns:** [*RemovedLayerUserAction*](../interfaces/src_user_reducers_user_actions.removedlayeruseraction.md)

Defined in: [packages/client-core/src/user/reducers/user/actions.ts:148](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/client-core/src/user/reducers/user/actions.ts#L148)

___

### removedLayerUser

▸ **removedLayerUser**(`user`: User): [*RemovedLayerUserAction*](../interfaces/src_user_reducers_user_actions.removedlayeruseraction.md)

#### Parameters:

Name | Type |
:------ | :------ |
`user` | User |

**Returns:** [*RemovedLayerUserAction*](../interfaces/src_user_reducers_user_actions.removedlayeruseraction.md)

Defined in: [packages/client-core/src/user/reducers/user/actions.ts:121](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/client-core/src/user/reducers/user/actions.ts#L121)

___

### userCreated

▸ **userCreated**(`user`: User): [*UserCreatedAction*](../interfaces/src_user_reducers_user_actions.usercreatedaction.md)

#### Parameters:

Name | Type |
:------ | :------ |
`user` | User |

**Returns:** [*UserCreatedAction*](../interfaces/src_user_reducers_user_actions.usercreatedaction.md)

Defined in: [packages/client-core/src/user/reducers/user/actions.ts:60](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/client-core/src/user/reducers/user/actions.ts#L60)

___

### userPatched

▸ **userPatched**(`user`: User): [*UserCreatedAction*](../interfaces/src_user_reducers_user_actions.usercreatedaction.md)

#### Parameters:

Name | Type |
:------ | :------ |
`user` | User |

**Returns:** [*UserCreatedAction*](../interfaces/src_user_reducers_user_actions.usercreatedaction.md)

Defined in: [packages/client-core/src/user/reducers/user/actions.ts:74](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/client-core/src/user/reducers/user/actions.ts#L74)

___

### userRemoved

▸ **userRemoved**(`user`: *any*): [*UserRemovedInstance*](../interfaces/src_user_reducers_user_actions.userremovedinstance.md)

#### Parameters:

Name | Type |
:------ | :------ |
`user` | *any* |

**Returns:** [*UserRemovedInstance*](../interfaces/src_user_reducers_user_actions.userremovedinstance.md)

Defined in: [packages/client-core/src/user/reducers/user/actions.ts:67](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/client-core/src/user/reducers/user/actions.ts#L67)
