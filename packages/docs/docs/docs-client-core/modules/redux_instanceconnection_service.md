---
id: "redux_instanceconnection_service"
title: "Module: redux/instanceConnection/service"
sidebar_label: "redux/instanceConnection/service"
custom_edit_url: null
hide_title: true
---

# Module: redux/instanceConnection/service

## Functions

### connectToInstanceServer

▸ **connectToInstanceServer**(`channelType`: *string*, `channelId?`: *string*): *function*

#### Parameters:

Name | Type |
:------ | :------ |
`channelType` | *string* |
`channelId?` | *string* |

**Returns:** (`dispatch`: *Dispatch*<AnyAction\>, `getState`: *any*) => *Promise*<any\>

Defined in: [packages/client-core/redux/instanceConnection/service.ts:47](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/instanceConnection/service.ts#L47)

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

Defined in: [packages/client-core/redux/instanceConnection/service.ts:19](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/instanceConnection/service.ts#L19)

___

### resetInstanceServer

▸ **resetInstanceServer**(): *function*

**Returns:** (`dispatch`: *Dispatch*<AnyAction\>) => *Promise*<any\>

Defined in: [packages/client-core/redux/instanceConnection/service.ts:89](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/instanceConnection/service.ts#L89)
