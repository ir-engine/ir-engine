---
id: "client_core_redux_alert_actions"
title: "Module: client-core/redux/alert/actions"
sidebar_label: "client-core/redux/alert/actions"
custom_edit_url: null
hide_title: true
---

# Module: client-core/redux/alert/actions

## Table of contents

### Interfaces

- [AlertAction](../interfaces/client_core_redux_alert_actions.alertaction.md)
- [AlertState](../interfaces/client_core_redux_alert_actions.alertstate.md)

## Type aliases

### AlertType

Ƭ **AlertType**: *error* \| *success* \| *warning* \| *none*

Defined in: [packages/client-core/redux/alert/actions.ts:5](https://github.com/xr3ngine/xr3ngine/blob/5c3dcaef1/packages/client-core/redux/alert/actions.ts#L5)

## Functions

### hideAlert

▸ **hideAlert**(): [*AlertAction*](../interfaces/client_core_redux_alert_actions.alertaction.md)

**Returns:** [*AlertAction*](../interfaces/client_core_redux_alert_actions.alertaction.md)

Defined in: [packages/client-core/redux/alert/actions.ts:22](https://github.com/xr3ngine/xr3ngine/blob/5c3dcaef1/packages/client-core/redux/alert/actions.ts#L22)

___

### showAlert

▸ **showAlert**(`type`: [*AlertType*](client_core_redux_alert_actions.md#alerttype), `message`: *string*): [*AlertAction*](../interfaces/client_core_redux_alert_actions.alertaction.md)

#### Parameters:

Name | Type |
:------ | :------ |
`type` | [*AlertType*](client_core_redux_alert_actions.md#alerttype) |
`message` | *string* |

**Returns:** [*AlertAction*](../interfaces/client_core_redux_alert_actions.alertaction.md)

Defined in: [packages/client-core/redux/alert/actions.ts:15](https://github.com/xr3ngine/xr3ngine/blob/5c3dcaef1/packages/client-core/redux/alert/actions.ts#L15)
