---
id: "redux_group_actions"
title: "Module: redux/group/actions"
sidebar_label: "redux/group/actions"
custom_edit_url: null
hide_title: true
---

# Module: redux/group/actions

## Table of contents

### Interfaces

- [CreatedGroupAction](../interfaces/redux_group_actions.createdgroupaction.md)
- [CreatedGroupUserAction](../interfaces/redux_group_actions.createdgroupuseraction.md)
- [FetchingGroupsAction](../interfaces/redux_group_actions.fetchinggroupsaction.md)
- [FetchingInvitableGroupsAction](../interfaces/redux_group_actions.fetchinginvitablegroupsaction.md)
- [InvitedGroupUserAction](../interfaces/redux_group_actions.invitedgroupuseraction.md)
- [LeftGroupAction](../interfaces/redux_group_actions.leftgroupaction.md)
- [LoadedGroupsAction](../interfaces/redux_group_actions.loadedgroupsaction.md)
- [LoadedInvitableGroupsAction](../interfaces/redux_group_actions.loadedinvitablegroupsaction.md)
- [PatchedGroupAction](../interfaces/redux_group_actions.patchedgroupaction.md)
- [PatchedGroupUserAction](../interfaces/redux_group_actions.patchedgroupuseraction.md)
- [RemovedGroupAction](../interfaces/redux_group_actions.removedgroupaction.md)
- [RemovedGroupUserAction](../interfaces/redux_group_actions.removedgroupuseraction.md)

## Type aliases

### GroupAction

Ƭ **GroupAction**: [*LoadedGroupsAction*](../interfaces/redux_group_actions.loadedgroupsaction.md) \| [*CreatedGroupAction*](../interfaces/redux_group_actions.createdgroupaction.md) \| [*PatchedGroupAction*](../interfaces/redux_group_actions.patchedgroupaction.md) \| [*RemovedGroupAction*](../interfaces/redux_group_actions.removedgroupaction.md) \| [*LeftGroupAction*](../interfaces/redux_group_actions.leftgroupaction.md) \| [*FetchingGroupsAction*](../interfaces/redux_group_actions.fetchinggroupsaction.md) \| [*LoadedInvitableGroupsAction*](../interfaces/redux_group_actions.loadedinvitablegroupsaction.md) \| [*FetchingInvitableGroupsAction*](../interfaces/redux_group_actions.fetchinginvitablegroupsaction.md) \| [*CreatedGroupUserAction*](../interfaces/redux_group_actions.createdgroupuseraction.md) \| [*PatchedGroupUserAction*](../interfaces/redux_group_actions.patchedgroupuseraction.md) \| [*RemovedGroupUserAction*](../interfaces/redux_group_actions.removedgroupuseraction.md)

