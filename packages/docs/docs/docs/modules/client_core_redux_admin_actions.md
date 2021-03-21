---
id: "client_core_redux_admin_actions"
title: "Module: client-core/redux/admin/actions"
sidebar_label: "client-core/redux/admin/actions"
custom_edit_url: null
hide_title: true
---

# Module: client-core/redux/admin/actions

## Table of contents

### Interfaces

- [InstanceRemovedResponse](../interfaces/client_core_redux_admin_actions.instanceremovedresponse.md)
- [InstancesRetrievedResponse](../interfaces/client_core_redux_admin_actions.instancesretrievedresponse.md)
- [LocationTypesRetrievedResponse](../interfaces/client_core_redux_admin_actions.locationtypesretrievedresponse.md)
- [VideoCreatedAction](../interfaces/client_core_redux_admin_actions.videocreatedaction.md)
- [VideoCreatedResponse](../interfaces/client_core_redux_admin_actions.videocreatedresponse.md)
- [VideoCreationForm](../interfaces/client_core_redux_admin_actions.videocreationform.md)
- [VideoDeletedAction](../interfaces/client_core_redux_admin_actions.videodeletedaction.md)
- [VideoDeletedResponse](../interfaces/client_core_redux_admin_actions.videodeletedresponse.md)
- [VideoUpdateForm](../interfaces/client_core_redux_admin_actions.videoupdateform.md)
- [VideoUpdatedAction](../interfaces/client_core_redux_admin_actions.videoupdatedaction.md)
- [VideoUpdatedResponse](../interfaces/client_core_redux_admin_actions.videoupdatedresponse.md)

## Functions

### instanceCreated

▸ **instanceCreated**(`instance`: *any*): [*InstanceRemovedResponse*](../interfaces/client_core_redux_admin_actions.instanceremovedresponse.md)

#### Parameters:

Name | Type |
:------ | :------ |
`instance` | *any* |

**Returns:** [*InstanceRemovedResponse*](../interfaces/client_core_redux_admin_actions.instanceremovedresponse.md)

