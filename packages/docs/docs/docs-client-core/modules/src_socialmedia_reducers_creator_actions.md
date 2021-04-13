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

Defined in: [packages/client-core/src/socialmedia/reducers/creator/actions.ts:31](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/client-core/src/socialmedia/reducers/creator/actions.ts#L31)

## Functions

### creatorFollowers

▸ **creatorFollowers**(`creators`: CreatorShort[]): [*CreatorsRetrievedAction*](../interfaces/src_socialmedia_reducers_creator_actions.creatorsretrievedaction.md)

#### Parameters:

Name | Type |
:------ | :------ |
`creators` | CreatorShort[] |

**Returns:** [*CreatorsRetrievedAction*](../interfaces/src_socialmedia_reducers_creator_actions.creatorsretrievedaction.md)

Defined in: [packages/client-core/src/socialmedia/reducers/creator/actions.ts:90](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/client-core/src/socialmedia/reducers/creator/actions.ts#L90)

___

### creatorFollowing

▸ **creatorFollowing**(`creators`: CreatorShort[]): [*CreatorsRetrievedAction*](../interfaces/src_socialmedia_reducers_creator_actions.creatorsretrievedaction.md)

#### Parameters:

Name | Type |
:------ | :------ |
`creators` | CreatorShort[] |

**Returns:** [*CreatorsRetrievedAction*](../interfaces/src_socialmedia_reducers_creator_actions.creatorsretrievedaction.md)

Defined in: [packages/client-core/src/socialmedia/reducers/creator/actions.ts:97](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/client-core/src/socialmedia/reducers/creator/actions.ts#L97)

___

### creatorLoggedRetrieved

▸ **creatorLoggedRetrieved**(`creator`: Creator): [*CreatorRetrievedAction*](../interfaces/src_socialmedia_reducers_creator_actions.creatorretrievedaction.md)

#### Parameters:

Name | Type |
:------ | :------ |
`creator` | Creator |

**Returns:** [*CreatorRetrievedAction*](../interfaces/src_socialmedia_reducers_creator_actions.creatorretrievedaction.md)

Defined in: [packages/client-core/src/socialmedia/reducers/creator/actions.ts:36](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/client-core/src/socialmedia/reducers/creator/actions.ts#L36)

___

### creatorNotificationList

▸ **creatorNotificationList**(`notifications`: *any*[]): [*CreatorsNotificationsRetrievedAction*](../interfaces/src_socialmedia_reducers_creator_actions.creatorsnotificationsretrievedaction.md)

#### Parameters:

Name | Type |
:------ | :------ |
`notifications` | *any*[] |

**Returns:** [*CreatorsNotificationsRetrievedAction*](../interfaces/src_socialmedia_reducers_creator_actions.creatorsnotificationsretrievedaction.md)

Defined in: [packages/client-core/src/socialmedia/reducers/creator/actions.ts:70](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/client-core/src/socialmedia/reducers/creator/actions.ts#L70)

___

### creatorRetrieved

▸ **creatorRetrieved**(`creator`: Creator): [*CreatorRetrievedAction*](../interfaces/src_socialmedia_reducers_creator_actions.creatorretrievedaction.md)

#### Parameters:

Name | Type |
:------ | :------ |
`creator` | Creator |

**Returns:** [*CreatorRetrievedAction*](../interfaces/src_socialmedia_reducers_creator_actions.creatorretrievedaction.md)

Defined in: [packages/client-core/src/socialmedia/reducers/creator/actions.ts:43](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/client-core/src/socialmedia/reducers/creator/actions.ts#L43)

___

### creatorsRetrieved

▸ **creatorsRetrieved**(`creators`: CreatorShort[]): [*CreatorsRetrievedAction*](../interfaces/src_socialmedia_reducers_creator_actions.creatorsretrievedaction.md)

#### Parameters:

Name | Type |
:------ | :------ |
`creators` | CreatorShort[] |

**Returns:** [*CreatorsRetrievedAction*](../interfaces/src_socialmedia_reducers_creator_actions.creatorsretrievedaction.md)

Defined in: [packages/client-core/src/socialmedia/reducers/creator/actions.ts:62](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/client-core/src/socialmedia/reducers/creator/actions.ts#L62)

___

### fetchingCreator

▸ **fetchingCreator**(): [*FetchingCreatorAction*](../interfaces/src_socialmedia_reducers_creator_actions.fetchingcreatoraction.md)

**Returns:** [*FetchingCreatorAction*](../interfaces/src_socialmedia_reducers_creator_actions.fetchingcreatoraction.md)

Defined in: [packages/client-core/src/socialmedia/reducers/creator/actions.ts:56](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/client-core/src/socialmedia/reducers/creator/actions.ts#L56)

___

### fetchingCreators

▸ **fetchingCreators**(): [*FetchingCreatorAction*](../interfaces/src_socialmedia_reducers_creator_actions.fetchingcreatoraction.md)

**Returns:** [*FetchingCreatorAction*](../interfaces/src_socialmedia_reducers_creator_actions.fetchingcreatoraction.md)

Defined in: [packages/client-core/src/socialmedia/reducers/creator/actions.ts:50](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/client-core/src/socialmedia/reducers/creator/actions.ts#L50)

___

### updateCreatorAsFollowed

▸ **updateCreatorAsFollowed**(): [*FetchingCreatorAction*](../interfaces/src_socialmedia_reducers_creator_actions.fetchingcreatoraction.md)

**Returns:** [*FetchingCreatorAction*](../interfaces/src_socialmedia_reducers_creator_actions.fetchingcreatoraction.md)

Defined in: [packages/client-core/src/socialmedia/reducers/creator/actions.ts:78](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/client-core/src/socialmedia/reducers/creator/actions.ts#L78)

___

### updateCreatorNotFollowed

▸ **updateCreatorNotFollowed**(): [*FetchingCreatorAction*](../interfaces/src_socialmedia_reducers_creator_actions.fetchingcreatoraction.md)

**Returns:** [*FetchingCreatorAction*](../interfaces/src_socialmedia_reducers_creator_actions.fetchingcreatoraction.md)

Defined in: [packages/client-core/src/socialmedia/reducers/creator/actions.ts:84](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/client-core/src/socialmedia/reducers/creator/actions.ts#L84)
