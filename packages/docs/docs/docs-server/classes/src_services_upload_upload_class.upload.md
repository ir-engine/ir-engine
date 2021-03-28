---
id: "src_services_upload_upload_class.upload"
title: "Class: Upload"
sidebar_label: "Upload"
custom_edit_url: null
hide_title: true
---

# Class: Upload

[src/services/upload/upload.class](../modules/src_services_upload_upload_class.md).Upload

A class for Upload service

**`author`** Vyacheslav Solovjov

## Implements

* *ServiceMethods*<Data\>

## Constructors

### constructor

\+ **new Upload**(`options?`: ServiceOptions, `app`: [*Application*](../modules/src_declarations.md#application)): [*Upload*](src_services_upload_upload_class.upload.md)

#### Parameters:

Name | Type |
:------ | :------ |
`options` | ServiceOptions |
`app` | [*Application*](../modules/src_declarations.md#application) |

**Returns:** [*Upload*](src_services_upload_upload_class.upload.md)

Defined in: [packages/server/src/services/upload/upload.class.ts:16](https://github.com/xr3ngine/xr3ngine/blob/66a84a950/packages/server/src/services/upload/upload.class.ts#L16)

## Properties

### app

• **app**: [*Application*](../modules/src_declarations.md#application)

Defined in: [packages/server/src/services/upload/upload.class.ts:14](https://github.com/xr3ngine/xr3ngine/blob/66a84a950/packages/server/src/services/upload/upload.class.ts#L14)

___

### docs

• **docs**: *any*

Defined in: [packages/server/src/services/upload/upload.class.ts:16](https://github.com/xr3ngine/xr3ngine/blob/66a84a950/packages/server/src/services/upload/upload.class.ts#L16)

___

### options

• **options**: ServiceOptions

Defined in: [packages/server/src/services/upload/upload.class.ts:15](https://github.com/xr3ngine/xr3ngine/blob/66a84a950/packages/server/src/services/upload/upload.class.ts#L15)

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

Defined in: [packages/server/src/services/upload/upload.class.ts:33](https://github.com/xr3ngine/xr3ngine/blob/66a84a950/packages/server/src/services/upload/upload.class.ts#L33)

___

### find

▸ **find**(`params?`: Params): *Promise*<Data[] \| Paginated<Data\>\>

#### Parameters:

Name | Type |
:------ | :------ |
`params?` | Params |

**Returns:** *Promise*<Data[] \| Paginated<Data\>\>

Implementation of: void

Defined in: [packages/server/src/services/upload/upload.class.ts:23](https://github.com/xr3ngine/xr3ngine/blob/66a84a950/packages/server/src/services/upload/upload.class.ts#L23)

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

Defined in: [packages/server/src/services/upload/upload.class.ts:27](https://github.com/xr3ngine/xr3ngine/blob/66a84a950/packages/server/src/services/upload/upload.class.ts#L27)

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

Defined in: [packages/server/src/services/upload/upload.class.ts:52](https://github.com/xr3ngine/xr3ngine/blob/66a84a950/packages/server/src/services/upload/upload.class.ts#L52)

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

Defined in: [packages/server/src/services/upload/upload.class.ts:56](https://github.com/xr3ngine/xr3ngine/blob/66a84a950/packages/server/src/services/upload/upload.class.ts#L56)

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

Defined in: [packages/server/src/services/upload/upload.class.ts:48](https://github.com/xr3ngine/xr3ngine/blob/66a84a950/packages/server/src/services/upload/upload.class.ts#L48)
