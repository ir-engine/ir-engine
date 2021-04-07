---
id: "redux_location_service"
title: "Module: redux/location/service"
sidebar_label: "redux/location/service"
custom_edit_url: null
hide_title: true
---

# Module: redux/location/service

## Functions

### banUserFromLocation

▸ **banUserFromLocation**(`userId`: *string*, `locationId`: *string*): *function*

#### Parameters:

Name | Type |
:------ | :------ |
`userId` | *string* |
`locationId` | *string* |

**Returns:** (`dispatch`: *Dispatch*<AnyAction\>) => *Promise*<any\>

Defined in: [packages/client-core/redux/location/service.ts:61](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/location/service.ts#L61)

___

### getLocation

▸ **getLocation**(`locationId`: *string*): *function*

#### Parameters:

Name | Type |
:------ | :------ |
`locationId` | *string* |

**Returns:** (`dispatch`: *Dispatch*<AnyAction\>) => *Promise*<any\>

Defined in: [packages/client-core/redux/location/service.ts:30](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/location/service.ts#L30)

___

### getLocationByName

▸ **getLocationByName**(`locationName`: *string*): *function*

#### Parameters:

Name | Type |
:------ | :------ |
`locationName` | *string* |

**Returns:** (`dispatch`: *Dispatch*<AnyAction\>) => *Promise*<any\>

Defined in: [packages/client-core/redux/location/service.ts:43](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/location/service.ts#L43)

___

### getLocations

▸ **getLocations**(`skip?`: *number*, `limit?`: *number*): *function*

#### Parameters:

Name | Type |
:------ | :------ |
`skip?` | *number* |
`limit?` | *number* |

**Returns:** (`dispatch`: *Dispatch*<AnyAction\>, `getState`: *any*) => *Promise*<any\>

Defined in: [packages/client-core/redux/location/service.ts:12](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/location/service.ts#L12)
