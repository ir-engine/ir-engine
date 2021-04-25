---
id: "src_common_reducers_alert_actions"
title: "Module: src/common/reducers/alert/actions"
sidebar_label: "src/common/reducers/alert/actions"
custom_edit_url: null
hide_title: true
---

# Module: src/common/reducers/alert/actions

## Table of contents

### Interfaces

- [AlertAction](../interfaces/src_common_reducers_alert_actions.alertaction.md)
- [AlertState](../interfaces/src_common_reducers_alert_actions.alertstate.md)

## Type aliases

### AlertType

Ƭ **AlertType**: ``"error"`` \| ``"success"`` \| ``"warning"`` \| ``"none"``

Defined in: [packages/client-core/src/common/reducers/alert/actions.ts:3](https://github.com/xr3ngine/xr3ngine/blob/2d83606b6/packages/client-core/src/common/reducers/alert/actions.ts#L3)

## Functions

### hideAlert

▸ **hideAlert**(): [*AlertAction*](../interfaces/src_common_reducers_alert_actions.alertaction.md)

**Returns:** [*AlertAction*](../interfaces/src_common_reducers_alert_actions.alertaction.md)

Defined in: [packages/client-core/src/common/reducers/alert/actions.ts:20](https://github.com/xr3ngine/xr3ngine/blob/2d83606b6/packages/client-core/src/common/reducers/alert/actions.ts#L20)

___

### showAlert

▸ **showAlert**(`type`: [*AlertType*](src_common_reducers_alert_actions.md#alerttype), `message`: *string*): [*AlertAction*](../interfaces/src_common_reducers_alert_actions.alertaction.md)

#### Parameters:

| Name | Type |
| :------ | :------ |
| `type` | [*AlertType*](src_common_reducers_alert_actions.md#alerttype) |
| `message` | *string* |

**Returns:** [*AlertAction*](../interfaces/src_common_reducers_alert_actions.alertaction.md)

Defined in: [packages/client-core/src/common/reducers/alert/actions.ts:13](https://github.com/xr3ngine/xr3ngine/blob/2d83606b6/packages/client-core/src/common/reducers/alert/actions.ts#L13)
