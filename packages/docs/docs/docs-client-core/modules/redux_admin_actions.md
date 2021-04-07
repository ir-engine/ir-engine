---
id: "redux_admin_actions"
title: "Module: redux/admin/actions"
sidebar_label: "redux/admin/actions"
custom_edit_url: null
hide_title: true
---

# Module: redux/admin/actions

## Table of contents

### Interfaces

- [InstanceRemovedResponse](../interfaces/redux_admin_actions.instanceremovedresponse.md)
- [InstancesRetrievedResponse](../interfaces/redux_admin_actions.instancesretrievedresponse.md)
- [LocationTypesRetrievedResponse](../interfaces/redux_admin_actions.locationtypesretrievedresponse.md)
- [VideoCreatedAction](../interfaces/redux_admin_actions.videocreatedaction.md)
- [VideoCreatedResponse](../interfaces/redux_admin_actions.videocreatedresponse.md)
- [VideoCreationForm](../interfaces/redux_admin_actions.videocreationform.md)
- [VideoDeletedAction](../interfaces/redux_admin_actions.videodeletedaction.md)
- [VideoDeletedResponse](../interfaces/redux_admin_actions.videodeletedresponse.md)
- [VideoUpdateForm](../interfaces/redux_admin_actions.videoupdateform.md)
- [VideoUpdatedAction](../interfaces/redux_admin_actions.videoupdatedaction.md)
- [VideoUpdatedResponse](../interfaces/redux_admin_actions.videoupdatedresponse.md)

## Functions

### instanceCreated

▸ **instanceCreated**(`instance`: *any*): [*InstanceRemovedResponse*](../interfaces/redux_admin_actions.instanceremovedresponse.md)

#### Parameters:

Name | Type |
:------ | :------ |
`instance` | *any* |

**Returns:** [*InstanceRemovedResponse*](../interfaces/redux_admin_actions.instanceremovedresponse.md)

Defined in: [packages/client-core/redux/admin/actions.ts:138](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/admin/actions.ts#L138)

___

### instancePatched

▸ **instancePatched**(`instance`: *any*): [*InstanceRemovedResponse*](../interfaces/redux_admin_actions.instanceremovedresponse.md)

#### Parameters:

Name | Type |
:------ | :------ |
`instance` | *any* |

**Returns:** [*InstanceRemovedResponse*](../interfaces/redux_admin_actions.instanceremovedresponse.md)

Defined in: [packages/client-core/redux/admin/actions.ts:152](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/admin/actions.ts#L152)

___

### instanceRemoved

▸ **instanceRemoved**(`instance`: *any*): [*InstanceRemovedResponse*](../interfaces/redux_admin_actions.instanceremovedresponse.md)

#### Parameters:

Name | Type |
:------ | :------ |
`instance` | *any* |

**Returns:** [*InstanceRemovedResponse*](../interfaces/redux_admin_actions.instanceremovedresponse.md)

Defined in: [packages/client-core/redux/admin/actions.ts:145](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/admin/actions.ts#L145)

___

### instanceRemovedAction

▸ **instanceRemovedAction**(`instance`: *any*): [*InstanceRemovedResponse*](../interfaces/redux_admin_actions.instanceremovedresponse.md)

#### Parameters:

Name | Type |
:------ | :------ |
`instance` | *any* |

**Returns:** [*InstanceRemovedResponse*](../interfaces/redux_admin_actions.instanceremovedresponse.md)

Defined in: [packages/client-core/redux/admin/actions.ts:131](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/admin/actions.ts#L131)

___

### instancesRetrievedAction

▸ **instancesRetrievedAction**(`instances`: *any*): [*InstancesRetrievedResponse*](../interfaces/redux_admin_actions.instancesretrievedresponse.md)

#### Parameters:

Name | Type |
:------ | :------ |
`instances` | *any* |

**Returns:** [*InstancesRetrievedResponse*](../interfaces/redux_admin_actions.instancesretrievedresponse.md)

Defined in: [packages/client-core/redux/admin/actions.ts:124](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/admin/actions.ts#L124)

___

### locationTypesRetrieved

▸ **locationTypesRetrieved**(`data`: *any*): [*LocationTypesRetrievedResponse*](../interfaces/redux_admin_actions.locationtypesretrievedresponse.md)

#### Parameters:

Name | Type |
:------ | :------ |
`data` | *any* |

**Returns:** [*LocationTypesRetrievedResponse*](../interfaces/redux_admin_actions.locationtypesretrievedresponse.md)

Defined in: [packages/client-core/redux/admin/actions.ts:117](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/admin/actions.ts#L117)

___

### videoCreated

▸ **videoCreated**(`data`: [*VideoCreatedResponse*](../interfaces/redux_admin_actions.videocreatedresponse.md)): [*VideoCreatedAction*](../interfaces/redux_admin_actions.videocreatedaction.md)

#### Parameters:

Name | Type |
:------ | :------ |
`data` | [*VideoCreatedResponse*](../interfaces/redux_admin_actions.videocreatedresponse.md) |

**Returns:** [*VideoCreatedAction*](../interfaces/redux_admin_actions.videocreatedaction.md)

Defined in: [packages/client-core/redux/admin/actions.ts:96](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/admin/actions.ts#L96)

___

### videoDeleted

▸ **videoDeleted**(`data`: [*VideoDeletedResponse*](../interfaces/redux_admin_actions.videodeletedresponse.md)): [*VideoDeletedAction*](../interfaces/redux_admin_actions.videodeletedaction.md)

#### Parameters:

Name | Type |
:------ | :------ |
`data` | [*VideoDeletedResponse*](../interfaces/redux_admin_actions.videodeletedresponse.md) |

**Returns:** [*VideoDeletedAction*](../interfaces/redux_admin_actions.videodeletedaction.md)

Defined in: [packages/client-core/redux/admin/actions.ts:110](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/admin/actions.ts#L110)

___

### videoUpdated

▸ **videoUpdated**(`data`: [*VideoUpdatedResponse*](../interfaces/redux_admin_actions.videoupdatedresponse.md)): [*VideoUpdatedAction*](../interfaces/redux_admin_actions.videoupdatedaction.md)

#### Parameters:

Name | Type |
:------ | :------ |
`data` | [*VideoUpdatedResponse*](../interfaces/redux_admin_actions.videoupdatedresponse.md) |

**Returns:** [*VideoUpdatedAction*](../interfaces/redux_admin_actions.videoupdatedaction.md)

Defined in: [packages/client-core/redux/admin/actions.ts:103](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/admin/actions.ts#L103)
