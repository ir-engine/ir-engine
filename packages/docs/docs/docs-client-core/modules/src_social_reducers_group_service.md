---
id: "src_social_reducers_group_service"
title: "Module: src/social/reducers/group/service"
sidebar_label: "src/social/reducers/group/service"
custom_edit_url: null
hide_title: true
---

# Module: src/social/reducers/group/service

## Functions

### createGroup

▸ **createGroup**(`values`: *any*): *function*

#### Parameters:

Name | Type |
:------ | :------ |
`values` | *any* |

**Returns:** (`dispatch`: *Dispatch*<AnyAction\>) => *Promise*<any\>

Defined in: [packages/client-core/src/social/reducers/group/service.ts:37](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/client-core/src/social/reducers/group/service.ts#L37)

___

### getGroups

▸ **getGroups**(`skip?`: *number*, `limit?`: *number*): *function*

#### Parameters:

Name | Type |
:------ | :------ |
`skip?` | *number* |
`limit?` | *number* |

**Returns:** (`dispatch`: *Dispatch*<AnyAction\>, `getState`: *any*) => *Promise*<any\>

Defined in: [packages/client-core/src/social/reducers/group/service.ts:19](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/client-core/src/social/reducers/group/service.ts#L19)

___

### getInvitableGroups

▸ **getInvitableGroups**(`skip?`: *number*, `limit?`: *number*): *function*

#### Parameters:

Name | Type |
:------ | :------ |
`skip?` | *number* |
`limit?` | *number* |

**Returns:** (`dispatch`: *Dispatch*<AnyAction\>, `getState`: *any*) => *Promise*<any\>

Defined in: [packages/client-core/src/social/reducers/group/service.ts:99](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/client-core/src/social/reducers/group/service.ts#L99)

___

### patchGroup

▸ **patchGroup**(`values`: *any*): *function*

#### Parameters:

Name | Type |
:------ | :------ |
`values` | *any* |

**Returns:** (`dispatch`: *Dispatch*<AnyAction\>) => *Promise*<any\>

Defined in: [packages/client-core/src/social/reducers/group/service.ts:51](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/client-core/src/social/reducers/group/service.ts#L51)

___

### removeGroup

▸ **removeGroup**(`groupId`: *string*): *function*

#### Parameters:

Name | Type |
:------ | :------ |
`groupId` | *string* |

**Returns:** (`dispatch`: *Dispatch*<AnyAction\>) => *Promise*<any\>

Defined in: [packages/client-core/src/social/reducers/group/service.ts:69](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/client-core/src/social/reducers/group/service.ts#L69)

___

### removeGroupUser

▸ **removeGroupUser**(`groupUserId`: *string*): *function*

#### Parameters:

Name | Type |
:------ | :------ |
`groupUserId` | *string* |

**Returns:** (`dispatch`: *Dispatch*<AnyAction\>) => *Promise*<any\>

Defined in: [packages/client-core/src/social/reducers/group/service.ts:88](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/client-core/src/social/reducers/group/service.ts#L88)
