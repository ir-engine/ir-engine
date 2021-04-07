---
id: "redux_alert_actions"
title: "Module: redux/alert/actions"
sidebar_label: "redux/alert/actions"
custom_edit_url: null
hide_title: true
---

# Module: redux/alert/actions

## Table of contents

### Interfaces

- [AlertAction](../interfaces/redux_alert_actions.alertaction.md)
- [AlertState](../interfaces/redux_alert_actions.alertstate.md)

## Type aliases

### AlertType

Ƭ **AlertType**: *error* \| *success* \| *warning* \| *none*

Defined in: [packages/client-core/redux/alert/actions.ts:5](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/alert/actions.ts#L5)

## Functions

### hideAlert

▸ **hideAlert**(): [*AlertAction*](../interfaces/redux_alert_actions.alertaction.md)

**Returns:** [*AlertAction*](../interfaces/redux_alert_actions.alertaction.md)

Defined in: [packages/client-core/redux/alert/actions.ts:22](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/alert/actions.ts#L22)

___

### showAlert

▸ **showAlert**(`type`: [*AlertType*](redux_alert_actions.md#alerttype), `message`: *string*): [*AlertAction*](../interfaces/redux_alert_actions.alertaction.md)

#### Parameters:

Name | Type |
:------ | :------ |
`type` | [*AlertType*](redux_alert_actions.md#alerttype) |
`message` | *string* |

**Returns:** [*AlertAction*](../interfaces/redux_alert_actions.alertaction.md)

Defined in: [packages/client-core/redux/alert/actions.ts:15](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/alert/actions.ts#L15)
