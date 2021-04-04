---
id: "redux_creator_service"
title: "Module: redux/creator/service"
sidebar_label: "redux/creator/service"
custom_edit_url: null
hide_title: true
---

# Module: redux/creator/service

## Functions

### createCreator

▸ **createCreator**(): *function*

**Returns:** (`dispatch`: *Dispatch*<AnyAction\>, `getState`: *any*) => *Promise*<any\>

Defined in: [packages/client-core/redux/creator/service.ts:19](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/creator/service.ts#L19)

___

### followCreator

▸ **followCreator**(`creatorId`: *string*): *function*

#### Parameters:

Name | Type |
:------ | :------ |
`creatorId` | *string* |

**Returns:** (`dispatch`: *Dispatch*<AnyAction\>) => *Promise*<any\>

Defined in: [packages/client-core/redux/creator/service.ts:104](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/creator/service.ts#L104)

___

### getCreator

▸ **getCreator**(`creatorId`: *any*): *function*

#### Parameters:

Name | Type |
:------ | :------ |
`creatorId` | *any* |

**Returns:** (`dispatch`: *Dispatch*<AnyAction\>) => *Promise*<any\>

Defined in: [packages/client-core/redux/creator/service.ts:57](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/creator/service.ts#L57)

___

### getCreatorNotificationList

▸ **getCreatorNotificationList**(): *function*

**Returns:** (`dispatch`: *Dispatch*<AnyAction\>) => *Promise*<any\>

Defined in: [packages/client-core/redux/creator/service.ts:91](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/creator/service.ts#L91)

___

### getCreators

▸ **getCreators**(`limit?`: *number*): *function*

#### Parameters:

Name | Type |
:------ | :------ |
`limit?` | *number* |

**Returns:** (`dispatch`: *Dispatch*<AnyAction\>, `getState`: *any*) => *Promise*<any\>

Defined in: [packages/client-core/redux/creator/service.ts:31](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/creator/service.ts#L31)

___

### getFollowersList

▸ **getFollowersList**(`creatorId`: *string*): *function*

#### Parameters:

Name | Type |
:------ | :------ |
`creatorId` | *string* |

**Returns:** (`dispatch`: *Dispatch*<AnyAction\>) => *Promise*<any\>

Defined in: [packages/client-core/redux/creator/service.ts:128](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/creator/service.ts#L128)

___

### getFollowingList

▸ **getFollowingList**(`creatorId`: *string*): *function*

#### Parameters:

Name | Type |
:------ | :------ |
`creatorId` | *string* |

**Returns:** (`dispatch`: *Dispatch*<AnyAction\>) => *Promise*<any\>

Defined in: [packages/client-core/redux/creator/service.ts:140](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/creator/service.ts#L140)

___

### getLoggedCreator

▸ **getLoggedCreator**(): *function*

**Returns:** (`dispatch`: *Dispatch*<AnyAction\>) => *Promise*<any\>

Defined in: [packages/client-core/redux/creator/service.ts:44](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/creator/service.ts#L44)

___

### unFollowCreator

▸ **unFollowCreator**(`creatorId`: *string*): *function*

#### Parameters:

Name | Type |
:------ | :------ |
`creatorId` | *string* |

**Returns:** (`dispatch`: *Dispatch*<AnyAction\>) => *Promise*<any\>

Defined in: [packages/client-core/redux/creator/service.ts:116](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/creator/service.ts#L116)

___

### updateCreator

▸ **updateCreator**(`creator`: Creator): *function*

#### Parameters:

Name | Type |
:------ | :------ |
`creator` | Creator |

**Returns:** (`dispatch`: *Dispatch*<AnyAction\>) => *Promise*<any\>

Defined in: [packages/client-core/redux/creator/service.ts:71](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/creator/service.ts#L71)
