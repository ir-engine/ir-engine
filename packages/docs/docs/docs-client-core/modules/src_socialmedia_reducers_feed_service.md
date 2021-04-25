---
id: "src_socialmedia_reducers_feed_service"
title: "Module: src/socialmedia/reducers/feed/service"
sidebar_label: "src/socialmedia/reducers/feed/service"
custom_edit_url: null
hide_title: true
---

# Module: src/socialmedia/reducers/feed/service

## Functions

### addViewToFeed

▸ **addViewToFeed**(`feedId`: *string*): *function*

#### Parameters:

| Name | Type |
| :------ | :------ |
| `feedId` | *string* |

**Returns:** (`dispatch`: *Dispatch*<AnyAction\>) => *Promise*<any\>

Defined in: [packages/client-core/src/socialmedia/reducers/feed/service.ts:91](https://github.com/xr3ngine/xr3ngine/blob/2d83606b6/packages/client-core/src/socialmedia/reducers/feed/service.ts#L91)

___

### createFeed

▸ **createFeed**(`__namedParameters`: *any*): *function*

#### Parameters:

| Name | Type |
| :------ | :------ |
| `__namedParameters` | *any* |

**Returns:** (`dispatch`: *Dispatch*<AnyAction\>) => *Promise*<any\>

Defined in: [packages/client-core/src/socialmedia/reducers/feed/service.ts:103](https://github.com/xr3ngine/xr3ngine/blob/2d83606b6/packages/client-core/src/socialmedia/reducers/feed/service.ts#L103)

___

### getFeed

▸ **getFeed**(`feedId`: *string*): *function*

#### Parameters:

| Name | Type |
| :------ | :------ |
| `feedId` | *string* |

**Returns:** (`dispatch`: *Dispatch*<AnyAction\>) => *Promise*<any\>

Defined in: [packages/client-core/src/socialmedia/reducers/feed/service.ts:78](https://github.com/xr3ngine/xr3ngine/blob/2d83606b6/packages/client-core/src/socialmedia/reducers/feed/service.ts#L78)

___

### getFeeds

▸ **getFeeds**(`type`: *string*, `id?`: *string*, `limit?`: *number*): *function*

#### Parameters:

| Name | Type |
| :------ | :------ |
| `type` | *string* |
| `id?` | *string* |
| `limit?` | *number* |

**Returns:** (`dispatch`: *Dispatch*<AnyAction\>, `getState`: *any*) => *Promise*<any\>

Defined in: [packages/client-core/src/socialmedia/reducers/feed/service.ts:24](https://github.com/xr3ngine/xr3ngine/blob/2d83606b6/packages/client-core/src/socialmedia/reducers/feed/service.ts#L24)

___

### setFeedAsFeatured

▸ **setFeedAsFeatured**(`feedId`: *string*): *function*

#### Parameters:

| Name | Type |
| :------ | :------ |
| `feedId` | *string* |

**Returns:** (`dispatch`: *Dispatch*<AnyAction\>) => *Promise*<any\>

Defined in: [packages/client-core/src/socialmedia/reducers/feed/service.ts:149](https://github.com/xr3ngine/xr3ngine/blob/2d83606b6/packages/client-core/src/socialmedia/reducers/feed/service.ts#L149)

___

### setFeedNotFeatured

▸ **setFeedNotFeatured**(`feedId`: *string*): *function*

#### Parameters:

| Name | Type |
| :------ | :------ |
| `feedId` | *string* |

**Returns:** (`dispatch`: *Dispatch*<AnyAction\>) => *Promise*<any\>

Defined in: [packages/client-core/src/socialmedia/reducers/feed/service.ts:161](https://github.com/xr3ngine/xr3ngine/blob/2d83606b6/packages/client-core/src/socialmedia/reducers/feed/service.ts#L161)

___

### updateFeedAsAdmin

▸ **updateFeedAsAdmin**(`feedId`: *string*, `feed`: *any*): *function*

#### Parameters:

| Name | Type |
| :------ | :------ |
| `feedId` | *string* |
| `feed` | *any* |

**Returns:** (`dispatch`: *Dispatch*<AnyAction\>) => *Promise*<any\>

Defined in: [packages/client-core/src/socialmedia/reducers/feed/service.ts:122](https://github.com/xr3ngine/xr3ngine/blob/2d83606b6/packages/client-core/src/socialmedia/reducers/feed/service.ts#L122)
