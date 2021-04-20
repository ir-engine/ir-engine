---
id: "src_admin_reducers_admin_actions"
title: "Module: src/admin/reducers/admin/actions"
sidebar_label: "src/admin/reducers/admin/actions"
custom_edit_url: null
hide_title: true
---

# Module: src/admin/reducers/admin/actions

## Table of contents

### Interfaces

- [InstanceRemovedResponse](../interfaces/src_admin_reducers_admin_actions.instanceremovedresponse.md)
- [InstancesRetrievedResponse](../interfaces/src_admin_reducers_admin_actions.instancesretrievedresponse.md)
- [LocationTypesRetrievedResponse](../interfaces/src_admin_reducers_admin_actions.locationtypesretrievedresponse.md)
- [VideoCreatedAction](../interfaces/src_admin_reducers_admin_actions.videocreatedaction.md)
- [VideoCreatedResponse](../interfaces/src_admin_reducers_admin_actions.videocreatedresponse.md)
- [VideoCreationForm](../interfaces/src_admin_reducers_admin_actions.videocreationform.md)
- [VideoDeletedAction](../interfaces/src_admin_reducers_admin_actions.videodeletedaction.md)
- [VideoDeletedResponse](../interfaces/src_admin_reducers_admin_actions.videodeletedresponse.md)
- [VideoUpdateForm](../interfaces/src_admin_reducers_admin_actions.videoupdateform.md)
- [VideoUpdatedAction](../interfaces/src_admin_reducers_admin_actions.videoupdatedaction.md)
- [VideoUpdatedResponse](../interfaces/src_admin_reducers_admin_actions.videoupdatedresponse.md)

## Functions

### instanceCreated

▸ **instanceCreated**(`instance`: *any*): [*InstanceRemovedResponse*](../interfaces/src_admin_reducers_admin_actions.instanceremovedresponse.md)

#### Parameters:

Name | Type |
:------ | :------ |
`instance` | *any* |

**Returns:** [*InstanceRemovedResponse*](../interfaces/src_admin_reducers_admin_actions.instanceremovedresponse.md)

