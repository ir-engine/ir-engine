---
id: "src_social_reducers_party_actions"
title: "Module: src/social/reducers/party/actions"
sidebar_label: "src/social/reducers/party/actions"
custom_edit_url: null
hide_title: true
---

# Module: src/social/reducers/party/actions

## Table of contents

### Interfaces

- [CreatedPartyAction](../interfaces/src_social_reducers_party_actions.createdpartyaction.md)
- [CreatedPartyUserAction](../interfaces/src_social_reducers_party_actions.createdpartyuseraction.md)
- [InvitedPartyUserAction](../interfaces/src_social_reducers_party_actions.invitedpartyuseraction.md)
- [LeftPartyAction](../interfaces/src_social_reducers_party_actions.leftpartyaction.md)
- [LoadedPartyAction](../interfaces/src_social_reducers_party_actions.loadedpartyaction.md)
- [LoadedPartyUsersAction](../interfaces/src_social_reducers_party_actions.loadedpartyusersaction.md)
- [LoadedSelfPartyUserAction](../interfaces/src_social_reducers_party_actions.loadedselfpartyuseraction.md)
- [PatchedPartyAction](../interfaces/src_social_reducers_party_actions.patchedpartyaction.md)
- [PatchedPartyUserAction](../interfaces/src_social_reducers_party_actions.patchedpartyuseraction.md)
- [RemovedPartyAction](../interfaces/src_social_reducers_party_actions.removedpartyaction.md)
- [RemovedPartyUserAction](../interfaces/src_social_reducers_party_actions.removedpartyuseraction.md)

## Type aliases

### PartyAction

Ƭ **PartyAction**: [*LoadedPartyAction*](../interfaces/src_social_reducers_party_actions.loadedpartyaction.md) \| [*CreatedPartyAction*](../interfaces/src_social_reducers_party_actions.createdpartyaction.md) \| [*PatchedPartyAction*](../interfaces/src_social_reducers_party_actions.patchedpartyaction.md) \| [*RemovedPartyAction*](../interfaces/src_social_reducers_party_actions.removedpartyaction.md) \| [*LeftPartyAction*](../interfaces/src_social_reducers_party_actions.leftpartyaction.md) \| [*CreatedPartyUserAction*](../interfaces/src_social_reducers_party_actions.createdpartyuseraction.md) \| [*PatchedPartyUserAction*](../interfaces/src_social_reducers_party_actions.patchedpartyuseraction.md)

