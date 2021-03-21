---
id: "client_core_redux_location_actions"
title: "Module: client-core/redux/location/actions"
sidebar_label: "client-core/redux/location/actions"
custom_edit_url: null
hide_title: true
---

# Module: client-core/redux/location/actions

## Table of contents

### Interfaces

- [FetchingCurrentLocationAction](../interfaces/client_core_redux_location_actions.fetchingcurrentlocationaction.md)
- [LocationBanCreatedAction](../interfaces/client_core_redux_location_actions.locationbancreatedaction.md)
- [LocationCreatedAction](../interfaces/client_core_redux_location_actions.locationcreatedaction.md)
- [LocationNotFoundAction](../interfaces/client_core_redux_location_actions.locationnotfoundaction.md)
- [LocationPatchedAction](../interfaces/client_core_redux_location_actions.locationpatchedaction.md)
- [LocationRemovedAction](../interfaces/client_core_redux_location_actions.locationremovedaction.md)
- [LocationRetrievedAction](../interfaces/client_core_redux_location_actions.locationretrievedaction.md)
- [LocationsRetrievedAction](../interfaces/client_core_redux_location_actions.locationsretrievedaction.md)

## Type aliases

### LocationsAction

Ƭ **LocationsAction**: [*LocationsRetrievedAction*](../interfaces/client_core_redux_location_actions.locationsretrievedaction.md) \| [*LocationRetrievedAction*](../interfaces/client_core_redux_location_actions.locationretrievedaction.md) \| [*LocationBanCreatedAction*](../interfaces/client_core_redux_location_actions.locationbancreatedaction.md) \| [*FetchingCurrentLocationAction*](../interfaces/client_core_redux_location_actions.fetchingcurrentlocationaction.md) \| [*LocationNotFoundAction*](../interfaces/client_core_redux_location_actions.locationnotfoundaction.md)

Defined in: [packages/client-core/redux/location/actions.ts:49](https://github.com/xr3ngine/xr3ngine/blob/5a0f83ed8/packages/client-core/redux/location/actions.ts#L49)

## Functions

### fetchingCurrentLocation

▸ **fetchingCurrentLocation**(): [*FetchingCurrentLocationAction*](../interfaces/client_core_redux_location_actions.fetchingcurrentlocationaction.md)

**Returns:** [*FetchingCurrentLocationAction*](../interfaces/client_core_redux_location_actions.fetchingcurrentlocationaction.md)

Defined in: [packages/client-core/redux/location/actions.ts:98](https://github.com/xr3ngine/xr3ngine/blob/5a0f83ed8/packages/client-core/redux/location/actions.ts#L98)

___

### locationBanCreated

▸ **locationBanCreated**(): [*LocationBanCreatedAction*](../interfaces/client_core_redux_location_actions.locationbancreatedaction.md)

**Returns:** [*LocationBanCreatedAction*](../interfaces/client_core_redux_location_actions.locationbancreatedaction.md)

Defined in: [packages/client-core/redux/location/actions.ts:92](https://github.com/xr3ngine/xr3ngine/blob/5a0f83ed8/packages/client-core/redux/location/actions.ts#L92)

___

### locationCreated

▸ **locationCreated**(`location`: Location): [*LocationCreatedAction*](../interfaces/client_core_redux_location_actions.locationcreatedaction.md)

#### Parameters:

Name | Type |
:------ | :------ |
`location` | Location |

**Returns:** [*LocationCreatedAction*](../interfaces/client_core_redux_location_actions.locationcreatedaction.md)

Defined in: [packages/client-core/redux/location/actions.ts:70](https://github.com/xr3ngine/xr3ngine/blob/5a0f83ed8/packages/client-core/redux/location/actions.ts#L70)

___

### locationNotFound

▸ **locationNotFound**(): [*LocationNotFoundAction*](../interfaces/client_core_redux_location_actions.locationnotfoundaction.md)

**Returns:** [*LocationNotFoundAction*](../interfaces/client_core_redux_location_actions.locationnotfoundaction.md)

Defined in: [packages/client-core/redux/location/actions.ts:104](https://github.com/xr3ngine/xr3ngine/blob/5a0f83ed8/packages/client-core/redux/location/actions.ts#L104)

___

### locationPatched

▸ **locationPatched**(`location`: Location): [*LocationCreatedAction*](../interfaces/client_core_redux_location_actions.locationcreatedaction.md)

#### Parameters:

Name | Type |
:------ | :------ |
`location` | Location |

**Returns:** [*LocationCreatedAction*](../interfaces/client_core_redux_location_actions.locationcreatedaction.md)

Defined in: [packages/client-core/redux/location/actions.ts:78](https://github.com/xr3ngine/xr3ngine/blob/5a0f83ed8/packages/client-core/redux/location/actions.ts#L78)

___

### locationRemoved

▸ **locationRemoved**(`location`: Location): [*LocationCreatedAction*](../interfaces/client_core_redux_location_actions.locationcreatedaction.md)

#### Parameters:

Name | Type |
:------ | :------ |
`location` | Location |

**Returns:** [*LocationCreatedAction*](../interfaces/client_core_redux_location_actions.locationcreatedaction.md)

Defined in: [packages/client-core/redux/location/actions.ts:85](https://github.com/xr3ngine/xr3ngine/blob/5a0f83ed8/packages/client-core/redux/location/actions.ts#L85)

___

### locationRetrieved

▸ **locationRetrieved**(`location`: *any*): [*LocationRetrievedAction*](../interfaces/client_core_redux_location_actions.locationretrievedaction.md)

#### Parameters:

Name | Type |
:------ | :------ |
`location` | *any* |

**Returns:** [*LocationRetrievedAction*](../interfaces/client_core_redux_location_actions.locationretrievedaction.md)

Defined in: [packages/client-core/redux/location/actions.ts:63](https://github.com/xr3ngine/xr3ngine/blob/5a0f83ed8/packages/client-core/redux/location/actions.ts#L63)

___

### locationsRetrieved

▸ **locationsRetrieved**(`locations`: *any*): [*LocationsRetrievedAction*](../interfaces/client_core_redux_location_actions.locationsretrievedaction.md)

#### Parameters:

Name | Type |
:------ | :------ |
`locations` | *any* |

**Returns:** [*LocationsRetrievedAction*](../interfaces/client_core_redux_location_actions.locationsretrievedaction.md)

Defined in: [packages/client-core/redux/location/actions.ts:56](https://github.com/xr3ngine/xr3ngine/blob/5a0f83ed8/packages/client-core/redux/location/actions.ts#L56)
