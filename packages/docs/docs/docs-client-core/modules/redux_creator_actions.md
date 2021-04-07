---
id: "redux_creator_actions"
title: "Module: redux/creator/actions"
sidebar_label: "redux/creator/actions"
custom_edit_url: null
hide_title: true
---

# Module: redux/creator/actions

## Table of contents

### Interfaces

- [CreatorRetrievedAction](../interfaces/redux_creator_actions.creatorretrievedaction.md)
- [CreatorsNotificationsRetrievedAction](../interfaces/redux_creator_actions.creatorsnotificationsretrievedaction.md)
- [CreatorsRetrievedAction](../interfaces/redux_creator_actions.creatorsretrievedaction.md)
- [FetchingCreatorAction](../interfaces/redux_creator_actions.fetchingcreatoraction.md)

## Type aliases

### CreatorsAction

Ƭ **CreatorsAction**: [*CreatorRetrievedAction*](../interfaces/redux_creator_actions.creatorretrievedaction.md) \| [*FetchingCreatorAction*](../interfaces/redux_creator_actions.fetchingcreatoraction.md) \| [*CreatorsRetrievedAction*](../interfaces/redux_creator_actions.creatorsretrievedaction.md)

Defined in: [packages/client-core/redux/creator/actions.ts:31](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/creator/actions.ts#L31)

## Functions

### creatorFollowers

▸ **creatorFollowers**(`creators`: CreatorShort[]): [*CreatorsRetrievedAction*](../interfaces/redux_creator_actions.creatorsretrievedaction.md)

#### Parameters:

Name | Type |
:------ | :------ |
`creators` | CreatorShort[] |

**Returns:** [*CreatorsRetrievedAction*](../interfaces/redux_creator_actions.creatorsretrievedaction.md)

Defined in: [packages/client-core/redux/creator/actions.ts:90](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/creator/actions.ts#L90)

___

### creatorFollowing

▸ **creatorFollowing**(`creators`: CreatorShort[]): [*CreatorsRetrievedAction*](../interfaces/redux_creator_actions.creatorsretrievedaction.md)

#### Parameters:

Name | Type |
:------ | :------ |
`creators` | CreatorShort[] |

**Returns:** [*CreatorsRetrievedAction*](../interfaces/redux_creator_actions.creatorsretrievedaction.md)

Defined in: [packages/client-core/redux/creator/actions.ts:97](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/creator/actions.ts#L97)

___

### creatorLoggedRetrieved

▸ **creatorLoggedRetrieved**(`creator`: Creator): [*CreatorRetrievedAction*](../interfaces/redux_creator_actions.creatorretrievedaction.md)

#### Parameters:

Name | Type |
:------ | :------ |
`creator` | Creator |

**Returns:** [*CreatorRetrievedAction*](../interfaces/redux_creator_actions.creatorretrievedaction.md)

Defined in: [packages/client-core/redux/creator/actions.ts:36](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/creator/actions.ts#L36)

___

### creatorNotificationList

▸ **creatorNotificationList**(`notifications`: *any*[]): [*CreatorsNotificationsRetrievedAction*](../interfaces/redux_creator_actions.creatorsnotificationsretrievedaction.md)

#### Parameters:

Name | Type |
:------ | :------ |
`notifications` | *any*[] |

**Returns:** [*CreatorsNotificationsRetrievedAction*](../interfaces/redux_creator_actions.creatorsnotificationsretrievedaction.md)

Defined in: [packages/client-core/redux/creator/actions.ts:70](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/creator/actions.ts#L70)

___

### creatorRetrieved

▸ **creatorRetrieved**(`creator`: Creator): [*CreatorRetrievedAction*](../interfaces/redux_creator_actions.creatorretrievedaction.md)

#### Parameters:

Name | Type |
:------ | :------ |
`creator` | Creator |

**Returns:** [*CreatorRetrievedAction*](../interfaces/redux_creator_actions.creatorretrievedaction.md)

Defined in: [packages/client-core/redux/creator/actions.ts:43](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/creator/actions.ts#L43)

___

### creatorsRetrieved

▸ **creatorsRetrieved**(`creators`: CreatorShort[]): [*CreatorsRetrievedAction*](../interfaces/redux_creator_actions.creatorsretrievedaction.md)

#### Parameters:

Name | Type |
:------ | :------ |
`creators` | CreatorShort[] |

**Returns:** [*CreatorsRetrievedAction*](../interfaces/redux_creator_actions.creatorsretrievedaction.md)

Defined in: [packages/client-core/redux/creator/actions.ts:62](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/creator/actions.ts#L62)

___

### fetchingCreator

▸ **fetchingCreator**(): [*FetchingCreatorAction*](../interfaces/redux_creator_actions.fetchingcreatoraction.md)

**Returns:** [*FetchingCreatorAction*](../interfaces/redux_creator_actions.fetchingcreatoraction.md)

Defined in: [packages/client-core/redux/creator/actions.ts:56](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/creator/actions.ts#L56)

___

### fetchingCreators

▸ **fetchingCreators**(): [*FetchingCreatorAction*](../interfaces/redux_creator_actions.fetchingcreatoraction.md)

**Returns:** [*FetchingCreatorAction*](../interfaces/redux_creator_actions.fetchingcreatoraction.md)

Defined in: [packages/client-core/redux/creator/actions.ts:50](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/creator/actions.ts#L50)

___

### updateCreatorAsFollowed

▸ **updateCreatorAsFollowed**(): [*FetchingCreatorAction*](../interfaces/redux_creator_actions.fetchingcreatoraction.md)

**Returns:** [*FetchingCreatorAction*](../interfaces/redux_creator_actions.fetchingcreatoraction.md)

Defined in: [packages/client-core/redux/creator/actions.ts:78](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/creator/actions.ts#L78)

___

### updateCreatorNotFollowed

▸ **updateCreatorNotFollowed**(): [*FetchingCreatorAction*](../interfaces/redux_creator_actions.fetchingcreatoraction.md)

**Returns:** [*FetchingCreatorAction*](../interfaces/redux_creator_actions.fetchingcreatoraction.md)

Defined in: [packages/client-core/redux/creator/actions.ts:84](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/creator/actions.ts#L84)
