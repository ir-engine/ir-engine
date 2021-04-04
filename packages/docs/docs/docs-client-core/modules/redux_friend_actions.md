---
id: "redux_friend_actions"
title: "Module: redux/friend/actions"
sidebar_label: "redux/friend/actions"
custom_edit_url: null
hide_title: true
---

# Module: redux/friend/actions

## Table of contents

### Interfaces

- [CreatedFriendAction](../interfaces/redux_friend_actions.createdfriendaction.md)
- [FetchingFriendsAction](../interfaces/redux_friend_actions.fetchingfriendsaction.md)
- [LoadedFriendsAction](../interfaces/redux_friend_actions.loadedfriendsaction.md)
- [PatchedFriendAction](../interfaces/redux_friend_actions.patchedfriendaction.md)
- [RemovedFriendAction](../interfaces/redux_friend_actions.removedfriendaction.md)

## Type aliases

### FriendAction

Ƭ **FriendAction**: [*LoadedFriendsAction*](../interfaces/redux_friend_actions.loadedfriendsaction.md) \| [*CreatedFriendAction*](../interfaces/redux_friend_actions.createdfriendaction.md) \| [*PatchedFriendAction*](../interfaces/redux_friend_actions.patchedfriendaction.md) \| [*RemovedFriendAction*](../interfaces/redux_friend_actions.removedfriendaction.md) \| [*FetchingFriendsAction*](../interfaces/redux_friend_actions.fetchingfriendsaction.md)

Defined in: [packages/client-core/redux/friend/actions.ts:41](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/friend/actions.ts#L41)

## Functions

### createdFriend

▸ **createdFriend**(`userRelationship`: UserRelationship): [*CreatedFriendAction*](../interfaces/redux_friend_actions.createdfriendaction.md)

#### Parameters:

Name | Type |
:------ | :------ |
`userRelationship` | UserRelationship |

**Returns:** [*CreatedFriendAction*](../interfaces/redux_friend_actions.createdfriendaction.md)

Defined in: [packages/client-core/redux/friend/actions.ts:58](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/friend/actions.ts#L58)

___

### fetchingFriends

▸ **fetchingFriends**(): [*FriendAction*](redux_friend_actions.md#friendaction)

**Returns:** [*FriendAction*](redux_friend_actions.md#friendaction)

Defined in: [packages/client-core/redux/friend/actions.ts:81](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/friend/actions.ts#L81)

___

### loadedFriends

▸ **loadedFriends**(`friendResult`: FriendResult): [*FriendAction*](redux_friend_actions.md#friendaction)

#### Parameters:

Name | Type |
:------ | :------ |
`friendResult` | FriendResult |

**Returns:** [*FriendAction*](redux_friend_actions.md#friendaction)

Defined in: [packages/client-core/redux/friend/actions.ts:48](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/friend/actions.ts#L48)

___

### patchedFriend

▸ **patchedFriend**(`userRelationship`: UserRelationship, `selfUser`: User): [*PatchedFriendAction*](../interfaces/redux_friend_actions.patchedfriendaction.md)

#### Parameters:

Name | Type |
:------ | :------ |
`userRelationship` | UserRelationship |
`selfUser` | User |

**Returns:** [*PatchedFriendAction*](../interfaces/redux_friend_actions.patchedfriendaction.md)

Defined in: [packages/client-core/redux/friend/actions.ts:65](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/friend/actions.ts#L65)

___

### removedFriend

▸ **removedFriend**(`userRelationship`: UserRelationship, `selfUser`: User): [*RemovedFriendAction*](../interfaces/redux_friend_actions.removedfriendaction.md)

#### Parameters:

Name | Type |
:------ | :------ |
`userRelationship` | UserRelationship |
`selfUser` | User |

**Returns:** [*RemovedFriendAction*](../interfaces/redux_friend_actions.removedfriendaction.md)

Defined in: [packages/client-core/redux/friend/actions.ts:73](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/friend/actions.ts#L73)
