---
id: "src_socialmedia_reducers_creator_actions"
title: "Module: src/socialmedia/reducers/creator/actions"
sidebar_label: "src/socialmedia/reducers/creator/actions"
custom_edit_url: null
hide_title: true
---

# Module: src/socialmedia/reducers/creator/actions

## Table of contents

### Interfaces

- [CreatorRetrievedAction](../interfaces/src_socialmedia_reducers_creator_actions.creatorretrievedaction.md)
- [CreatorsNotificationsRetrievedAction](../interfaces/src_socialmedia_reducers_creator_actions.creatorsnotificationsretrievedaction.md)
- [CreatorsRetrievedAction](../interfaces/src_socialmedia_reducers_creator_actions.creatorsretrievedaction.md)
- [FetchingCreatorAction](../interfaces/src_socialmedia_reducers_creator_actions.fetchingcreatoraction.md)

## Type aliases

### CreatorsAction

Ƭ **CreatorsAction**: [*CreatorRetrievedAction*](../interfaces/src_socialmedia_reducers_creator_actions.creatorretrievedaction.md) \| [*FetchingCreatorAction*](../interfaces/src_socialmedia_reducers_creator_actions.fetchingcreatoraction.md) \| [*CreatorsRetrievedAction*](../interfaces/src_socialmedia_reducers_creator_actions.creatorsretrievedaction.md)

