---
id: "redux_feedcomment_service"
title: "Module: redux/feedComment/service"
sidebar_label: "redux/feedComment/service"
custom_edit_url: null
hide_title: true
---

# Module: redux/feedComment/service

## Functions

### addCommentToFeed

▸ **addCommentToFeed**(`feedId`: *string*, `text`: *string*): *function*

#### Parameters:

Name | Type |
:------ | :------ |
`feedId` | *string* |
`text` | *string* |

**Returns:** (`dispatch`: *Dispatch*<AnyAction\>) => *Promise*<any\>

Defined in: [packages/client-core/redux/feedComment/service.ts:27](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/feedComment/service.ts#L27)

___

### addFireToFeedComment

▸ **addFireToFeedComment**(`commentId`: *string*): *function*

#### Parameters:

Name | Type |
:------ | :------ |
`commentId` | *string* |

**Returns:** (`dispatch`: *Dispatch*<AnyAction\>) => *Promise*<any\>

Defined in: [packages/client-core/redux/feedComment/service.ts:40](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/feedComment/service.ts#L40)

___

### getCommentFires

▸ **getCommentFires**(`commentId`: *string*, `limit?`: *number*): *function*

#### Parameters:

Name | Type |
:------ | :------ |
`commentId` | *string* |
`limit?` | *number* |

**Returns:** (`dispatch`: *Dispatch*<AnyAction\>, `getState`: *any*) => *Promise*<any\>

Defined in: [packages/client-core/redux/feedComment/service.ts:65](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/feedComment/service.ts#L65)

___

### getFeedComments

▸ **getFeedComments**(`feedId`: *string*, `limit?`: *number*): *function*

#### Parameters:

Name | Type |
:------ | :------ |
`feedId` | *string* |
`limit?` | *number* |

**Returns:** (`dispatch`: *Dispatch*<AnyAction\>, `getState`: *any*) => *Promise*<any\>

Defined in: [packages/client-core/redux/feedComment/service.ts:14](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/feedComment/service.ts#L14)

___

### removeFireToFeedComment

▸ **removeFireToFeedComment**(`commentId`: *string*): *function*

#### Parameters:

Name | Type |
:------ | :------ |
`commentId` | *string* |

**Returns:** (`dispatch`: *Dispatch*<AnyAction\>) => *Promise*<any\>

Defined in: [packages/client-core/redux/feedComment/service.ts:52](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/feedComment/service.ts#L52)
