---
id: "client_core_redux_admin_service"
title: "Module: client-core/redux/admin/service"
sidebar_label: "client-core/redux/admin/service"
custom_edit_url: null
hide_title: true
---

# Module: client-core/redux/admin/service

## Functions

### createInstance

▸ **createInstance**(`instance`: *any*): *function*

#### Parameters:

Name | Type |
:------ | :------ |
`instance` | *any* |

**Returns:** (`dispatch`: *Dispatch*<AnyAction\>) => *Promise*<any\>

Defined in: [packages/client-core/redux/admin/service.ts:195](https://github.com/xr3ngine/xr3ngine/blob/9d253dc38/packages/client-core/redux/admin/service.ts#L195)

___

### createLocation

▸ **createLocation**(`location`: *any*): *function*

#### Parameters:

Name | Type |
:------ | :------ |
`location` | *any* |

**Returns:** (`dispatch`: *Dispatch*<AnyAction\>) => *Promise*<any\>

Defined in: [packages/client-core/redux/admin/service.ts:153](https://github.com/xr3ngine/xr3ngine/blob/9d253dc38/packages/client-core/redux/admin/service.ts#L153)

___

### createUser

▸ **createUser**(`user`: *any*): *function*

#### Parameters:

Name | Type |
:------ | :------ |
`user` | *any* |

**Returns:** (`dispatch`: *Dispatch*<AnyAction\>) => *Promise*<any\>

Defined in: [packages/client-core/redux/admin/service.ts:164](https://github.com/xr3ngine/xr3ngine/blob/9d253dc38/packages/client-core/redux/admin/service.ts#L164)

___

### createVideo

▸ **createVideo**(`data`: [*VideoCreationForm*](../interfaces/client_core_redux_admin_actions.videocreationform.md)): *function*

#### Parameters:

Name | Type |
:------ | :------ |
`data` | [*VideoCreationForm*](../interfaces/client_core_redux_admin_actions.videocreationform.md) |

**Returns:** (`dispatch`: *Dispatch*<AnyAction\>, `getState`: *any*) => *Promise*<void\>

Defined in: [packages/client-core/redux/admin/service.ts:39](https://github.com/xr3ngine/xr3ngine/blob/9d253dc38/packages/client-core/redux/admin/service.ts#L39)

___

### deleteVideo

▸ **deleteVideo**(`id`: *string*): *function*

#### Parameters:

Name | Type |
:------ | :------ |
`id` | *string* |

**Returns:** (`dispatch`: *Dispatch*<AnyAction\>) => *any*

Defined in: [packages/client-core/redux/admin/service.ts:69](https://github.com/xr3ngine/xr3ngine/blob/9d253dc38/packages/client-core/redux/admin/service.ts#L69)

___

### fetchAdminInstances

▸ **fetchAdminInstances**(): *function*

**Returns:** (`dispatch`: *Dispatch*<AnyAction\>, `getState`: *any*) => *Promise*<any\>

Defined in: [packages/client-core/redux/admin/service.ts:136](https://github.com/xr3ngine/xr3ngine/blob/9d253dc38/packages/client-core/redux/admin/service.ts#L136)

___

### fetchAdminLocations

▸ **fetchAdminLocations**(): *function*

**Returns:** (`dispatch`: *Dispatch*<AnyAction\>, `getState`: *any*) => *Promise*<any\>

Defined in: [packages/client-core/redux/admin/service.ts:98](https://github.com/xr3ngine/xr3ngine/blob/9d253dc38/packages/client-core/redux/admin/service.ts#L98)

___

### fetchAdminScenes

▸ **fetchAdminScenes**(): *function*

**Returns:** (`dispatch`: *Dispatch*<AnyAction\>) => *Promise*<any\>

Defined in: [packages/client-core/redux/admin/service.ts:243](https://github.com/xr3ngine/xr3ngine/blob/9d253dc38/packages/client-core/redux/admin/service.ts#L243)

___

### fetchAdminVideos

▸ **fetchAdminVideos**(): *function*

**Returns:** (`dispatch`: *Dispatch*<AnyAction\>) => *any*

Defined in: [packages/client-core/redux/admin/service.ts:79](https://github.com/xr3ngine/xr3ngine/blob/9d253dc38/packages/client-core/redux/admin/service.ts#L79)

___

### fetchLocationTypes

▸ **fetchLocationTypes**(): *function*

**Returns:** (`dispatch`: *Dispatch*<AnyAction\>) => *Promise*<any\>

Defined in: [packages/client-core/redux/admin/service.ts:257](https://github.com/xr3ngine/xr3ngine/blob/9d253dc38/packages/client-core/redux/admin/service.ts#L257)

___

### fetchUsersAsAdmin

▸ **fetchUsersAsAdmin**(`offset`: *string*): *function*

#### Parameters:

Name | Type |
:------ | :------ |
`offset` | *string* |

**Returns:** (`dispatch`: *Dispatch*<AnyAction\>, `getState`: *any*) => *Promise*<any\>

Defined in: [packages/client-core/redux/admin/service.ts:114](https://github.com/xr3ngine/xr3ngine/blob/9d253dc38/packages/client-core/redux/admin/service.ts#L114)

___

### patchInstance

▸ **patchInstance**(`id`: *string*, `instance`: *any*): *function*

#### Parameters:

Name | Type |
:------ | :------ |
`id` | *string* |
`instance` | *any* |

**Returns:** (`dispatch`: *Dispatch*<AnyAction\>) => *Promise*<any\>

Defined in: [packages/client-core/redux/admin/service.ts:206](https://github.com/xr3ngine/xr3ngine/blob/9d253dc38/packages/client-core/redux/admin/service.ts#L206)

___

### patchLocation

▸ **patchLocation**(`id`: *string*, `location`: *any*): *function*

#### Parameters:

Name | Type |
:------ | :------ |
`id` | *string* |
`location` | *any* |

**Returns:** (`dispatch`: *Dispatch*<AnyAction\>) => *Promise*<any\>

Defined in: [packages/client-core/redux/admin/service.ts:224](https://github.com/xr3ngine/xr3ngine/blob/9d253dc38/packages/client-core/redux/admin/service.ts#L224)

___

### patchUser

▸ **patchUser**(`id`: *string*, `user`: *any*): *function*

#### Parameters:

Name | Type |
:------ | :------ |
`id` | *string* |
`user` | *any* |

**Returns:** (`dispatch`: *Dispatch*<AnyAction\>) => *Promise*<any\>

Defined in: [packages/client-core/redux/admin/service.ts:175](https://github.com/xr3ngine/xr3ngine/blob/9d253dc38/packages/client-core/redux/admin/service.ts#L175)

___

### removeInstance

▸ **removeInstance**(`id`: *string*): *function*

#### Parameters:

Name | Type |
:------ | :------ |
`id` | *string* |

**Returns:** (`dispatch`: *Dispatch*<AnyAction\>) => *Promise*<any\>

Defined in: [packages/client-core/redux/admin/service.ts:217](https://github.com/xr3ngine/xr3ngine/blob/9d253dc38/packages/client-core/redux/admin/service.ts#L217)

___

### removeLocation

▸ **removeLocation**(`id`: *string*): *function*

#### Parameters:

Name | Type |
:------ | :------ |
`id` | *string* |

**Returns:** (`dispatch`: *Dispatch*<AnyAction\>) => *Promise*<any\>

Defined in: [packages/client-core/redux/admin/service.ts:236](https://github.com/xr3ngine/xr3ngine/blob/9d253dc38/packages/client-core/redux/admin/service.ts#L236)

___

### removeUser

▸ **removeUser**(`id`: *string*): *function*

#### Parameters:

Name | Type |
:------ | :------ |
`id` | *string* |

**Returns:** (`dispatch`: *Dispatch*<AnyAction\>) => *Promise*<any\>

Defined in: [packages/client-core/redux/admin/service.ts:188](https://github.com/xr3ngine/xr3ngine/blob/9d253dc38/packages/client-core/redux/admin/service.ts#L188)

___

### updateVideo

▸ **updateVideo**(`data`: [*VideoUpdateForm*](../interfaces/client_core_redux_admin_actions.videoupdateform.md)): *function*

#### Parameters:

Name | Type |
:------ | :------ |
`data` | [*VideoUpdateForm*](../interfaces/client_core_redux_admin_actions.videoupdateform.md) |

**Returns:** (`dispatch`: *Dispatch*<AnyAction\>) => *any*

Defined in: [packages/client-core/redux/admin/service.ts:59](https://github.com/xr3ngine/xr3ngine/blob/9d253dc38/packages/client-core/redux/admin/service.ts#L59)
