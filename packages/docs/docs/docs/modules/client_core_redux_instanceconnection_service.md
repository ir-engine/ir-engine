---
id: "client_core_redux_instanceconnection_service"
title: "Module: client-core/redux/instanceConnection/service"
sidebar_label: "client-core/redux/instanceConnection/service"
custom_edit_url: null
hide_title: true
---

# Module: client-core/redux/instanceConnection/service

## Functions

### connectToInstanceServer

▸ **connectToInstanceServer**(`channelType`: *string*, `channelId?`: *string*): *function*

#### Parameters:

Name | Type |
:------ | :------ |
`channelType` | *string* |
`channelId?` | *string* |

**Returns:** (`dispatch`: *Dispatch*<AnyAction\>, `getState`: *any*) => *Promise*<any\>

Defined in: [packages/client-core/redux/instanceConnection/service.ts:44](https://github.com/xr3ngine/xr3ngine/blob/9d253dc38/packages/client-core/redux/instanceConnection/service.ts#L44)

___

### provisionInstanceServer

▸ **provisionInstanceServer**(`locationId?`: *string*, `instanceId?`: *string*, `sceneId?`: *string*): *function*

#### Parameters:

Name | Type |
:------ | :------ |
`locationId?` | *string* |
`instanceId?` | *string* |
`sceneId?` | *string* |

**Returns:** (`dispatch`: *Dispatch*<AnyAction\>, `getState`: *any*) => *Promise*<any\>

Defined in: [packages/client-core/redux/instanceConnection/service.ts:16](https://github.com/xr3ngine/xr3ngine/blob/9d253dc38/packages/client-core/redux/instanceConnection/service.ts#L16)

___

### resetInstanceServer

▸ **resetInstanceServer**(): *function*

**Returns:** (`dispatch`: *Dispatch*<AnyAction\>) => *Promise*<any\>

Defined in: [packages/client-core/redux/instanceConnection/service.ts:85](https://github.com/xr3ngine/xr3ngine/blob/9d253dc38/packages/client-core/redux/instanceConnection/service.ts#L85)
