---
id: "redux_feed_actions"
title: "Module: redux/feed/actions"
sidebar_label: "redux/feed/actions"
custom_edit_url: null
hide_title: true
---

# Module: redux/feed/actions

## Table of contents

### Interfaces

- [FeedRetrievedAction](../interfaces/redux_feed_actions.feedretrievedaction.md)
- [FeedsRetrievedAction](../interfaces/redux_feed_actions.feedsretrievedaction.md)
- [FetchingFeedsAction](../interfaces/redux_feed_actions.fetchingfeedsaction.md)
- [oneFeedAction](../interfaces/redux_feed_actions.onefeedaction.md)

## Type aliases

### FeedsAction

Ƭ **FeedsAction**: [*FeedsRetrievedAction*](../interfaces/redux_feed_actions.feedsretrievedaction.md) \| [*FeedRetrievedAction*](../interfaces/redux_feed_actions.feedretrievedaction.md) \| [*FetchingFeedsAction*](../interfaces/redux_feed_actions.fetchingfeedsaction.md) \| [*oneFeedAction*](../interfaces/redux_feed_actions.onefeedaction.md)

Defined in: [packages/client-core/redux/feed/actions.ts:36](https://github.com/xr3ngine/xr3ngine/blob/66a84a950/packages/client-core/redux/feed/actions.ts#L36)

## Functions

### addFeed

▸ **addFeed**(`feed`: Feed): [*FeedRetrievedAction*](../interfaces/redux_feed_actions.feedretrievedaction.md)

#### Parameters:

Name | Type |
:------ | :------ |
`feed` | Feed |

**Returns:** [*FeedRetrievedAction*](../interfaces/redux_feed_actions.feedretrievedaction.md)

Defined in: [packages/client-core/redux/feed/actions.ts:119](https://github.com/xr3ngine/xr3ngine/blob/66a84a950/packages/client-core/redux/feed/actions.ts#L119)

___

### addFeedBookmark

▸ **addFeedBookmark**(`feedId`: *string*): [*oneFeedAction*](../interfaces/redux_feed_actions.onefeedaction.md)

#### Parameters:

Name | Type |
:------ | :------ |
`feedId` | *string* |

**Returns:** [*oneFeedAction*](../interfaces/redux_feed_actions.onefeedaction.md)

Defined in: [packages/client-core/redux/feed/actions.ts:98](https://github.com/xr3ngine/xr3ngine/blob/66a84a950/packages/client-core/redux/feed/actions.ts#L98)

___

### addFeedFire

▸ **addFeedFire**(`feedId`: *string*): [*oneFeedAction*](../interfaces/redux_feed_actions.onefeedaction.md)

#### Parameters:

Name | Type |
:------ | :------ |
`feedId` | *string* |

**Returns:** [*oneFeedAction*](../interfaces/redux_feed_actions.onefeedaction.md)

Defined in: [packages/client-core/redux/feed/actions.ts:84](https://github.com/xr3ngine/xr3ngine/blob/66a84a950/packages/client-core/redux/feed/actions.ts#L84)

___

### addFeedView

▸ **addFeedView**(`feedId`: *string*): [*oneFeedAction*](../interfaces/redux_feed_actions.onefeedaction.md)

#### Parameters:

Name | Type |
:------ | :------ |
`feedId` | *string* |

**Returns:** [*oneFeedAction*](../interfaces/redux_feed_actions.onefeedaction.md)

Defined in: [packages/client-core/redux/feed/actions.ts:112](https://github.com/xr3ngine/xr3ngine/blob/66a84a950/packages/client-core/redux/feed/actions.ts#L112)

___

### feedRetrieved

▸ **feedRetrieved**(`feed`: Feed): [*FeedRetrievedAction*](../interfaces/redux_feed_actions.feedretrievedaction.md)

#### Parameters:

Name | Type |
:------ | :------ |
`feed` | Feed |

**Returns:** [*FeedRetrievedAction*](../interfaces/redux_feed_actions.feedretrievedaction.md)

Defined in: [packages/client-core/redux/feed/actions.ts:70](https://github.com/xr3ngine/xr3ngine/blob/66a84a950/packages/client-core/redux/feed/actions.ts#L70)

___

### feedsBookmarkRetrieved

▸ **feedsBookmarkRetrieved**(`feeds`: FeedShort[]): [*FeedsRetrievedAction*](../interfaces/redux_feed_actions.feedsretrievedaction.md)

#### Parameters:

Name | Type |
:------ | :------ |
`feeds` | FeedShort[] |

**Returns:** [*FeedsRetrievedAction*](../interfaces/redux_feed_actions.feedsretrievedaction.md)

Defined in: [packages/client-core/redux/feed/actions.ts:63](https://github.com/xr3ngine/xr3ngine/blob/66a84a950/packages/client-core/redux/feed/actions.ts#L63)

___

### feedsCreatorRetrieved

▸ **feedsCreatorRetrieved**(`feeds`: FeedShort[]): [*FeedsRetrievedAction*](../interfaces/redux_feed_actions.feedsretrievedaction.md)

#### Parameters:

Name | Type |
:------ | :------ |
`feeds` | FeedShort[] |

**Returns:** [*FeedsRetrievedAction*](../interfaces/redux_feed_actions.feedsretrievedaction.md)

Defined in: [packages/client-core/redux/feed/actions.ts:56](https://github.com/xr3ngine/xr3ngine/blob/66a84a950/packages/client-core/redux/feed/actions.ts#L56)

___

### feedsFeaturedRetrieved

▸ **feedsFeaturedRetrieved**(`feeds`: FeedShort[]): [*FeedsRetrievedAction*](../interfaces/redux_feed_actions.feedsretrievedaction.md)

#### Parameters:

Name | Type |
:------ | :------ |
`feeds` | FeedShort[] |

**Returns:** [*FeedsRetrievedAction*](../interfaces/redux_feed_actions.feedsretrievedaction.md)

Defined in: [packages/client-core/redux/feed/actions.ts:49](https://github.com/xr3ngine/xr3ngine/blob/66a84a950/packages/client-core/redux/feed/actions.ts#L49)

___

### feedsRetrieved

▸ **feedsRetrieved**(`feeds`: Feed[]): [*FeedsRetrievedAction*](../interfaces/redux_feed_actions.feedsretrievedaction.md)

#### Parameters:

Name | Type |
:------ | :------ |
`feeds` | Feed[] |

**Returns:** [*FeedsRetrievedAction*](../interfaces/redux_feed_actions.feedsretrievedaction.md)

Defined in: [packages/client-core/redux/feed/actions.ts:42](https://github.com/xr3ngine/xr3ngine/blob/66a84a950/packages/client-core/redux/feed/actions.ts#L42)

___

### fetchingFeeds

▸ **fetchingFeeds**(): [*FetchingFeedsAction*](../interfaces/redux_feed_actions.fetchingfeedsaction.md)

**Returns:** [*FetchingFeedsAction*](../interfaces/redux_feed_actions.fetchingfeedsaction.md)

Defined in: [packages/client-core/redux/feed/actions.ts:78](https://github.com/xr3ngine/xr3ngine/blob/66a84a950/packages/client-core/redux/feed/actions.ts#L78)

___

### removeFeedBookmark

▸ **removeFeedBookmark**(`feedId`: *string*): [*oneFeedAction*](../interfaces/redux_feed_actions.onefeedaction.md)

#### Parameters:

Name | Type |
:------ | :------ |
`feedId` | *string* |

**Returns:** [*oneFeedAction*](../interfaces/redux_feed_actions.onefeedaction.md)

Defined in: [packages/client-core/redux/feed/actions.ts:105](https://github.com/xr3ngine/xr3ngine/blob/66a84a950/packages/client-core/redux/feed/actions.ts#L105)

___

### removeFeedFire

▸ **removeFeedFire**(`feedId`: *string*): [*oneFeedAction*](../interfaces/redux_feed_actions.onefeedaction.md)

#### Parameters:

Name | Type |
:------ | :------ |
`feedId` | *string* |

**Returns:** [*oneFeedAction*](../interfaces/redux_feed_actions.onefeedaction.md)

Defined in: [packages/client-core/redux/feed/actions.ts:91](https://github.com/xr3ngine/xr3ngine/blob/66a84a950/packages/client-core/redux/feed/actions.ts#L91)
