---
id: "src_storage_s3_storage.default"
title: "Class: default"
sidebar_label: "default"
custom_edit_url: null
hide_title: true
---

# Class: default

[src/storage/s3.storage](../modules/src_storage_s3_storage.md).default

## Implements

* [*StorageProviderInterface*](../interfaces/src_storage_storageprovider_interface.storageproviderinterface.md)

## Constructors

### constructor

\+ **new default**(): [*default*](src_storage_s3_storage.default.md)

**Returns:** [*default*](src_storage_s3_storage.default.md)

## Properties

### blob

• **blob**: *any*

Defined in: [packages/server/src/storage/s3.storage.ts:15](https://github.com/xr3ngine/xr3ngine/blob/66a84a950/packages/server/src/storage/s3.storage.ts#L15)

___

### bucket

• **bucket**: *string*

Defined in: [packages/server/src/storage/s3.storage.ts:8](https://github.com/xr3ngine/xr3ngine/blob/66a84a950/packages/server/src/storage/s3.storage.ts#L8)

___

### provider

• **provider**: *S3*

Defined in: [packages/server/src/storage/s3.storage.ts:9](https://github.com/xr3ngine/xr3ngine/blob/66a84a950/packages/server/src/storage/s3.storage.ts#L9)

## Methods

### deleteResources

▸ **deleteResources**(`keys`: [*string*]): *Promise*<unknown\>

#### Parameters:

Name | Type |
:------ | :------ |
`keys` | [*string*] |

**Returns:** *Promise*<unknown\>

Defined in: [packages/server/src/storage/s3.storage.ts:44](https://github.com/xr3ngine/xr3ngine/blob/66a84a950/packages/server/src/storage/s3.storage.ts#L44)

___

### getProvider

▸ **getProvider**(): *any*

**Returns:** *any*

Implementation of: [StorageProviderInterface](../interfaces/src_storage_storageprovider_interface.storageproviderinterface.md)

Defined in: [packages/server/src/storage/s3.storage.ts:22](https://github.com/xr3ngine/xr3ngine/blob/66a84a950/packages/server/src/storage/s3.storage.ts#L22)

___

### getSignedUrl

▸ **getSignedUrl**(`key`: *string*, `expiresAfter`: *number*, `conditions`: *any*): *Promise*<any\>

#### Parameters:

Name | Type |
:------ | :------ |
`key` | *string* |
`expiresAfter` | *number* |
`conditions` | *any* |

**Returns:** *Promise*<any\>

Defined in: [packages/server/src/storage/s3.storage.ts:28](https://github.com/xr3ngine/xr3ngine/blob/66a84a950/packages/server/src/storage/s3.storage.ts#L28)

___

### getStorage

▸ **getStorage**(): *any*

**Returns:** *any*

Implementation of: [StorageProviderInterface](../interfaces/src_storage_storageprovider_interface.storageproviderinterface.md)

Defined in: [packages/server/src/storage/s3.storage.ts:26](https://github.com/xr3ngine/xr3ngine/blob/66a84a950/packages/server/src/storage/s3.storage.ts#L26)