Defined in: [packages/client-core/src/social/reducers/party/actions.ts:49](https://github.com/xr3ngine/xr3ngine/blob/65dfcf39a/packages/client-core/src/social/reducers/party/actions.ts#L49)

___

### PartyUserAction

Ƭ **PartyUserAction**: [*LoadedPartyUsersAction*](../interfaces/src_social_reducers_party_actions.loadedpartyusersaction.md) \| [*RemovedPartyUserAction*](../interfaces/src_social_reducers_party_actions.removedpartyuseraction.md) \| [*LoadedSelfPartyUserAction*](../interfaces/src_social_reducers_party_actions.loadedselfpartyuseraction.md)

Defined in: [packages/client-core/src/social/reducers/party/actions.ts:116](https://github.com/xr3ngine/xr3ngine/blob/65dfcf39a/packages/client-core/src/social/reducers/party/actions.ts#L116)

## Functions

### createdParty

▸ **createdParty**(`party`: Party): [*CreatedPartyAction*](../interfaces/src_social_reducers_party_actions.createdpartyaction.md)

#### Parameters:

Name | Type |
:------ | :------ |
`party` | Party |

**Returns:** [*CreatedPartyAction*](../interfaces/src_social_reducers_party_actions.createdpartyaction.md)

Defined in: [packages/client-core/src/social/reducers/party/actions.ts:65](https://github.com/xr3ngine/xr3ngine/blob/65dfcf39a/packages/client-core/src/social/reducers/party/actions.ts#L65)

___

### createdPartyUser

▸ **createdPartyUser**(`partyUser`: PartyUser): [*CreatedPartyUserAction*](../interfaces/src_social_reducers_party_actions.createdpartyuseraction.md)

#### Parameters:

Name | Type |
:------ | :------ |
`partyUser` | PartyUser |

**Returns:** [*CreatedPartyUserAction*](../interfaces/src_social_reducers_party_actions.createdpartyuseraction.md)

Defined in: [packages/client-core/src/social/reducers/party/actions.ts:122](https://github.com/xr3ngine/xr3ngine/blob/65dfcf39a/packages/client-core/src/social/reducers/party/actions.ts#L122)

___

### invitedPartyUser

▸ **invitedPartyUser**(): [*InvitedPartyUserAction*](../interfaces/src_social_reducers_party_actions.invitedpartyuseraction.md)

**Returns:** [*InvitedPartyUserAction*](../interfaces/src_social_reducers_party_actions.invitedpartyuseraction.md)

Defined in: [packages/client-core/src/social/reducers/party/actions.ts:86](https://github.com/xr3ngine/xr3ngine/blob/65dfcf39a/packages/client-core/src/social/reducers/party/actions.ts#L86)

___

### leftParty

▸ **leftParty**(): [*LeftPartyAction*](../interfaces/src_social_reducers_party_actions.leftpartyaction.md)

**Returns:** [*LeftPartyAction*](../interfaces/src_social_reducers_party_actions.leftpartyaction.md)

Defined in: [packages/client-core/src/social/reducers/party/actions.ts:92](https://github.com/xr3ngine/xr3ngine/blob/65dfcf39a/packages/client-core/src/social/reducers/party/actions.ts#L92)

___

### loadedParty

▸ **loadedParty**(`partyResult`: PartyResult): [*PartyAction*](src_social_reducers_party_actions.md#partyaction)

#### Parameters:

Name | Type |
:------ | :------ |
`partyResult` | PartyResult |

**Returns:** [*PartyAction*](src_social_reducers_party_actions.md#partyaction)

Defined in: [packages/client-core/src/social/reducers/party/actions.ts:58](https://github.com/xr3ngine/xr3ngine/blob/65dfcf39a/packages/client-core/src/social/reducers/party/actions.ts#L58)

___

### patchedParty

▸ **patchedParty**(`party`: Party): [*PatchedPartyAction*](../interfaces/src_social_reducers_party_actions.patchedpartyaction.md)

#### Parameters:

Name | Type |
:------ | :------ |
`party` | Party |

**Returns:** [*PatchedPartyAction*](../interfaces/src_social_reducers_party_actions.patchedpartyaction.md)

Defined in: [packages/client-core/src/social/reducers/party/actions.ts:72](https://github.com/xr3ngine/xr3ngine/blob/65dfcf39a/packages/client-core/src/social/reducers/party/actions.ts#L72)

___

### patchedPartyUser

▸ **patchedPartyUser**(`partyUser`: PartyUser): [*PatchedPartyUserAction*](../interfaces/src_social_reducers_party_actions.patchedpartyuseraction.md)

#### Parameters:

Name | Type |
:------ | :------ |
`partyUser` | PartyUser |

**Returns:** [*PatchedPartyUserAction*](../interfaces/src_social_reducers_party_actions.patchedpartyuseraction.md)

Defined in: [packages/client-core/src/social/reducers/party/actions.ts:129](https://github.com/xr3ngine/xr3ngine/blob/65dfcf39a/packages/client-core/src/social/reducers/party/actions.ts#L129)

___

### removedParty

▸ **removedParty**(`party`: Party): [*RemovedPartyAction*](../interfaces/src_social_reducers_party_actions.removedpartyaction.md)

#### Parameters:

Name | Type |
:------ | :------ |
`party` | Party |

**Returns:** [*RemovedPartyAction*](../interfaces/src_social_reducers_party_actions.removedpartyaction.md)

Defined in: [packages/client-core/src/social/reducers/party/actions.ts:79](https://github.com/xr3ngine/xr3ngine/blob/65dfcf39a/packages/client-core/src/social/reducers/party/actions.ts#L79)

___

### removedPartyUser

▸ **removedPartyUser**(`partyUser`: PartyUser): [*RemovedPartyUserAction*](../interfaces/src_social_reducers_party_actions.removedpartyuseraction.md)

#### Parameters:

Name | Type |
:------ | :------ |
`partyUser` | PartyUser |

**Returns:** [*RemovedPartyUserAction*](../interfaces/src_social_reducers_party_actions.removedpartyuseraction.md)

Defined in: [packages/client-core/src/social/reducers/party/actions.ts:136](https://github.com/xr3ngine/xr3ngine/blob/65dfcf39a/packages/client-core/src/social/reducers/party/actions.ts#L136)
