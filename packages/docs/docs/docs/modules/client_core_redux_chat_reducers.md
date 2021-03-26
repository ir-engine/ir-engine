---
id: "client_core_redux_chat_reducers"
title: "Module: client-core/redux/chat/reducers"
sidebar_label: "client-core/redux/chat/reducers"
custom_edit_url: null
hide_title: true
---

# Module: client-core/redux/chat/reducers

## Variables

### initialState

• `Const` **initialState**: *object*

#### Type declaration:

Name | Type |
:------ | :------ |
`channels` | *object* |
`channels.channels` | *object* |
`channels.limit` | *number* |
`channels.skip` | *number* |
`channels.total` | *number* |
`channels.updateNeeded` | *boolean* |
`instanceChannelFetched` | *boolean* |
`instanceChannelFetching` | *boolean* |
`messageScrollInit` | *boolean* |
`targetChannelId` | *string* |
`targetObject` | *object* |
`targetObjectType` | *string* |
`updateMessageScroll` | *boolean* |

Defined in: [packages/client-core/redux/chat/reducers.ts:36](https://github.com/xr3ngine/xr3ngine/blob/9d253dc38/packages/client-core/redux/chat/reducers.ts#L36)

## Functions

### default

▸ `Const`**default**(`state?`: *any*, `action`: [*ChatAction*](client_core_redux_chat_actions.md#chataction)): *any*

#### Parameters:

Name | Type |
:------ | :------ |
`state` | *any* |
`action` | [*ChatAction*](client_core_redux_chat_actions.md#chataction) |

**Returns:** *any*

Defined in: [packages/client-core/redux/chat/reducers.ts:55](https://github.com/xr3ngine/xr3ngine/blob/9d253dc38/packages/client-core/redux/chat/reducers.ts#L55)
