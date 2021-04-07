---
id: "redux_friend_service"
title: "Module: redux/friend/service"
sidebar_label: "redux/friend/service"
custom_edit_url: null
hide_title: true
---

# Module: redux/friend/service

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

Defined in: [packages/client-core/redux/friend/service.ts:37](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/friend/service.ts#L37)

___

### unfriend

▸ **unfriend**(`relatedUserId`: *string*): *function*

#### Parameters:

Name | Type |
:------ | :------ |
`relatedUserId` | *string* |

**Returns:** (`dispatch`: *Dispatch*<AnyAction\>) => *Promise*<any\>

Defined in: [packages/client-core/redux/friend/service.ts:120](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/friend/service.ts#L120)
