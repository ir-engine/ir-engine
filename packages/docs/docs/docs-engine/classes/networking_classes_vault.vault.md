---
id: "networking_classes_vault.vault"
title: "Class: Vault"
sidebar_label: "Vault"
custom_edit_url: null
hide_title: true
---

# Class: Vault

[networking/classes/Vault](../modules/networking_classes_vault.md).Vault

Component class for Snapshot interpolation.\
Snapshot is based on this [library by yandeu](https://github.com/geckosio/snapshot-interpolation).

## Constructors

### constructor

\+ **new Vault**(): [*Vault*](networking_classes_vault.vault.md)

**Returns:** [*Vault*](networking_classes_vault.vault.md)

## Properties

### vault

• **vault**: [*Snapshot*](../interfaces/networking_types_snapshotdatatypes.snapshot.md)[]

Span shot vault to store snapshots.

Defined in: [packages/engine/src/networking/classes/Vault.ts:12](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/networking/classes/Vault.ts#L12)

___

### vaultSize

• **vaultSize**: *number*= 2000

Size of the vault.

Defined in: [packages/engine/src/networking/classes/Vault.ts:14](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/networking/classes/Vault.ts#L14)

___

### instance

▪ `Static` **instance**: [*Vault*](networking_classes_vault.vault.md)

Static instance for Component.

Defined in: [packages/engine/src/networking/classes/Vault.ts:10](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/networking/classes/Vault.ts#L10)

## Accessors

### size

• get **size**(): *number*

Get the current capacity (size) of the vault.

**Returns:** *number*

Current capacity (size) of the vault.

Defined in: [packages/engine/src/networking/classes/Vault.ts:85](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/networking/classes/Vault.ts#L85)

## Methods

### add

▸ **add**(`snapshot`: [*Snapshot*](../interfaces/networking_types_snapshotdatatypes.snapshot.md)): *void*

Add a snapshot to the vault.

#### Parameters:

Name | Type | Description |
:------ | :------ | :------ |
`snapshot` | [*Snapshot*](../interfaces/networking_types_snapshotdatatypes.snapshot.md) | Snapshot to be added in vault.    |

**Returns:** *void*

Defined in: [packages/engine/src/networking/classes/Vault.ts:73](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/networking/classes/Vault.ts#L73)

___

### get

▸ **get**(): [*Snapshot*](../interfaces/networking_types_snapshotdatatypes.snapshot.md)

Get the latest snapshot

**Returns:** [*Snapshot*](../interfaces/networking_types_snapshotdatatypes.snapshot.md)

Defined in: [packages/engine/src/networking/classes/Vault.ts:42](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/networking/classes/Vault.ts#L42)

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

Defined in: [packages/engine/src/networking/classes/Vault.ts:44](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/networking/classes/Vault.ts#L44)

▸ **get**(`time`: *number*, `closest`: *boolean*): [*Snapshot*](../interfaces/networking_types_snapshotdatatypes.snapshot.md)

Get the closest snapshot to e specific time

#### Parameters:

Name | Type |
:------ | :------ |
`time` | *number* |
`closest` | *boolean* |

**Returns:** [*Snapshot*](../interfaces/networking_types_snapshotdatatypes.snapshot.md)

Defined in: [packages/engine/src/networking/classes/Vault.ts:46](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/networking/classes/Vault.ts#L46)

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

Defined in: [packages/engine/src/networking/classes/Vault.ts:21](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/networking/classes/Vault.ts#L21)

___

### getMaxSize

▸ **getMaxSize**(): *number*

Get the max capacity (size) of the vault.

**Returns:** *number*

Max capacity o the vault.

Defined in: [packages/engine/src/networking/classes/Vault.ts:101](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/networking/classes/Vault.ts#L101)

___

### setMaxSize

▸ **setMaxSize**(`size`: *number*): *void*

Set the max capacity (size) of the vault.

#### Parameters:

Name | Type | Description |
:------ | :------ | :------ |
`size` | *number* | New Max capacity of vault.    |

**Returns:** *void*

Defined in: [packages/engine/src/networking/classes/Vault.ts:93](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/networking/classes/Vault.ts#L93)

___

### test

▸ **test**(`clientSnapshot`: *any*): *any*

#### Parameters:

Name | Type |
:------ | :------ |
`clientSnapshot` | *any* |

**Returns:** *any*

Defined in: [packages/engine/src/networking/classes/Vault.ts:25](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/networking/classes/Vault.ts#L25)