Defined in: [packages/client-core/src/socialmedia/reducers/creator/actions.ts:34](https://github.com/xr3ngine/xr3ngine/blob/2d83606b6/packages/client-core/src/socialmedia/reducers/creator/actions.ts#L34)

## Functions

### creatorFollowers

▸ **creatorFollowers**(`creators`: CreatorShort[]): [*CreatorsRetrievedAction*](../interfaces/src_socialmedia_reducers_creator_actions.creatorsretrievedaction.md)

#### Parameters:

| Name | Type |
| :------ | :------ |
| `creators` | CreatorShort[] |

**Returns:** [*CreatorsRetrievedAction*](../interfaces/src_socialmedia_reducers_creator_actions.creatorsretrievedaction.md)

Defined in: [packages/client-core/src/socialmedia/reducers/creator/actions.ts:93](https://github.com/xr3ngine/xr3ngine/blob/2d83606b6/packages/client-core/src/socialmedia/reducers/creator/actions.ts#L93)

___

### creatorFollowing

▸ **creatorFollowing**(`creators`: CreatorShort[]): [*CreatorsRetrievedAction*](../interfaces/src_socialmedia_reducers_creator_actions.creatorsretrievedaction.md)

#### Parameters:

| Name | Type |
| :------ | :------ |
| `creators` | CreatorShort[] |

**Returns:** [*CreatorsRetrievedAction*](../interfaces/src_socialmedia_reducers_creator_actions.creatorsretrievedaction.md)

Defined in: [packages/client-core/src/socialmedia/reducers/creator/actions.ts:100](https://github.com/xr3ngine/xr3ngine/blob/2d83606b6/packages/client-core/src/socialmedia/reducers/creator/actions.ts#L100)

___

### creatorLoggedRetrieved

▸ **creatorLoggedRetrieved**(`creator`: Creator): [*CreatorRetrievedAction*](../interfaces/src_socialmedia_reducers_creator_actions.creatorretrievedaction.md)

#### Parameters:

| Name | Type |
| :------ | :------ |
| `creator` | Creator |

**Returns:** [*CreatorRetrievedAction*](../interfaces/src_socialmedia_reducers_creator_actions.creatorretrievedaction.md)

Defined in: [packages/client-core/src/socialmedia/reducers/creator/actions.ts:39](https://github.com/xr3ngine/xr3ngine/blob/2d83606b6/packages/client-core/src/socialmedia/reducers/creator/actions.ts#L39)

___

### creatorNotificationList

▸ **creatorNotificationList**(`notifications`: *any*[]): [*CreatorsNotificationsRetrievedAction*](../interfaces/src_socialmedia_reducers_creator_actions.creatorsnotificationsretrievedaction.md)

#### Parameters:

| Name | Type |
| :------ | :------ |
| `notifications` | *any*[] |

**Returns:** [*CreatorsNotificationsRetrievedAction*](../interfaces/src_socialmedia_reducers_creator_actions.creatorsnotificationsretrievedaction.md)

Defined in: [packages/client-core/src/socialmedia/reducers/creator/actions.ts:73](https://github.com/xr3ngine/xr3ngine/blob/2d83606b6/packages/client-core/src/socialmedia/reducers/creator/actions.ts#L73)

___

### creatorRetrieved

▸ **creatorRetrieved**(`creator`: Creator): [*CreatorRetrievedAction*](../interfaces/src_socialmedia_reducers_creator_actions.creatorretrievedaction.md)

#### Parameters:

| Name | Type |
| :------ | :------ |
| `creator` | Creator |

**Returns:** [*CreatorRetrievedAction*](../interfaces/src_socialmedia_reducers_creator_actions.creatorretrievedaction.md)

Defined in: [packages/client-core/src/socialmedia/reducers/creator/actions.ts:46](https://github.com/xr3ngine/xr3ngine/blob/2d83606b6/packages/client-core/src/socialmedia/reducers/creator/actions.ts#L46)

___

### creatorsRetrieved

▸ **creatorsRetrieved**(`creators`: CreatorShort[]): [*CreatorsRetrievedAction*](../interfaces/src_socialmedia_reducers_creator_actions.creatorsretrievedaction.md)

#### Parameters:

| Name | Type |
| :------ | :------ |
| `creators` | CreatorShort[] |

**Returns:** [*CreatorsRetrievedAction*](../interfaces/src_socialmedia_reducers_creator_actions.creatorsretrievedaction.md)

Defined in: [packages/client-core/src/socialmedia/reducers/creator/actions.ts:65](https://github.com/xr3ngine/xr3ngine/blob/2d83606b6/packages/client-core/src/socialmedia/reducers/creator/actions.ts#L65)

___

### fetchingCreator

▸ **fetchingCreator**(): [*FetchingCreatorAction*](../interfaces/src_socialmedia_reducers_creator_actions.fetchingcreatoraction.md)

**Returns:** [*FetchingCreatorAction*](../interfaces/src_socialmedia_reducers_creator_actions.fetchingcreatoraction.md)

Defined in: [packages/client-core/src/socialmedia/reducers/creator/actions.ts:59](https://github.com/xr3ngine/xr3ngine/blob/2d83606b6/packages/client-core/src/socialmedia/reducers/creator/actions.ts#L59)

___

### fetchingCreators

▸ **fetchingCreators**(): [*FetchingCreatorAction*](../interfaces/src_socialmedia_reducers_creator_actions.fetchingcreatoraction.md)

**Returns:** [*FetchingCreatorAction*](../interfaces/src_socialmedia_reducers_creator_actions.fetchingcreatoraction.md)

Defined in: [packages/client-core/src/socialmedia/reducers/creator/actions.ts:53](https://github.com/xr3ngine/xr3ngine/blob/2d83606b6/packages/client-core/src/socialmedia/reducers/creator/actions.ts#L53)

___

### updateCreatorAsFollowed

▸ **updateCreatorAsFollowed**(): [*FetchingCreatorAction*](../interfaces/src_socialmedia_reducers_creator_actions.fetchingcreatoraction.md)

**Returns:** [*FetchingCreatorAction*](../interfaces/src_socialmedia_reducers_creator_actions.fetchingcreatoraction.md)

Defined in: [packages/client-core/src/socialmedia/reducers/creator/actions.ts:81](https://github.com/xr3ngine/xr3ngine/blob/2d83606b6/packages/client-core/src/socialmedia/reducers/creator/actions.ts#L81)

___

### updateCreatorNotFollowed

▸ **updateCreatorNotFollowed**(): [*FetchingCreatorAction*](../interfaces/src_socialmedia_reducers_creator_actions.fetchingcreatoraction.md)

**Returns:** [*FetchingCreatorAction*](../interfaces/src_socialmedia_reducers_creator_actions.fetchingcreatoraction.md)

Defined in: [packages/client-core/src/socialmedia/reducers/creator/actions.ts:87](https://github.com/xr3ngine/xr3ngine/blob/2d83606b6/packages/client-core/src/socialmedia/reducers/creator/actions.ts#L87)
