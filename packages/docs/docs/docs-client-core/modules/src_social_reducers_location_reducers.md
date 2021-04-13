---
id: "src_social_reducers_location_reducers"
title: "Module: src/social/reducers/location/reducers"
sidebar_label: "src/social/reducers/location/reducers"
custom_edit_url: null
hide_title: true
---

# Module: src/social/reducers/location/reducers

## Variables

### initialLocationState

• `Const` **initialLocationState**: *object*

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

Defined in: [packages/client-core/src/social/reducers/location/reducers.ts:16](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/client-core/src/social/reducers/location/reducers.ts#L16)

## Functions

### default

▸ `Const`**default**(`state?`: *any*, `action`: [*LocationsAction*](src_social_reducers_location_actions.md#locationsaction)): *any*

#### Parameters:

Name | Type |
:------ | :------ |
`state` | *any* |
`action` | [*LocationsAction*](src_social_reducers_location_actions.md#locationsaction) |

**Returns:** *any*

Defined in: [packages/client-core/src/social/reducers/location/reducers.ts:34](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/client-core/src/social/reducers/location/reducers.ts#L34)
