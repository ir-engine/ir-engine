---
id: "media_storageprovider_s3_storage.default"
title: "Class: default"
sidebar_label: "default"
custom_edit_url: null
hide_title: true
---

# Class: default

[media/storageprovider/s3.storage](../modules/media_storageprovider_s3_storage.md).default

## Implements

* [*StorageProviderInterface*](../interfaces/media_storageprovider_storageprovider_interface.storageproviderinterface.md)

## Constructors

### constructor

\+ **new default**(): [*default*](media_storageprovider_s3_storage.default.md)

**Returns:** [*default*](media_storageprovider_s3_storage.default.md)

## Properties

### blob

• **blob**: *any*

Defined in: [packages/server-core/src/media/storageprovider/s3.storage.ts:14](https://github.com/xr3ngine/xr3ngine/blob/77d12cea0/packages/server-core/src/media/storageprovider/s3.storage.ts#L14)

___

### bucket

• **bucket**: *string*

Defined in: [packages/server-core/src/media/storageprovider/s3.storage.ts:7](https://github.com/xr3ngine/xr3ngine/blob/77d12cea0/packages/server-core/src/media/storageprovider/s3.storage.ts#L7)

___

### provider

• **provider**: *S3*

Defined in: [packages/server-core/src/media/storageprovider/s3.storage.ts:8](https://github.com/xr3ngine/xr3ngine/blob/77d12cea0/packages/server-core/src/media/storageprovider/s3.storage.ts#L8)

## Methods

### deleteResources

▸ **deleteResources**(`keys`: *string*[]): *Promise*<any\>

#### Parameters:

Name | Type |
:------ | :------ |
`keys` | *string*[] |

**Returns:** *Promise*<any\>

Defined in: [packages/server-core/src/media/storageprovider/s3.storage.ts:43](https://github.com/xr3ngine/xr3ngine/blob/77d12cea0/packages/server-core/src/media/storageprovider/s3.storage.ts#L43)

___

### getProvider

▸ **getProvider**(): *any*

**Returns:** *any*

Implementation of: [StorageProviderInterface](../interfaces/media_storageprovider_storageprovider_interface.storageproviderinterface.md)

Defined in: [packages/server-core/src/media/storageprovider/s3.storage.ts:21](https://github.com/xr3ngine/xr3ngine/blob/77d12cea0/packages/server-core/src/media/storageprovider/s3.storage.ts#L21)

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

Defined in: [packages/server-core/src/media/storageprovider/s3.storage.ts:27](https://github.com/xr3ngine/xr3ngine/blob/77d12cea0/packages/server-core/src/media/storageprovider/s3.storage.ts#L27)

___

### getStorage

▸ **getStorage**(): *any*

**Returns:** *any*

Implementation of: [StorageProviderInterface](../interfaces/media_storageprovider_storageprovider_interface.storageproviderinterface.md)

Defined in: [packages/server-core/src/media/storageprovider/s3.storage.ts:25](https://github.com/xr3ngine/xr3ngine/blob/77d12cea0/packages/server-core/src/media/storageprovider/s3.storage.ts#L25)
