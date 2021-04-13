---
id: "src_admin_reducers_admin_service"
title: "Module: src/admin/reducers/admin/service"
sidebar_label: "src/admin/reducers/admin/service"
custom_edit_url: null
hide_title: true
---

# Module: src/admin/reducers/admin/service

## Functions

### createInstance

▸ **createInstance**(`instance`: *any*): *function*

#### Parameters:

Name | Type |
:------ | :------ |
`instance` | *any* |

**Returns:** (`dispatch`: *Dispatch*<AnyAction\>) => *Promise*<any\>

Defined in: [packages/client-core/src/admin/reducers/admin/service.ts:182](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/client-core/src/admin/reducers/admin/service.ts#L182)

___

### createLocation

▸ **createLocation**(`location`: *any*): *function*

#### Parameters:

Name | Type |
:------ | :------ |
`location` | *any* |

**Returns:** (`dispatch`: *Dispatch*<AnyAction\>) => *Promise*<any\>

Defined in: [packages/client-core/src/admin/reducers/admin/service.ts:140](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/client-core/src/admin/reducers/admin/service.ts#L140)

___

### createUser

▸ **createUser**(`user`: *any*): *function*

#### Parameters:

Name | Type |
:------ | :------ |
`user` | *any* |

**Returns:** (`dispatch`: *Dispatch*<AnyAction\>) => *Promise*<any\>

Defined in: [packages/client-core/src/admin/reducers/admin/service.ts:151](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/client-core/src/admin/reducers/admin/service.ts#L151)

___

### createVideo

▸ **createVideo**(`data`: [*VideoCreationForm*](../interfaces/src_admin_reducers_admin_actions.videocreationform.md)): *function*

#### Parameters:

Name | Type |
:------ | :------ |
`data` | [*VideoCreationForm*](../interfaces/src_admin_reducers_admin_actions.videocreationform.md) |

**Returns:** (`dispatch`: *Dispatch*<AnyAction\>, `getState`: *any*) => *Promise*<void\>

Defined in: [packages/client-core/src/admin/reducers/admin/service.ts:26](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/client-core/src/admin/reducers/admin/service.ts#L26)

___

### deleteVideo

▸ **deleteVideo**(`id`: *string*): *function*

#### Parameters:

Name | Type |
:------ | :------ |
`id` | *string* |

**Returns:** (`dispatch`: *Dispatch*<AnyAction\>) => *any*

Defined in: [packages/client-core/src/admin/reducers/admin/service.ts:56](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/client-core/src/admin/reducers/admin/service.ts#L56)

___

### fetchAdminInstances

▸ **fetchAdminInstances**(): *function*

**Returns:** (`dispatch`: *Dispatch*<AnyAction\>, `getState`: *any*) => *Promise*<any\>

Defined in: [packages/client-core/src/admin/reducers/admin/service.ts:123](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/client-core/src/admin/reducers/admin/service.ts#L123)

___

### fetchAdminLocations

▸ **fetchAdminLocations**(): *function*

**Returns:** (`dispatch`: *Dispatch*<AnyAction\>, `getState`: *any*) => *Promise*<any\>

Defined in: [packages/client-core/src/admin/reducers/admin/service.ts:85](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/client-core/src/admin/reducers/admin/service.ts#L85)

___

### fetchAdminScenes

▸ **fetchAdminScenes**(): *function*

**Returns:** (`dispatch`: *Dispatch*<AnyAction\>) => *Promise*<any\>

Defined in: [packages/client-core/src/admin/reducers/admin/service.ts:230](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/client-core/src/admin/reducers/admin/service.ts#L230)

___

### fetchAdminVideos

▸ **fetchAdminVideos**(): *function*

**Returns:** (`dispatch`: *Dispatch*<AnyAction\>) => *any*

Defined in: [packages/client-core/src/admin/reducers/admin/service.ts:66](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/client-core/src/admin/reducers/admin/service.ts#L66)

___

### fetchLocationTypes

▸ **fetchLocationTypes**(): *function*

**Returns:** (`dispatch`: *Dispatch*<AnyAction\>) => *Promise*<any\>

Defined in: [packages/client-core/src/admin/reducers/admin/service.ts:244](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/client-core/src/admin/reducers/admin/service.ts#L244)

___

### fetchUsersAsAdmin

▸ **fetchUsersAsAdmin**(`offset`: *string*): *function*

#### Parameters:

Name | Type |
:------ | :------ |
`offset` | *string* |

**Returns:** (`dispatch`: *Dispatch*<AnyAction\>, `getState`: *any*) => *Promise*<any\>

Defined in: [packages/client-core/src/admin/reducers/admin/service.ts:101](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/client-core/src/admin/reducers/admin/service.ts#L101)

___

### patchInstance

▸ **patchInstance**(`id`: *string*, `instance`: *any*): *function*

#### Parameters:

Name | Type |
:------ | :------ |
`id` | *string* |
`instance` | *any* |

**Returns:** (`dispatch`: *Dispatch*<AnyAction\>) => *Promise*<any\>

Defined in: [packages/client-core/src/admin/reducers/admin/service.ts:193](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/client-core/src/admin/reducers/admin/service.ts#L193)

___

### patchLocation

▸ **patchLocation**(`id`: *string*, `location`: *any*): *function*

#### Parameters:

Name | Type |
:------ | :------ |
`id` | *string* |
`location` | *any* |

**Returns:** (`dispatch`: *Dispatch*<AnyAction\>) => *Promise*<any\>

Defined in: [packages/client-core/src/admin/reducers/admin/service.ts:211](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/client-core/src/admin/reducers/admin/service.ts#L211)

___

### patchUser

▸ **patchUser**(`id`: *string*, `user`: *any*): *function*

#### Parameters:

Name | Type |
:------ | :------ |
`id` | *string* |
`user` | *any* |

**Returns:** (`dispatch`: *Dispatch*<AnyAction\>) => *Promise*<any\>

Defined in: [packages/client-core/src/admin/reducers/admin/service.ts:162](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/client-core/src/admin/reducers/admin/service.ts#L162)

___

### removeInstance

▸ **removeInstance**(`id`: *string*): *function*

#### Parameters:

Name | Type |
:------ | :------ |
`id` | *string* |

**Returns:** (`dispatch`: *Dispatch*<AnyAction\>) => *Promise*<any\>

Defined in: [packages/client-core/src/admin/reducers/admin/service.ts:204](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/client-core/src/admin/reducers/admin/service.ts#L204)

___

### removeLocation

▸ **removeLocation**(`id`: *string*): *function*

#### Parameters:

Name | Type |
:------ | :------ |
`id` | *string* |

**Returns:** (`dispatch`: *Dispatch*<AnyAction\>) => *Promise*<any\>

Defined in: [packages/client-core/src/admin/reducers/admin/service.ts:223](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/client-core/src/admin/reducers/admin/service.ts#L223)

___

### removeUserAdmin

▸ **removeUserAdmin**(`id`: *string*): *function*

#### Parameters:

Name | Type |
:------ | :------ |
`id` | *string* |

**Returns:** (`dispatch`: *Dispatch*<AnyAction\>) => *Promise*<any\>

Defined in: [packages/client-core/src/admin/reducers/admin/service.ts:175](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/client-core/src/admin/reducers/admin/service.ts#L175)

___

### updateVideo

▸ **updateVideo**(`data`: [*VideoUpdateForm*](../interfaces/src_admin_reducers_admin_actions.videoupdateform.md)): *function*

#### Parameters:

Name | Type |
:------ | :------ |
`data` | [*VideoUpdateForm*](../interfaces/src_admin_reducers_admin_actions.videoupdateform.md) |

**Returns:** (`dispatch`: *Dispatch*<AnyAction\>) => *any*

Defined in: [packages/client-core/src/admin/reducers/admin/service.ts:46](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/client-core/src/admin/reducers/admin/service.ts#L46)
