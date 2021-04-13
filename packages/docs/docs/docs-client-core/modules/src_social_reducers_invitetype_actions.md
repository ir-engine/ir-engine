---
id: "src_social_reducers_invitetype_actions"
title: "Module: src/social/reducers/inviteType/actions"
sidebar_label: "src/social/reducers/inviteType/actions"
custom_edit_url: null
hide_title: true
---

# Module: src/social/reducers/inviteType/actions

## Table of contents

### Interfaces

- [InviteTypeCreatedAction](../interfaces/src_social_reducers_invitetype_actions.invitetypecreatedaction.md)
- [InviteTypeRemoveAction](../interfaces/src_social_reducers_invitetype_actions.invitetyperemoveaction.md)
- [InvitesTypesRetrievedAction](../interfaces/src_social_reducers_invitetype_actions.invitestypesretrievedaction.md)

## Type aliases

### InviteTypeAction

Ƭ **InviteTypeAction**: [*InviteTypeCreatedAction*](../interfaces/src_social_reducers_invitetype_actions.invitetypecreatedaction.md) \| [*InviteTypeRemoveAction*](../interfaces/src_social_reducers_invitetype_actions.invitetyperemoveaction.md) \| [*InvitesTypesRetrievedAction*](../interfaces/src_social_reducers_invitetype_actions.invitestypesretrievedaction.md)

Defined in: [packages/client-core/src/social/reducers/inviteType/actions.ts:26](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/client-core/src/social/reducers/inviteType/actions.ts#L26)

## Functions

### fetchingInvitesTypes

▸ **fetchingInvitesTypes**(): [*InviteTypeAction*](src_social_reducers_invitetype_actions.md#invitetypeaction)

**Returns:** [*InviteTypeAction*](src_social_reducers_invitetype_actions.md#invitetypeaction)

Defined in: [packages/client-core/src/social/reducers/inviteType/actions.ts:39](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/client-core/src/social/reducers/inviteType/actions.ts#L39)

___

### retrievedInvitesTypes

▸ **retrievedInvitesTypes**(`inviteType`: InviteResult): [*InvitesTypesRetrievedAction*](../interfaces/src_social_reducers_invitetype_actions.invitestypesretrievedaction.md)

#### Parameters:

Name | Type |
:------ | :------ |
`inviteType` | InviteResult |

**Returns:** [*InvitesTypesRetrievedAction*](../interfaces/src_social_reducers_invitetype_actions.invitestypesretrievedaction.md)

Defined in: [packages/client-core/src/social/reducers/inviteType/actions.ts:28](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/client-core/src/social/reducers/inviteType/actions.ts#L28)
