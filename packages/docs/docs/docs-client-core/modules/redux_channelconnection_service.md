---
id: "redux_channelconnection_service"
title: "Module: redux/channelConnection/service"
sidebar_label: "redux/channelConnection/service"
custom_edit_url: null
hide_title: true
---

# Module: redux/channelConnection/service

## Functions

### connectToChannelServer

▸ **connectToChannelServer**(`channelId`: *string*, `isHarmonyPage?`: *boolean*): *function*

#### Parameters:

Name | Type |
:------ | :------ |
`channelId` | *string* |
`isHarmonyPage?` | *boolean* |

**Returns:** (`dispatch`: *Dispatch*<AnyAction\>, `getState`: *any*) => *Promise*<any\>

Defined in: [packages/client-core/redux/channelConnection/service.ts:45](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/channelConnection/service.ts#L45)

___

### provisionChannelServer

▸ **provisionChannelServer**(`instanceId?`: *string*, `channelId?`: *string*): *function*

#### Parameters:

Name | Type |
:------ | :------ |
`instanceId?` | *string* |
`channelId?` | *string* |

**Returns:** (`dispatch`: *Dispatch*<AnyAction\>, `getState`: *any*) => *Promise*<any\>

Defined in: [packages/client-core/redux/channelConnection/service.ts:19](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/channelConnection/service.ts#L19)

___

### resetChannelServer

▸ **resetChannelServer**(): *function*

**Returns:** (`dispatch`: *Dispatch*<AnyAction\>) => *Promise*<any\>

Defined in: [packages/client-core/redux/channelConnection/service.ts:86](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/channelConnection/service.ts#L86)
