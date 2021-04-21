---
id: "src_social_reducers_invite_reducers"
title: "Module: src/social/reducers/invite/reducers"
sidebar_label: "src/social/reducers/invite/reducers"
custom_edit_url: null
hide_title: true
---

# Module: src/social/reducers/invite/reducers

## Variables

### initialInviteState

• `Const` **initialInviteState**: *object*

#### Type declaration:

| Name | Type |
| :------ | :------ |
| `getReceivedInvitesInProgress` | *boolean* |
| `getSentInvitesInProgress` | *boolean* |
| `receivedInvites` | *object* |
| `receivedInvites.invites` | *any*[] |
| `receivedInvites.limit` | *number* |
| `receivedInvites.skip` | *number* |
| `receivedInvites.total` | *number* |
| `receivedUpdateNeeded` | *boolean* |
| `sentInvites` | *object* |
| `sentInvites.invites` | *any*[] |
| `sentInvites.limit` | *number* |
| `sentInvites.skip` | *number* |
| `sentInvites.total` | *number* |
| `sentUpdateNeeded` | *boolean* |
| `targetObjectId` | *string* |
| `targetObjectType` | *string* |

Defined in: [packages/client-core/src/social/reducers/invite/reducers.ts:24](https://github.com/xr3ngine/xr3ngine/blob/7e8e151f1/packages/client-core/src/social/reducers/invite/reducers.ts#L24)

## Functions

### default

▸ `Const`**default**(`state?`: *any*, `action`: [*InviteAction*](src_social_reducers_invite_actions.md#inviteaction)): *any*

#### Parameters:

| Name | Type |
| :------ | :------ |
| `state` | *any* |
| `action` | [*InviteAction*](src_social_reducers_invite_actions.md#inviteaction) |

**Returns:** *any*

Defined in: [packages/client-core/src/social/reducers/invite/reducers.ts:48](https://github.com/xr3ngine/xr3ngine/blob/7e8e151f1/packages/client-core/src/social/reducers/invite/reducers.ts#L48)
