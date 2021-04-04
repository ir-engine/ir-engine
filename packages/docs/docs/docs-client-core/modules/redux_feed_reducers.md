---
id: "redux_feed_reducers"
title: "Module: redux/feed/reducers"
sidebar_label: "redux/feed/reducers"
custom_edit_url: null
hide_title: true
---

# Module: redux/feed/reducers

## Variables

### initialState

• `Const` **initialState**: *object*

#### Type declaration:

Name | Type |
:------ | :------ |
`feeds` | *object* |
`feeds.feed` | *object* |
`feeds.feeds` | *any*[] |
`feeds.feedsAdmin` | *any*[] |
`feeds.feedsBookmark` | *any*[] |
`feeds.feedsCreator` | *any*[] |
`feeds.feedsFeatured` | *any*[] |
`feeds.fetching` | *boolean* |
`feeds.myFeatured` | *any*[] |

Defined in: [packages/client-core/redux/feed/reducers.ts:29](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/feed/reducers.ts#L29)

## Functions

### default

▸ `Const`**default**(`state?`: *any*, `action`: [*FeedsAction*](redux_feed_actions.md#feedsaction)): *any*

#### Parameters:

Name | Type |
:------ | :------ |
`state` | *any* |
`action` | [*FeedsAction*](redux_feed_actions.md#feedsaction) |

**Returns:** *any*

Defined in: [packages/client-core/redux/feed/reducers.ts:44](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/feed/reducers.ts#L44)
