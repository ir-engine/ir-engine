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

Defined in: [packages/client-core/redux/feed/service.ts:70](https://github.com/xr3ngine/xr3ngine/blob/66a84a950/packages/client-core/redux/feed/service.ts#L70)

___

### createFeed

▸ **createFeed**(`__namedParameters`: *any*): *function*

#### Parameters:

Name | Type |
:------ | :------ |
`__namedParameters` | *any* |

**Returns:** (`dispatch`: *Dispatch*<AnyAction\>) => *Promise*<any\>

Defined in: [packages/client-core/redux/feed/service.ts:82](https://github.com/xr3ngine/xr3ngine/blob/66a84a950/packages/client-core/redux/feed/service.ts#L82)

___

### getFeed

▸ **getFeed**(`feedId`: *string*): *function*

#### Parameters:

Name | Type |
:------ | :------ |
`feedId` | *string* |

**Returns:** (`dispatch`: *Dispatch*<AnyAction\>) => *Promise*<any\>

Defined in: [packages/client-core/redux/feed/service.ts:57](https://github.com/xr3ngine/xr3ngine/blob/66a84a950/packages/client-core/redux/feed/service.ts#L57)

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

Defined in: [packages/client-core/redux/feed/service.ts:17](https://github.com/xr3ngine/xr3ngine/blob/66a84a950/packages/client-core/redux/feed/service.ts#L17)
