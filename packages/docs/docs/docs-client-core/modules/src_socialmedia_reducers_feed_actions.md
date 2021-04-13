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

Defined in: [packages/client-core/src/socialmedia/reducers/feed/actions.ts:41](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/client-core/src/socialmedia/reducers/feed/actions.ts#L41)

## Functions

### addFeed

▸ **addFeed**(`feed`: Feed): [*FeedRetrievedAction*](../interfaces/src_socialmedia_reducers_feed_actions.feedretrievedaction.md)

#### Parameters:

Name | Type |
:------ | :------ |
`feed` | Feed |

**Returns:** [*FeedRetrievedAction*](../interfaces/src_socialmedia_reducers_feed_actions.feedretrievedaction.md)

Defined in: [packages/client-core/src/socialmedia/reducers/feed/actions.ts:144](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/client-core/src/socialmedia/reducers/feed/actions.ts#L144)

___

### addFeedBookmark

▸ **addFeedBookmark**(`feedId`: *string*): [*oneFeedAction*](../interfaces/src_socialmedia_reducers_feed_actions.onefeedaction.md)

#### Parameters:

Name | Type |
:------ | :------ |
`feedId` | *string* |

**Returns:** [*oneFeedAction*](../interfaces/src_socialmedia_reducers_feed_actions.onefeedaction.md)

Defined in: [packages/client-core/src/socialmedia/reducers/feed/actions.ts:123](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/client-core/src/socialmedia/reducers/feed/actions.ts#L123)

___

### addFeedFire

▸ **addFeedFire**(`feedId`: *string*): [*oneFeedAction*](../interfaces/src_socialmedia_reducers_feed_actions.onefeedaction.md)

#### Parameters:

Name | Type |
:------ | :------ |
`feedId` | *string* |

**Returns:** [*oneFeedAction*](../interfaces/src_socialmedia_reducers_feed_actions.onefeedaction.md)

Defined in: [packages/client-core/src/socialmedia/reducers/feed/actions.ts:96](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/client-core/src/socialmedia/reducers/feed/actions.ts#L96)

___

### addFeedView

▸ **addFeedView**(`feedId`: *string*): [*oneFeedAction*](../interfaces/src_socialmedia_reducers_feed_actions.onefeedaction.md)

#### Parameters:

Name | Type |
:------ | :------ |
`feedId` | *string* |

**Returns:** [*oneFeedAction*](../interfaces/src_socialmedia_reducers_feed_actions.onefeedaction.md)

Defined in: [packages/client-core/src/socialmedia/reducers/feed/actions.ts:137](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/client-core/src/socialmedia/reducers/feed/actions.ts#L137)

___

### feedAsFeatured

▸ **feedAsFeatured**(`feedId`: *string*): [*oneFeedAction*](../interfaces/src_socialmedia_reducers_feed_actions.onefeedaction.md)

#### Parameters:

Name | Type |
:------ | :------ |
`feedId` | *string* |

**Returns:** [*oneFeedAction*](../interfaces/src_socialmedia_reducers_feed_actions.onefeedaction.md)

Defined in: [packages/client-core/src/socialmedia/reducers/feed/actions.ts:103](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/client-core/src/socialmedia/reducers/feed/actions.ts#L103)

___

### feedNotFeatured

▸ **feedNotFeatured**(`feedId`: *string*): [*oneFeedAction*](../interfaces/src_socialmedia_reducers_feed_actions.onefeedaction.md)

#### Parameters:

Name | Type |
:------ | :------ |
`feedId` | *string* |

**Returns:** [*oneFeedAction*](../interfaces/src_socialmedia_reducers_feed_actions.onefeedaction.md)

Defined in: [packages/client-core/src/socialmedia/reducers/feed/actions.ts:110](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/client-core/src/socialmedia/reducers/feed/actions.ts#L110)

___

### feedRetrieved

▸ **feedRetrieved**(`feed`: Feed): [*FeedRetrievedAction*](../interfaces/src_socialmedia_reducers_feed_actions.feedretrievedaction.md)

#### Parameters:

Name | Type |
:------ | :------ |
`feed` | Feed |

**Returns:** [*FeedRetrievedAction*](../interfaces/src_socialmedia_reducers_feed_actions.feedretrievedaction.md)

Defined in: [packages/client-core/src/socialmedia/reducers/feed/actions.ts:82](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/client-core/src/socialmedia/reducers/feed/actions.ts#L82)

___

### feedsAdminRetrieved

▸ **feedsAdminRetrieved**(`feeds`: *any*[]): [*FeedsRetrievedAction*](../interfaces/src_socialmedia_reducers_feed_actions.feedsretrievedaction.md)

#### Parameters:

Name | Type |
:------ | :------ |
`feeds` | *any*[] |

**Returns:** [*FeedsRetrievedAction*](../interfaces/src_socialmedia_reducers_feed_actions.feedsretrievedaction.md)

Defined in: [packages/client-core/src/socialmedia/reducers/feed/actions.ts:151](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/client-core/src/socialmedia/reducers/feed/actions.ts#L151)

___

### feedsBookmarkRetrieved

▸ **feedsBookmarkRetrieved**(`feeds`: FeedShort[]): [*FeedsRetrievedAction*](../interfaces/src_socialmedia_reducers_feed_actions.feedsretrievedaction.md)

#### Parameters:

Name | Type |
:------ | :------ |
`feeds` | FeedShort[] |

**Returns:** [*FeedsRetrievedAction*](../interfaces/src_socialmedia_reducers_feed_actions.feedsretrievedaction.md)

Defined in: [packages/client-core/src/socialmedia/reducers/feed/actions.ts:68](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/client-core/src/socialmedia/reducers/feed/actions.ts#L68)

___

### feedsCreatorRetrieved

▸ **feedsCreatorRetrieved**(`feeds`: FeedShort[]): [*FeedsRetrievedAction*](../interfaces/src_socialmedia_reducers_feed_actions.feedsretrievedaction.md)

#### Parameters:

Name | Type |
:------ | :------ |
`feeds` | FeedShort[] |

**Returns:** [*FeedsRetrievedAction*](../interfaces/src_socialmedia_reducers_feed_actions.feedsretrievedaction.md)

Defined in: [packages/client-core/src/socialmedia/reducers/feed/actions.ts:61](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/client-core/src/socialmedia/reducers/feed/actions.ts#L61)

___

### feedsFeaturedRetrieved

▸ **feedsFeaturedRetrieved**(`feeds`: FeedShort[]): [*FeedsRetrievedAction*](../interfaces/src_socialmedia_reducers_feed_actions.feedsretrievedaction.md)

#### Parameters:

Name | Type |
:------ | :------ |
`feeds` | FeedShort[] |

**Returns:** [*FeedsRetrievedAction*](../interfaces/src_socialmedia_reducers_feed_actions.feedsretrievedaction.md)

Defined in: [packages/client-core/src/socialmedia/reducers/feed/actions.ts:54](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/client-core/src/socialmedia/reducers/feed/actions.ts#L54)

___

### feedsMyFeaturedRetrieved

▸ **feedsMyFeaturedRetrieved**(`feeds`: FeedShort[]): [*FeedsRetrievedAction*](../interfaces/src_socialmedia_reducers_feed_actions.feedsretrievedaction.md)

#### Parameters:

Name | Type |
:------ | :------ |
`feeds` | FeedShort[] |

**Returns:** [*FeedsRetrievedAction*](../interfaces/src_socialmedia_reducers_feed_actions.feedsretrievedaction.md)

Defined in: [packages/client-core/src/socialmedia/reducers/feed/actions.ts:75](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/client-core/src/socialmedia/reducers/feed/actions.ts#L75)

___

### feedsRetrieved

▸ **feedsRetrieved**(`feeds`: Feed[]): [*FeedsRetrievedAction*](../interfaces/src_socialmedia_reducers_feed_actions.feedsretrievedaction.md)

#### Parameters:

Name | Type |
:------ | :------ |
`feeds` | Feed[] |

**Returns:** [*FeedsRetrievedAction*](../interfaces/src_socialmedia_reducers_feed_actions.feedsretrievedaction.md)

Defined in: [packages/client-core/src/socialmedia/reducers/feed/actions.ts:47](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/client-core/src/socialmedia/reducers/feed/actions.ts#L47)

___

### fetchingFeeds

▸ **fetchingFeeds**(): [*FetchingFeedsAction*](../interfaces/src_socialmedia_reducers_feed_actions.fetchingfeedsaction.md)

**Returns:** [*FetchingFeedsAction*](../interfaces/src_socialmedia_reducers_feed_actions.fetchingfeedsaction.md)

Defined in: [packages/client-core/src/socialmedia/reducers/feed/actions.ts:90](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/client-core/src/socialmedia/reducers/feed/actions.ts#L90)

___

### removeFeedBookmark

▸ **removeFeedBookmark**(`feedId`: *string*): [*oneFeedAction*](../interfaces/src_socialmedia_reducers_feed_actions.onefeedaction.md)

#### Parameters:

Name | Type |
:------ | :------ |
`feedId` | *string* |

**Returns:** [*oneFeedAction*](../interfaces/src_socialmedia_reducers_feed_actions.onefeedaction.md)

Defined in: [packages/client-core/src/socialmedia/reducers/feed/actions.ts:130](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/client-core/src/socialmedia/reducers/feed/actions.ts#L130)

___

### removeFeedFire

▸ **removeFeedFire**(`feedId`: *string*): [*oneFeedAction*](../interfaces/src_socialmedia_reducers_feed_actions.onefeedaction.md)

#### Parameters:

Name | Type |
:------ | :------ |
`feedId` | *string* |

**Returns:** [*oneFeedAction*](../interfaces/src_socialmedia_reducers_feed_actions.onefeedaction.md)

Defined in: [packages/client-core/src/socialmedia/reducers/feed/actions.ts:116](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/client-core/src/socialmedia/reducers/feed/actions.ts#L116)

___

### updateFeedInList

▸ **updateFeedInList**(`feed`: Feed): [*FeedRetrievedAction*](../interfaces/src_socialmedia_reducers_feed_actions.feedretrievedaction.md)

#### Parameters:

Name | Type |
:------ | :------ |
`feed` | Feed |

**Returns:** [*FeedRetrievedAction*](../interfaces/src_socialmedia_reducers_feed_actions.feedretrievedaction.md)

Defined in: [packages/client-core/src/socialmedia/reducers/feed/actions.ts:158](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/client-core/src/socialmedia/reducers/feed/actions.ts#L158)
