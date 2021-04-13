---
id: "networking_functions_networkinterpolationfunctions"
title: "Module: networking/functions/NetworkInterpolationFunctions"
sidebar_label: "networking/functions/NetworkInterpolationFunctions"
custom_edit_url: null
hide_title: true
---

# Module: networking/functions/NetworkInterpolationFunctions

## Functions

### addSnapshot

▸ **addSnapshot**(`snapshot`: [*Snapshot*](../interfaces/networking_types_snapshotdatatypes.snapshot.md)): *void*

Add snapshot into vault.

#### Parameters:

Name | Type | Description |
:------ | :------ | :------ |
`snapshot` | [*Snapshot*](../interfaces/networking_types_snapshotdatatypes.snapshot.md) | Snapshot to be added into the vault.    |

**Returns:** *void*

Defined in: [packages/engine/src/networking/functions/NetworkInterpolationFunctions.ts:49](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/networking/functions/NetworkInterpolationFunctions.ts#L49)

___

### calculateInterpolation

▸ **calculateInterpolation**(`parameters`: *string*, `arrayName?`: *string*): [*InterpolatedSnapshot*](../interfaces/networking_types_snapshotdatatypes.interpolatedsnapshot.md) \| *undefined*

Get the calculated interpolation on the client.

#### Parameters:

Name | Type | Default value | Description |
:------ | :------ | :------ | :------ |
`parameters` | *string* | - | On which param interpolation should be applied.   |
`arrayName` | *string* | '' |     |

**Returns:** [*InterpolatedSnapshot*](../interfaces/networking_types_snapshotdatatypes.interpolatedsnapshot.md) \| *undefined*

Interpolated snapshot.

Defined in: [packages/engine/src/networking/functions/NetworkInterpolationFunctions.ts:268](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/networking/functions/NetworkInterpolationFunctions.ts#L268)

___

### createSnapshot

▸ **createSnapshot**(`state`: [*StateEntityGroup*](networking_types_snapshotdatatypes.md#stateentitygroup)): [*Snapshot*](../interfaces/networking_types_snapshotdatatypes.snapshot.md)

Create a new Snapshot.

#### Parameters:

Name | Type | Description |
:------ | :------ | :------ |
`state` | [*StateEntityGroup*](networking_types_snapshotdatatypes.md#stateentitygroup) | State of the world or client to be stored in this snapshot.   |

**Returns:** [*Snapshot*](../interfaces/networking_types_snapshotdatatypes.snapshot.md)

Newly created snapshot.

Defined in: [packages/engine/src/networking/functions/NetworkInterpolationFunctions.ts:22](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/networking/functions/NetworkInterpolationFunctions.ts#L22)

___

### interpolate

▸ **interpolate**(`snapshotA`: [*Snapshot*](../interfaces/networking_types_snapshotdatatypes.snapshot.md), `snapshotB`: [*Snapshot*](../interfaces/networking_types_snapshotdatatypes.snapshot.md), `timeOrPercentage`: *number*, `parameters`: *string*, `deep`: *string*): [*InterpolatedSnapshot*](../interfaces/networking_types_snapshotdatatypes.interpolatedsnapshot.md)

Interpolate between two snapshots.

#### Parameters:

Name | Type | Description |
:------ | :------ | :------ |
`snapshotA` | [*Snapshot*](../interfaces/networking_types_snapshotdatatypes.snapshot.md) | First snapshot to interpolate from.   |
`snapshotB` | [*Snapshot*](../interfaces/networking_types_snapshotdatatypes.snapshot.md) | Second snapshot to interpolate to.   |
`timeOrPercentage` | *number* | How far to interpolate from first snapshot.   |
`parameters` | *string* | On which param interpolation should be applied.   |
`deep` | *string* |     |

**Returns:** [*InterpolatedSnapshot*](../interfaces/networking_types_snapshotdatatypes.interpolatedsnapshot.md)

Interpolated snapshot.

Defined in: [packages/engine/src/networking/functions/NetworkInterpolationFunctions.ts:102](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/networking/functions/NetworkInterpolationFunctions.ts#L102)

___

### snapshot

▸ **snapshot**(): *any*

Get snapshot factory.

**Returns:** *any*

Defined in: [packages/engine/src/networking/functions/NetworkInterpolationFunctions.ts:9](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/networking/functions/NetworkInterpolationFunctions.ts#L9)
