---
id: "redux_feed_service"
title: "Module: redux/feed/service"
sidebar_label: "redux/feed/service"
custom_edit_url: null
hide_title: true
---

# Module: redux/feed/service

## Functions

### addViewToFeed

▸ **addViewToFeed**(`feedId`: *string*): *function*

#### Parameters:

Name | Type |
:------ | :------ |
`feedId` | *string* |

**Returns:** (`dispatch`: *Dispatch*<AnyAction\>) => *Promise*<any\>

Defined in: [packages/client-core/redux/feed/service.ts:90](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/feed/service.ts#L90)

___

### createFeed

▸ **createFeed**(`__namedParameters`: *any*): *function*

#### Parameters:

Name | Type |
:------ | :------ |
`__namedParameters` | *any* |

**Returns:** (`dispatch`: *Dispatch*<AnyAction\>) => *Promise*<any\>

Defined in: [packages/client-core/redux/feed/service.ts:102](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/feed/service.ts#L102)

___

### getFeed

▸ **getFeed**(`feedId`: *string*): *function*

#### Parameters:

Name | Type |
:------ | :------ |
`feedId` | *string* |

**Returns:** (`dispatch`: *Dispatch*<AnyAction\>) => *Promise*<any\>

Defined in: [packages/client-core/redux/feed/service.ts:77](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/feed/service.ts#L77)

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

Defined in: [packages/client-core/redux/feed/service.ts:22](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/feed/service.ts#L22)

___

### setFeedAsFeatured

▸ **setFeedAsFeatured**(`feedId`: *string*): *function*

#### Parameters:

Name | Type |
:------ | :------ |
`feedId` | *string* |

**Returns:** (`dispatch`: *Dispatch*<AnyAction\>) => *Promise*<any\>

Defined in: [packages/client-core/redux/feed/service.ts:148](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/feed/service.ts#L148)

___

### setFeedNotFeatured

▸ **setFeedNotFeatured**(`feedId`: *string*): *function*

#### Parameters:

Name | Type |
:------ | :------ |
`feedId` | *string* |

**Returns:** (`dispatch`: *Dispatch*<AnyAction\>) => *Promise*<any\>

Defined in: [packages/client-core/redux/feed/service.ts:160](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/feed/service.ts#L160)

___

### updateFeedAsAdmin

▸ **updateFeedAsAdmin**(`feedId`: *string*, `feed`: *any*): *function*

#### Parameters:

Name | Type |
:------ | :------ |
`feedId` | *string* |
`feed` | *any* |

**Returns:** (`dispatch`: *Dispatch*<AnyAction\>) => *Promise*<any\>

Defined in: [packages/client-core/redux/feed/service.ts:121](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/feed/service.ts#L121)
