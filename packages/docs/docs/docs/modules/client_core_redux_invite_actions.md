---
id: "client_core_redux_invite_actions"
title: "Module: client-core/redux/invite/actions"
sidebar_label: "client-core/redux/invite/actions"
custom_edit_url: null
hide_title: true
---

# Module: client-core/redux/invite/actions

## Table of contents

### Interfaces

- [FetchingReceivedInvitesAction](../interfaces/client_core_redux_invite_actions.fetchingreceivedinvitesaction.md)
- [FetchingSentInvitesAction](../interfaces/client_core_redux_invite_actions.fetchingsentinvitesaction.md)
- [InviteCreatedAction](../interfaces/client_core_redux_invite_actions.invitecreatedaction.md)
- [InviteRemovedAction](../interfaces/client_core_redux_invite_actions.inviteremovedaction.md)
- [InviteSentAction](../interfaces/client_core_redux_invite_actions.invitesentaction.md)
- [InviteTargetSetAction](../interfaces/client_core_redux_invite_actions.invitetargetsetaction.md)
- [InvitesRetrievedAction](../interfaces/client_core_redux_invite_actions.invitesretrievedaction.md)

## Type aliases

### InviteAction

Ƭ **InviteAction**: [*InviteSentAction*](../interfaces/client_core_redux_invite_actions.invitesentaction.md) \| [*InvitesRetrievedAction*](../interfaces/client_core_redux_invite_actions.invitesretrievedaction.md) \| [*InviteCreatedAction*](../interfaces/client_core_redux_invite_actions.invitecreatedaction.md) \| [*InviteRemovedAction*](../interfaces/client_core_redux_invite_actions.inviteremovedaction.md) \| [*InviteTargetSetAction*](../interfaces/client_core_redux_invite_actions.invitetargetsetaction.md) \| [*FetchingReceivedInvitesAction*](../interfaces/client_core_redux_invite_actions.fetchingreceivedinvitesaction.md) \| [*FetchingSentInvitesAction*](../interfaces/client_core_redux_invite_actions.fetchingsentinvitesaction.md)

