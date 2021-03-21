---
id: "client_core_redux_user_actions"
title: "Module: client-core/redux/user/actions"
sidebar_label: "client-core/redux/user/actions"
custom_edit_url: null
hide_title: true
---

# Module: client-core/redux/user/actions

## Table of contents

### Interfaces

- [AddedLayerUserAction](../interfaces/client_core_redux_user_actions.addedlayeruseraction.md)
- [ChangedRelationAction](../interfaces/client_core_redux_user_actions.changedrelationaction.md)
- [ClearLayersUsersAction](../interfaces/client_core_redux_user_actions.clearlayersusersaction.md)
- [LoadedLayerUsersAction](../interfaces/client_core_redux_user_actions.loadedlayerusersaction.md)
- [LoadedUserRelationshipAction](../interfaces/client_core_redux_user_actions.loadeduserrelationshipaction.md)
- [LoadedUsersAction](../interfaces/client_core_redux_user_actions.loadedusersaction.md)
- [RemovedLayerUserAction](../interfaces/client_core_redux_user_actions.removedlayeruseraction.md)
- [UserCreatedAction](../interfaces/client_core_redux_user_actions.usercreatedaction.md)
- [UserRemovedInstance](../interfaces/client_core_redux_user_actions.userremovedinstance.md)
- [UserToastAction](../interfaces/client_core_redux_user_actions.usertoastaction.md)

## Type aliases

### UserAction

Ƭ **UserAction**: [*LoadedUserRelationshipAction*](../interfaces/client_core_redux_user_actions.loadeduserrelationshipaction.md) \| [*LoadedUsersAction*](../interfaces/client_core_redux_user_actions.loadedusersaction.md) \| [*LoadedLayerUsersAction*](../interfaces/client_core_redux_user_actions.loadedlayerusersaction.md) \| [*ClearLayersUsersAction*](../interfaces/client_core_redux_user_actions.clearlayersusersaction.md)

