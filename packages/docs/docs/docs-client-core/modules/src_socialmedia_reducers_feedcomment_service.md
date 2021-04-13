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

Name | Type |
:------ | :------ |
`feedId` | *string* |
`text` | *string* |

**Returns:** (`dispatch`: *Dispatch*<AnyAction\>) => *Promise*<any\>

Defined in: [packages/client-core/src/socialmedia/reducers/feedComment/service.ts:26](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/client-core/src/socialmedia/reducers/feedComment/service.ts#L26)

___

### addFireToFeedComment

▸ **addFireToFeedComment**(`commentId`: *string*): *function*

#### Parameters:

Name | Type |
:------ | :------ |
`commentId` | *string* |

**Returns:** (`dispatch`: *Dispatch*<AnyAction\>) => *Promise*<any\>

Defined in: [packages/client-core/src/socialmedia/reducers/feedComment/service.ts:39](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/client-core/src/socialmedia/reducers/feedComment/service.ts#L39)

___

### getCommentFires

▸ **getCommentFires**(`commentId`: *string*, `limit?`: *number*): *function*

#### Parameters:

Name | Type |
:------ | :------ |
`commentId` | *string* |
`limit?` | *number* |

**Returns:** (`dispatch`: *Dispatch*<AnyAction\>, `getState`: *any*) => *Promise*<any\>

Defined in: [packages/client-core/src/socialmedia/reducers/feedComment/service.ts:64](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/client-core/src/socialmedia/reducers/feedComment/service.ts#L64)

___

### getFeedComments

▸ **getFeedComments**(`feedId`: *string*, `limit?`: *number*): *function*

#### Parameters:

Name | Type |
:------ | :------ |
`feedId` | *string* |
`limit?` | *number* |

**Returns:** (`dispatch`: *Dispatch*<AnyAction\>, `getState`: *any*) => *Promise*<any\>

Defined in: [packages/client-core/src/socialmedia/reducers/feedComment/service.ts:13](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/client-core/src/socialmedia/reducers/feedComment/service.ts#L13)

___

### removeFireToFeedComment

▸ **removeFireToFeedComment**(`commentId`: *string*): *function*

#### Parameters:

Name | Type |
:------ | :------ |
`commentId` | *string* |

**Returns:** (`dispatch`: *Dispatch*<AnyAction\>) => *Promise*<any\>

Defined in: [packages/client-core/src/socialmedia/reducers/feedComment/service.ts:51](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/client-core/src/socialmedia/reducers/feedComment/service.ts#L51)
