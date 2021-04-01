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
- [FeedCommentsRetrievedAction](../interfaces/redux_feedcomment_actions.feedcommentsretrievedaction.md)
- [FetchingFeedCommentsAction](../interfaces/redux_feedcomment_actions.fetchingfeedcommentsaction.md)

## Type aliases

### FeedCommentsAction

Ƭ **FeedCommentsAction**: [*FeedCommentsRetrievedAction*](../interfaces/redux_feedcomment_actions.feedcommentsretrievedaction.md) \| [*FetchingFeedCommentsAction*](../interfaces/redux_feedcomment_actions.fetchingfeedcommentsaction.md) \| [*AddFeedCommentAction*](../interfaces/redux_feedcomment_actions.addfeedcommentaction.md)

Defined in: [packages/client-core/redux/feedComment/actions.ts:35](https://github.com/xr3ngine/xr3ngine/blob/66a84a950/packages/client-core/redux/feedComment/actions.ts#L35)

## Functions

### addFeedComment

▸ **addFeedComment**(`comment`: CommentInterface): [*AddFeedCommentAction*](../interfaces/redux_feedcomment_actions.addfeedcommentaction.md)

#### Parameters:

Name | Type |
:------ | :------ |
`comment` | CommentInterface |

**Returns:** [*AddFeedCommentAction*](../interfaces/redux_feedcomment_actions.addfeedcommentaction.md)

Defined in: [packages/client-core/redux/feedComment/actions.ts:68](https://github.com/xr3ngine/xr3ngine/blob/66a84a950/packages/client-core/redux/feedComment/actions.ts#L68)

___

### addFeedCommentFire

▸ **addFeedCommentFire**(`commentId`: *string*): [*AddFeedCommentFiresAction*](../interfaces/redux_feedcomment_actions.addfeedcommentfiresaction.md)

#### Parameters:

Name | Type |
:------ | :------ |
`commentId` | *string* |

**Returns:** [*AddFeedCommentFiresAction*](../interfaces/redux_feedcomment_actions.addfeedcommentfiresaction.md)

Defined in: [packages/client-core/redux/feedComment/actions.ts:54](https://github.com/xr3ngine/xr3ngine/blob/66a84a950/packages/client-core/redux/feedComment/actions.ts#L54)

___

### feedsRetrieved

▸ **feedsRetrieved**(`comments`: CommentInterface[]): [*FeedCommentsRetrievedAction*](../interfaces/redux_feedcomment_actions.feedcommentsretrievedaction.md)

#### Parameters:

Name | Type |
:------ | :------ |
`comments` | CommentInterface[] |

**Returns:** [*FeedCommentsRetrievedAction*](../interfaces/redux_feedcomment_actions.feedcommentsretrievedaction.md)

Defined in: [packages/client-core/redux/feedComment/actions.ts:40](https://github.com/xr3ngine/xr3ngine/blob/66a84a950/packages/client-core/redux/feedComment/actions.ts#L40)

___

### fetchingFeedComments

▸ **fetchingFeedComments**(): [*FetchingFeedCommentsAction*](../interfaces/redux_feedcomment_actions.fetchingfeedcommentsaction.md)

**Returns:** [*FetchingFeedCommentsAction*](../interfaces/redux_feedcomment_actions.fetchingfeedcommentsaction.md)

Defined in: [packages/client-core/redux/feedComment/actions.ts:47](https://github.com/xr3ngine/xr3ngine/blob/66a84a950/packages/client-core/redux/feedComment/actions.ts#L47)

___

### removeFeedCommentFire

▸ **removeFeedCommentFire**(`commentId`: *string*): [*AddFeedCommentFiresAction*](../interfaces/redux_feedcomment_actions.addfeedcommentfiresaction.md)

#### Parameters:

Name | Type |
:------ | :------ |
`commentId` | *string* |

**Returns:** [*AddFeedCommentFiresAction*](../interfaces/redux_feedcomment_actions.addfeedcommentfiresaction.md)

Defined in: [packages/client-core/redux/feedComment/actions.ts:61](https://github.com/xr3ngine/xr3ngine/blob/66a84a950/packages/client-core/redux/feedComment/actions.ts#L61)
