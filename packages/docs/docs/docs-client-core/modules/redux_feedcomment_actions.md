---
id: "redux_feedcomment_actions"
title: "Module: redux/feedComment/actions"
sidebar_label: "redux/feedComment/actions"
custom_edit_url: null
hide_title: true
---

# Module: redux/feedComment/actions

## Table of contents

### Interfaces

- [AddFeedCommentAction](../interfaces/redux_feedcomment_actions.addfeedcommentaction.md)
- [AddFeedCommentFiresAction](../interfaces/redux_feedcomment_actions.addfeedcommentfiresaction.md)
- [CommentFiresRetrievedAction](../interfaces/redux_feedcomment_actions.commentfiresretrievedaction.md)
- [FeedCommentsRetrievedAction](../interfaces/redux_feedcomment_actions.feedcommentsretrievedaction.md)
- [FetchingFeedCommentsAction](../interfaces/redux_feedcomment_actions.fetchingfeedcommentsaction.md)

## Type aliases

### FeedCommentsAction

Ƭ **FeedCommentsAction**: [*FeedCommentsRetrievedAction*](../interfaces/redux_feedcomment_actions.feedcommentsretrievedaction.md) \| [*FetchingFeedCommentsAction*](../interfaces/redux_feedcomment_actions.fetchingfeedcommentsaction.md) \| [*AddFeedCommentAction*](../interfaces/redux_feedcomment_actions.addfeedcommentaction.md) \| [*CommentFiresRetrievedAction*](../interfaces/redux_feedcomment_actions.commentfiresretrievedaction.md)

Defined in: [packages/client-core/redux/feedComment/actions.ts:42](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/feedComment/actions.ts#L42)

## Functions

### addFeedComment

▸ **addFeedComment**(`comment`: CommentInterface): [*AddFeedCommentAction*](../interfaces/redux_feedcomment_actions.addfeedcommentaction.md)

#### Parameters:

Name | Type |
:------ | :------ |
`comment` | CommentInterface |

**Returns:** [*AddFeedCommentAction*](../interfaces/redux_feedcomment_actions.addfeedcommentaction.md)

Defined in: [packages/client-core/redux/feedComment/actions.ts:76](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/feedComment/actions.ts#L76)

___

### addFeedCommentFire

▸ **addFeedCommentFire**(`commentId`: *string*): [*AddFeedCommentFiresAction*](../interfaces/redux_feedcomment_actions.addfeedcommentfiresaction.md)

#### Parameters:

Name | Type |
:------ | :------ |
`commentId` | *string* |

**Returns:** [*AddFeedCommentFiresAction*](../interfaces/redux_feedcomment_actions.addfeedcommentfiresaction.md)

Defined in: [packages/client-core/redux/feedComment/actions.ts:62](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/feedComment/actions.ts#L62)

___

### commentFires

▸ **commentFires**(`creators`: CreatorShort[]): [*CommentFiresRetrievedAction*](../interfaces/redux_feedcomment_actions.commentfiresretrievedaction.md)

#### Parameters:

Name | Type |
:------ | :------ |
`creators` | CreatorShort[] |

**Returns:** [*CommentFiresRetrievedAction*](../interfaces/redux_feedcomment_actions.commentfiresretrievedaction.md)

Defined in: [packages/client-core/redux/feedComment/actions.ts:83](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/feedComment/actions.ts#L83)

___

### feedsRetrieved

▸ **feedsRetrieved**(`comments`: CommentInterface[]): [*FeedCommentsRetrievedAction*](../interfaces/redux_feedcomment_actions.feedcommentsretrievedaction.md)

#### Parameters:

Name | Type |
:------ | :------ |
`comments` | CommentInterface[] |

**Returns:** [*FeedCommentsRetrievedAction*](../interfaces/redux_feedcomment_actions.feedcommentsretrievedaction.md)

Defined in: [packages/client-core/redux/feedComment/actions.ts:48](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/feedComment/actions.ts#L48)

___

### fetchingFeedComments

▸ **fetchingFeedComments**(): [*FetchingFeedCommentsAction*](../interfaces/redux_feedcomment_actions.fetchingfeedcommentsaction.md)

**Returns:** [*FetchingFeedCommentsAction*](../interfaces/redux_feedcomment_actions.fetchingfeedcommentsaction.md)

Defined in: [packages/client-core/redux/feedComment/actions.ts:55](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/feedComment/actions.ts#L55)

___

### removeFeedCommentFire

▸ **removeFeedCommentFire**(`commentId`: *string*): [*AddFeedCommentFiresAction*](../interfaces/redux_feedcomment_actions.addfeedcommentfiresaction.md)

#### Parameters:

Name | Type |
:------ | :------ |
`commentId` | *string* |

**Returns:** [*AddFeedCommentFiresAction*](../interfaces/redux_feedcomment_actions.addfeedcommentfiresaction.md)

Defined in: [packages/client-core/redux/feedComment/actions.ts:69](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/feedComment/actions.ts#L69)
