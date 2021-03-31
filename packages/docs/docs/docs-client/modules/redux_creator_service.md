---
id: "redux_creator_service"
title: "Module: redux/creator/service"
sidebar_label: "redux/creator/service"
custom_edit_url: null
hide_title: true
---

# Module: redux/creator/service

## Functions

### getCreator

▸ **getCreator**(`creatorId`: *any*): *function*

#### Parameters:

Name | Type |
:------ | :------ |
`creatorId` | *any* |

**Returns:** (`dispatch`: *Dispatch*<AnyAction\>) => *Promise*<any\>

Defined in: [packages/client-core/redux/creator/service.ts:39](https://github.com/xr3ngine/xr3ngine/blob/66a84a950/packages/client-core/redux/creator/service.ts#L39)

___

### getCreators

▸ **getCreators**(`limit?`: *number*): *function*

#### Parameters:

Name | Type |
:------ | :------ |
`limit?` | *number* |

**Returns:** (`dispatch`: *Dispatch*<AnyAction\>, `getState`: *any*) => *Promise*<any\>

Defined in: [packages/client-core/redux/creator/service.ts:13](https://github.com/xr3ngine/xr3ngine/blob/66a84a950/packages/client-core/redux/creator/service.ts#L13)

___

### getLoggedCreator

▸ **getLoggedCreator**(): *function*

**Returns:** (`dispatch`: *Dispatch*<AnyAction\>) => *Promise*<any\>

Defined in: [packages/client-core/redux/creator/service.ts:26](https://github.com/xr3ngine/xr3ngine/blob/66a84a950/packages/client-core/redux/creator/service.ts#L26)

___

### updateCreator

▸ **updateCreator**(`creator`: Creator): *function*

#### Parameters:

Name | Type |
:------ | :------ |
`creator` | Creator |

**Returns:** (`dispatch`: *Dispatch*<AnyAction\>) => *Promise*<any\>

Defined in: [packages/client-core/redux/creator/service.ts:52](https://github.com/xr3ngine/xr3ngine/blob/66a84a950/packages/client-core/redux/creator/service.ts#L52)
