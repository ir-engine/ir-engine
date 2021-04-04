---
id: "redux_location_actions"
title: "Module: redux/location/actions"
sidebar_label: "redux/location/actions"
custom_edit_url: null
hide_title: true
---

# Module: redux/location/actions

## Table of contents

### Interfaces

- [FetchingCurrentLocationAction](../interfaces/redux_location_actions.fetchingcurrentlocationaction.md)
- [LocationBanCreatedAction](../interfaces/redux_location_actions.locationbancreatedaction.md)
- [LocationCreatedAction](../interfaces/redux_location_actions.locationcreatedaction.md)
- [LocationNotFoundAction](../interfaces/redux_location_actions.locationnotfoundaction.md)
- [LocationPatchedAction](../interfaces/redux_location_actions.locationpatchedaction.md)
- [LocationRemovedAction](../interfaces/redux_location_actions.locationremovedaction.md)
- [LocationRetrievedAction](../interfaces/redux_location_actions.locationretrievedaction.md)
- [LocationsRetrievedAction](../interfaces/redux_location_actions.locationsretrievedaction.md)

## Type aliases

### LocationsAction

Ƭ **LocationsAction**: [*LocationsRetrievedAction*](../interfaces/redux_location_actions.locationsretrievedaction.md) \| [*LocationRetrievedAction*](../interfaces/redux_location_actions.locationretrievedaction.md) \| [*LocationBanCreatedAction*](../interfaces/redux_location_actions.locationbancreatedaction.md) \| [*FetchingCurrentLocationAction*](../interfaces/redux_location_actions.fetchingcurrentlocationaction.md) \| [*LocationNotFoundAction*](../interfaces/redux_location_actions.locationnotfoundaction.md)

Defined in: [packages/client-core/redux/location/actions.ts:49](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/location/actions.ts#L49)

## Functions

### fetchingCurrentLocation

▸ **fetchingCurrentLocation**(): [*FetchingCurrentLocationAction*](../interfaces/redux_location_actions.fetchingcurrentlocationaction.md)

**Returns:** [*FetchingCurrentLocationAction*](../interfaces/redux_location_actions.fetchingcurrentlocationaction.md)

Defined in: [packages/client-core/redux/location/actions.ts:98](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/location/actions.ts#L98)

___

### locationBanCreated

▸ **locationBanCreated**(): [*LocationBanCreatedAction*](../interfaces/redux_location_actions.locationbancreatedaction.md)

**Returns:** [*LocationBanCreatedAction*](../interfaces/redux_location_actions.locationbancreatedaction.md)

Defined in: [packages/client-core/redux/location/actions.ts:92](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/location/actions.ts#L92)

___

### locationCreated

▸ **locationCreated**(`location`: Location): [*LocationCreatedAction*](../interfaces/redux_location_actions.locationcreatedaction.md)

#### Parameters:

Name | Type |
:------ | :------ |
`location` | Location |

**Returns:** [*LocationCreatedAction*](../interfaces/redux_location_actions.locationcreatedaction.md)

Defined in: [packages/client-core/redux/location/actions.ts:70](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/location/actions.ts#L70)

___

### locationNotFound

▸ **locationNotFound**(): [*LocationNotFoundAction*](../interfaces/redux_location_actions.locationnotfoundaction.md)

**Returns:** [*LocationNotFoundAction*](../interfaces/redux_location_actions.locationnotfoundaction.md)

Defined in: [packages/client-core/redux/location/actions.ts:104](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/location/actions.ts#L104)

___

### locationPatched

▸ **locationPatched**(`location`: Location): [*LocationCreatedAction*](../interfaces/redux_location_actions.locationcreatedaction.md)

#### Parameters:

Name | Type |
:------ | :------ |
`location` | Location |

**Returns:** [*LocationCreatedAction*](../interfaces/redux_location_actions.locationcreatedaction.md)

Defined in: [packages/client-core/redux/location/actions.ts:78](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/location/actions.ts#L78)

___

### locationRemoved

▸ **locationRemoved**(`location`: Location): [*LocationCreatedAction*](../interfaces/redux_location_actions.locationcreatedaction.md)

#### Parameters:

Name | Type |
:------ | :------ |
`location` | Location |

**Returns:** [*LocationCreatedAction*](../interfaces/redux_location_actions.locationcreatedaction.md)

Defined in: [packages/client-core/redux/location/actions.ts:85](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/location/actions.ts#L85)

___

### locationRetrieved

▸ **locationRetrieved**(`location`: *any*): [*LocationRetrievedAction*](../interfaces/redux_location_actions.locationretrievedaction.md)

#### Parameters:

Name | Type |
:------ | :------ |
`location` | *any* |

**Returns:** [*LocationRetrievedAction*](../interfaces/redux_location_actions.locationretrievedaction.md)

Defined in: [packages/client-core/redux/location/actions.ts:63](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/location/actions.ts#L63)

___

### locationsRetrieved

▸ **locationsRetrieved**(`locations`: *any*): [*LocationsRetrievedAction*](../interfaces/redux_location_actions.locationsretrievedaction.md)

#### Parameters:

Name | Type |
:------ | :------ |
`locations` | *any* |

**Returns:** [*LocationsRetrievedAction*](../interfaces/redux_location_actions.locationsretrievedaction.md)

Defined in: [packages/client-core/redux/location/actions.ts:56](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/location/actions.ts#L56)
