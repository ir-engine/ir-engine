---
id: "client_core_redux_party_actions"
title: "Module: client-core/redux/party/actions"
sidebar_label: "client-core/redux/party/actions"
custom_edit_url: null
hide_title: true
---

# Module: client-core/redux/party/actions

## Table of contents

### Interfaces

- [CreatedPartyAction](../interfaces/client_core_redux_party_actions.createdpartyaction.md)
- [CreatedPartyUserAction](../interfaces/client_core_redux_party_actions.createdpartyuseraction.md)
- [InvitedPartyUserAction](../interfaces/client_core_redux_party_actions.invitedpartyuseraction.md)
- [LeftPartyAction](../interfaces/client_core_redux_party_actions.leftpartyaction.md)
- [LoadedPartyAction](../interfaces/client_core_redux_party_actions.loadedpartyaction.md)
- [LoadedPartyUsersAction](../interfaces/client_core_redux_party_actions.loadedpartyusersaction.md)
- [LoadedSelfPartyUserAction](../interfaces/client_core_redux_party_actions.loadedselfpartyuseraction.md)
- [PatchedPartyAction](../interfaces/client_core_redux_party_actions.patchedpartyaction.md)
- [PatchedPartyUserAction](../interfaces/client_core_redux_party_actions.patchedpartyuseraction.md)
- [RemovedPartyAction](../interfaces/client_core_redux_party_actions.removedpartyaction.md)
- [RemovedPartyUserAction](../interfaces/client_core_redux_party_actions.removedpartyuseraction.md)

## Type aliases

### PartyAction

Ƭ **PartyAction**: [*LoadedPartyAction*](../interfaces/client_core_redux_party_actions.loadedpartyaction.md) \| [*CreatedPartyAction*](../interfaces/client_core_redux_party_actions.createdpartyaction.md) \| [*PatchedPartyAction*](../interfaces/client_core_redux_party_actions.patchedpartyaction.md) \| [*RemovedPartyAction*](../interfaces/client_core_redux_party_actions.removedpartyaction.md) \| [*LeftPartyAction*](../interfaces/client_core_redux_party_actions.leftpartyaction.md) \| [*CreatedPartyUserAction*](../interfaces/client_core_redux_party_actions.createdpartyuseraction.md) \| [*PatchedPartyUserAction*](../interfaces/client_core_redux_party_actions.patchedpartyuseraction.md)

