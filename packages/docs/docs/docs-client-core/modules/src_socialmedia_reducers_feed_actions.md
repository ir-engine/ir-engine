---
id: "src_socialmedia_reducers_feed_actions"
title: "Module: src/socialmedia/reducers/feed/actions"
sidebar_label: "src/socialmedia/reducers/feed/actions"
custom_edit_url: null
hide_title: true
---

# Module: src/socialmedia/reducers/feed/actions

## Table of contents

### Interfaces

- [FeedRetrievedAction](../interfaces/src_socialmedia_reducers_feed_actions.feedretrievedaction.md)
- [FeedsRetrievedAction](../interfaces/src_socialmedia_reducers_feed_actions.feedsretrievedaction.md)
- [FetchingFeedsAction](../interfaces/src_socialmedia_reducers_feed_actions.fetchingfeedsaction.md)
- [oneFeedAction](../interfaces/src_socialmedia_reducers_feed_actions.onefeedaction.md)

## Type aliases

### FeedsAction

Ƭ **FeedsAction**: [*FeedsRetrievedAction*](../interfaces/src_socialmedia_reducers_feed_actions.feedsretrievedaction.md) \| [*FeedRetrievedAction*](../interfaces/src_socialmedia_reducers_feed_actions.feedretrievedaction.md) \| [*FetchingFeedsAction*](../interfaces/src_socialmedia_reducers_feed_actions.fetchingfeedsaction.md) \| [*oneFeedAction*](../interfaces/src_socialmedia_reducers_feed_actions.onefeedaction.md)

