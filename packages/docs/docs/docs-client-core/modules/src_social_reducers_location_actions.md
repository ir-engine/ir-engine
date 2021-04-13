---
id: "src_social_reducers_location_actions"
title: "Module: src/social/reducers/location/actions"
sidebar_label: "src/social/reducers/location/actions"
custom_edit_url: null
hide_title: true
---

# Module: src/social/reducers/location/actions

## Table of contents

### Interfaces

- [FetchingCurrentLocationAction](../interfaces/src_social_reducers_location_actions.fetchingcurrentlocationaction.md)
- [LocationBanCreatedAction](../interfaces/src_social_reducers_location_actions.locationbancreatedaction.md)
- [LocationCreatedAction](../interfaces/src_social_reducers_location_actions.locationcreatedaction.md)
- [LocationNotFoundAction](../interfaces/src_social_reducers_location_actions.locationnotfoundaction.md)
- [LocationPatchedAction](../interfaces/src_social_reducers_location_actions.locationpatchedaction.md)
- [LocationRemovedAction](../interfaces/src_social_reducers_location_actions.locationremovedaction.md)
- [LocationRetrievedAction](../interfaces/src_social_reducers_location_actions.locationretrievedaction.md)
- [LocationsRetrievedAction](../interfaces/src_social_reducers_location_actions.locationsretrievedaction.md)

## Type aliases

### LocationsAction

Ƭ **LocationsAction**: [*LocationsRetrievedAction*](../interfaces/src_social_reducers_location_actions.locationsretrievedaction.md) \| [*LocationRetrievedAction*](../interfaces/src_social_reducers_location_actions.locationretrievedaction.md) \| [*LocationBanCreatedAction*](../interfaces/src_social_reducers_location_actions.locationbancreatedaction.md) \| [*FetchingCurrentLocationAction*](../interfaces/src_social_reducers_location_actions.fetchingcurrentlocationaction.md) \| [*LocationNotFoundAction*](../interfaces/src_social_reducers_location_actions.locationnotfoundaction.md)

Defined in: [packages/client-core/src/social/reducers/location/actions.ts:48](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/client-core/src/social/reducers/location/actions.ts#L48)

## Functions

### fetchingCurrentLocation

▸ **fetchingCurrentLocation**(): [*FetchingCurrentLocationAction*](../interfaces/src_social_reducers_location_actions.fetchingcurrentlocationaction.md)

**Returns:** [*FetchingCurrentLocationAction*](../interfaces/src_social_reducers_location_actions.fetchingcurrentlocationaction.md)

Defined in: [packages/client-core/src/social/reducers/location/actions.ts:97](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/client-core/src/social/reducers/location/actions.ts#L97)

___

### locationBanCreated

▸ **locationBanCreated**(): [*LocationBanCreatedAction*](../interfaces/src_social_reducers_location_actions.locationbancreatedaction.md)

**Returns:** [*LocationBanCreatedAction*](../interfaces/src_social_reducers_location_actions.locationbancreatedaction.md)

Defined in: [packages/client-core/src/social/reducers/location/actions.ts:91](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/client-core/src/social/reducers/location/actions.ts#L91)

___

### locationCreated

▸ **locationCreated**(`location`: Location): [*LocationCreatedAction*](../interfaces/src_social_reducers_location_actions.locationcreatedaction.md)

#### Parameters:

Name | Type |
:------ | :------ |
`location` | Location |

**Returns:** [*LocationCreatedAction*](../interfaces/src_social_reducers_location_actions.locationcreatedaction.md)

Defined in: [packages/client-core/src/social/reducers/location/actions.ts:69](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/client-core/src/social/reducers/location/actions.ts#L69)

___

### locationNotFound

▸ **locationNotFound**(): [*LocationNotFoundAction*](../interfaces/src_social_reducers_location_actions.locationnotfoundaction.md)

**Returns:** [*LocationNotFoundAction*](../interfaces/src_social_reducers_location_actions.locationnotfoundaction.md)

Defined in: [packages/client-core/src/social/reducers/location/actions.ts:103](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/client-core/src/social/reducers/location/actions.ts#L103)

___

### locationPatched

▸ **locationPatched**(`location`: Location): [*LocationCreatedAction*](../interfaces/src_social_reducers_location_actions.locationcreatedaction.md)

#### Parameters:

Name | Type |
:------ | :------ |
`location` | Location |

**Returns:** [*LocationCreatedAction*](../interfaces/src_social_reducers_location_actions.locationcreatedaction.md)

Defined in: [packages/client-core/src/social/reducers/location/actions.ts:77](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/client-core/src/social/reducers/location/actions.ts#L77)

___

### locationRemoved

▸ **locationRemoved**(`location`: Location): [*LocationCreatedAction*](../interfaces/src_social_reducers_location_actions.locationcreatedaction.md)

#### Parameters:

Name | Type |
:------ | :------ |
`location` | Location |

**Returns:** [*LocationCreatedAction*](../interfaces/src_social_reducers_location_actions.locationcreatedaction.md)

Defined in: [packages/client-core/src/social/reducers/location/actions.ts:84](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/client-core/src/social/reducers/location/actions.ts#L84)

___

### locationRetrieved

▸ **locationRetrieved**(`location`: *any*): [*LocationRetrievedAction*](../interfaces/src_social_reducers_location_actions.locationretrievedaction.md)

#### Parameters:

Name | Type |
:------ | :------ |
`location` | *any* |

**Returns:** [*LocationRetrievedAction*](../interfaces/src_social_reducers_location_actions.locationretrievedaction.md)

Defined in: [packages/client-core/src/social/reducers/location/actions.ts:62](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/client-core/src/social/reducers/location/actions.ts#L62)

___

### locationsRetrieved

▸ **locationsRetrieved**(`locations`: *any*): [*LocationsRetrievedAction*](../interfaces/src_social_reducers_location_actions.locationsretrievedaction.md)

#### Parameters:

Name | Type |
:------ | :------ |
`locations` | *any* |

**Returns:** [*LocationsRetrievedAction*](../interfaces/src_social_reducers_location_actions.locationsretrievedaction.md)

Defined in: [packages/client-core/src/social/reducers/location/actions.ts:55](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/client-core/src/social/reducers/location/actions.ts#L55)
