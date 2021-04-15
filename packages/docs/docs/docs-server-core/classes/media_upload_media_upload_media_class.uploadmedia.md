---
id: "media_upload_media_upload_media_class.uploadmedia"
title: "Class: UploadMedia"
sidebar_label: "UploadMedia"
custom_edit_url: null
hide_title: true
---

# Class: UploadMedia

[media/upload-media/upload-media.class](../modules/media_upload_media_upload_media_class.md).UploadMedia

A class for Upload Media service

**`author`** Vyacheslav Solovjov

## Implements

* *ServiceMethods*<Data\>

## Constructors

### constructor

\+ **new UploadMedia**(`options?`: ServiceOptions, `app`: Application): [*UploadMedia*](media_upload_media_upload_media_class.uploadmedia.md)

#### Parameters:

Name | Type | Default value |
:------ | :------ | :------ |
`options` | ServiceOptions | {} |
`app` | Application | - |

**Returns:** [*UploadMedia*](media_upload_media_upload_media_class.uploadmedia.md)

Defined in: [packages/server-core/src/media/upload-media/upload-media.class.ts:15](https://github.com/xr3ngine/xr3ngine/blob/673ad6a5f/packages/server-core/src/media/upload-media/upload-media.class.ts#L15)

## Properties

### app

• **app**: Application

Defined in: [packages/server-core/src/media/upload-media/upload-media.class.ts:14](https://github.com/xr3ngine/xr3ngine/blob/673ad6a5f/packages/server-core/src/media/upload-media/upload-media.class.ts#L14)

___

### options

• **options**: ServiceOptions

Defined in: [packages/server-core/src/media/upload-media/upload-media.class.ts:15](https://github.com/xr3ngine/xr3ngine/blob/673ad6a5f/packages/server-core/src/media/upload-media/upload-media.class.ts#L15)

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

Defined in: [packages/server-core/src/media/upload-media/upload-media.class.ts:30](https://github.com/xr3ngine/xr3ngine/blob/673ad6a5f/packages/server-core/src/media/upload-media/upload-media.class.ts#L30)

___

### find

▸ **find**(`params?`: Params): *Promise*<Data[] \| Paginated<Data\>\>

#### Parameters:

Name | Type |
:------ | :------ |
`params?` | Params |

**Returns:** *Promise*<Data[] \| Paginated<Data\>\>

Implementation of: ServiceMethods.find

Defined in: [packages/server-core/src/media/upload-media/upload-media.class.ts:22](https://github.com/xr3ngine/xr3ngine/blob/673ad6a5f/packages/server-core/src/media/upload-media/upload-media.class.ts#L22)

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

Defined in: [packages/server-core/src/media/upload-media/upload-media.class.ts:26](https://github.com/xr3ngine/xr3ngine/blob/673ad6a5f/packages/server-core/src/media/upload-media/upload-media.class.ts#L26)

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

Defined in: [packages/server-core/src/media/upload-media/upload-media.class.ts:42](https://github.com/xr3ngine/xr3ngine/blob/673ad6a5f/packages/server-core/src/media/upload-media/upload-media.class.ts#L42)

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

Defined in: [packages/server-core/src/media/upload-media/upload-media.class.ts:46](https://github.com/xr3ngine/xr3ngine/blob/673ad6a5f/packages/server-core/src/media/upload-media/upload-media.class.ts#L46)

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

Defined in: [packages/server-core/src/media/upload-media/upload-media.class.ts:38](https://github.com/xr3ngine/xr3ngine/blob/673ad6a5f/packages/server-core/src/media/upload-media/upload-media.class.ts#L38)
