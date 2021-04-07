---
id: "redux_feedfires_actions"
title: "Module: redux/feedFires/actions"
sidebar_label: "redux/feedFires/actions"
custom_edit_url: null
hide_title: true
---

# Module: redux/feedFires/actions

## Table of contents

### Interfaces

- [FeedFiresRetriveAction](../interfaces/redux_feedfires_actions.feedfiresretriveaction.md)
- [FetchingFeedFiresAction](../interfaces/redux_feedfires_actions.fetchingfeedfiresaction.md)

## Type aliases

### FeedFiresAction

Ƭ **FeedFiresAction**: [*FeedFiresRetriveAction*](../interfaces/redux_feedfires_actions.feedfiresretriveaction.md) \| [*FetchingFeedFiresAction*](../interfaces/redux_feedfires_actions.fetchingfeedfiresaction.md)

Defined in: [packages/client-core/redux/feedFires/actions.ts:16](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/feedFires/actions.ts#L16)

## Functions

### feedFiresRetrieved

▸ **feedFiresRetrieved**(`feedFires`: CreatorShort[]): [*FeedFiresRetriveAction*](../interfaces/redux_feedfires_actions.feedfiresretriveaction.md)

#### Parameters:

Name | Type |
:------ | :------ |
`feedFires` | CreatorShort[] |

**Returns:** [*FeedFiresRetriveAction*](../interfaces/redux_feedfires_actions.feedfiresretriveaction.md)

Defined in: [packages/client-core/redux/feedFires/actions.ts:20](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/feedFires/actions.ts#L20)

___

### fetchingFeedFires

▸ **fetchingFeedFires**(): [*FetchingFeedFiresAction*](../interfaces/redux_feedfires_actions.fetchingfeedfiresaction.md)

**Returns:** [*FetchingFeedFiresAction*](../interfaces/redux_feedfires_actions.fetchingfeedfiresaction.md)

Defined in: [packages/client-core/redux/feedFires/actions.ts:28](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/feedFires/actions.ts#L28)
