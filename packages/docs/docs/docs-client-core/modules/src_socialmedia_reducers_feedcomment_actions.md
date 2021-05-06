---
id: "src_socialmedia_reducers_feedcomment_actions"
title: "Module: src/socialmedia/reducers/feedComment/actions"
sidebar_label: "src/socialmedia/reducers/feedComment/actions"
custom_edit_url: null
hide_title: true
---

# Module: src/socialmedia/reducers/feedComment/actions

## Table of contents

### Interfaces

- [AddFeedCommentAction](../interfaces/src_socialmedia_reducers_feedcomment_actions.addfeedcommentaction.md)
- [AddFeedCommentFiresAction](../interfaces/src_socialmedia_reducers_feedcomment_actions.addfeedcommentfiresaction.md)
- [CommentFiresRetrievedAction](../interfaces/src_socialmedia_reducers_feedcomment_actions.commentfiresretrievedaction.md)
- [FeedCommentsRetrievedAction](../interfaces/src_socialmedia_reducers_feedcomment_actions.feedcommentsretrievedaction.md)
- [FetchingFeedCommentsAction](../interfaces/src_socialmedia_reducers_feedcomment_actions.fetchingfeedcommentsaction.md)

## Type aliases

### FeedCommentsAction

Ƭ **FeedCommentsAction**: [*FeedCommentsRetrievedAction*](../interfaces/src_socialmedia_reducers_feedcomment_actions.feedcommentsretrievedaction.md) \| [*FetchingFeedCommentsAction*](../interfaces/src_socialmedia_reducers_feedcomment_actions.fetchingfeedcommentsaction.md) \| [*AddFeedCommentAction*](../interfaces/src_socialmedia_reducers_feedcomment_actions.addfeedcommentaction.md) \| [*CommentFiresRetrievedAction*](../interfaces/src_socialmedia_reducers_feedcomment_actions.commentfiresretrievedaction.md)

Defined in: [packages/client-core/src/socialmedia/reducers/feedComment/actions.ts:43](https://github.com/xr3ngine/xr3ngine/blob/2d83606b6/packages/client-core/src/socialmedia/reducers/feedComment/actions.ts#L43)

## Functions

### addFeedComment

▸ **addFeedComment**(`comment`: CommentInterface): [*AddFeedCommentAction*](../interfaces/src_socialmedia_reducers_feedcomment_actions.addfeedcommentaction.md)

#### Parameters:

| Name | Type |
| :------ | :------ |
| `comment` | CommentInterface |

**Returns:** [*AddFeedCommentAction*](../interfaces/src_socialmedia_reducers_feedcomment_actions.addfeedcommentaction.md)

Defined in: [packages/client-core/src/socialmedia/reducers/feedComment/actions.ts:69](https://github.com/xr3ngine/xr3ngine/blob/2d83606b6/packages/client-core/src/socialmedia/reducers/feedComment/actions.ts#L69)

___

### addFeedCommentFire

▸ **addFeedCommentFire**(`commentId`: *string*): [*AddFeedCommentFiresAction*](../interfaces/src_socialmedia_reducers_feedcomment_actions.addfeedcommentfiresaction.md)

#### Parameters:

| Name | Type |
| :------ | :------ |
| `commentId` | *string* |

**Returns:** [*AddFeedCommentFiresAction*](../interfaces/src_socialmedia_reducers_feedcomment_actions.addfeedcommentfiresaction.md)

Defined in: [packages/client-core/src/socialmedia/reducers/feedComment/actions.ts:55](https://github.com/xr3ngine/xr3ngine/blob/2d83606b6/packages/client-core/src/socialmedia/reducers/feedComment/actions.ts#L55)

___

### commentFires

▸ **commentFires**(`creators`: CreatorShort[]): [*CommentFiresRetrievedAction*](../interfaces/src_socialmedia_reducers_feedcomment_actions.commentfiresretrievedaction.md)

#### Parameters:

| Name | Type |
| :------ | :------ |
| `creators` | CreatorShort[] |

**Returns:** [*CommentFiresRetrievedAction*](../interfaces/src_socialmedia_reducers_feedcomment_actions.commentfiresretrievedaction.md)

Defined in: [packages/client-core/src/socialmedia/reducers/feedComment/actions.ts:76](https://github.com/xr3ngine/xr3ngine/blob/2d83606b6/packages/client-core/src/socialmedia/reducers/feedComment/actions.ts#L76)

___

### fetchingFeedComments

▸ **fetchingFeedComments**(): [*FetchingFeedCommentsAction*](../interfaces/src_socialmedia_reducers_feedcomment_actions.fetchingfeedcommentsaction.md)

**Returns:** [*FetchingFeedCommentsAction*](../interfaces/src_socialmedia_reducers_feedcomment_actions.fetchingfeedcommentsaction.md)

Defined in: [packages/client-core/src/socialmedia/reducers/feedComment/actions.ts:49](https://github.com/xr3ngine/xr3ngine/blob/2d83606b6/packages/client-core/src/socialmedia/reducers/feedComment/actions.ts#L49)

___

### removeFeedCommentFire

▸ **removeFeedCommentFire**(`commentId`: *string*): [*AddFeedCommentFiresAction*](../interfaces/src_socialmedia_reducers_feedcomment_actions.addfeedcommentfiresaction.md)

#### Parameters:

| Name | Type |
| :------ | :------ |
| `commentId` | *string* |

**Returns:** [*AddFeedCommentFiresAction*](../interfaces/src_socialmedia_reducers_feedcomment_actions.addfeedcommentfiresaction.md)

Defined in: [packages/client-core/src/socialmedia/reducers/feedComment/actions.ts:62](https://github.com/xr3ngine/xr3ngine/blob/2d83606b6/packages/client-core/src/socialmedia/reducers/feedComment/actions.ts#L62)
