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
- [CreatorsRetrievedAction](../interfaces/redux_creator_actions.creatorsretrievedaction.md)
- [FetchingCreatorAction](../interfaces/redux_creator_actions.fetchingcreatoraction.md)

## Type aliases

### CreatorsAction

Ƭ **CreatorsAction**: [*CreatorRetrievedAction*](../interfaces/redux_creator_actions.creatorretrievedaction.md) \| [*FetchingCreatorAction*](../interfaces/redux_creator_actions.fetchingcreatoraction.md) \| [*CreatorsRetrievedAction*](../interfaces/redux_creator_actions.creatorsretrievedaction.md)

Defined in: [packages/client-core/redux/creator/actions.ts:23](https://github.com/xr3ngine/xr3ngine/blob/66a84a950/packages/client-core/redux/creator/actions.ts#L23)

## Functions

### creatorLoggedRetrieved

▸ **creatorLoggedRetrieved**(`creator`: Creator): [*CreatorRetrievedAction*](../interfaces/redux_creator_actions.creatorretrievedaction.md)

#### Parameters:

Name | Type |
:------ | :------ |
`creator` | Creator |

**Returns:** [*CreatorRetrievedAction*](../interfaces/redux_creator_actions.creatorretrievedaction.md)

Defined in: [packages/client-core/redux/creator/actions.ts:28](https://github.com/xr3ngine/xr3ngine/blob/66a84a950/packages/client-core/redux/creator/actions.ts#L28)

___

### creatorRetrieved

▸ **creatorRetrieved**(`creator`: Creator): [*CreatorRetrievedAction*](../interfaces/redux_creator_actions.creatorretrievedaction.md)

#### Parameters:

Name | Type |
:------ | :------ |
`creator` | Creator |

**Returns:** [*CreatorRetrievedAction*](../interfaces/redux_creator_actions.creatorretrievedaction.md)

Defined in: [packages/client-core/redux/creator/actions.ts:35](https://github.com/xr3ngine/xr3ngine/blob/66a84a950/packages/client-core/redux/creator/actions.ts#L35)

___

### creatorsRetrieved

▸ **creatorsRetrieved**(`creators`: CreatorShort[]): [*CreatorsRetrievedAction*](../interfaces/redux_creator_actions.creatorsretrievedaction.md)

#### Parameters:

Name | Type |
:------ | :------ |
`creators` | CreatorShort[] |

**Returns:** [*CreatorsRetrievedAction*](../interfaces/redux_creator_actions.creatorsretrievedaction.md)

Defined in: [packages/client-core/redux/creator/actions.ts:48](https://github.com/xr3ngine/xr3ngine/blob/66a84a950/packages/client-core/redux/creator/actions.ts#L48)

___

### fetchingCreator

▸ **fetchingCreator**(): [*FetchingCreatorAction*](../interfaces/redux_creator_actions.fetchingcreatoraction.md)

**Returns:** [*FetchingCreatorAction*](../interfaces/redux_creator_actions.fetchingcreatoraction.md)

Defined in: [packages/client-core/redux/creator/actions.ts:42](https://github.com/xr3ngine/xr3ngine/blob/66a84a950/packages/client-core/redux/creator/actions.ts#L42)
