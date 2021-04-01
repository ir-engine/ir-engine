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

Defined in: [packages/client-core/redux/channelConnection/service.ts:43](https://github.com/xr3ngine/xr3ngine/blob/66a84a950/packages/client-core/redux/channelConnection/service.ts#L43)

___

### provisionChannelServer

▸ **provisionChannelServer**(`instanceId?`: *string*, `channelId?`: *string*): *function*

#### Parameters:

Name | Type |
:------ | :------ |
`instanceId?` | *string* |
`channelId?` | *string* |

**Returns:** (`dispatch`: *Dispatch*<AnyAction\>, `getState`: *any*) => *Promise*<any\>

Defined in: [packages/client-core/redux/channelConnection/service.ts:17](https://github.com/xr3ngine/xr3ngine/blob/66a84a950/packages/client-core/redux/channelConnection/service.ts#L17)

___

### resetChannelServer

▸ **resetChannelServer**(): *function*

**Returns:** (`dispatch`: *Dispatch*<AnyAction\>) => *Promise*<any\>

Defined in: [packages/client-core/redux/channelConnection/service.ts:85](https://github.com/xr3ngine/xr3ngine/blob/66a84a950/packages/client-core/redux/channelConnection/service.ts#L85)
