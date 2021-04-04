---
id: "redux_channelconnection_reducers"
title: "Module: redux/channelConnection/reducers"
sidebar_label: "redux/channelConnection/reducers"
custom_edit_url: null
hide_title: true
---

# Module: redux/channelConnection/reducers

## Variables

### initialState

• `Const` **initialState**: *object*

#### Type declaration:

Name | Type |
:------ | :------ |
`channelId` | *string* |
`connected` | *boolean* |
`instance` | *object* |
`instance.ipAddress` | *string* |
`instance.port` | *string* |
`instanceProvisioned` | *boolean* |
`instanceProvisioning` | *boolean* |
`instanceServerConnecting` | *boolean* |
`locationId` | *string* |
`readyToConnect` | *boolean* |
`sceneId` | *string* |
`socket` | *object* |
`updateNeeded` | *boolean* |

Defined in: [packages/client-core/redux/channelConnection/reducers.ts:17](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/channelConnection/reducers.ts#L17)

## Functions

### default

▸ `Const`**default**(`state?`: *any*, `action`: [*ChannelServerAction*](redux_channelconnection_actions.md#channelserveraction)): *any*

#### Parameters:

Name | Type |
:------ | :------ |
`state` | *any* |
`action` | [*ChannelServerAction*](redux_channelconnection_actions.md#channelserveraction) |

**Returns:** *any*

Defined in: [packages/client-core/redux/channelConnection/reducers.ts:38](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/channelConnection/reducers.ts#L38)