Defined in: [packages/client-core/redux/group/actions.ts:82](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/group/actions.ts#L82)

## Functions

### createdGroup

▸ **createdGroup**(`group`: Group): [*CreatedGroupAction*](../interfaces/redux_group_actions.createdgroupaction.md)

#### Parameters:

Name | Type |
:------ | :------ |
`group` | Group |

**Returns:** [*CreatedGroupAction*](../interfaces/redux_group_actions.createdgroupaction.md)

Defined in: [packages/client-core/redux/group/actions.ts:105](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/group/actions.ts#L105)

___

### createdGroupUser

▸ **createdGroupUser**(`groupUser`: GroupUser): [*CreatedGroupUserAction*](../interfaces/redux_group_actions.createdgroupuseraction.md)

#### Parameters:

Name | Type |
:------ | :------ |
`groupUser` | GroupUser |

**Returns:** [*CreatedGroupUserAction*](../interfaces/redux_group_actions.createdgroupuseraction.md)

Defined in: [packages/client-core/redux/group/actions.ts:126](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/group/actions.ts#L126)

___

### fetchingGroups

▸ **fetchingGroups**(): [*FetchingGroupsAction*](../interfaces/redux_group_actions.fetchinggroupsaction.md)

**Returns:** [*FetchingGroupsAction*](../interfaces/redux_group_actions.fetchinggroupsaction.md)

Defined in: [packages/client-core/redux/group/actions.ts:160](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/group/actions.ts#L160)

___

### fetchingInvitableGroups

▸ **fetchingInvitableGroups**(): [*FetchingInvitableGroupsAction*](../interfaces/redux_group_actions.fetchinginvitablegroupsaction.md)

**Returns:** [*FetchingInvitableGroupsAction*](../interfaces/redux_group_actions.fetchinginvitablegroupsaction.md)

Defined in: [packages/client-core/redux/group/actions.ts:176](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/group/actions.ts#L176)

___

### invitedGroupUser

▸ **invitedGroupUser**(): [*InvitedGroupUserAction*](../interfaces/redux_group_actions.invitedgroupuseraction.md)

**Returns:** [*InvitedGroupUserAction*](../interfaces/redux_group_actions.invitedgroupuseraction.md)

Defined in: [packages/client-core/redux/group/actions.ts:148](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/group/actions.ts#L148)

___

### leftGroup

▸ **leftGroup**(): [*LeftGroupAction*](../interfaces/redux_group_actions.leftgroupaction.md)

**Returns:** [*LeftGroupAction*](../interfaces/redux_group_actions.leftgroupaction.md)

Defined in: [packages/client-core/redux/group/actions.ts:154](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/group/actions.ts#L154)

___

### loadedGroups

▸ **loadedGroups**(`groupResult`: GroupResult): [*GroupAction*](redux_group_actions.md#groupaction)

#### Parameters:

Name | Type |
:------ | :------ |
`groupResult` | GroupResult |

**Returns:** [*GroupAction*](redux_group_actions.md#groupaction)

Defined in: [packages/client-core/redux/group/actions.ts:95](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/group/actions.ts#L95)

___

### loadedInvitableGroups

▸ **loadedInvitableGroups**(`groupResult`: GroupResult): [*GroupAction*](redux_group_actions.md#groupaction)

#### Parameters:

Name | Type |
:------ | :------ |
`groupResult` | GroupResult |

**Returns:** [*GroupAction*](redux_group_actions.md#groupaction)

Defined in: [packages/client-core/redux/group/actions.ts:166](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/group/actions.ts#L166)

___

### patchedGroup

▸ **patchedGroup**(`group`: Group): [*PatchedGroupAction*](../interfaces/redux_group_actions.patchedgroupaction.md)

#### Parameters:

Name | Type |
:------ | :------ |
`group` | Group |

**Returns:** [*PatchedGroupAction*](../interfaces/redux_group_actions.patchedgroupaction.md)

Defined in: [packages/client-core/redux/group/actions.ts:112](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/group/actions.ts#L112)

___

### patchedGroupUser

▸ **patchedGroupUser**(`groupUser`: GroupUser): [*PatchedGroupUserAction*](../interfaces/redux_group_actions.patchedgroupuseraction.md)

#### Parameters:

Name | Type |
:------ | :------ |
`groupUser` | GroupUser |

**Returns:** [*PatchedGroupUserAction*](../interfaces/redux_group_actions.patchedgroupuseraction.md)

Defined in: [packages/client-core/redux/group/actions.ts:133](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/group/actions.ts#L133)

___

### removedGroup

▸ **removedGroup**(`group`: Group): [*RemovedGroupAction*](../interfaces/redux_group_actions.removedgroupaction.md)

#### Parameters:

Name | Type |
:------ | :------ |
`group` | Group |

**Returns:** [*RemovedGroupAction*](../interfaces/redux_group_actions.removedgroupaction.md)

Defined in: [packages/client-core/redux/group/actions.ts:119](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/group/actions.ts#L119)

___

### removedGroupUser

▸ **removedGroupUser**(`groupUser`: GroupUser, `self`: *boolean*): [*RemovedGroupUserAction*](../interfaces/redux_group_actions.removedgroupuseraction.md)

#### Parameters:

Name | Type |
:------ | :------ |
`groupUser` | GroupUser |
`self` | *boolean* |

**Returns:** [*RemovedGroupUserAction*](../interfaces/redux_group_actions.removedgroupuseraction.md)

Defined in: [packages/client-core/redux/group/actions.ts:140](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/group/actions.ts#L140)
