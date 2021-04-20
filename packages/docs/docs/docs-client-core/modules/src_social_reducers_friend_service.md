---
id: "src_social_reducers_friend_service"
title: "Module: src/social/reducers/friend/service"
sidebar_label: "src/social/reducers/friend/service"
custom_edit_url: null
hide_title: true
---

# Module: src/social/reducers/friend/service

## Functions

### getFriends

▸ **getFriends**(`search`: *string*, `skip?`: *number*, `limit?`: *number*): *function*

#### Parameters:

Name | Type |
:------ | :------ |
`search` | *string* |
`skip?` | *number* |
`limit?` | *number* |

**Returns:** (`dispatch`: *Dispatch*<AnyAction\>, `getState`: *any*) => *Promise*<any\>

Defined in: [packages/client-core/src/social/reducers/friend/service.ts:36](https://github.com/xr3ngine/xr3ngine/blob/65dfcf39a/packages/client-core/src/social/reducers/friend/service.ts#L36)

___

### unfriend

▸ **unfriend**(`relatedUserId`: *string*): *function*

#### Parameters:

Name | Type |
:------ | :------ |
`relatedUserId` | *string* |

**Returns:** (`dispatch`: *Dispatch*<AnyAction\>) => *Promise*<any\>

Defined in: [packages/client-core/src/social/reducers/friend/service.ts:119](https://github.com/xr3ngine/xr3ngine/blob/65dfcf39a/packages/client-core/src/social/reducers/friend/service.ts#L119)
