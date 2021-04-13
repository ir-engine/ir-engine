---
id: "src_user_reducers_user_service"
title: "Module: src/user/reducers/user/service"
sidebar_label: "src/user/reducers/user/service"
custom_edit_url: null
hide_title: true
---

# Module: src/user/reducers/user/service

## Functions

### acceptFriend

▸ **acceptFriend**(`userId`: *string*, `relatedUserId`: *string*): *function*

#### Parameters:

Name | Type |
:------ | :------ |
`userId` | *string* |
`relatedUserId` | *string* |

**Returns:** (`dispatch`: *Dispatch*<AnyAction\>) => *any*

Defined in: [packages/client-core/src/user/reducers/user/service.ts:105](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/client-core/src/user/reducers/user/service.ts#L105)

___

### blockUser

▸ **blockUser**(`userId`: *string*, `relatedUserId`: *string*): *function*

#### Parameters:

Name | Type |
:------ | :------ |
`userId` | *string* |
`relatedUserId` | *string* |

**Returns:** (`dispatch`: *Dispatch*<AnyAction\>) => *any*

Defined in: [packages/client-core/src/user/reducers/user/service.ts:101](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/client-core/src/user/reducers/user/service.ts#L101)

___

### cancelBlock

▸ **cancelBlock**(`userId`: *string*, `relatedUserId`: *string*): *function*

#### Parameters:

Name | Type |
:------ | :------ |
`userId` | *string* |
`relatedUserId` | *string* |

**Returns:** (`dispatch`: *Dispatch*<AnyAction\>) => *any*

Defined in: [packages/client-core/src/user/reducers/user/service.ts:113](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/client-core/src/user/reducers/user/service.ts#L113)

___

### declineFriend

▸ **declineFriend**(`userId`: *string*, `relatedUserId`: *string*): *function*

#### Parameters:

Name | Type |
:------ | :------ |
`userId` | *string* |
`relatedUserId` | *string* |

**Returns:** (`dispatch`: *Dispatch*<AnyAction\>) => *any*

Defined in: [packages/client-core/src/user/reducers/user/service.ts:109](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/client-core/src/user/reducers/user/service.ts#L109)

___

### getLayerUsers

▸ **getLayerUsers**(`instance?`: *boolean*): *function*

#### Parameters:

Name | Type | Default value |
:------ | :------ | :------ |
`instance` | *boolean* | true |

**Returns:** (`dispatch`: *Dispatch*<AnyAction\>) => *Promise*<any\>

Defined in: [packages/client-core/src/user/reducers/user/service.ts:46](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/client-core/src/user/reducers/user/service.ts#L46)

___

### getUserRelationship

▸ **getUserRelationship**(`userId`: *string*): *function*

#### Parameters:

Name | Type |
:------ | :------ |
`userId` | *string* |

**Returns:** (`dispatch`: *Dispatch*<AnyAction\>) => *any*

Defined in: [packages/client-core/src/user/reducers/user/service.ts:14](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/client-core/src/user/reducers/user/service.ts#L14)

___

### getUsers

▸ **getUsers**(`userId`: *string*, `search`: *string*): *function*

#### Parameters:

Name | Type |
:------ | :------ |
`userId` | *string* |
`search` | *string* |

**Returns:** (`dispatch`: *Dispatch*<AnyAction\>) => *any*

Defined in: [packages/client-core/src/user/reducers/user/service.ts:29](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/client-core/src/user/reducers/user/service.ts#L29)

___

### requestFriend

▸ **requestFriend**(`userId`: *string*, `relatedUserId`: *string*): *function*

#### Parameters:

Name | Type |
:------ | :------ |
`userId` | *string* |
`relatedUserId` | *string* |

**Returns:** (`dispatch`: *Dispatch*<AnyAction\>) => *any*

Defined in: [packages/client-core/src/user/reducers/user/service.ts:97](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/client-core/src/user/reducers/user/service.ts#L97)

___

### showUserToast

▸ **showUserToast**(`user`: User, `args`: *string*): [*UserToastAction*](../interfaces/src_user_reducers_user_actions.usertoastaction.md)

#### Parameters:

Name | Type |
:------ | :------ |
`user` | User |
`args` | *string* |

**Returns:** [*UserToastAction*](../interfaces/src_user_reducers_user_actions.usertoastaction.md)

Defined in: [packages/client-core/src/user/reducers/user/service.ts:117](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/client-core/src/user/reducers/user/service.ts#L117)