Defined in: [packages/client-core/redux/party/actions.ts:60](https://github.com/xr3ngine/xr3ngine/blob/5c3dcaef1/packages/client-core/redux/party/actions.ts#L60)

___

### PartyUserAction

Ƭ **PartyUserAction**: [*LoadedPartyUsersAction*](../interfaces/client_core_redux_party_actions.loadedpartyusersaction.md) \| [*RemovedPartyUserAction*](../interfaces/client_core_redux_party_actions.removedpartyuseraction.md) \| [*LoadedSelfPartyUserAction*](../interfaces/client_core_redux_party_actions.loadedselfpartyuseraction.md)

Defined in: [packages/client-core/redux/party/actions.ts:127](https://github.com/xr3ngine/xr3ngine/blob/5c3dcaef1/packages/client-core/redux/party/actions.ts#L127)

## Functions

### createdParty

▸ **createdParty**(`party`: Party): [*CreatedPartyAction*](../interfaces/client_core_redux_party_actions.createdpartyaction.md)

#### Parameters:

Name | Type |
:------ | :------ |
`party` | Party |

**Returns:** [*CreatedPartyAction*](../interfaces/client_core_redux_party_actions.createdpartyaction.md)

Defined in: [packages/client-core/redux/party/actions.ts:76](https://github.com/xr3ngine/xr3ngine/blob/5c3dcaef1/packages/client-core/redux/party/actions.ts#L76)

___

### createdPartyUser

▸ **createdPartyUser**(`partyUser`: PartyUser): [*CreatedPartyUserAction*](../interfaces/client_core_redux_party_actions.createdpartyuseraction.md)

#### Parameters:

Name | Type |
:------ | :------ |
`partyUser` | PartyUser |

**Returns:** [*CreatedPartyUserAction*](../interfaces/client_core_redux_party_actions.createdpartyuseraction.md)

Defined in: [packages/client-core/redux/party/actions.ts:133](https://github.com/xr3ngine/xr3ngine/blob/5c3dcaef1/packages/client-core/redux/party/actions.ts#L133)

___

### invitedPartyUser

▸ **invitedPartyUser**(): [*InvitedPartyUserAction*](../interfaces/client_core_redux_party_actions.invitedpartyuseraction.md)

**Returns:** [*InvitedPartyUserAction*](../interfaces/client_core_redux_party_actions.invitedpartyuseraction.md)

Defined in: [packages/client-core/redux/party/actions.ts:97](https://github.com/xr3ngine/xr3ngine/blob/5c3dcaef1/packages/client-core/redux/party/actions.ts#L97)

___

### leftParty

▸ **leftParty**(): [*LeftPartyAction*](../interfaces/client_core_redux_party_actions.leftpartyaction.md)

**Returns:** [*LeftPartyAction*](../interfaces/client_core_redux_party_actions.leftpartyaction.md)

Defined in: [packages/client-core/redux/party/actions.ts:103](https://github.com/xr3ngine/xr3ngine/blob/5c3dcaef1/packages/client-core/redux/party/actions.ts#L103)

___

### loadedParty

▸ **loadedParty**(`partyResult`: PartyResult): [*PartyAction*](client_core_redux_party_actions.md#partyaction)

#### Parameters:

Name | Type |
:------ | :------ |
`partyResult` | PartyResult |

**Returns:** [*PartyAction*](client_core_redux_party_actions.md#partyaction)

Defined in: [packages/client-core/redux/party/actions.ts:69](https://github.com/xr3ngine/xr3ngine/blob/5c3dcaef1/packages/client-core/redux/party/actions.ts#L69)

___

### patchedParty

▸ **patchedParty**(`party`: Party): [*PatchedPartyAction*](../interfaces/client_core_redux_party_actions.patchedpartyaction.md)

#### Parameters:

Name | Type |
:------ | :------ |
`party` | Party |

**Returns:** [*PatchedPartyAction*](../interfaces/client_core_redux_party_actions.patchedpartyaction.md)

Defined in: [packages/client-core/redux/party/actions.ts:83](https://github.com/xr3ngine/xr3ngine/blob/5c3dcaef1/packages/client-core/redux/party/actions.ts#L83)

___

### patchedPartyUser

▸ **patchedPartyUser**(`partyUser`: PartyUser): [*PatchedPartyUserAction*](../interfaces/client_core_redux_party_actions.patchedpartyuseraction.md)

#### Parameters:

Name | Type |
:------ | :------ |
`partyUser` | PartyUser |

**Returns:** [*PatchedPartyUserAction*](../interfaces/client_core_redux_party_actions.patchedpartyuseraction.md)

Defined in: [packages/client-core/redux/party/actions.ts:140](https://github.com/xr3ngine/xr3ngine/blob/5c3dcaef1/packages/client-core/redux/party/actions.ts#L140)

___

### removedParty

▸ **removedParty**(`party`: Party): [*RemovedPartyAction*](../interfaces/client_core_redux_party_actions.removedpartyaction.md)

#### Parameters:

Name | Type |
:------ | :------ |
`party` | Party |

**Returns:** [*RemovedPartyAction*](../interfaces/client_core_redux_party_actions.removedpartyaction.md)

Defined in: [packages/client-core/redux/party/actions.ts:90](https://github.com/xr3ngine/xr3ngine/blob/5c3dcaef1/packages/client-core/redux/party/actions.ts#L90)

___

### removedPartyUser

▸ **removedPartyUser**(`partyUser`: PartyUser): [*RemovedPartyUserAction*](../interfaces/client_core_redux_party_actions.removedpartyuseraction.md)

#### Parameters:

Name | Type |
:------ | :------ |
`partyUser` | PartyUser |

**Returns:** [*RemovedPartyUserAction*](../interfaces/client_core_redux_party_actions.removedpartyuseraction.md)

Defined in: [packages/client-core/redux/party/actions.ts:147](https://github.com/xr3ngine/xr3ngine/blob/5c3dcaef1/packages/client-core/redux/party/actions.ts#L147)
