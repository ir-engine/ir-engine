---
id: "src_common_reducers_app_actions"
title: "Module: src/common/reducers/app/actions"
sidebar_label: "src/common/reducers/app/actions"
custom_edit_url: null
hide_title: true
---

# Module: src/common/reducers/app/actions

## Table of contents

### Enumerations

- [generalStateList](../enums/src_common_reducers_app_actions.generalstatelist.md)

### Interfaces

- [AppLoadPercentAction](../interfaces/src_common_reducers_app_actions.apploadpercentaction.md)
- [AppLoadedAction](../interfaces/src_common_reducers_app_actions.apploadedaction.md)
- [AppOnBoardingStepAction](../interfaces/src_common_reducers_app_actions.apponboardingstepaction.md)
- [SetViewportAction](../interfaces/src_common_reducers_app_actions.setviewportaction.md)

## Functions

### setAppInVrMode

▸ `Const`**setAppInVrMode**(`inVrMode`: *boolean*): *object*

#### Parameters:

| Name | Type |
| :------ | :------ |
| `inVrMode` | *boolean* |

**Returns:** *object*

| Name | Type |
| :------ | :------ |
| `inVrMode` | *boolean* |
| `type` | *string* |

Defined in: [packages/client-core/src/common/reducers/app/actions.ts:53](https://github.com/xr3ngine/xr3ngine/blob/7e8e151f1/packages/client-core/src/common/reducers/app/actions.ts#L53)

___

### setAppLoadPercent

▸ `Const`**setAppLoadPercent**(`loadPercent`: *number*): [*AppLoadPercentAction*](../interfaces/src_common_reducers_app_actions.apploadpercentaction.md)

#### Parameters:

| Name | Type |
| :------ | :------ |
| `loadPercent` | *number* |

**Returns:** [*AppLoadPercentAction*](../interfaces/src_common_reducers_app_actions.apploadpercentaction.md)

Defined in: [packages/client-core/src/common/reducers/app/actions.ts:41](https://github.com/xr3ngine/xr3ngine/blob/7e8e151f1/packages/client-core/src/common/reducers/app/actions.ts#L41)

___

### setAppLoaded

▸ `Const`**setAppLoaded**(`loaded`: *boolean*): [*AppLoadedAction*](../interfaces/src_common_reducers_app_actions.apploadedaction.md)

#### Parameters:

| Name | Type |
| :------ | :------ |
| `loaded` | *boolean* |

**Returns:** [*AppLoadedAction*](../interfaces/src_common_reducers_app_actions.apploadedaction.md)

Defined in: [packages/client-core/src/common/reducers/app/actions.ts:39](https://github.com/xr3ngine/xr3ngine/blob/7e8e151f1/packages/client-core/src/common/reducers/app/actions.ts#L39)

___

### setAppOnBoardingStep

▸ `Const`**setAppOnBoardingStep**(`onBoardingStep`: *number*): [*AppOnBoardingStepAction*](../interfaces/src_common_reducers_app_actions.apponboardingstepaction.md)

#### Parameters:

| Name | Type |
| :------ | :------ |
| `onBoardingStep` | *number* |

**Returns:** [*AppOnBoardingStepAction*](../interfaces/src_common_reducers_app_actions.apponboardingstepaction.md)

Defined in: [packages/client-core/src/common/reducers/app/actions.ts:43](https://github.com/xr3ngine/xr3ngine/blob/7e8e151f1/packages/client-core/src/common/reducers/app/actions.ts#L43)

___

### setAppSpecificOnBoardingStep

▸ `Const`**setAppSpecificOnBoardingStep**(`onBoardingStep`: *number*, `isTutorial`: *boolean*): [*AppOnBoardingStepAction*](../interfaces/src_common_reducers_app_actions.apponboardingstepaction.md)

#### Parameters:

| Name | Type |
| :------ | :------ |
| `onBoardingStep` | *number* |
| `isTutorial` | *boolean* |

**Returns:** [*AppOnBoardingStepAction*](../interfaces/src_common_reducers_app_actions.apponboardingstepaction.md)

Defined in: [packages/client-core/src/common/reducers/app/actions.ts:45](https://github.com/xr3ngine/xr3ngine/blob/7e8e151f1/packages/client-core/src/common/reducers/app/actions.ts#L45)

___

### setUserHasInteracted

▸ `Const`**setUserHasInteracted**(): *object*

**Returns:** *object*

| Name | Type |
| :------ | :------ |
| `type` | *string* |

Defined in: [packages/client-core/src/common/reducers/app/actions.ts:58](https://github.com/xr3ngine/xr3ngine/blob/7e8e151f1/packages/client-core/src/common/reducers/app/actions.ts#L58)

___

### setViewportSize

▸ `Const`**setViewportSize**(`width`: *number*, `height`: *number*): *object*

#### Parameters:

| Name | Type |
| :------ | :------ |
| `width` | *number* |
| `height` | *number* |

**Returns:** *object*

| Name | Type |
| :------ | :------ |
| `height` | *number* |
| `type` | *string* |
| `width` | *number* |

Defined in: [packages/client-core/src/common/reducers/app/actions.ts:47](https://github.com/xr3ngine/xr3ngine/blob/7e8e151f1/packages/client-core/src/common/reducers/app/actions.ts#L47)