Defined in: [packages/client-core/redux/admin/actions.ts:138](https://github.com/xr3ngine/xr3ngine/blob/5a0f83ed8/packages/client-core/redux/admin/actions.ts#L138)

___

### instancePatched

▸ **instancePatched**(`instance`: *any*): [*InstanceRemovedResponse*](../interfaces/client_core_redux_admin_actions.instanceremovedresponse.md)

#### Parameters:

Name | Type |
:------ | :------ |
`instance` | *any* |

**Returns:** [*InstanceRemovedResponse*](../interfaces/client_core_redux_admin_actions.instanceremovedresponse.md)

Defined in: [packages/client-core/redux/admin/actions.ts:152](https://github.com/xr3ngine/xr3ngine/blob/5a0f83ed8/packages/client-core/redux/admin/actions.ts#L152)

___

### instanceRemoved

▸ **instanceRemoved**(`instance`: *any*): [*InstanceRemovedResponse*](../interfaces/client_core_redux_admin_actions.instanceremovedresponse.md)

#### Parameters:

Name | Type |
:------ | :------ |
`instance` | *any* |

**Returns:** [*InstanceRemovedResponse*](../interfaces/client_core_redux_admin_actions.instanceremovedresponse.md)

Defined in: [packages/client-core/redux/admin/actions.ts:145](https://github.com/xr3ngine/xr3ngine/blob/5a0f83ed8/packages/client-core/redux/admin/actions.ts#L145)

___

### instanceRemovedAction

▸ **instanceRemovedAction**(`instance`: *any*): [*InstanceRemovedResponse*](../interfaces/client_core_redux_admin_actions.instanceremovedresponse.md)

#### Parameters:

Name | Type |
:------ | :------ |
`instance` | *any* |

**Returns:** [*InstanceRemovedResponse*](../interfaces/client_core_redux_admin_actions.instanceremovedresponse.md)

Defined in: [packages/client-core/redux/admin/actions.ts:131](https://github.com/xr3ngine/xr3ngine/blob/5a0f83ed8/packages/client-core/redux/admin/actions.ts#L131)

___

### instancesRetrievedAction

▸ **instancesRetrievedAction**(`instances`: *any*): [*InstancesRetrievedResponse*](../interfaces/client_core_redux_admin_actions.instancesretrievedresponse.md)

#### Parameters:

Name | Type |
:------ | :------ |
`instances` | *any* |

**Returns:** [*InstancesRetrievedResponse*](../interfaces/client_core_redux_admin_actions.instancesretrievedresponse.md)

Defined in: [packages/client-core/redux/admin/actions.ts:124](https://github.com/xr3ngine/xr3ngine/blob/5a0f83ed8/packages/client-core/redux/admin/actions.ts#L124)

___

### locationTypesRetrieved

▸ **locationTypesRetrieved**(`data`: *any*): [*LocationTypesRetrievedResponse*](../interfaces/client_core_redux_admin_actions.locationtypesretrievedresponse.md)

#### Parameters:

Name | Type |
:------ | :------ |
`data` | *any* |

**Returns:** [*LocationTypesRetrievedResponse*](../interfaces/client_core_redux_admin_actions.locationtypesretrievedresponse.md)

Defined in: [packages/client-core/redux/admin/actions.ts:117](https://github.com/xr3ngine/xr3ngine/blob/5a0f83ed8/packages/client-core/redux/admin/actions.ts#L117)

___

### videoCreated

▸ **videoCreated**(`data`: [*VideoCreatedResponse*](../interfaces/client_core_redux_admin_actions.videocreatedresponse.md)): [*VideoCreatedAction*](../interfaces/client_core_redux_admin_actions.videocreatedaction.md)

#### Parameters:

Name | Type |
:------ | :------ |
`data` | [*VideoCreatedResponse*](../interfaces/client_core_redux_admin_actions.videocreatedresponse.md) |

**Returns:** [*VideoCreatedAction*](../interfaces/client_core_redux_admin_actions.videocreatedaction.md)

Defined in: [packages/client-core/redux/admin/actions.ts:96](https://github.com/xr3ngine/xr3ngine/blob/5a0f83ed8/packages/client-core/redux/admin/actions.ts#L96)

___

### videoDeleted

▸ **videoDeleted**(`data`: [*VideoDeletedResponse*](../interfaces/client_core_redux_admin_actions.videodeletedresponse.md)): [*VideoDeletedAction*](../interfaces/client_core_redux_admin_actions.videodeletedaction.md)

#### Parameters:

Name | Type |
:------ | :------ |
`data` | [*VideoDeletedResponse*](../interfaces/client_core_redux_admin_actions.videodeletedresponse.md) |

**Returns:** [*VideoDeletedAction*](../interfaces/client_core_redux_admin_actions.videodeletedaction.md)

Defined in: [packages/client-core/redux/admin/actions.ts:110](https://github.com/xr3ngine/xr3ngine/blob/5a0f83ed8/packages/client-core/redux/admin/actions.ts#L110)

___

### videoUpdated

▸ **videoUpdated**(`data`: [*VideoUpdatedResponse*](../interfaces/client_core_redux_admin_actions.videoupdatedresponse.md)): [*VideoUpdatedAction*](../interfaces/client_core_redux_admin_actions.videoupdatedaction.md)

#### Parameters:

Name | Type |
:------ | :------ |
`data` | [*VideoUpdatedResponse*](../interfaces/client_core_redux_admin_actions.videoupdatedresponse.md) |

**Returns:** [*VideoUpdatedAction*](../interfaces/client_core_redux_admin_actions.videoupdatedaction.md)

Defined in: [packages/client-core/redux/admin/actions.ts:103](https://github.com/xr3ngine/xr3ngine/blob/5a0f83ed8/packages/client-core/redux/admin/actions.ts#L103)
