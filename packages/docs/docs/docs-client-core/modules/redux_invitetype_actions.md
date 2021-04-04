---
id: "redux_invitetype_actions"
title: "Module: redux/inviteType/actions"
sidebar_label: "redux/inviteType/actions"
custom_edit_url: null
hide_title: true
---

# Module: redux/inviteType/actions

## Table of contents

### Interfaces

- [InviteTypeCreatedAction](../interfaces/redux_invitetype_actions.invitetypecreatedaction.md)
- [InviteTypeRemoveAction](../interfaces/redux_invitetype_actions.invitetyperemoveaction.md)
- [InvitesTypesRetrievedAction](../interfaces/redux_invitetype_actions.invitestypesretrievedaction.md)

## Type aliases

### InviteTypeAction

Ƭ **InviteTypeAction**: [*InviteTypeCreatedAction*](../interfaces/redux_invitetype_actions.invitetypecreatedaction.md) \| [*InviteTypeRemoveAction*](../interfaces/redux_invitetype_actions.invitetyperemoveaction.md) \| [*InvitesTypesRetrievedAction*](../interfaces/redux_invitetype_actions.invitestypesretrievedaction.md)

Defined in: [packages/client-core/redux/inviteType/actions.ts:26](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/inviteType/actions.ts#L26)

## Functions

### fetchingInvitesTypes

▸ **fetchingInvitesTypes**(): [*InviteTypeAction*](redux_invitetype_actions.md#invitetypeaction)

**Returns:** [*InviteTypeAction*](redux_invitetype_actions.md#invitetypeaction)

Defined in: [packages/client-core/redux/inviteType/actions.ts:39](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/inviteType/actions.ts#L39)

___

### retrievedInvitesTypes

▸ **retrievedInvitesTypes**(`inviteType`: InviteResult): [*InvitesTypesRetrievedAction*](../interfaces/redux_invitetype_actions.invitestypesretrievedaction.md)

#### Parameters:

Name | Type |
:------ | :------ |
`inviteType` | InviteResult |

**Returns:** [*InvitesTypesRetrievedAction*](../interfaces/redux_invitetype_actions.invitestypesretrievedaction.md)

Defined in: [packages/client-core/redux/inviteType/actions.ts:28](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/inviteType/actions.ts#L28)
