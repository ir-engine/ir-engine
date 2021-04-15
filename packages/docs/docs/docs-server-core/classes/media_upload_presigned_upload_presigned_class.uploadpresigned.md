---
id: "media_upload_presigned_upload_presigned_class.uploadpresigned"
title: "Class: UploadPresigned"
sidebar_label: "UploadPresigned"
custom_edit_url: null
hide_title: true
---

# Class: UploadPresigned

[media/upload-presigned/upload-presigned.class](../modules/media_upload_presigned_upload_presigned_class.md).UploadPresigned

A class for Upload service

**`author`** Vyacheslav Solovjov

## Implements

* *ServiceMethods*<Data\>

## Constructors

### constructor

\+ **new UploadPresigned**(`options?`: ServiceOptions, `app`: Application): [*UploadPresigned*](media_upload_presigned_upload_presigned_class.uploadpresigned.md)

#### Parameters:

Name | Type | Default value |
:------ | :------ | :------ |
`options` | ServiceOptions | {} |
`app` | Application | - |

**Returns:** [*UploadPresigned*](media_upload_presigned_upload_presigned_class.uploadpresigned.md)

Defined in: [packages/server-core/src/media/upload-presigned/upload-presigned.class.ts:20](https://github.com/xr3ngine/xr3ngine/blob/673ad6a5f/packages/server-core/src/media/upload-presigned/upload-presigned.class.ts#L20)

## Properties

### app

• **app**: Application

Defined in: [packages/server-core/src/media/upload-presigned/upload-presigned.class.ts:17](https://github.com/xr3ngine/xr3ngine/blob/673ad6a5f/packages/server-core/src/media/upload-presigned/upload-presigned.class.ts#L17)

___

### docs

• **docs**: *any*

Defined in: [packages/server-core/src/media/upload-presigned/upload-presigned.class.ts:19](https://github.com/xr3ngine/xr3ngine/blob/673ad6a5f/packages/server-core/src/media/upload-presigned/upload-presigned.class.ts#L19)

___

### options

• **options**: ServiceOptions

Defined in: [packages/server-core/src/media/upload-presigned/upload-presigned.class.ts:18](https://github.com/xr3ngine/xr3ngine/blob/673ad6a5f/packages/server-core/src/media/upload-presigned/upload-presigned.class.ts#L18)

___

### s3

• **s3**: [*S3Provider*](media_storageprovider_s3_storage.s3provider.md)

Defined in: [packages/server-core/src/media/upload-presigned/upload-presigned.class.ts:20](https://github.com/xr3ngine/xr3ngine/blob/673ad6a5f/packages/server-core/src/media/upload-presigned/upload-presigned.class.ts#L20)

## Methods

### create

▸ **create**(`data`: Data, `params?`: Params): *Promise*<Data\>

#### Parameters:

Name | Type |
:------ | :------ |
`data` | Data |
`params?` | Params |

**Returns:** *Promise*<Data\>

Implementation of: ServiceMethods.create

Defined in: [packages/server-core/src/media/upload-presigned/upload-presigned.class.ts:43](https://github.com/xr3ngine/xr3ngine/blob/673ad6a5f/packages/server-core/src/media/upload-presigned/upload-presigned.class.ts#L43)

___

### find

▸ **find**(`params?`: Params): *Promise*<Data[] \| Paginated<Data\>\>

#### Parameters:

Name | Type |
:------ | :------ |
`params?` | Params |

**Returns:** *Promise*<Data[] \| Paginated<Data\>\>

Implementation of: ServiceMethods.find

Defined in: [packages/server-core/src/media/upload-presigned/upload-presigned.class.ts:27](https://github.com/xr3ngine/xr3ngine/blob/673ad6a5f/packages/server-core/src/media/upload-presigned/upload-presigned.class.ts#L27)

___

### get

▸ **get**(`id`: Id, `params?`: Params): *Promise*<Data\>

#### Parameters:

Name | Type |
:------ | :------ |
`id` | Id |
`params?` | Params |

**Returns:** *Promise*<Data\>

Implementation of: ServiceMethods.get

Defined in: [packages/server-core/src/media/upload-presigned/upload-presigned.class.ts:31](https://github.com/xr3ngine/xr3ngine/blob/673ad6a5f/packages/server-core/src/media/upload-presigned/upload-presigned.class.ts#L31)

___

### getKeyForFilename

▸ **getKeyForFilename**(`key`: *string*): *string*

#### Parameters:

Name | Type |
:------ | :------ |
`key` | *string* |

**Returns:** *string*

Defined in: [packages/server-core/src/media/upload-presigned/upload-presigned.class.ts:67](https://github.com/xr3ngine/xr3ngine/blob/673ad6a5f/packages/server-core/src/media/upload-presigned/upload-presigned.class.ts#L67)

___

### patch

▸ **patch**(`id`: NullableId, `data`: Data, `params?`: Params): *Promise*<Data\>

#### Parameters:

Name | Type |
:------ | :------ |
`id` | NullableId |
`data` | Data |
`params?` | Params |

**Returns:** *Promise*<Data\>

Implementation of: ServiceMethods.patch

Defined in: [packages/server-core/src/media/upload-presigned/upload-presigned.class.ts:51](https://github.com/xr3ngine/xr3ngine/blob/673ad6a5f/packages/server-core/src/media/upload-presigned/upload-presigned.class.ts#L51)

___

### remove

▸ **remove**(`id`: NullableId, `params?`: Params): *Promise*<Data\>

#### Parameters:

Name | Type |
:------ | :------ |
`id` | NullableId |
`params?` | Params |

**Returns:** *Promise*<Data\>

Implementation of: ServiceMethods.remove

Defined in: [packages/server-core/src/media/upload-presigned/upload-presigned.class.ts:55](https://github.com/xr3ngine/xr3ngine/blob/673ad6a5f/packages/server-core/src/media/upload-presigned/upload-presigned.class.ts#L55)

___

### update

▸ **update**(`id`: NullableId, `data`: Data, `params?`: Params): *Promise*<Data\>

#### Parameters:

Name | Type |
:------ | :------ |
`id` | NullableId |
`data` | Data |
`params?` | Params |

**Returns:** *Promise*<Data\>

Implementation of: ServiceMethods.update

Defined in: [packages/server-core/src/media/upload-presigned/upload-presigned.class.ts:47](https://github.com/xr3ngine/xr3ngine/blob/673ad6a5f/packages/server-core/src/media/upload-presigned/upload-presigned.class.ts#L47)
