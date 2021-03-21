---
id: "client_core_redux_invite_reducers"
title: "Module: client-core/redux/invite/reducers"
sidebar_label: "client-core/redux/invite/reducers"
custom_edit_url: null
hide_title: true
---

# Module: client-core/redux/invite/reducers

## Variables

### initialState

• `Const` **initialState**: *object*

#### Type declaration:

Name | Type |
:------ | :------ |
`getReceivedInvitesInProgress` | *boolean* |
`getSentInvitesInProgress` | *boolean* |
`receivedInvites` | *object* |
`receivedInvites.invites` | *any*[] |
`receivedInvites.limit` | *number* |
`receivedInvites.skip` | *number* |
`receivedInvites.total` | *number* |
`receivedUpdateNeeded` | *boolean* |
`sentInvites` | *object* |
`sentInvites.invites` | *any*[] |
`sentInvites.limit` | *number* |
`sentInvites.skip` | *number* |
`sentInvites.total` | *number* |
`sentUpdateNeeded` | *boolean* |
`targetObjectId` | *string* |
`targetObjectType` | *string* |

Defined in: [packages/client-core/redux/invite/reducers.ts:24](https://github.com/xr3ngine/xr3ngine/blob/5a0f83ed8/packages/client-core/redux/invite/reducers.ts#L24)

## Functions

### default

▸ `Const`**default**(`state?`: *any*, `action`: [*InviteAction*](client_core_redux_invite_actions.md#inviteaction)): *any*

#### Parameters:

Name | Type |
:------ | :------ |
`state` | *any* |
`action` | [*InviteAction*](client_core_redux_invite_actions.md#inviteaction) |

**Returns:** *any*

Defined in: [packages/client-core/redux/invite/reducers.ts:47](https://github.com/xr3ngine/xr3ngine/blob/5a0f83ed8/packages/client-core/redux/invite/reducers.ts#L47)
