---
id: "redux_admin_service"
title: "Module: redux/admin/service"
sidebar_label: "redux/admin/service"
custom_edit_url: null
hide_title: true
---

# Module: redux/admin/service

## Functions

### createInstance

▸ **createInstance**(`instance`: *any*): *function*

#### Parameters:

Name | Type |
:------ | :------ |
`instance` | *any* |

**Returns:** (`dispatch`: *Dispatch*<AnyAction\>) => *Promise*<any\>

Defined in: [packages/client-core/redux/admin/service.ts:196](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/admin/service.ts#L196)

___

### createLocation

▸ **createLocation**(`location`: *any*): *function*

#### Parameters:

Name | Type |
:------ | :------ |
`location` | *any* |

**Returns:** (`dispatch`: *Dispatch*<AnyAction\>) => *Promise*<any\>

Defined in: [packages/client-core/redux/admin/service.ts:154](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/admin/service.ts#L154)

___

### createUser

▸ **createUser**(`user`: *any*): *function*

#### Parameters:

Name | Type |
:------ | :------ |
`user` | *any* |

**Returns:** (`dispatch`: *Dispatch*<AnyAction\>) => *Promise*<any\>

Defined in: [packages/client-core/redux/admin/service.ts:165](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/admin/service.ts#L165)

___

### createVideo

▸ **createVideo**(`data`: [*VideoCreationForm*](../interfaces/redux_admin_actions.videocreationform.md)): *function*

#### Parameters:

Name | Type |
:------ | :------ |
`data` | [*VideoCreationForm*](../interfaces/redux_admin_actions.videocreationform.md) |

**Returns:** (`dispatch`: *Dispatch*<AnyAction\>, `getState`: *any*) => *Promise*<void\>

Defined in: [packages/client-core/redux/admin/service.ts:40](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/admin/service.ts#L40)

___

### deleteVideo

▸ **deleteVideo**(`id`: *string*): *function*

#### Parameters:

Name | Type |
:------ | :------ |
`id` | *string* |

**Returns:** (`dispatch`: *Dispatch*<AnyAction\>) => *any*

Defined in: [packages/client-core/redux/admin/service.ts:70](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/admin/service.ts#L70)

___

### fetchAdminInstances

▸ **fetchAdminInstances**(): *function*

**Returns:** (`dispatch`: *Dispatch*<AnyAction\>, `getState`: *any*) => *Promise*<any\>

Defined in: [packages/client-core/redux/admin/service.ts:137](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/admin/service.ts#L137)

___

### fetchAdminLocations

▸ **fetchAdminLocations**(): *function*

**Returns:** (`dispatch`: *Dispatch*<AnyAction\>, `getState`: *any*) => *Promise*<any\>

Defined in: [packages/client-core/redux/admin/service.ts:99](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/admin/service.ts#L99)

___

### fetchAdminScenes

▸ **fetchAdminScenes**(): *function*

**Returns:** (`dispatch`: *Dispatch*<AnyAction\>) => *Promise*<any\>

Defined in: [packages/client-core/redux/admin/service.ts:244](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/admin/service.ts#L244)

___

### fetchAdminVideos

▸ **fetchAdminVideos**(): *function*

**Returns:** (`dispatch`: *Dispatch*<AnyAction\>) => *any*

Defined in: [packages/client-core/redux/admin/service.ts:80](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/admin/service.ts#L80)

___

### fetchLocationTypes

▸ **fetchLocationTypes**(): *function*

**Returns:** (`dispatch`: *Dispatch*<AnyAction\>) => *Promise*<any\>

Defined in: [packages/client-core/redux/admin/service.ts:258](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/admin/service.ts#L258)

___

### fetchUsersAsAdmin

▸ **fetchUsersAsAdmin**(`offset`: *string*): *function*

#### Parameters:

Name | Type |
:------ | :------ |
`offset` | *string* |

**Returns:** (`dispatch`: *Dispatch*<AnyAction\>, `getState`: *any*) => *Promise*<any\>

Defined in: [packages/client-core/redux/admin/service.ts:115](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/admin/service.ts#L115)

___

### patchInstance

▸ **patchInstance**(`id`: *string*, `instance`: *any*): *function*

#### Parameters:

Name | Type |
:------ | :------ |
`id` | *string* |
`instance` | *any* |

**Returns:** (`dispatch`: *Dispatch*<AnyAction\>) => *Promise*<any\>

Defined in: [packages/client-core/redux/admin/service.ts:207](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/admin/service.ts#L207)

___

### patchLocation

▸ **patchLocation**(`id`: *string*, `location`: *any*): *function*

#### Parameters:

Name | Type |
:------ | :------ |
`id` | *string* |
`location` | *any* |

**Returns:** (`dispatch`: *Dispatch*<AnyAction\>) => *Promise*<any\>

Defined in: [packages/client-core/redux/admin/service.ts:225](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/admin/service.ts#L225)

___

### patchUser

▸ **patchUser**(`id`: *string*, `user`: *any*): *function*

#### Parameters:

Name | Type |
:------ | :------ |
`id` | *string* |
`user` | *any* |

**Returns:** (`dispatch`: *Dispatch*<AnyAction\>) => *Promise*<any\>

Defined in: [packages/client-core/redux/admin/service.ts:176](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/admin/service.ts#L176)

___

### removeInstance

▸ **removeInstance**(`id`: *string*): *function*

#### Parameters:

Name | Type |
:------ | :------ |
`id` | *string* |

**Returns:** (`dispatch`: *Dispatch*<AnyAction\>) => *Promise*<any\>

Defined in: [packages/client-core/redux/admin/service.ts:218](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/admin/service.ts#L218)

___

### removeLocation

▸ **removeLocation**(`id`: *string*): *function*

#### Parameters:

Name | Type |
:------ | :------ |
`id` | *string* |

**Returns:** (`dispatch`: *Dispatch*<AnyAction\>) => *Promise*<any\>

Defined in: [packages/client-core/redux/admin/service.ts:237](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/admin/service.ts#L237)

___

### removeUser

▸ **removeUser**(`id`: *string*): *function*

#### Parameters:

Name | Type |
:------ | :------ |
`id` | *string* |

**Returns:** (`dispatch`: *Dispatch*<AnyAction\>) => *Promise*<any\>

Defined in: [packages/client-core/redux/admin/service.ts:189](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/admin/service.ts#L189)

___

### updateVideo

▸ **updateVideo**(`data`: [*VideoUpdateForm*](../interfaces/redux_admin_actions.videoupdateform.md)): *function*

#### Parameters:

Name | Type |
:------ | :------ |
`data` | [*VideoUpdateForm*](../interfaces/redux_admin_actions.videoupdateform.md) |

**Returns:** (`dispatch`: *Dispatch*<AnyAction\>) => *any*

Defined in: [packages/client-core/redux/admin/service.ts:60](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/admin/service.ts#L60)
