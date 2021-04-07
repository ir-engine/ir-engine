---
id: "redux_group_reducers"
title: "Module: redux/group/reducers"
sidebar_label: "redux/group/reducers"
custom_edit_url: null
hide_title: true
---

# Module: redux/group/reducers

## Variables

### initialState

• `Const` **initialState**: *object*

#### Type declaration:

Name | Type |
:------ | :------ |
`closeDetails` | *string* |
`getGroupsInProgress` | *boolean* |
`getInvitableGroupsInProgress` | *boolean* |
`groups` | *object* |
`groups.groups` | *any*[] |
`groups.limit` | *number* |
`groups.skip` | *number* |
`groups.total` | *number* |
`invitableGroups` | *object* |
`invitableGroups.groups` | *any*[] |
`invitableGroups.limit` | *number* |
`invitableGroups.skip` | *number* |
`invitableGroups.total` | *number* |
`invitableUpdateNeeded` | *boolean* |
`updateNeeded` | *boolean* |

Defined in: [packages/client-core/redux/group/reducers.ts:31](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/group/reducers.ts#L31)

## Functions

### default

▸ `Const`**default**(`state?`: *any*, `action`: [*GroupAction*](redux_group_actions.md#groupaction)): *any*

#### Parameters:

Name | Type |
:------ | :------ |
`state` | *any* |
`action` | [*GroupAction*](redux_group_actions.md#groupaction) |

**Returns:** *any*

Defined in: [packages/client-core/redux/group/reducers.ts:53](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/group/reducers.ts#L53)
