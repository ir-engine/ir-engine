---
id: "client_core_redux_creator_actions"
title: "Module: client-core/redux/creator/actions"
sidebar_label: "client-core/redux/creator/actions"
custom_edit_url: null
hide_title: true
---

# Module: client-core/redux/creator/actions

## Table of contents

### Interfaces

- [CreatorRetrievedAction](../interfaces/client_core_redux_creator_actions.creatorretrievedaction.md)
- [CreatorsRetrievedAction](../interfaces/client_core_redux_creator_actions.creatorsretrievedaction.md)
- [FetchingCreatorAction](../interfaces/client_core_redux_creator_actions.fetchingcreatoraction.md)

## Type aliases

### CreatorsAction

Ƭ **CreatorsAction**: [*CreatorRetrievedAction*](../interfaces/client_core_redux_creator_actions.creatorretrievedaction.md) \| [*FetchingCreatorAction*](../interfaces/client_core_redux_creator_actions.fetchingcreatoraction.md) \| [*CreatorsRetrievedAction*](../interfaces/client_core_redux_creator_actions.creatorsretrievedaction.md)

Defined in: [packages/client-core/redux/creator/actions.ts:23](https://github.com/xr3ngine/xr3ngine/blob/5a0f83ed8/packages/client-core/redux/creator/actions.ts#L23)

## Functions

### creatorLoggedRetrieved

▸ **creatorLoggedRetrieved**(`creator`: Creator): [*CreatorRetrievedAction*](../interfaces/client_core_redux_creator_actions.creatorretrievedaction.md)

#### Parameters:

Name | Type |
:------ | :------ |
`creator` | Creator |

**Returns:** [*CreatorRetrievedAction*](../interfaces/client_core_redux_creator_actions.creatorretrievedaction.md)

Defined in: [packages/client-core/redux/creator/actions.ts:28](https://github.com/xr3ngine/xr3ngine/blob/5a0f83ed8/packages/client-core/redux/creator/actions.ts#L28)

___

### creatorRetrieved

▸ **creatorRetrieved**(`creator`: Creator): [*CreatorRetrievedAction*](../interfaces/client_core_redux_creator_actions.creatorretrievedaction.md)

#### Parameters:

Name | Type |
:------ | :------ |
`creator` | Creator |

**Returns:** [*CreatorRetrievedAction*](../interfaces/client_core_redux_creator_actions.creatorretrievedaction.md)

Defined in: [packages/client-core/redux/creator/actions.ts:35](https://github.com/xr3ngine/xr3ngine/blob/5a0f83ed8/packages/client-core/redux/creator/actions.ts#L35)

___

### creatorsRetrieved

▸ **creatorsRetrieved**(`creators`: CreatorShort[]): [*CreatorsRetrievedAction*](../interfaces/client_core_redux_creator_actions.creatorsretrievedaction.md)

#### Parameters:

Name | Type |
:------ | :------ |
`creators` | CreatorShort[] |

**Returns:** [*CreatorsRetrievedAction*](../interfaces/client_core_redux_creator_actions.creatorsretrievedaction.md)

Defined in: [packages/client-core/redux/creator/actions.ts:48](https://github.com/xr3ngine/xr3ngine/blob/5a0f83ed8/packages/client-core/redux/creator/actions.ts#L48)

___

### fetchingCreator

▸ **fetchingCreator**(): [*FetchingCreatorAction*](../interfaces/client_core_redux_creator_actions.fetchingcreatoraction.md)

**Returns:** [*FetchingCreatorAction*](../interfaces/client_core_redux_creator_actions.fetchingcreatoraction.md)

Defined in: [packages/client-core/redux/creator/actions.ts:42](https://github.com/xr3ngine/xr3ngine/blob/5a0f83ed8/packages/client-core/redux/creator/actions.ts#L42)
