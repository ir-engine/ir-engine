---
id: "src_services_upload_presigned_upload_presigned_class.uploadpresigned"
title: "Class: UploadPresigned"
sidebar_label: "UploadPresigned"
custom_edit_url: null
hide_title: true
---

# Class: UploadPresigned

[src/services/upload-presigned/upload-presigned.class](../modules/src_services_upload_presigned_upload_presigned_class.md).UploadPresigned

A class for Upload service

**`author`** Vyacheslav Solovjov

## Implements

* *ServiceMethods*<Data\>

## Constructors

### constructor

\+ **new UploadPresigned**(`options?`: ServiceOptions, `app`: [*Application*](../modules/src_declarations.md#application)): [*UploadPresigned*](src_services_upload_presigned_upload_presigned_class.uploadpresigned.md)

#### Parameters:

Name | Type |
:------ | :------ |
`options` | ServiceOptions |
`app` | [*Application*](../modules/src_declarations.md#application) |

**Returns:** [*UploadPresigned*](src_services_upload_presigned_upload_presigned_class.uploadpresigned.md)

Defined in: [packages/server/src/services/upload-presigned/upload-presigned.class.ts:19](https://github.com/xr3ngine/xr3ngine/blob/66a84a950/packages/server/src/services/upload-presigned/upload-presigned.class.ts#L19)

## Properties

### app

• **app**: [*Application*](../modules/src_declarations.md#application)

Defined in: [packages/server/src/services/upload-presigned/upload-presigned.class.ts:16](https://github.com/xr3ngine/xr3ngine/blob/66a84a950/packages/server/src/services/upload-presigned/upload-presigned.class.ts#L16)

___

### docs

• **docs**: *any*

Defined in: [packages/server/src/services/upload-presigned/upload-presigned.class.ts:18](https://github.com/xr3ngine/xr3ngine/blob/66a84a950/packages/server/src/services/upload-presigned/upload-presigned.class.ts#L18)

___

### options

• **options**: ServiceOptions

Defined in: [packages/server/src/services/upload-presigned/upload-presigned.class.ts:17](https://github.com/xr3ngine/xr3ngine/blob/66a84a950/packages/server/src/services/upload-presigned/upload-presigned.class.ts#L17)

___

### s3

• **s3**: [*default*](src_storage_s3_storage.default.md)

Defined in: [packages/server/src/services/upload-presigned/upload-presigned.class.ts:19](https://github.com/xr3ngine/xr3ngine/blob/66a84a950/packages/server/src/services/upload-presigned/upload-presigned.class.ts#L19)

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

Defined in: [packages/server/src/services/upload-presigned/upload-presigned.class.ts:42](https://github.com/xr3ngine/xr3ngine/blob/66a84a950/packages/server/src/services/upload-presigned/upload-presigned.class.ts#L42)

___

### find

▸ **find**(`params?`: Params): *Promise*<Data[] \| Paginated<Data\>\>

#### Parameters:

Name | Type |
:------ | :------ |
`params?` | Params |

**Returns:** *Promise*<Data[] \| Paginated<Data\>\>

Implementation of: void

Defined in: [packages/server/src/services/upload-presigned/upload-presigned.class.ts:26](https://github.com/xr3ngine/xr3ngine/blob/66a84a950/packages/server/src/services/upload-presigned/upload-presigned.class.ts#L26)

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

Defined in: [packages/server/src/services/upload-presigned/upload-presigned.class.ts:30](https://github.com/xr3ngine/xr3ngine/blob/66a84a950/packages/server/src/services/upload-presigned/upload-presigned.class.ts#L30)

___

### getKeyForFilename

▸ **getKeyForFilename**(`key`: *string*): *string*

#### Parameters:

Name | Type |
:------ | :------ |
`key` | *string* |

**Returns:** *string*

Defined in: [packages/server/src/services/upload-presigned/upload-presigned.class.ts:66](https://github.com/xr3ngine/xr3ngine/blob/66a84a950/packages/server/src/services/upload-presigned/upload-presigned.class.ts#L66)

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

Defined in: [packages/server/src/services/upload-presigned/upload-presigned.class.ts:50](https://github.com/xr3ngine/xr3ngine/blob/66a84a950/packages/server/src/services/upload-presigned/upload-presigned.class.ts#L50)

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

Defined in: [packages/server/src/services/upload-presigned/upload-presigned.class.ts:54](https://github.com/xr3ngine/xr3ngine/blob/66a84a950/packages/server/src/services/upload-presigned/upload-presigned.class.ts#L54)

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

Defined in: [packages/server/src/services/upload-presigned/upload-presigned.class.ts:46](https://github.com/xr3ngine/xr3ngine/blob/66a84a950/packages/server/src/services/upload-presigned/upload-presigned.class.ts#L46)
