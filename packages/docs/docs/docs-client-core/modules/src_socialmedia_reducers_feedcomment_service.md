---
id: "src_socialmedia_reducers_feedcomment_service"
title: "Module: src/socialmedia/reducers/feedComment/service"
sidebar_label: "src/socialmedia/reducers/feedComment/service"
custom_edit_url: null
hide_title: true
---

# Module: src/socialmedia/reducers/feedComment/service

## Functions

### addCommentToFeed

▸ **addCommentToFeed**(`feedId`: *string*, `text`: *string*): *function*

#### Parameters:

| Name | Type |
| :------ | :------ |
| `feedId` | *string* |
| `text` | *string* |

**Returns:** (`dispatch`: *Dispatch*<AnyAction\>) => *Promise*<any\>

Defined in: [packages/client-core/src/socialmedia/reducers/feedComment/service.ts:29](https://github.com/xr3ngine/xr3ngine/blob/2d83606b6/packages/client-core/src/socialmedia/reducers/feedComment/service.ts#L29)

___

### addFireToFeedComment

▸ **addFireToFeedComment**(`commentId`: *string*): *function*

#### Parameters:

| Name | Type |
| :------ | :------ |
| `commentId` | *string* |

**Returns:** (`dispatch`: *Dispatch*<AnyAction\>) => *Promise*<any\>

Defined in: [packages/client-core/src/socialmedia/reducers/feedComment/service.ts:42](https://github.com/xr3ngine/xr3ngine/blob/2d83606b6/packages/client-core/src/socialmedia/reducers/feedComment/service.ts#L42)

___

### getCommentFires

▸ **getCommentFires**(`commentId`: *string*, `limit?`: *number*): *function*

#### Parameters:

| Name | Type |
| :------ | :------ |
| `commentId` | *string* |
| `limit?` | *number* |

**Returns:** (`dispatch`: *Dispatch*<AnyAction\>, `getState`: *any*) => *Promise*<any\>

Defined in: [packages/client-core/src/socialmedia/reducers/feedComment/service.ts:67](https://github.com/xr3ngine/xr3ngine/blob/2d83606b6/packages/client-core/src/socialmedia/reducers/feedComment/service.ts#L67)

___

### getFeedComments

▸ **getFeedComments**(`feedId`: *string*, `limit?`: *number*): *function*

#### Parameters:

| Name | Type |
| :------ | :------ |
| `feedId` | *string* |
| `limit?` | *number* |

**Returns:** (`dispatch`: *Dispatch*<AnyAction\>, `getState`: *any*) => *Promise*<any\>

Defined in: [packages/client-core/src/socialmedia/reducers/feedComment/service.ts:16](https://github.com/xr3ngine/xr3ngine/blob/2d83606b6/packages/client-core/src/socialmedia/reducers/feedComment/service.ts#L16)

___

### removeFireToFeedComment

▸ **removeFireToFeedComment**(`commentId`: *string*): *function*

#### Parameters:

| Name | Type |
| :------ | :------ |
| `commentId` | *string* |

**Returns:** (`dispatch`: *Dispatch*<AnyAction\>) => *Promise*<any\>

Defined in: [packages/client-core/src/socialmedia/reducers/feedComment/service.ts:54](https://github.com/xr3ngine/xr3ngine/blob/2d83606b6/packages/client-core/src/socialmedia/reducers/feedComment/service.ts#L54)