Defined in: [packages/client-core/redux/invite/actions.ts:58](https://github.com/xr3ngine/xr3ngine/blob/5a0f83ed8/packages/client-core/redux/invite/actions.ts#L58)

## Functions

### acceptedInvite

▸ **acceptedInvite**(): [*InviteAction*](client_core_redux_invite_actions.md#inviteaction)

**Returns:** [*InviteAction*](client_core_redux_invite_actions.md#inviteaction)

Defined in: [packages/client-core/redux/invite/actions.ts:116](https://github.com/xr3ngine/xr3ngine/blob/5a0f83ed8/packages/client-core/redux/invite/actions.ts#L116)

___

### createdReceivedInvite

▸ **createdReceivedInvite**(): [*InviteCreatedAction*](../interfaces/client_core_redux_invite_actions.invitecreatedaction.md)

**Returns:** [*InviteCreatedAction*](../interfaces/client_core_redux_invite_actions.invitecreatedaction.md)

Defined in: [packages/client-core/redux/invite/actions.ts:94](https://github.com/xr3ngine/xr3ngine/blob/5a0f83ed8/packages/client-core/redux/invite/actions.ts#L94)

___

### createdSentInvite

▸ **createdSentInvite**(): [*InviteCreatedAction*](../interfaces/client_core_redux_invite_actions.invitecreatedaction.md)

**Returns:** [*InviteCreatedAction*](../interfaces/client_core_redux_invite_actions.invitecreatedaction.md)

Defined in: [packages/client-core/redux/invite/actions.ts:105](https://github.com/xr3ngine/xr3ngine/blob/5a0f83ed8/packages/client-core/redux/invite/actions.ts#L105)

___

### declinedInvite

▸ **declinedInvite**(): [*InviteAction*](client_core_redux_invite_actions.md#inviteaction)

**Returns:** [*InviteAction*](client_core_redux_invite_actions.md#inviteaction)

Defined in: [packages/client-core/redux/invite/actions.ts:122](https://github.com/xr3ngine/xr3ngine/blob/5a0f83ed8/packages/client-core/redux/invite/actions.ts#L122)

___

### fetchingReceivedInvites

▸ **fetchingReceivedInvites**(): [*InviteAction*](client_core_redux_invite_actions.md#inviteaction)

**Returns:** [*InviteAction*](client_core_redux_invite_actions.md#inviteaction)

Defined in: [packages/client-core/redux/invite/actions.ts:142](https://github.com/xr3ngine/xr3ngine/blob/5a0f83ed8/packages/client-core/redux/invite/actions.ts#L142)

___

### fetchingSentInvites

▸ **fetchingSentInvites**(): [*InviteAction*](client_core_redux_invite_actions.md#inviteaction)

**Returns:** [*InviteAction*](client_core_redux_invite_actions.md#inviteaction)

Defined in: [packages/client-core/redux/invite/actions.ts:136](https://github.com/xr3ngine/xr3ngine/blob/5a0f83ed8/packages/client-core/redux/invite/actions.ts#L136)

___

### removedReceivedInvite

▸ **removedReceivedInvite**(): [*InviteRemovedAction*](../interfaces/client_core_redux_invite_actions.inviteremovedaction.md)

**Returns:** [*InviteRemovedAction*](../interfaces/client_core_redux_invite_actions.inviteremovedaction.md)

Defined in: [packages/client-core/redux/invite/actions.ts:99](https://github.com/xr3ngine/xr3ngine/blob/5a0f83ed8/packages/client-core/redux/invite/actions.ts#L99)

___

### removedSentInvite

▸ **removedSentInvite**(): [*InviteRemovedAction*](../interfaces/client_core_redux_invite_actions.inviteremovedaction.md)

**Returns:** [*InviteRemovedAction*](../interfaces/client_core_redux_invite_actions.inviteremovedaction.md)

Defined in: [packages/client-core/redux/invite/actions.ts:110](https://github.com/xr3ngine/xr3ngine/blob/5a0f83ed8/packages/client-core/redux/invite/actions.ts#L110)

___

### retrievedReceivedInvites

▸ **retrievedReceivedInvites**(`inviteResult`: InviteResult): [*InviteAction*](client_core_redux_invite_actions.md#inviteaction)

#### Parameters:

Name | Type |
:------ | :------ |
`inviteResult` | InviteResult |

**Returns:** [*InviteAction*](client_core_redux_invite_actions.md#inviteaction)

Defined in: [packages/client-core/redux/invite/actions.ts:84](https://github.com/xr3ngine/xr3ngine/blob/5a0f83ed8/packages/client-core/redux/invite/actions.ts#L84)

___

### retrievedSentInvites

▸ **retrievedSentInvites**(`inviteResult`: InviteResult): [*InviteAction*](client_core_redux_invite_actions.md#inviteaction)

#### Parameters:

Name | Type |
:------ | :------ |
`inviteResult` | InviteResult |

**Returns:** [*InviteAction*](client_core_redux_invite_actions.md#inviteaction)

Defined in: [packages/client-core/redux/invite/actions.ts:74](https://github.com/xr3ngine/xr3ngine/blob/5a0f83ed8/packages/client-core/redux/invite/actions.ts#L74)

___

### sentInvite

▸ **sentInvite**(`id`: *string*): [*InviteAction*](client_core_redux_invite_actions.md#inviteaction)

#### Parameters:

Name | Type |
:------ | :------ |
`id` | *string* |

**Returns:** [*InviteAction*](client_core_redux_invite_actions.md#inviteaction)

Defined in: [packages/client-core/redux/invite/actions.ts:67](https://github.com/xr3ngine/xr3ngine/blob/5a0f83ed8/packages/client-core/redux/invite/actions.ts#L67)

___

### setInviteTarget

▸ **setInviteTarget**(`targetObjectType`: *string*, `targetObjectId`: *string*): [*InviteAction*](client_core_redux_invite_actions.md#inviteaction)

#### Parameters:

Name | Type |
:------ | :------ |
`targetObjectType` | *string* |
`targetObjectId` | *string* |

**Returns:** [*InviteAction*](client_core_redux_invite_actions.md#inviteaction)

Defined in: [packages/client-core/redux/invite/actions.ts:128](https://github.com/xr3ngine/xr3ngine/blob/5a0f83ed8/packages/client-core/redux/invite/actions.ts#L128)
