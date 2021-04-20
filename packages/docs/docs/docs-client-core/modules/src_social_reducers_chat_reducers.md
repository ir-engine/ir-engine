---
id: "src_social_reducers_chat_reducers"
title: "Module: src/social/reducers/chat/reducers"
sidebar_label: "src/social/reducers/chat/reducers"
custom_edit_url: null
hide_title: true
---

# Module: src/social/reducers/chat/reducers

## Variables

### initialChatState

• `Const` **initialChatState**: *object*

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

Defined in: [packages/client-core/src/social/reducers/chat/reducers.ts:36](https://github.com/xr3ngine/xr3ngine/blob/65dfcf39a/packages/client-core/src/social/reducers/chat/reducers.ts#L36)

## Functions

### default

▸ `Const`**default**(`state?`: *any*, `action`: [*ChatAction*](src_social_reducers_chat_actions.md#chataction)): *any*

#### Parameters:

Name | Type |
:------ | :------ |
`state` | *any* |
`action` | [*ChatAction*](src_social_reducers_chat_actions.md#chataction) |

**Returns:** *any*

Defined in: [packages/client-core/src/social/reducers/chat/reducers.ts:55](https://github.com/xr3ngine/xr3ngine/blob/65dfcf39a/packages/client-core/src/social/reducers/chat/reducers.ts#L55)
