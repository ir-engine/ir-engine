---
id: "redux_invite_actions"
title: "Module: redux/invite/actions"
sidebar_label: "redux/invite/actions"
custom_edit_url: null
hide_title: true
---

# Module: redux/invite/actions

## Table of contents

### Interfaces

- [FetchingReceivedInvitesAction](../interfaces/redux_invite_actions.fetchingreceivedinvitesaction.md)
- [FetchingSentInvitesAction](../interfaces/redux_invite_actions.fetchingsentinvitesaction.md)
- [InviteCreatedAction](../interfaces/redux_invite_actions.invitecreatedaction.md)
- [InviteRemovedAction](../interfaces/redux_invite_actions.inviteremovedaction.md)
- [InviteSentAction](../interfaces/redux_invite_actions.invitesentaction.md)
- [InviteTargetSetAction](../interfaces/redux_invite_actions.invitetargetsetaction.md)
- [InvitesRetrievedAction](../interfaces/redux_invite_actions.invitesretrievedaction.md)

## Type aliases

### InviteAction

Ƭ **InviteAction**: [*InviteSentAction*](../interfaces/redux_invite_actions.invitesentaction.md) \| [*InvitesRetrievedAction*](../interfaces/redux_invite_actions.invitesretrievedaction.md) \| [*InviteCreatedAction*](../interfaces/redux_invite_actions.invitecreatedaction.md) \| [*InviteRemovedAction*](../interfaces/redux_invite_actions.inviteremovedaction.md) \| [*InviteTargetSetAction*](../interfaces/redux_invite_actions.invitetargetsetaction.md) \| [*FetchingReceivedInvitesAction*](../interfaces/redux_invite_actions.fetchingreceivedinvitesaction.md) \| [*FetchingSentInvitesAction*](../interfaces/redux_invite_actions.fetchingsentinvitesaction.md)

Defined in: [packages/client-core/redux/invite/actions.ts:58](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/invite/actions.ts#L58)

## Functions

### acceptedInvite

▸ **acceptedInvite**(): [*InviteAction*](redux_invite_actions.md#inviteaction)

**Returns:** [*InviteAction*](redux_invite_actions.md#inviteaction)

Defined in: [packages/client-core/redux/invite/actions.ts:116](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/invite/actions.ts#L116)

___

### createdReceivedInvite

▸ **createdReceivedInvite**(): [*InviteCreatedAction*](../interfaces/redux_invite_actions.invitecreatedaction.md)

**Returns:** [*InviteCreatedAction*](../interfaces/redux_invite_actions.invitecreatedaction.md)

Defined in: [packages/client-core/redux/invite/actions.ts:94](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/invite/actions.ts#L94)

___

### createdSentInvite

▸ **createdSentInvite**(): [*InviteCreatedAction*](../interfaces/redux_invite_actions.invitecreatedaction.md)

**Returns:** [*InviteCreatedAction*](../interfaces/redux_invite_actions.invitecreatedaction.md)

Defined in: [packages/client-core/redux/invite/actions.ts:105](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/invite/actions.ts#L105)

___

### declinedInvite

▸ **declinedInvite**(): [*InviteAction*](redux_invite_actions.md#inviteaction)

**Returns:** [*InviteAction*](redux_invite_actions.md#inviteaction)

Defined in: [packages/client-core/redux/invite/actions.ts:122](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/invite/actions.ts#L122)

___

### fetchingReceivedInvites

▸ **fetchingReceivedInvites**(): [*InviteAction*](redux_invite_actions.md#inviteaction)

**Returns:** [*InviteAction*](redux_invite_actions.md#inviteaction)

Defined in: [packages/client-core/redux/invite/actions.ts:142](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/invite/actions.ts#L142)

___

### fetchingSentInvites

▸ **fetchingSentInvites**(): [*InviteAction*](redux_invite_actions.md#inviteaction)

**Returns:** [*InviteAction*](redux_invite_actions.md#inviteaction)

Defined in: [packages/client-core/redux/invite/actions.ts:136](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/invite/actions.ts#L136)

___

### removedReceivedInvite

▸ **removedReceivedInvite**(): [*InviteRemovedAction*](../interfaces/redux_invite_actions.inviteremovedaction.md)

**Returns:** [*InviteRemovedAction*](../interfaces/redux_invite_actions.inviteremovedaction.md)

Defined in: [packages/client-core/redux/invite/actions.ts:99](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/invite/actions.ts#L99)

___

### removedSentInvite

▸ **removedSentInvite**(): [*InviteRemovedAction*](../interfaces/redux_invite_actions.inviteremovedaction.md)

**Returns:** [*InviteRemovedAction*](../interfaces/redux_invite_actions.inviteremovedaction.md)

Defined in: [packages/client-core/redux/invite/actions.ts:110](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/invite/actions.ts#L110)

___

### retrievedReceivedInvites

▸ **retrievedReceivedInvites**(`inviteResult`: InviteResult): [*InviteAction*](redux_invite_actions.md#inviteaction)

#### Parameters:

Name | Type |
:------ | :------ |
`inviteResult` | InviteResult |

**Returns:** [*InviteAction*](redux_invite_actions.md#inviteaction)

Defined in: [packages/client-core/redux/invite/actions.ts:84](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/invite/actions.ts#L84)

___

### retrievedSentInvites

▸ **retrievedSentInvites**(`inviteResult`: InviteResult): [*InviteAction*](redux_invite_actions.md#inviteaction)

#### Parameters:

Name | Type |
:------ | :------ |
`inviteResult` | InviteResult |

**Returns:** [*InviteAction*](redux_invite_actions.md#inviteaction)

Defined in: [packages/client-core/redux/invite/actions.ts:74](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/invite/actions.ts#L74)

___

### sentInvite

▸ **sentInvite**(`id`: *string*): [*InviteAction*](redux_invite_actions.md#inviteaction)

#### Parameters:

Name | Type |
:------ | :------ |
`id` | *string* |

**Returns:** [*InviteAction*](redux_invite_actions.md#inviteaction)

Defined in: [packages/client-core/redux/invite/actions.ts:67](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/invite/actions.ts#L67)

___

### setInviteTarget

▸ **setInviteTarget**(`targetObjectType`: *string*, `targetObjectId`: *string*): [*InviteAction*](redux_invite_actions.md#inviteaction)

#### Parameters:

Name | Type |
:------ | :------ |
`targetObjectType` | *string* |
`targetObjectId` | *string* |

**Returns:** [*InviteAction*](redux_invite_actions.md#inviteaction)

Defined in: [packages/client-core/redux/invite/actions.ts:128](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/invite/actions.ts#L128)
