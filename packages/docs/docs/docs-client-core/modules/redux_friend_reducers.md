---
id: "redux_friend_reducers"
title: "Module: redux/friend/reducers"
sidebar_label: "redux/friend/reducers"
custom_edit_url: null
hide_title: true
---

# Module: redux/friend/reducers

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

Defined in: [packages/client-core/redux/friend/reducers.ts:20](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/friend/reducers.ts#L20)

## Functions

### default

▸ `Const`**default**(`state?`: *any*, `action`: [*FriendAction*](redux_friend_actions.md#friendaction)): *any*

#### Parameters:

Name | Type |
:------ | :------ |
`state` | *any* |
`action` | [*FriendAction*](redux_friend_actions.md#friendaction) |

**Returns:** *any*

Defined in: [packages/client-core/redux/friend/reducers.ts:33](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/friend/reducers.ts#L33)
