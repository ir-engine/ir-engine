---
id: "networking_classes_networkinterpolation.networkinterpolation"
title: "Class: NetworkInterpolation"
sidebar_label: "NetworkInterpolation"
custom_edit_url: null
hide_title: true
---

# Class: NetworkInterpolation

[networking/classes/NetworkInterpolation](../modules/networking_classes_networkinterpolation.md).NetworkInterpolation

Component class for Snapshot interpolation.\
Snap shot is based on this [library by yandeu](https://github.com/geckosio/snapshot-interpolation).

## Constructors

### constructor

\+ **new NetworkInterpolation**(): [*NetworkInterpolation*](networking_classes_networkinterpolation.networkinterpolation.md)

**Returns:** [*NetworkInterpolation*](networking_classes_networkinterpolation.networkinterpolation.md)

## Properties

### \_interpolationBuffer

• **\_interpolationBuffer**: *number*= 128

Interpolation buffer for snapshots.

Defined in: [packages/engine/src/networking/classes/NetworkInterpolation.ts:25](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/networking/classes/NetworkInterpolation.ts#L25)

___

### checkCount

• **checkCount**: *number*= 0

The number of checks that will pass before the interpolation delay decreases.

Defined in: [packages/engine/src/networking/classes/NetworkInterpolation.ts:20](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/networking/classes/NetworkInterpolation.ts#L20)

___

### checkDelay

• **checkDelay**: *number*= 0

Defined in: [packages/engine/src/networking/classes/NetworkInterpolation.ts:21](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/networking/classes/NetworkInterpolation.ts#L21)

___

### serverTime

• **serverTime**: *number*= 0

The current server time based on the current snapshot interpolation.

Defined in: [packages/engine/src/networking/classes/NetworkInterpolation.ts:27](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/networking/classes/NetworkInterpolation.ts#L27)

___

### serverTimePrev

• **serverTimePrev**: *number*= 0

Last time interpolation was performed.

Defined in: [packages/engine/src/networking/classes/NetworkInterpolation.ts:23](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/networking/classes/NetworkInterpolation.ts#L23)

___

### timeOffset

• **timeOffset**: *number*= 25

Time offset between client and server.

Defined in: [packages/engine/src/networking/classes/NetworkInterpolation.ts:18](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/networking/classes/NetworkInterpolation.ts#L18)

___

### vault

• **vault**: [*Snapshot*](../interfaces/networking_types_snapshotdatatypes.snapshot.md)[]

Vault to store snapshots.

Defined in: [packages/engine/src/networking/classes/NetworkInterpolation.ts:14](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/networking/classes/NetworkInterpolation.ts#L14)

___

### vaultSize

• **vaultSize**: *number*= 200

Size of the vault.

Defined in: [packages/engine/src/networking/classes/NetworkInterpolation.ts:16](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/networking/classes/NetworkInterpolation.ts#L16)

___

### instance

▪ `Static` **instance**: [*NetworkInterpolation*](networking_classes_networkinterpolation.networkinterpolation.md)

An instance of this class, like a singleton.

Defined in: [packages/engine/src/networking/classes/NetworkInterpolation.ts:11](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/networking/classes/NetworkInterpolation.ts#L11)

## Accessors

### interpolationBuffer

• get **interpolationBuffer**(): *any*

Get and set Interpolation buffer.

**Returns:** *any*

Defined in: [packages/engine/src/networking/classes/NetworkInterpolation.ts:30](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/networking/classes/NetworkInterpolation.ts#L30)

___

### size

• get **size**(): *number*

Get the current capacity (size) of the vault.

**Returns:** *number*

Current capacity (size) of the vault.

Defined in: [packages/engine/src/networking/classes/NetworkInterpolation.ts:98](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/networking/classes/NetworkInterpolation.ts#L98)

## Methods

### add

▸ **add**(`snapshot`: [*Snapshot*](../interfaces/networking_types_snapshotdatatypes.snapshot.md)): *void*

Add a snapshot to the vault.

#### Parameters:

Name | Type | Description |
:------ | :------ | :------ |
`snapshot` | [*Snapshot*](../interfaces/networking_types_snapshotdatatypes.snapshot.md) | Snapshot to be added in vault.    |

**Returns:** *void*

Defined in: [packages/engine/src/networking/classes/NetworkInterpolation.ts:86](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/networking/classes/NetworkInterpolation.ts#L86)

___

### get

▸ **get**(): [*Snapshot*](../interfaces/networking_types_snapshotdatatypes.snapshot.md)

Get the latest snapshot

**Returns:** [*Snapshot*](../interfaces/networking_types_snapshotdatatypes.snapshot.md)

Defined in: [packages/engine/src/networking/classes/NetworkInterpolation.ts:50](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/networking/classes/NetworkInterpolation.ts#L50)

▸ **get**(`time`: *number*): *object*

Get the two snapshots around a specific time

#### Parameters:

Name | Type |
:------ | :------ |
`time` | *number* |

**Returns:** *object*

Name | Type |
:------ | :------ |
`newer` | [*Snapshot*](../interfaces/networking_types_snapshotdatatypes.snapshot.md) |
`older` | [*Snapshot*](../interfaces/networking_types_snapshotdatatypes.snapshot.md) |

Defined in: [packages/engine/src/networking/classes/NetworkInterpolation.ts:52](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/networking/classes/NetworkInterpolation.ts#L52)

▸ **get**(`time`: *number*, `closest`: *boolean*): [*Snapshot*](../interfaces/networking_types_snapshotdatatypes.snapshot.md)

Get the closest snapshot to e specific time

#### Parameters:

Name | Type |
:------ | :------ |
`time` | *number* |
`closest` | *boolean* |

**Returns:** [*Snapshot*](../interfaces/networking_types_snapshotdatatypes.snapshot.md)

Defined in: [packages/engine/src/networking/classes/NetworkInterpolation.ts:54](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/networking/classes/NetworkInterpolation.ts#L54)

___

### getById

▸ **getById**(`id`: *string*): [*Snapshot*](../interfaces/networking_types_snapshotdatatypes.snapshot.md)

Get a Snapshot by its ID.

#### Parameters:

Name | Type | Description |
:------ | :------ | :------ |
`id` | *string* | ID of the snapshot.   |

**Returns:** [*Snapshot*](../interfaces/networking_types_snapshotdatatypes.snapshot.md)

Snapshot of given ID.

Defined in: [packages/engine/src/networking/classes/NetworkInterpolation.ts:45](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/networking/classes/NetworkInterpolation.ts#L45)

___

### getMaxSize

▸ **getMaxSize**(): *number*

Get the max capacity (size) of the vault.

**Returns:** *number*

Max capacity o the vault.

Defined in: [packages/engine/src/networking/classes/NetworkInterpolation.ts:114](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/networking/classes/NetworkInterpolation.ts#L114)

___

### setMaxSize

▸ **setMaxSize**(`size`: *number*): *void*

Set the max capacity (size) of the vault.

#### Parameters:

Name | Type | Description |
:------ | :------ | :------ |
`size` | *number* | New Max capacity of vault.    |

**Returns:** *void*

Defined in: [packages/engine/src/networking/classes/NetworkInterpolation.ts:106](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/networking/classes/NetworkInterpolation.ts#L106)
