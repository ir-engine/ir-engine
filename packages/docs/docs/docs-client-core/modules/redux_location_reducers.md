---
id: "redux_location_reducers"
title: "Module: redux/location/reducers"
sidebar_label: "redux/location/reducers"
custom_edit_url: null
hide_title: true
---

# Module: redux/location/reducers

## Variables

### initialState

• `Const` **initialState**: *object*

#### Type declaration:

Name | Type |
:------ | :------ |
`currentLocation` | *object* |
`currentLocation.bannedUsers` | *any*[] |
`currentLocation.location` | *object* |
`currentLocationUpdateNeeded` | *boolean* |
`fetchingCurrentLocation` | *boolean* |
`locations` | *object* |
`locations.limit` | *number* |
`locations.locations` | *any*[] |
`locations.skip` | *number* |
`locations.total` | *number* |
`updateNeeded` | *boolean* |

Defined in: [packages/client-core/redux/location/reducers.ts:16](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/location/reducers.ts#L16)

## Functions

### default

▸ `Const`**default**(`state?`: *any*, `action`: [*LocationsAction*](redux_location_actions.md#locationsaction)): *any*

#### Parameters:

Name | Type |
:------ | :------ |
`state` | *any* |
`action` | [*LocationsAction*](redux_location_actions.md#locationsaction) |

**Returns:** *any*

Defined in: [packages/client-core/redux/location/reducers.ts:34](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/location/reducers.ts#L34)
