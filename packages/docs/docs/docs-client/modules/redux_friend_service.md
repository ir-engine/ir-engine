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

Defined in: [packages/client-core/redux/friend/service.ts:34](https://github.com/xr3ngine/xr3ngine/blob/66a84a950/packages/client-core/redux/friend/service.ts#L34)

___

### unfriend

▸ **unfriend**(`relatedUserId`: *string*): *function*

#### Parameters:

Name | Type |
:------ | :------ |
`relatedUserId` | *string* |

**Returns:** (`dispatch`: *Dispatch*<AnyAction\>) => *Promise*<any\>

Defined in: [packages/client-core/redux/friend/service.ts:117](https://github.com/xr3ngine/xr3ngine/blob/66a84a950/packages/client-core/redux/friend/service.ts#L117)
