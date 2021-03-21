---
id: "client_core_redux_feed_actions"
title: "Module: client-core/redux/feed/actions"
sidebar_label: "client-core/redux/feed/actions"
custom_edit_url: null
hide_title: true
---

# Module: client-core/redux/feed/actions

## Table of contents

### Interfaces

- [FeedRetrievedAction](../interfaces/client_core_redux_feed_actions.feedretrievedaction.md)
- [FeedsRetrievedAction](../interfaces/client_core_redux_feed_actions.feedsretrievedaction.md)
- [FetchingFeedsAction](../interfaces/client_core_redux_feed_actions.fetchingfeedsaction.md)
- [oneFeedAction](../interfaces/client_core_redux_feed_actions.onefeedaction.md)

## Type aliases

### FeedsAction

Ƭ **FeedsAction**: [*FeedsRetrievedAction*](../interfaces/client_core_redux_feed_actions.feedsretrievedaction.md) \| [*FeedRetrievedAction*](../interfaces/client_core_redux_feed_actions.feedretrievedaction.md) \| [*FetchingFeedsAction*](../interfaces/client_core_redux_feed_actions.fetchingfeedsaction.md) \| [*oneFeedAction*](../interfaces/client_core_redux_feed_actions.onefeedaction.md)

Defined in: [packages/client-core/redux/feed/actions.ts:36](https://github.com/xr3ngine/xr3ngine/blob/5a0f83ed8/packages/client-core/redux/feed/actions.ts#L36)

## Functions

### addFeed

▸ **addFeed**(`feed`: Feed): [*FeedRetrievedAction*](../interfaces/client_core_redux_feed_actions.feedretrievedaction.md)

#### Parameters:

Name | Type |
:------ | :------ |
`feed` | Feed |

**Returns:** [*FeedRetrievedAction*](../interfaces/client_core_redux_feed_actions.feedretrievedaction.md)

Defined in: [packages/client-core/redux/feed/actions.ts:119](https://github.com/xr3ngine/xr3ngine/blob/5a0f83ed8/packages/client-core/redux/feed/actions.ts#L119)

___

### addFeedBookmark

▸ **addFeedBookmark**(`feedId`: *string*): [*oneFeedAction*](../interfaces/client_core_redux_feed_actions.onefeedaction.md)

#### Parameters:

Name | Type |
:------ | :------ |
`feedId` | *string* |

**Returns:** [*oneFeedAction*](../interfaces/client_core_redux_feed_actions.onefeedaction.md)

Defined in: [packages/client-core/redux/feed/actions.ts:98](https://github.com/xr3ngine/xr3ngine/blob/5a0f83ed8/packages/client-core/redux/feed/actions.ts#L98)

___

### addFeedFire

▸ **addFeedFire**(`feedId`: *string*): [*oneFeedAction*](../interfaces/client_core_redux_feed_actions.onefeedaction.md)

#### Parameters:

Name | Type |
:------ | :------ |
`feedId` | *string* |

**Returns:** [*oneFeedAction*](../interfaces/client_core_redux_feed_actions.onefeedaction.md)

Defined in: [packages/client-core/redux/feed/actions.ts:84](https://github.com/xr3ngine/xr3ngine/blob/5a0f83ed8/packages/client-core/redux/feed/actions.ts#L84)

___

### addFeedView

▸ **addFeedView**(`feedId`: *string*): [*oneFeedAction*](../interfaces/client_core_redux_feed_actions.onefeedaction.md)

#### Parameters:

Name | Type |
:------ | :------ |
`feedId` | *string* |

**Returns:** [*oneFeedAction*](../interfaces/client_core_redux_feed_actions.onefeedaction.md)

Defined in: [packages/client-core/redux/feed/actions.ts:112](https://github.com/xr3ngine/xr3ngine/blob/5a0f83ed8/packages/client-core/redux/feed/actions.ts#L112)

___

### feedRetrieved

▸ **feedRetrieved**(`feed`: Feed): [*FeedRetrievedAction*](../interfaces/client_core_redux_feed_actions.feedretrievedaction.md)

#### Parameters:

Name | Type |
:------ | :------ |
`feed` | Feed |

**Returns:** [*FeedRetrievedAction*](../interfaces/client_core_redux_feed_actions.feedretrievedaction.md)

Defined in: [packages/client-core/redux/feed/actions.ts:70](https://github.com/xr3ngine/xr3ngine/blob/5a0f83ed8/packages/client-core/redux/feed/actions.ts#L70)

___

### feedsBookmarkRetrieved

▸ **feedsBookmarkRetrieved**(`feeds`: FeedShort[]): [*FeedsRetrievedAction*](../interfaces/client_core_redux_feed_actions.feedsretrievedaction.md)

#### Parameters:

Name | Type |
:------ | :------ |
`feeds` | FeedShort[] |

**Returns:** [*FeedsRetrievedAction*](../interfaces/client_core_redux_feed_actions.feedsretrievedaction.md)

Defined in: [packages/client-core/redux/feed/actions.ts:63](https://github.com/xr3ngine/xr3ngine/blob/5a0f83ed8/packages/client-core/redux/feed/actions.ts#L63)

___

### feedsCreatorRetrieved

▸ **feedsCreatorRetrieved**(`feeds`: FeedShort[]): [*FeedsRetrievedAction*](../interfaces/client_core_redux_feed_actions.feedsretrievedaction.md)

#### Parameters:

Name | Type |
:------ | :------ |
`feeds` | FeedShort[] |

**Returns:** [*FeedsRetrievedAction*](../interfaces/client_core_redux_feed_actions.feedsretrievedaction.md)

Defined in: [packages/client-core/redux/feed/actions.ts:56](https://github.com/xr3ngine/xr3ngine/blob/5a0f83ed8/packages/client-core/redux/feed/actions.ts#L56)

___

### feedsFeaturedRetrieved

▸ **feedsFeaturedRetrieved**(`feeds`: FeedShort[]): [*FeedsRetrievedAction*](../interfaces/client_core_redux_feed_actions.feedsretrievedaction.md)

#### Parameters:

Name | Type |
:------ | :------ |
`feeds` | FeedShort[] |

**Returns:** [*FeedsRetrievedAction*](../interfaces/client_core_redux_feed_actions.feedsretrievedaction.md)

Defined in: [packages/client-core/redux/feed/actions.ts:49](https://github.com/xr3ngine/xr3ngine/blob/5a0f83ed8/packages/client-core/redux/feed/actions.ts#L49)

___

### feedsRetrieved

▸ **feedsRetrieved**(`feeds`: Feed[]): [*FeedsRetrievedAction*](../interfaces/client_core_redux_feed_actions.feedsretrievedaction.md)

#### Parameters:

Name | Type |
:------ | :------ |
`feeds` | Feed[] |

**Returns:** [*FeedsRetrievedAction*](../interfaces/client_core_redux_feed_actions.feedsretrievedaction.md)

Defined in: [packages/client-core/redux/feed/actions.ts:42](https://github.com/xr3ngine/xr3ngine/blob/5a0f83ed8/packages/client-core/redux/feed/actions.ts#L42)

___

### fetchingFeeds

▸ **fetchingFeeds**(): [*FetchingFeedsAction*](../interfaces/client_core_redux_feed_actions.fetchingfeedsaction.md)

**Returns:** [*FetchingFeedsAction*](../interfaces/client_core_redux_feed_actions.fetchingfeedsaction.md)

Defined in: [packages/client-core/redux/feed/actions.ts:78](https://github.com/xr3ngine/xr3ngine/blob/5a0f83ed8/packages/client-core/redux/feed/actions.ts#L78)

___

### removeFeedBookmark

▸ **removeFeedBookmark**(`feedId`: *string*): [*oneFeedAction*](../interfaces/client_core_redux_feed_actions.onefeedaction.md)

#### Parameters:

Name | Type |
:------ | :------ |
`feedId` | *string* |

**Returns:** [*oneFeedAction*](../interfaces/client_core_redux_feed_actions.onefeedaction.md)

Defined in: [packages/client-core/redux/feed/actions.ts:105](https://github.com/xr3ngine/xr3ngine/blob/5a0f83ed8/packages/client-core/redux/feed/actions.ts#L105)

___

### removeFeedFire

▸ **removeFeedFire**(`feedId`: *string*): [*oneFeedAction*](../interfaces/client_core_redux_feed_actions.onefeedaction.md)

#### Parameters:

Name | Type |
:------ | :------ |
`feedId` | *string* |

**Returns:** [*oneFeedAction*](../interfaces/client_core_redux_feed_actions.onefeedaction.md)

Defined in: [packages/client-core/redux/feed/actions.ts:91](https://github.com/xr3ngine/xr3ngine/blob/5a0f83ed8/packages/client-core/redux/feed/actions.ts#L91)
