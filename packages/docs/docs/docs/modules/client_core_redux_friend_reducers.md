---
id: "client_core_redux_friend_reducers"
title: "Module: client-core/redux/friend/reducers"
sidebar_label: "client-core/redux/friend/reducers"
custom_edit_url: null
hide_title: true
---

# Module: client-core/redux/friend/reducers

## Variables

### initialState

• `Const` **initialState**: *object*

#### Type declaration:

Name | Type |
:------ | :------ |
`friends` | *object* |
`friends.friends` | *any*[] |
`friends.limit` | *number* |
`friends.skip` | *number* |
`friends.total` | *number* |
`getFriendsInProgress` | *boolean* |
`updateNeeded` | *boolean* |

Defined in: [packages/client-core/redux/friend/reducers.ts:20](https://github.com/xr3ngine/xr3ngine/blob/5a0f83ed8/packages/client-core/redux/friend/reducers.ts#L20)

## Functions

### default

▸ `Const`**default**(`state?`: *any*, `action`: [*FriendAction*](client_core_redux_friend_actions.md#friendaction)): *any*

#### Parameters:

Name | Type |
:------ | :------ |
`state` | *any* |
`action` | [*FriendAction*](client_core_redux_friend_actions.md#friendaction) |

**Returns:** *any*

Defined in: [packages/client-core/redux/friend/reducers.ts:33](https://github.com/xr3ngine/xr3ngine/blob/5a0f83ed8/packages/client-core/redux/friend/reducers.ts#L33)
