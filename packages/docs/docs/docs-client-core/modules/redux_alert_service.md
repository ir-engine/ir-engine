---
id: "redux_alert_service"
title: "Module: redux/alert/service"
sidebar_label: "redux/alert/service"
custom_edit_url: null
hide_title: true
---

# Module: redux/alert/service

## Functions

### alertCancel

▸ **alertCancel**(): *function*

**Returns:** (`dispatch`: *Dispatch*<AnyAction\>) => *any*

Defined in: [packages/client-core/redux/alert/service.ts:26](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/alert/service.ts#L26)

___

### alertError

▸ **alertError**(`message`: *string*): *function*

#### Parameters:

Name | Type |
:------ | :------ |
`message` | *string* |

**Returns:** (`dispatch`: *Dispatch*<AnyAction\>) => *any*

Defined in: [packages/client-core/redux/alert/service.ts:21](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/alert/service.ts#L21)

___

### alertSuccess

▸ **alertSuccess**(`message`: *string*): *function*

#### Parameters:

Name | Type |
:------ | :------ |
`message` | *string* |

**Returns:** (`dispatch`: *Dispatch*<AnyAction\>) => *any*

Defined in: [packages/client-core/redux/alert/service.ts:11](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/alert/service.ts#L11)

___

### alertWarning

▸ **alertWarning**(`message`: *string*): *function*

#### Parameters:

Name | Type |
:------ | :------ |
`message` | *string* |

**Returns:** (`dispatch`: *Dispatch*<AnyAction\>) => *any*

Defined in: [packages/client-core/redux/alert/service.ts:16](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/alert/service.ts#L16)

___

### dispatchAlertCancel

▸ **dispatchAlertCancel**(`dispatch`: Dispatch): [*AlertAction*](../interfaces/redux_alert_actions.alertaction.md)

#### Parameters:

Name | Type |
:------ | :------ |
`dispatch` | Dispatch |

**Returns:** [*AlertAction*](../interfaces/redux_alert_actions.alertaction.md)

Defined in: [packages/client-core/redux/alert/service.ts:57](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/alert/service.ts#L57)

___

### dispatchAlertError

▸ **dispatchAlertError**(`dispatch`: Dispatch, `message`: *string*): [*AlertAction*](../interfaces/redux_alert_actions.alertaction.md)

#### Parameters:

Name | Type |
:------ | :------ |
`dispatch` | Dispatch |
`message` | *string* |

**Returns:** [*AlertAction*](../interfaces/redux_alert_actions.alertaction.md)

Defined in: [packages/client-core/redux/alert/service.ts:53](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/alert/service.ts#L53)

___

### dispatchAlertSuccess

▸ **dispatchAlertSuccess**(`dispatch`: Dispatch, `message`: *string*): [*AlertAction*](../interfaces/redux_alert_actions.alertaction.md)

#### Parameters:

Name | Type |
:------ | :------ |
`dispatch` | Dispatch |
`message` | *string* |

**Returns:** [*AlertAction*](../interfaces/redux_alert_actions.alertaction.md)

Defined in: [packages/client-core/redux/alert/service.ts:45](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/alert/service.ts#L45)

___

### dispatchAlertWarning

▸ **dispatchAlertWarning**(`dispatch`: Dispatch, `message`: *string*): [*AlertAction*](../interfaces/redux_alert_actions.alertaction.md)

#### Parameters:

Name | Type |
:------ | :------ |
`dispatch` | Dispatch |
`message` | *string* |

**Returns:** [*AlertAction*](../interfaces/redux_alert_actions.alertaction.md)

Defined in: [packages/client-core/redux/alert/service.ts:49](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/alert/service.ts#L49)
