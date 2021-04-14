---
id: "src_social_reducers_group_actions"
title: "Module: src/social/reducers/group/actions"
sidebar_label: "src/social/reducers/group/actions"
custom_edit_url: null
hide_title: true
---

# Module: src/social/reducers/group/actions

## Table of contents

### Interfaces

- [CreatedGroupAction](../interfaces/src_social_reducers_group_actions.createdgroupaction.md)
- [CreatedGroupUserAction](../interfaces/src_social_reducers_group_actions.createdgroupuseraction.md)
- [FetchingGroupsAction](../interfaces/src_social_reducers_group_actions.fetchinggroupsaction.md)
- [FetchingInvitableGroupsAction](../interfaces/src_social_reducers_group_actions.fetchinginvitablegroupsaction.md)
- [InvitedGroupUserAction](../interfaces/src_social_reducers_group_actions.invitedgroupuseraction.md)
- [LeftGroupAction](../interfaces/src_social_reducers_group_actions.leftgroupaction.md)
- [LoadedGroupsAction](../interfaces/src_social_reducers_group_actions.loadedgroupsaction.md)
- [LoadedInvitableGroupsAction](../interfaces/src_social_reducers_group_actions.loadedinvitablegroupsaction.md)
- [PatchedGroupAction](../interfaces/src_social_reducers_group_actions.patchedgroupaction.md)
- [PatchedGroupUserAction](../interfaces/src_social_reducers_group_actions.patchedgroupuseraction.md)
- [RemovedGroupAction](../interfaces/src_social_reducers_group_actions.removedgroupaction.md)
- [RemovedGroupUserAction](../interfaces/src_social_reducers_group_actions.removedgroupuseraction.md)

## Type aliases

### GroupAction

Ƭ **GroupAction**: [*LoadedGroupsAction*](../interfaces/src_social_reducers_group_actions.loadedgroupsaction.md) \| [*CreatedGroupAction*](../interfaces/src_social_reducers_group_actions.createdgroupaction.md) \| [*PatchedGroupAction*](../interfaces/src_social_reducers_group_actions.patchedgroupaction.md) \| [*RemovedGroupAction*](../interfaces/src_social_reducers_group_actions.removedgroupaction.md) \| [*LeftGroupAction*](../interfaces/src_social_reducers_group_actions.leftgroupaction.md) \| [*FetchingGroupsAction*](../interfaces/src_social_reducers_group_actions.fetchinggroupsaction.md) \| [*LoadedInvitableGroupsAction*](../interfaces/src_social_reducers_group_actions.loadedinvitablegroupsaction.md) \| [*FetchingInvitableGroupsAction*](../interfaces/src_social_reducers_group_actions.fetchinginvitablegroupsaction.md) \| [*CreatedGroupUserAction*](../interfaces/src_social_reducers_group_actions.createdgroupuseraction.md) \| [*PatchedGroupUserAction*](../interfaces/src_social_reducers_group_actions.patchedgroupuseraction.md) \| [*RemovedGroupUserAction*](../interfaces/src_social_reducers_group_actions.removedgroupuseraction.md)

