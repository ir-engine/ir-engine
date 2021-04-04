---
id: "redux_user_service"
title: "Module: redux/user/service"
sidebar_label: "redux/user/service"
custom_edit_url: null
hide_title: true
---

# Module: redux/user/service

## Functions

### acceptFriend

▸ **acceptFriend**(`userId`: *string*, `relatedUserId`: *string*): *function*

#### Parameters:

Name | Type |
:------ | :------ |
`userId` | *string* |
`relatedUserId` | *string* |

**Returns:** (`dispatch`: *Dispatch*<AnyAction\>) => *any*

Defined in: [packages/client-core/redux/user/service.ts:116](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/user/service.ts#L116)

___

### blockUser

▸ **blockUser**(`userId`: *string*, `relatedUserId`: *string*): *function*

#### Parameters:

Name | Type |
:------ | :------ |
`userId` | *string* |
`relatedUserId` | *string* |

**Returns:** (`dispatch`: *Dispatch*<AnyAction\>) => *any*

Defined in: [packages/client-core/redux/user/service.ts:112](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/user/service.ts#L112)

___

### cancelBlock

▸ **cancelBlock**(`userId`: *string*, `relatedUserId`: *string*): *function*

#### Parameters:

Name | Type |
:------ | :------ |
`userId` | *string* |
`relatedUserId` | *string* |

**Returns:** (`dispatch`: *Dispatch*<AnyAction\>) => *any*

Defined in: [packages/client-core/redux/user/service.ts:124](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/user/service.ts#L124)

___

### declineFriend

▸ **declineFriend**(`userId`: *string*, `relatedUserId`: *string*): *function*

#### Parameters:

Name | Type |
:------ | :------ |
`userId` | *string* |
`relatedUserId` | *string* |

**Returns:** (`dispatch`: *Dispatch*<AnyAction\>) => *any*

Defined in: [packages/client-core/redux/user/service.ts:120](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/user/service.ts#L120)

___

### getLayerUsers

▸ **getLayerUsers**(`instance?`: *boolean*): *function*

#### Parameters:

Name | Type | Default value |
:------ | :------ | :------ |
`instance` | *boolean* | true |

**Returns:** (`dispatch`: *Dispatch*<AnyAction\>) => *Promise*<any\>

Defined in: [packages/client-core/redux/user/service.ts:54](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/user/service.ts#L54)

___

### getUserRelationship

▸ **getUserRelationship**(`userId`: *string*): *function*

#### Parameters:

Name | Type |
:------ | :------ |
`userId` | *string* |

**Returns:** (`dispatch`: *Dispatch*<AnyAction\>) => *any*

Defined in: [packages/client-core/redux/user/service.ts:14](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/user/service.ts#L14)

___

### getUsers

▸ **getUsers**(`userId`: *string*, `search`: *string*): *function*

#### Parameters:

Name | Type |
:------ | :------ |
`userId` | *string* |
`search` | *string* |

**Returns:** (`dispatch`: *Dispatch*<AnyAction\>) => *any*

Defined in: [packages/client-core/redux/user/service.ts:34](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/user/service.ts#L34)

___

### requestFriend

▸ **requestFriend**(`userId`: *string*, `relatedUserId`: *string*): *function*

#### Parameters:

Name | Type |
:------ | :------ |
`userId` | *string* |
`relatedUserId` | *string* |

**Returns:** (`dispatch`: *Dispatch*<AnyAction\>) => *any*

Defined in: [packages/client-core/redux/user/service.ts:108](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/user/service.ts#L108)

___

### showUserToast

▸ **showUserToast**(`user`: User, `args`: *string*): [*UserToastAction*](../interfaces/redux_user_actions.usertoastaction.md)

#### Parameters:

Name | Type |
:------ | :------ |
`user` | User |
`args` | *string* |

**Returns:** [*UserToastAction*](../interfaces/redux_user_actions.usertoastaction.md)

Defined in: [packages/client-core/redux/user/service.ts:128](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/user/service.ts#L128)
