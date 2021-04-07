---
id: "redux_group_service"
title: "Module: redux/group/service"
sidebar_label: "redux/group/service"
custom_edit_url: null
hide_title: true
---

# Module: redux/group/service

## Functions

### createGroup

▸ **createGroup**(`values`: *any*): *function*

#### Parameters:

Name | Type |
:------ | :------ |
`values` | *any* |

**Returns:** (`dispatch`: *Dispatch*<AnyAction\>) => *Promise*<any\>

Defined in: [packages/client-core/redux/group/service.ts:40](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/group/service.ts#L40)

___

### getGroups

▸ **getGroups**(`skip?`: *number*, `limit?`: *number*): *function*

#### Parameters:

Name | Type |
:------ | :------ |
`skip?` | *number* |
`limit?` | *number* |

**Returns:** (`dispatch`: *Dispatch*<AnyAction\>, `getState`: *any*) => *Promise*<any\>

Defined in: [packages/client-core/redux/group/service.ts:22](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/group/service.ts#L22)

___

### getInvitableGroups

▸ **getInvitableGroups**(`skip?`: *number*, `limit?`: *number*): *function*

#### Parameters:

Name | Type |
:------ | :------ |
`skip?` | *number* |
`limit?` | *number* |

**Returns:** (`dispatch`: *Dispatch*<AnyAction\>, `getState`: *any*) => *Promise*<any\>

Defined in: [packages/client-core/redux/group/service.ts:102](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/group/service.ts#L102)

___

### patchGroup

▸ **patchGroup**(`values`: *any*): *function*

#### Parameters:

Name | Type |
:------ | :------ |
`values` | *any* |

**Returns:** (`dispatch`: *Dispatch*<AnyAction\>) => *Promise*<any\>

Defined in: [packages/client-core/redux/group/service.ts:54](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/group/service.ts#L54)

___

### removeGroup

▸ **removeGroup**(`groupId`: *string*): *function*

#### Parameters:

Name | Type |
:------ | :------ |
`groupId` | *string* |

**Returns:** (`dispatch`: *Dispatch*<AnyAction\>) => *Promise*<any\>

Defined in: [packages/client-core/redux/group/service.ts:72](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/group/service.ts#L72)

___

### removeGroupUser

▸ **removeGroupUser**(`groupUserId`: *string*): *function*

#### Parameters:

Name | Type |
:------ | :------ |
`groupUserId` | *string* |

**Returns:** (`dispatch`: *Dispatch*<AnyAction\>) => *Promise*<any\>

Defined in: [packages/client-core/redux/group/service.ts:91](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/group/service.ts#L91)
