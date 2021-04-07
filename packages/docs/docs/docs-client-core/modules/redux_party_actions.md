---
id: "redux_party_actions"
title: "Module: redux/party/actions"
sidebar_label: "redux/party/actions"
custom_edit_url: null
hide_title: true
---

# Module: redux/party/actions

## Table of contents

### Interfaces

- [CreatedPartyAction](../interfaces/redux_party_actions.createdpartyaction.md)
- [CreatedPartyUserAction](../interfaces/redux_party_actions.createdpartyuseraction.md)
- [InvitedPartyUserAction](../interfaces/redux_party_actions.invitedpartyuseraction.md)
- [LeftPartyAction](../interfaces/redux_party_actions.leftpartyaction.md)
- [LoadedPartyAction](../interfaces/redux_party_actions.loadedpartyaction.md)
- [LoadedPartyUsersAction](../interfaces/redux_party_actions.loadedpartyusersaction.md)
- [LoadedSelfPartyUserAction](../interfaces/redux_party_actions.loadedselfpartyuseraction.md)
- [PatchedPartyAction](../interfaces/redux_party_actions.patchedpartyaction.md)
- [PatchedPartyUserAction](../interfaces/redux_party_actions.patchedpartyuseraction.md)
- [RemovedPartyAction](../interfaces/redux_party_actions.removedpartyaction.md)
- [RemovedPartyUserAction](../interfaces/redux_party_actions.removedpartyuseraction.md)

## Type aliases

### PartyAction

Ƭ **PartyAction**: [*LoadedPartyAction*](../interfaces/redux_party_actions.loadedpartyaction.md) \| [*CreatedPartyAction*](../interfaces/redux_party_actions.createdpartyaction.md) \| [*PatchedPartyAction*](../interfaces/redux_party_actions.patchedpartyaction.md) \| [*RemovedPartyAction*](../interfaces/redux_party_actions.removedpartyaction.md) \| [*LeftPartyAction*](../interfaces/redux_party_actions.leftpartyaction.md) \| [*CreatedPartyUserAction*](../interfaces/redux_party_actions.createdpartyuseraction.md) \| [*PatchedPartyUserAction*](../interfaces/redux_party_actions.patchedpartyuseraction.md)

Defined in: [packages/client-core/redux/party/actions.ts:60](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/party/actions.ts#L60)

___

### PartyUserAction

Ƭ **PartyUserAction**: [*LoadedPartyUsersAction*](../interfaces/redux_party_actions.loadedpartyusersaction.md) \| [*RemovedPartyUserAction*](../interfaces/redux_party_actions.removedpartyuseraction.md) \| [*LoadedSelfPartyUserAction*](../interfaces/redux_party_actions.loadedselfpartyuseraction.md)

Defined in: [packages/client-core/redux/party/actions.ts:127](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/party/actions.ts#L127)

## Functions

### createdParty

▸ **createdParty**(`party`: Party): [*CreatedPartyAction*](../interfaces/redux_party_actions.createdpartyaction.md)

#### Parameters:

Name | Type |
:------ | :------ |
`party` | Party |

**Returns:** [*CreatedPartyAction*](../interfaces/redux_party_actions.createdpartyaction.md)

Defined in: [packages/client-core/redux/party/actions.ts:76](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/party/actions.ts#L76)

___

### createdPartyUser

▸ **createdPartyUser**(`partyUser`: PartyUser): [*CreatedPartyUserAction*](../interfaces/redux_party_actions.createdpartyuseraction.md)

#### Parameters:

Name | Type |
:------ | :------ |
`partyUser` | PartyUser |

**Returns:** [*CreatedPartyUserAction*](../interfaces/redux_party_actions.createdpartyuseraction.md)

Defined in: [packages/client-core/redux/party/actions.ts:133](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/party/actions.ts#L133)

___

### invitedPartyUser

▸ **invitedPartyUser**(): [*InvitedPartyUserAction*](../interfaces/redux_party_actions.invitedpartyuseraction.md)

**Returns:** [*InvitedPartyUserAction*](../interfaces/redux_party_actions.invitedpartyuseraction.md)

Defined in: [packages/client-core/redux/party/actions.ts:97](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/party/actions.ts#L97)

___

### leftParty

▸ **leftParty**(): [*LeftPartyAction*](../interfaces/redux_party_actions.leftpartyaction.md)

**Returns:** [*LeftPartyAction*](../interfaces/redux_party_actions.leftpartyaction.md)

Defined in: [packages/client-core/redux/party/actions.ts:103](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/party/actions.ts#L103)

___

### loadedParty

▸ **loadedParty**(`partyResult`: PartyResult): [*PartyAction*](redux_party_actions.md#partyaction)

#### Parameters:

Name | Type |
:------ | :------ |
`partyResult` | PartyResult |

**Returns:** [*PartyAction*](redux_party_actions.md#partyaction)

Defined in: [packages/client-core/redux/party/actions.ts:69](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/party/actions.ts#L69)

___

### patchedParty

▸ **patchedParty**(`party`: Party): [*PatchedPartyAction*](../interfaces/redux_party_actions.patchedpartyaction.md)

#### Parameters:

Name | Type |
:------ | :------ |
`party` | Party |

**Returns:** [*PatchedPartyAction*](../interfaces/redux_party_actions.patchedpartyaction.md)

Defined in: [packages/client-core/redux/party/actions.ts:83](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/party/actions.ts#L83)

___

### patchedPartyUser

▸ **patchedPartyUser**(`partyUser`: PartyUser): [*PatchedPartyUserAction*](../interfaces/redux_party_actions.patchedpartyuseraction.md)

#### Parameters:

Name | Type |
:------ | :------ |
`partyUser` | PartyUser |

**Returns:** [*PatchedPartyUserAction*](../interfaces/redux_party_actions.patchedpartyuseraction.md)

Defined in: [packages/client-core/redux/party/actions.ts:140](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/party/actions.ts#L140)

___

### removedParty

▸ **removedParty**(`party`: Party): [*RemovedPartyAction*](../interfaces/redux_party_actions.removedpartyaction.md)

#### Parameters:

Name | Type |
:------ | :------ |
`party` | Party |

**Returns:** [*RemovedPartyAction*](../interfaces/redux_party_actions.removedpartyaction.md)

Defined in: [packages/client-core/redux/party/actions.ts:90](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/party/actions.ts#L90)

___

### removedPartyUser

▸ **removedPartyUser**(`partyUser`: PartyUser): [*RemovedPartyUserAction*](../interfaces/redux_party_actions.removedpartyuseraction.md)

#### Parameters:

Name | Type |
:------ | :------ |
`partyUser` | PartyUser |

**Returns:** [*RemovedPartyUserAction*](../interfaces/redux_party_actions.removedpartyuseraction.md)

Defined in: [packages/client-core/redux/party/actions.ts:147](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/party/actions.ts#L147)