Defined in: [packages/client-core/redux/user/actions.ts:68](https://github.com/xr3ngine/xr3ngine/blob/5a0f83ed8/packages/client-core/redux/user/actions.ts#L68)

## Functions

### addedChannelLayerUser

▸ **addedChannelLayerUser**(`user`: User): [*AddedLayerUserAction*](../interfaces/client_core_redux_user_actions.addedlayeruseraction.md)

#### Parameters:

Name | Type |
:------ | :------ |
`user` | User |

**Returns:** [*AddedLayerUserAction*](../interfaces/client_core_redux_user_actions.addedlayeruseraction.md)

Defined in: [packages/client-core/redux/user/actions.ts:155](https://github.com/xr3ngine/xr3ngine/blob/5a0f83ed8/packages/client-core/redux/user/actions.ts#L155)

___

### addedLayerUser

▸ **addedLayerUser**(`user`: User): [*AddedLayerUserAction*](../interfaces/client_core_redux_user_actions.addedlayeruseraction.md)

#### Parameters:

Name | Type |
:------ | :------ |
`user` | User |

**Returns:** [*AddedLayerUserAction*](../interfaces/client_core_redux_user_actions.addedlayeruseraction.md)

Defined in: [packages/client-core/redux/user/actions.ts:128](https://github.com/xr3ngine/xr3ngine/blob/5a0f83ed8/packages/client-core/redux/user/actions.ts#L128)

___

### changedRelation

▸ **changedRelation**(): [*ChangedRelationAction*](../interfaces/client_core_redux_user_actions.changedrelationaction.md)

**Returns:** [*ChangedRelationAction*](../interfaces/client_core_redux_user_actions.changedrelationaction.md)

Defined in: [packages/client-core/redux/user/actions.ts:109](https://github.com/xr3ngine/xr3ngine/blob/5a0f83ed8/packages/client-core/redux/user/actions.ts#L109)

___

### clearChannelLayerUsers

▸ **clearChannelLayerUsers**(): [*ClearLayersUsersAction*](../interfaces/client_core_redux_user_actions.clearlayersusersaction.md)

**Returns:** [*ClearLayersUsersAction*](../interfaces/client_core_redux_user_actions.clearlayersusersaction.md)

Defined in: [packages/client-core/redux/user/actions.ts:149](https://github.com/xr3ngine/xr3ngine/blob/5a0f83ed8/packages/client-core/redux/user/actions.ts#L149)

___

### clearLayerUsers

▸ **clearLayerUsers**(): [*ClearLayersUsersAction*](../interfaces/client_core_redux_user_actions.clearlayersusersaction.md)

**Returns:** [*ClearLayersUsersAction*](../interfaces/client_core_redux_user_actions.clearlayersusersaction.md)

Defined in: [packages/client-core/redux/user/actions.ts:122](https://github.com/xr3ngine/xr3ngine/blob/5a0f83ed8/packages/client-core/redux/user/actions.ts#L122)

___

### displayUserToast

▸ **displayUserToast**(`user`: User, `args`: *any*): [*UserToastAction*](../interfaces/client_core_redux_user_actions.usertoastaction.md)

#### Parameters:

Name | Type |
:------ | :------ |
`user` | User |
`args` | *any* |

**Returns:** [*UserToastAction*](../interfaces/client_core_redux_user_actions.usertoastaction.md)

Defined in: [packages/client-core/redux/user/actions.ts:169](https://github.com/xr3ngine/xr3ngine/blob/5a0f83ed8/packages/client-core/redux/user/actions.ts#L169)

___

### loadedChannelLayerUsers

▸ **loadedChannelLayerUsers**(`users`: User[]): [*LoadedLayerUsersAction*](../interfaces/client_core_redux_user_actions.loadedlayerusersaction.md)

#### Parameters:

Name | Type |
:------ | :------ |
`users` | User[] |

**Returns:** [*LoadedLayerUsersAction*](../interfaces/client_core_redux_user_actions.loadedlayerusersaction.md)

Defined in: [packages/client-core/redux/user/actions.ts:142](https://github.com/xr3ngine/xr3ngine/blob/5a0f83ed8/packages/client-core/redux/user/actions.ts#L142)

___

### loadedLayerUsers

▸ **loadedLayerUsers**(`users`: User[]): [*LoadedLayerUsersAction*](../interfaces/client_core_redux_user_actions.loadedlayerusersaction.md)

#### Parameters:

Name | Type |
:------ | :------ |
`users` | User[] |

**Returns:** [*LoadedLayerUsersAction*](../interfaces/client_core_redux_user_actions.loadedlayerusersaction.md)

Defined in: [packages/client-core/redux/user/actions.ts:115](https://github.com/xr3ngine/xr3ngine/blob/5a0f83ed8/packages/client-core/redux/user/actions.ts#L115)

___

### loadedUserRelationship

▸ **loadedUserRelationship**(`relationship`: Relationship): [*LoadedUserRelationshipAction*](../interfaces/client_core_redux_user_actions.loadeduserrelationshipaction.md)

#### Parameters:

Name | Type |
:------ | :------ |
`relationship` | Relationship |

**Returns:** [*LoadedUserRelationshipAction*](../interfaces/client_core_redux_user_actions.loadeduserrelationshipaction.md)

Defined in: [packages/client-core/redux/user/actions.ts:95](https://github.com/xr3ngine/xr3ngine/blob/5a0f83ed8/packages/client-core/redux/user/actions.ts#L95)

___

### loadedUsers

▸ **loadedUsers**(`users`: User[]): [*LoadedUsersAction*](../interfaces/client_core_redux_user_actions.loadedusersaction.md)

#### Parameters:

Name | Type |
:------ | :------ |
`users` | User[] |

**Returns:** [*LoadedUsersAction*](../interfaces/client_core_redux_user_actions.loadedusersaction.md)

Defined in: [packages/client-core/redux/user/actions.ts:102](https://github.com/xr3ngine/xr3ngine/blob/5a0f83ed8/packages/client-core/redux/user/actions.ts#L102)

___

### removedChannelLayerUser

▸ **removedChannelLayerUser**(`user`: User): [*RemovedLayerUserAction*](../interfaces/client_core_redux_user_actions.removedlayeruseraction.md)

#### Parameters:

Name | Type |
:------ | :------ |
`user` | User |

**Returns:** [*RemovedLayerUserAction*](../interfaces/client_core_redux_user_actions.removedlayeruseraction.md)

Defined in: [packages/client-core/redux/user/actions.ts:162](https://github.com/xr3ngine/xr3ngine/blob/5a0f83ed8/packages/client-core/redux/user/actions.ts#L162)

___

### removedLayerUser

▸ **removedLayerUser**(`user`: User): [*RemovedLayerUserAction*](../interfaces/client_core_redux_user_actions.removedlayeruseraction.md)

#### Parameters:

Name | Type |
:------ | :------ |
`user` | User |

**Returns:** [*RemovedLayerUserAction*](../interfaces/client_core_redux_user_actions.removedlayeruseraction.md)

Defined in: [packages/client-core/redux/user/actions.ts:135](https://github.com/xr3ngine/xr3ngine/blob/5a0f83ed8/packages/client-core/redux/user/actions.ts#L135)

___

### userCreated

▸ **userCreated**(`user`: User): [*UserCreatedAction*](../interfaces/client_core_redux_user_actions.usercreatedaction.md)

#### Parameters:

Name | Type |
:------ | :------ |
`user` | User |

**Returns:** [*UserCreatedAction*](../interfaces/client_core_redux_user_actions.usercreatedaction.md)

Defined in: [packages/client-core/redux/user/actions.ts:74](https://github.com/xr3ngine/xr3ngine/blob/5a0f83ed8/packages/client-core/redux/user/actions.ts#L74)

___

### userPatched

▸ **userPatched**(`user`: User): [*UserCreatedAction*](../interfaces/client_core_redux_user_actions.usercreatedaction.md)

#### Parameters:

Name | Type |
:------ | :------ |
`user` | User |

**Returns:** [*UserCreatedAction*](../interfaces/client_core_redux_user_actions.usercreatedaction.md)

Defined in: [packages/client-core/redux/user/actions.ts:88](https://github.com/xr3ngine/xr3ngine/blob/5a0f83ed8/packages/client-core/redux/user/actions.ts#L88)

___

### userRemoved

▸ **userRemoved**(`user`: *any*): [*UserRemovedInstance*](../interfaces/client_core_redux_user_actions.userremovedinstance.md)

#### Parameters:

Name | Type |
:------ | :------ |
`user` | *any* |

**Returns:** [*UserRemovedInstance*](../interfaces/client_core_redux_user_actions.userremovedinstance.md)

Defined in: [packages/client-core/redux/user/actions.ts:81](https://github.com/xr3ngine/xr3ngine/blob/5a0f83ed8/packages/client-core/redux/user/actions.ts#L81)