Defined in: [packages/client-core/src/admin/reducers/admin/actions.ts:135](https://github.com/xr3ngine/xr3ngine/blob/65dfcf39a/packages/client-core/src/admin/reducers/admin/actions.ts#L135)

___

### instancePatched

▸ **instancePatched**(`instance`: *any*): [*InstanceRemovedResponse*](../interfaces/src_admin_reducers_admin_actions.instanceremovedresponse.md)

#### Parameters:

Name | Type |
:------ | :------ |
`instance` | *any* |

**Returns:** [*InstanceRemovedResponse*](../interfaces/src_admin_reducers_admin_actions.instanceremovedresponse.md)

Defined in: [packages/client-core/src/admin/reducers/admin/actions.ts:149](https://github.com/xr3ngine/xr3ngine/blob/65dfcf39a/packages/client-core/src/admin/reducers/admin/actions.ts#L149)

___

### instanceRemoved

▸ **instanceRemoved**(`instance`: *any*): [*InstanceRemovedResponse*](../interfaces/src_admin_reducers_admin_actions.instanceremovedresponse.md)

#### Parameters:

Name | Type |
:------ | :------ |
`instance` | *any* |

**Returns:** [*InstanceRemovedResponse*](../interfaces/src_admin_reducers_admin_actions.instanceremovedresponse.md)

Defined in: [packages/client-core/src/admin/reducers/admin/actions.ts:142](https://github.com/xr3ngine/xr3ngine/blob/65dfcf39a/packages/client-core/src/admin/reducers/admin/actions.ts#L142)

___

### instanceRemovedAction

▸ **instanceRemovedAction**(`instance`: *any*): [*InstanceRemovedResponse*](../interfaces/src_admin_reducers_admin_actions.instanceremovedresponse.md)

#### Parameters:

Name | Type |
:------ | :------ |
`instance` | *any* |

**Returns:** [*InstanceRemovedResponse*](../interfaces/src_admin_reducers_admin_actions.instanceremovedresponse.md)

Defined in: [packages/client-core/src/admin/reducers/admin/actions.ts:128](https://github.com/xr3ngine/xr3ngine/blob/65dfcf39a/packages/client-core/src/admin/reducers/admin/actions.ts#L128)

___

### instancesRetrievedAction

▸ **instancesRetrievedAction**(`instances`: *any*): [*InstancesRetrievedResponse*](../interfaces/src_admin_reducers_admin_actions.instancesretrievedresponse.md)

#### Parameters:

Name | Type |
:------ | :------ |
`instances` | *any* |

**Returns:** [*InstancesRetrievedResponse*](../interfaces/src_admin_reducers_admin_actions.instancesretrievedresponse.md)

Defined in: [packages/client-core/src/admin/reducers/admin/actions.ts:121](https://github.com/xr3ngine/xr3ngine/blob/65dfcf39a/packages/client-core/src/admin/reducers/admin/actions.ts#L121)

___

### locationTypesRetrieved

▸ **locationTypesRetrieved**(`data`: *any*): [*LocationTypesRetrievedResponse*](../interfaces/src_admin_reducers_admin_actions.locationtypesretrievedresponse.md)

#### Parameters:

Name | Type |
:------ | :------ |
`data` | *any* |

**Returns:** [*LocationTypesRetrievedResponse*](../interfaces/src_admin_reducers_admin_actions.locationtypesretrievedresponse.md)

Defined in: [packages/client-core/src/admin/reducers/admin/actions.ts:114](https://github.com/xr3ngine/xr3ngine/blob/65dfcf39a/packages/client-core/src/admin/reducers/admin/actions.ts#L114)

___

### videoCreated

▸ **videoCreated**(`data`: [*VideoCreatedResponse*](../interfaces/src_admin_reducers_admin_actions.videocreatedresponse.md)): [*VideoCreatedAction*](../interfaces/src_admin_reducers_admin_actions.videocreatedaction.md)

#### Parameters:

Name | Type |
:------ | :------ |
`data` | [*VideoCreatedResponse*](../interfaces/src_admin_reducers_admin_actions.videocreatedresponse.md) |

**Returns:** [*VideoCreatedAction*](../interfaces/src_admin_reducers_admin_actions.videocreatedaction.md)

Defined in: [packages/client-core/src/admin/reducers/admin/actions.ts:93](https://github.com/xr3ngine/xr3ngine/blob/65dfcf39a/packages/client-core/src/admin/reducers/admin/actions.ts#L93)

___

### videoDeleted

▸ **videoDeleted**(`data`: [*VideoDeletedResponse*](../interfaces/src_admin_reducers_admin_actions.videodeletedresponse.md)): [*VideoDeletedAction*](../interfaces/src_admin_reducers_admin_actions.videodeletedaction.md)

#### Parameters:

Name | Type |
:------ | :------ |
`data` | [*VideoDeletedResponse*](../interfaces/src_admin_reducers_admin_actions.videodeletedresponse.md) |

**Returns:** [*VideoDeletedAction*](../interfaces/src_admin_reducers_admin_actions.videodeletedaction.md)

Defined in: [packages/client-core/src/admin/reducers/admin/actions.ts:107](https://github.com/xr3ngine/xr3ngine/blob/65dfcf39a/packages/client-core/src/admin/reducers/admin/actions.ts#L107)

___

### videoUpdated

▸ **videoUpdated**(`data`: [*VideoUpdatedResponse*](../interfaces/src_admin_reducers_admin_actions.videoupdatedresponse.md)): [*VideoUpdatedAction*](../interfaces/src_admin_reducers_admin_actions.videoupdatedaction.md)

#### Parameters:

Name | Type |
:------ | :------ |
`data` | [*VideoUpdatedResponse*](../interfaces/src_admin_reducers_admin_actions.videoupdatedresponse.md) |

**Returns:** [*VideoUpdatedAction*](../interfaces/src_admin_reducers_admin_actions.videoupdatedaction.md)

Defined in: [packages/client-core/src/admin/reducers/admin/actions.ts:100](https://github.com/xr3ngine/xr3ngine/blob/65dfcf39a/packages/client-core/src/admin/reducers/admin/actions.ts#L100)