Defined in: [packages/client-core/src/socialmedia/reducers/feed/actions.ts:44](https://github.com/xr3ngine/xr3ngine/blob/2d83606b6/packages/client-core/src/socialmedia/reducers/feed/actions.ts#L44)

## Functions

### addFeed

▸ **addFeed**(`feed`: Feed): [*FeedRetrievedAction*](../interfaces/src_socialmedia_reducers_feed_actions.feedretrievedaction.md)

#### Parameters:

| Name | Type |
| :------ | :------ |
| `feed` | Feed |

**Returns:** [*FeedRetrievedAction*](../interfaces/src_socialmedia_reducers_feed_actions.feedretrievedaction.md)

Defined in: [packages/client-core/src/socialmedia/reducers/feed/actions.ts:147](https://github.com/xr3ngine/xr3ngine/blob/2d83606b6/packages/client-core/src/socialmedia/reducers/feed/actions.ts#L147)

___

### addFeedBookmark

▸ **addFeedBookmark**(`feedId`: *string*): [*oneFeedAction*](../interfaces/src_socialmedia_reducers_feed_actions.onefeedaction.md)

#### Parameters:

| Name | Type |
| :------ | :------ |
| `feedId` | *string* |

**Returns:** [*oneFeedAction*](../interfaces/src_socialmedia_reducers_feed_actions.onefeedaction.md)

Defined in: [packages/client-core/src/socialmedia/reducers/feed/actions.ts:126](https://github.com/xr3ngine/xr3ngine/blob/2d83606b6/packages/client-core/src/socialmedia/reducers/feed/actions.ts#L126)

___

### addFeedFire

▸ **addFeedFire**(`feedId`: *string*): [*oneFeedAction*](../interfaces/src_socialmedia_reducers_feed_actions.onefeedaction.md)

#### Parameters:

| Name | Type |
| :------ | :------ |
| `feedId` | *string* |

**Returns:** [*oneFeedAction*](../interfaces/src_socialmedia_reducers_feed_actions.onefeedaction.md)

Defined in: [packages/client-core/src/socialmedia/reducers/feed/actions.ts:99](https://github.com/xr3ngine/xr3ngine/blob/2d83606b6/packages/client-core/src/socialmedia/reducers/feed/actions.ts#L99)

___

### addFeedView

▸ **addFeedView**(`feedId`: *string*): [*oneFeedAction*](../interfaces/src_socialmedia_reducers_feed_actions.onefeedaction.md)

#### Parameters:

| Name | Type |
| :------ | :------ |
| `feedId` | *string* |

**Returns:** [*oneFeedAction*](../interfaces/src_socialmedia_reducers_feed_actions.onefeedaction.md)

Defined in: [packages/client-core/src/socialmedia/reducers/feed/actions.ts:140](https://github.com/xr3ngine/xr3ngine/blob/2d83606b6/packages/client-core/src/socialmedia/reducers/feed/actions.ts#L140)

___

### feedAsFeatured

▸ **feedAsFeatured**(`feedId`: *string*): [*oneFeedAction*](../interfaces/src_socialmedia_reducers_feed_actions.onefeedaction.md)

#### Parameters:

| Name | Type |
| :------ | :------ |
| `feedId` | *string* |

**Returns:** [*oneFeedAction*](../interfaces/src_socialmedia_reducers_feed_actions.onefeedaction.md)

Defined in: [packages/client-core/src/socialmedia/reducers/feed/actions.ts:106](https://github.com/xr3ngine/xr3ngine/blob/2d83606b6/packages/client-core/src/socialmedia/reducers/feed/actions.ts#L106)

___

### feedNotFeatured

▸ **feedNotFeatured**(`feedId`: *string*): [*oneFeedAction*](../interfaces/src_socialmedia_reducers_feed_actions.onefeedaction.md)

#### Parameters:

| Name | Type |
| :------ | :------ |
| `feedId` | *string* |

**Returns:** [*oneFeedAction*](../interfaces/src_socialmedia_reducers_feed_actions.onefeedaction.md)

Defined in: [packages/client-core/src/socialmedia/reducers/feed/actions.ts:113](https://github.com/xr3ngine/xr3ngine/blob/2d83606b6/packages/client-core/src/socialmedia/reducers/feed/actions.ts#L113)

___

### feedRetrieved

▸ **feedRetrieved**(`feed`: Feed): [*FeedRetrievedAction*](../interfaces/src_socialmedia_reducers_feed_actions.feedretrievedaction.md)

#### Parameters:

| Name | Type |
| :------ | :------ |
| `feed` | Feed |

**Returns:** [*FeedRetrievedAction*](../interfaces/src_socialmedia_reducers_feed_actions.feedretrievedaction.md)

Defined in: [packages/client-core/src/socialmedia/reducers/feed/actions.ts:85](https://github.com/xr3ngine/xr3ngine/blob/2d83606b6/packages/client-core/src/socialmedia/reducers/feed/actions.ts#L85)

___

### feedsAdminRetrieved

▸ **feedsAdminRetrieved**(`feeds`: *any*[]): [*FeedsRetrievedAction*](../interfaces/src_socialmedia_reducers_feed_actions.feedsretrievedaction.md)

#### Parameters:

| Name | Type |
| :------ | :------ |
| `feeds` | *any*[] |

**Returns:** [*FeedsRetrievedAction*](../interfaces/src_socialmedia_reducers_feed_actions.feedsretrievedaction.md)

Defined in: [packages/client-core/src/socialmedia/reducers/feed/actions.ts:154](https://github.com/xr3ngine/xr3ngine/blob/2d83606b6/packages/client-core/src/socialmedia/reducers/feed/actions.ts#L154)

___

### feedsBookmarkRetrieved

▸ **feedsBookmarkRetrieved**(`feeds`: FeedShort[]): [*FeedsRetrievedAction*](../interfaces/src_socialmedia_reducers_feed_actions.feedsretrievedaction.md)

#### Parameters:

| Name | Type |
| :------ | :------ |
| `feeds` | FeedShort[] |

**Returns:** [*FeedsRetrievedAction*](../interfaces/src_socialmedia_reducers_feed_actions.feedsretrievedaction.md)

Defined in: [packages/client-core/src/socialmedia/reducers/feed/actions.ts:71](https://github.com/xr3ngine/xr3ngine/blob/2d83606b6/packages/client-core/src/socialmedia/reducers/feed/actions.ts#L71)

___

### feedsCreatorRetrieved

▸ **feedsCreatorRetrieved**(`feeds`: FeedShort[]): [*FeedsRetrievedAction*](../interfaces/src_socialmedia_reducers_feed_actions.feedsretrievedaction.md)

#### Parameters:

| Name | Type |
| :------ | :------ |
| `feeds` | FeedShort[] |

**Returns:** [*FeedsRetrievedAction*](../interfaces/src_socialmedia_reducers_feed_actions.feedsretrievedaction.md)

Defined in: [packages/client-core/src/socialmedia/reducers/feed/actions.ts:64](https://github.com/xr3ngine/xr3ngine/blob/2d83606b6/packages/client-core/src/socialmedia/reducers/feed/actions.ts#L64)

___

### feedsFeaturedRetrieved

▸ **feedsFeaturedRetrieved**(`feeds`: FeedShort[]): [*FeedsRetrievedAction*](../interfaces/src_socialmedia_reducers_feed_actions.feedsretrievedaction.md)

#### Parameters:

| Name | Type |
| :------ | :------ |
| `feeds` | FeedShort[] |

**Returns:** [*FeedsRetrievedAction*](../interfaces/src_socialmedia_reducers_feed_actions.feedsretrievedaction.md)

Defined in: [packages/client-core/src/socialmedia/reducers/feed/actions.ts:57](https://github.com/xr3ngine/xr3ngine/blob/2d83606b6/packages/client-core/src/socialmedia/reducers/feed/actions.ts#L57)

___

### feedsMyFeaturedRetrieved

▸ **feedsMyFeaturedRetrieved**(`feeds`: FeedShort[]): [*FeedsRetrievedAction*](../interfaces/src_socialmedia_reducers_feed_actions.feedsretrievedaction.md)

#### Parameters:

| Name | Type |
| :------ | :------ |
| `feeds` | FeedShort[] |

**Returns:** [*FeedsRetrievedAction*](../interfaces/src_socialmedia_reducers_feed_actions.feedsretrievedaction.md)

Defined in: [packages/client-core/src/socialmedia/reducers/feed/actions.ts:78](https://github.com/xr3ngine/xr3ngine/blob/2d83606b6/packages/client-core/src/socialmedia/reducers/feed/actions.ts#L78)

___

### feedsRetrieved

▸ **feedsRetrieved**(`feeds`: Feed[]): [*FeedsRetrievedAction*](../interfaces/src_socialmedia_reducers_feed_actions.feedsretrievedaction.md)

#### Parameters:

| Name | Type |
| :------ | :------ |
| `feeds` | Feed[] |

**Returns:** [*FeedsRetrievedAction*](../interfaces/src_socialmedia_reducers_feed_actions.feedsretrievedaction.md)

Defined in: [packages/client-core/src/socialmedia/reducers/feed/actions.ts:50](https://github.com/xr3ngine/xr3ngine/blob/2d83606b6/packages/client-core/src/socialmedia/reducers/feed/actions.ts#L50)

___

### fetchingFeeds

▸ **fetchingFeeds**(): [*FetchingFeedsAction*](../interfaces/src_socialmedia_reducers_feed_actions.fetchingfeedsaction.md)

**Returns:** [*FetchingFeedsAction*](../interfaces/src_socialmedia_reducers_feed_actions.fetchingfeedsaction.md)

Defined in: [packages/client-core/src/socialmedia/reducers/feed/actions.ts:93](https://github.com/xr3ngine/xr3ngine/blob/2d83606b6/packages/client-core/src/socialmedia/reducers/feed/actions.ts#L93)

___

### removeFeedBookmark

▸ **removeFeedBookmark**(`feedId`: *string*): [*oneFeedAction*](../interfaces/src_socialmedia_reducers_feed_actions.onefeedaction.md)

#### Parameters:

| Name | Type |
| :------ | :------ |
| `feedId` | *string* |

**Returns:** [*oneFeedAction*](../interfaces/src_socialmedia_reducers_feed_actions.onefeedaction.md)

Defined in: [packages/client-core/src/socialmedia/reducers/feed/actions.ts:133](https://github.com/xr3ngine/xr3ngine/blob/2d83606b6/packages/client-core/src/socialmedia/reducers/feed/actions.ts#L133)

___

### removeFeedFire

▸ **removeFeedFire**(`feedId`: *string*): [*oneFeedAction*](../interfaces/src_socialmedia_reducers_feed_actions.onefeedaction.md)

#### Parameters:

| Name | Type |
| :------ | :------ |
| `feedId` | *string* |

**Returns:** [*oneFeedAction*](../interfaces/src_socialmedia_reducers_feed_actions.onefeedaction.md)

Defined in: [packages/client-core/src/socialmedia/reducers/feed/actions.ts:119](https://github.com/xr3ngine/xr3ngine/blob/2d83606b6/packages/client-core/src/socialmedia/reducers/feed/actions.ts#L119)

___

### updateFeedInList

▸ **updateFeedInList**(`feed`: Feed): [*FeedRetrievedAction*](../interfaces/src_socialmedia_reducers_feed_actions.feedretrievedaction.md)

#### Parameters:

| Name | Type |
| :------ | :------ |
| `feed` | Feed |

**Returns:** [*FeedRetrievedAction*](../interfaces/src_socialmedia_reducers_feed_actions.feedretrievedaction.md)

Defined in: [packages/client-core/src/socialmedia/reducers/feed/actions.ts:161](https://github.com/xr3ngine/xr3ngine/blob/2d83606b6/packages/client-core/src/socialmedia/reducers/feed/actions.ts#L161)
