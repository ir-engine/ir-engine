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

Name | Type |
:------ | :------ |
`feedId` | *string* |

**Returns:** (`dispatch`: *Dispatch*<AnyAction\>) => *Promise*<any\>

Defined in: [packages/client-core/src/socialmedia/reducers/feed/service.ts:89](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/client-core/src/socialmedia/reducers/feed/service.ts#L89)

___

### createFeed

▸ **createFeed**(`__namedParameters`: *any*): *function*

#### Parameters:

Name | Type |
:------ | :------ |
`__namedParameters` | *any* |

**Returns:** (`dispatch`: *Dispatch*<AnyAction\>) => *Promise*<any\>

Defined in: [packages/client-core/src/socialmedia/reducers/feed/service.ts:101](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/client-core/src/socialmedia/reducers/feed/service.ts#L101)

___

### getFeed

▸ **getFeed**(`feedId`: *string*): *function*

#### Parameters:

Name | Type |
:------ | :------ |
`feedId` | *string* |

**Returns:** (`dispatch`: *Dispatch*<AnyAction\>) => *Promise*<any\>

Defined in: [packages/client-core/src/socialmedia/reducers/feed/service.ts:76](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/client-core/src/socialmedia/reducers/feed/service.ts#L76)

___

### getFeeds

▸ **getFeeds**(`type`: *string*, `id?`: *string*, `limit?`: *number*): *function*

#### Parameters:

Name | Type |
:------ | :------ |
`type` | *string* |
`id?` | *string* |
`limit?` | *number* |

**Returns:** (`dispatch`: *Dispatch*<AnyAction\>, `getState`: *any*) => *Promise*<any\>

Defined in: [packages/client-core/src/socialmedia/reducers/feed/service.ts:22](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/client-core/src/socialmedia/reducers/feed/service.ts#L22)

___

### setFeedAsFeatured

▸ **setFeedAsFeatured**(`feedId`: *string*): *function*

#### Parameters:

Name | Type |
:------ | :------ |
`feedId` | *string* |

**Returns:** (`dispatch`: *Dispatch*<AnyAction\>) => *Promise*<any\>

Defined in: [packages/client-core/src/socialmedia/reducers/feed/service.ts:147](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/client-core/src/socialmedia/reducers/feed/service.ts#L147)

___

### setFeedNotFeatured

▸ **setFeedNotFeatured**(`feedId`: *string*): *function*

#### Parameters:

Name | Type |
:------ | :------ |
`feedId` | *string* |

**Returns:** (`dispatch`: *Dispatch*<AnyAction\>) => *Promise*<any\>

Defined in: [packages/client-core/src/socialmedia/reducers/feed/service.ts:159](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/client-core/src/socialmedia/reducers/feed/service.ts#L159)

___

### updateFeedAsAdmin

▸ **updateFeedAsAdmin**(`feedId`: *string*, `feed`: *any*): *function*

#### Parameters:

Name | Type |
:------ | :------ |
`feedId` | *string* |
`feed` | *any* |

**Returns:** (`dispatch`: *Dispatch*<AnyAction\>) => *Promise*<any\>

Defined in: [packages/client-core/src/socialmedia/reducers/feed/service.ts:120](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/client-core/src/socialmedia/reducers/feed/service.ts#L120)