Defined in: [packages/client-core/src/social/reducers/group/actions.ts:70](https://github.com/xr3ngine/xr3ngine/blob/77d12cea0/packages/client-core/src/social/reducers/group/actions.ts#L70)

## Functions

### createdGroup

▸ **createdGroup**(`group`: Group): [*CreatedGroupAction*](../interfaces/src_social_reducers_group_actions.createdgroupaction.md)

#### Parameters:

Name | Type |
:------ | :------ |
`group` | Group |

**Returns:** [*CreatedGroupAction*](../interfaces/src_social_reducers_group_actions.createdgroupaction.md)

Defined in: [packages/client-core/src/social/reducers/group/actions.ts:93](https://github.com/xr3ngine/xr3ngine/blob/77d12cea0/packages/client-core/src/social/reducers/group/actions.ts#L93)

___

### createdGroupUser

▸ **createdGroupUser**(`groupUser`: GroupUser): [*CreatedGroupUserAction*](../interfaces/src_social_reducers_group_actions.createdgroupuseraction.md)

#### Parameters:

Name | Type |
:------ | :------ |
`groupUser` | GroupUser |

**Returns:** [*CreatedGroupUserAction*](../interfaces/src_social_reducers_group_actions.createdgroupuseraction.md)

Defined in: [packages/client-core/src/social/reducers/group/actions.ts:114](https://github.com/xr3ngine/xr3ngine/blob/77d12cea0/packages/client-core/src/social/reducers/group/actions.ts#L114)

___

### fetchingGroups

▸ **fetchingGroups**(): [*FetchingGroupsAction*](../interfaces/src_social_reducers_group_actions.fetchinggroupsaction.md)

**Returns:** [*FetchingGroupsAction*](../interfaces/src_social_reducers_group_actions.fetchinggroupsaction.md)

Defined in: [packages/client-core/src/social/reducers/group/actions.ts:148](https://github.com/xr3ngine/xr3ngine/blob/77d12cea0/packages/client-core/src/social/reducers/group/actions.ts#L148)

___

### fetchingInvitableGroups

▸ **fetchingInvitableGroups**(): [*FetchingInvitableGroupsAction*](../interfaces/src_social_reducers_group_actions.fetchinginvitablegroupsaction.md)

**Returns:** [*FetchingInvitableGroupsAction*](../interfaces/src_social_reducers_group_actions.fetchinginvitablegroupsaction.md)

Defined in: [packages/client-core/src/social/reducers/group/actions.ts:164](https://github.com/xr3ngine/xr3ngine/blob/77d12cea0/packages/client-core/src/social/reducers/group/actions.ts#L164)

___

### invitedGroupUser

▸ **invitedGroupUser**(): [*InvitedGroupUserAction*](../interfaces/src_social_reducers_group_actions.invitedgroupuseraction.md)

**Returns:** [*InvitedGroupUserAction*](../interfaces/src_social_reducers_group_actions.invitedgroupuseraction.md)

Defined in: [packages/client-core/src/social/reducers/group/actions.ts:136](https://github.com/xr3ngine/xr3ngine/blob/77d12cea0/packages/client-core/src/social/reducers/group/actions.ts#L136)

___

### leftGroup

▸ **leftGroup**(): [*LeftGroupAction*](../interfaces/src_social_reducers_group_actions.leftgroupaction.md)

**Returns:** [*LeftGroupAction*](../interfaces/src_social_reducers_group_actions.leftgroupaction.md)

Defined in: [packages/client-core/src/social/reducers/group/actions.ts:142](https://github.com/xr3ngine/xr3ngine/blob/77d12cea0/packages/client-core/src/social/reducers/group/actions.ts#L142)

___

### loadedGroups

▸ **loadedGroups**(`groupResult`: GroupResult): [*GroupAction*](src_social_reducers_group_actions.md#groupaction)

#### Parameters:

Name | Type |
:------ | :------ |
`groupResult` | GroupResult |

**Returns:** [*GroupAction*](src_social_reducers_group_actions.md#groupaction)

Defined in: [packages/client-core/src/social/reducers/group/actions.ts:83](https://github.com/xr3ngine/xr3ngine/blob/77d12cea0/packages/client-core/src/social/reducers/group/actions.ts#L83)

___

### loadedInvitableGroups

▸ **loadedInvitableGroups**(`groupResult`: GroupResult): [*GroupAction*](src_social_reducers_group_actions.md#groupaction)

#### Parameters:

Name | Type |
:------ | :------ |
`groupResult` | GroupResult |

**Returns:** [*GroupAction*](src_social_reducers_group_actions.md#groupaction)

Defined in: [packages/client-core/src/social/reducers/group/actions.ts:154](https://github.com/xr3ngine/xr3ngine/blob/77d12cea0/packages/client-core/src/social/reducers/group/actions.ts#L154)

___

### patchedGroup

▸ **patchedGroup**(`group`: Group): [*PatchedGroupAction*](../interfaces/src_social_reducers_group_actions.patchedgroupaction.md)

#### Parameters:

Name | Type |
:------ | :------ |
`group` | Group |

**Returns:** [*PatchedGroupAction*](../interfaces/src_social_reducers_group_actions.patchedgroupaction.md)

Defined in: [packages/client-core/src/social/reducers/group/actions.ts:100](https://github.com/xr3ngine/xr3ngine/blob/77d12cea0/packages/client-core/src/social/reducers/group/actions.ts#L100)

___

### patchedGroupUser

▸ **patchedGroupUser**(`groupUser`: GroupUser): [*PatchedGroupUserAction*](../interfaces/src_social_reducers_group_actions.patchedgroupuseraction.md)

#### Parameters:

Name | Type |
:------ | :------ |
`groupUser` | GroupUser |

**Returns:** [*PatchedGroupUserAction*](../interfaces/src_social_reducers_group_actions.patchedgroupuseraction.md)

Defined in: [packages/client-core/src/social/reducers/group/actions.ts:121](https://github.com/xr3ngine/xr3ngine/blob/77d12cea0/packages/client-core/src/social/reducers/group/actions.ts#L121)

___

### removedGroup

▸ **removedGroup**(`group`: Group): [*RemovedGroupAction*](../interfaces/src_social_reducers_group_actions.removedgroupaction.md)

#### Parameters:

Name | Type |
:------ | :------ |
`group` | Group |

**Returns:** [*RemovedGroupAction*](../interfaces/src_social_reducers_group_actions.removedgroupaction.md)

Defined in: [packages/client-core/src/social/reducers/group/actions.ts:107](https://github.com/xr3ngine/xr3ngine/blob/77d12cea0/packages/client-core/src/social/reducers/group/actions.ts#L107)

___

### removedGroupUser

▸ **removedGroupUser**(`groupUser`: GroupUser, `self`: *boolean*): [*RemovedGroupUserAction*](../interfaces/src_social_reducers_group_actions.removedgroupuseraction.md)

#### Parameters:

Name | Type |
:------ | :------ |
`groupUser` | GroupUser |
`self` | *boolean* |

**Returns:** [*RemovedGroupUserAction*](../interfaces/src_social_reducers_group_actions.removedgroupuseraction.md)

Defined in: [packages/client-core/src/social/reducers/group/actions.ts:128](https://github.com/xr3ngine/xr3ngine/blob/77d12cea0/packages/client-core/src/social/reducers/group/actions.ts#L128)
