---
id: "src_services_upload_media_upload_media_class.uploadmedia"
title: "Class: UploadMedia"
sidebar_label: "UploadMedia"
custom_edit_url: null
hide_title: true
---

# Class: UploadMedia

[src/services/upload-media/upload-media.class](../modules/src_services_upload_media_upload_media_class.md).UploadMedia

A class for Upload Media service

**`author`** Vyacheslav Solovjov

## Implements

* *ServiceMethods*<Data\>

## Constructors

### constructor

\+ **new UploadMedia**(`options?`: ServiceOptions, `app`: [*Application*](../modules/src_declarations.md#application)): [*UploadMedia*](src_services_upload_media_upload_media_class.uploadmedia.md)

#### Parameters:

Name | Type |
:------ | :------ |
`options` | ServiceOptions |
`app` | [*Application*](../modules/src_declarations.md#application) |

**Returns:** [*UploadMedia*](src_services_upload_media_upload_media_class.uploadmedia.md)

Defined in: [packages/server/src/services/upload-media/upload-media.class.ts:15](https://github.com/xr3ngine/xr3ngine/blob/66a84a950/packages/server/src/services/upload-media/upload-media.class.ts#L15)

## Properties

### app

• **app**: [*Application*](../modules/src_declarations.md#application)

Defined in: [packages/server/src/services/upload-media/upload-media.class.ts:14](https://github.com/xr3ngine/xr3ngine/blob/66a84a950/packages/server/src/services/upload-media/upload-media.class.ts#L14)

___

### options

• **options**: ServiceOptions

Defined in: [packages/server/src/services/upload-media/upload-media.class.ts:15](https://github.com/xr3ngine/xr3ngine/blob/66a84a950/packages/server/src/services/upload-media/upload-media.class.ts#L15)

## Methods

### create

▸ **create**(`data`: Data, `params?`: Params): *Promise*<Data\>

#### Parameters:

Name | Type |
:------ | :------ |
`data` | Data |
`params?` | Params |

**Returns:** *Promise*<Data\>

Implementation of: void

Defined in: [packages/server/src/services/upload-media/upload-media.class.ts:30](https://github.com/xr3ngine/xr3ngine/blob/66a84a950/packages/server/src/services/upload-media/upload-media.class.ts#L30)

___

### find

▸ **find**(`params?`: Params): *Promise*<Data[] \| Paginated<Data\>\>

#### Parameters:

Name | Type |
:------ | :------ |
`params?` | Params |

**Returns:** *Promise*<Data[] \| Paginated<Data\>\>

Implementation of: void

Defined in: [packages/server/src/services/upload-media/upload-media.class.ts:22](https://github.com/xr3ngine/xr3ngine/blob/66a84a950/packages/server/src/services/upload-media/upload-media.class.ts#L22)

___

### get

▸ **get**(`id`: Id, `params?`: Params): *Promise*<Data\>

#### Parameters:

Name | Type |
:------ | :------ |
`id` | Id |
`params?` | Params |

**Returns:** *Promise*<Data\>

Implementation of: void

Defined in: [packages/server/src/services/upload-media/upload-media.class.ts:26](https://github.com/xr3ngine/xr3ngine/blob/66a84a950/packages/server/src/services/upload-media/upload-media.class.ts#L26)

___

### patch

▸ **patch**(`id`: Id, `data`: Data, `params?`: Params): *Promise*<Data\>

#### Parameters:

Name | Type |
:------ | :------ |
`id` | Id |
`data` | Data |
`params?` | Params |

**Returns:** *Promise*<Data\>

Implementation of: void

Defined in: [packages/server/src/services/upload-media/upload-media.class.ts:42](https://github.com/xr3ngine/xr3ngine/blob/66a84a950/packages/server/src/services/upload-media/upload-media.class.ts#L42)

___

### remove

▸ **remove**(`id`: Id, `params?`: Params): *Promise*<Data\>

#### Parameters:

Name | Type |
:------ | :------ |
`id` | Id |
`params?` | Params |

**Returns:** *Promise*<Data\>

Implementation of: void

Defined in: [packages/server/src/services/upload-media/upload-media.class.ts:46](https://github.com/xr3ngine/xr3ngine/blob/66a84a950/packages/server/src/services/upload-media/upload-media.class.ts#L46)

___

### update

▸ **update**(`id`: Id, `data`: Data, `params?`: Params): *Promise*<Data\>

#### Parameters:

Name | Type |
:------ | :------ |
`id` | Id |
`data` | Data |
`params?` | Params |

**Returns:** *Promise*<Data\>

Implementation of: void

Defined in: [packages/server/src/services/upload-media/upload-media.class.ts:38](https://github.com/xr3ngine/xr3ngine/blob/66a84a950/packages/server/src/services/upload-media/upload-media.class.ts#L38)
