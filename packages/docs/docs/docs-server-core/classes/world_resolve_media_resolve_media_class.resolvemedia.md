---
id: "world_resolve_media_resolve_media_class.resolvemedia"
title: "Class: ResolveMedia"
sidebar_label: "ResolveMedia"
custom_edit_url: null
hide_title: true
---

# Class: ResolveMedia

[world/resolve-media/resolve-media.class](../modules/world_resolve_media_resolve_media_class.md).ResolveMedia

A class for Resolve Media service

**`author`** Vyacheslav Solovjov

## Implements

* *ServiceMethods*<Data\>

## Constructors

### constructor

\+ **new ResolveMedia**(`options?`: ServiceOptions, `app`: Application): [*ResolveMedia*](world_resolve_media_resolve_media_class.resolvemedia.md)

#### Parameters:

| Name | Type | Default value |
| :------ | :------ | :------ |
| `options` | ServiceOptions | {} |
| `app` | Application | - |

**Returns:** [*ResolveMedia*](world_resolve_media_resolve_media_class.resolvemedia.md)

Defined in: [packages/server-core/src/world/resolve-media/resolve-media.class.ts:22](https://github.com/xr3ngine/xr3ngine/blob/7e8e151f1/packages/server-core/src/world/resolve-media/resolve-media.class.ts#L22)

## Properties

### app

• **app**: Application

Defined in: [packages/server-core/src/world/resolve-media/resolve-media.class.ts:18](https://github.com/xr3ngine/xr3ngine/blob/7e8e151f1/packages/server-core/src/world/resolve-media/resolve-media.class.ts#L18)

___

### docs

• **docs**: *any*

Defined in: [packages/server-core/src/world/resolve-media/resolve-media.class.ts:22](https://github.com/xr3ngine/xr3ngine/blob/7e8e151f1/packages/server-core/src/world/resolve-media/resolve-media.class.ts#L22)

___

### models

• **models**: *any*

Defined in: [packages/server-core/src/world/resolve-media/resolve-media.class.ts:20](https://github.com/xr3ngine/xr3ngine/blob/7e8e151f1/packages/server-core/src/world/resolve-media/resolve-media.class.ts#L20)

___

### options

• **options**: ServiceOptions

Defined in: [packages/server-core/src/world/resolve-media/resolve-media.class.ts:19](https://github.com/xr3ngine/xr3ngine/blob/7e8e151f1/packages/server-core/src/world/resolve-media/resolve-media.class.ts#L19)

___

### storage

• **storage**: *any*

Defined in: [packages/server-core/src/world/resolve-media/resolve-media.class.ts:21](https://github.com/xr3ngine/xr3ngine/blob/7e8e151f1/packages/server-core/src/world/resolve-media/resolve-media.class.ts#L21)

## Methods

### create

▸ **create**(`data`: *any*, `params?`: Params): *Promise*<Data\>

#### Parameters:

| Name | Type |
| :------ | :------ |
| `data` | *any* |
| `params?` | Params |

**Returns:** *Promise*<Data\>

Implementation of: ServiceMethods.create

Defined in: [packages/server-core/src/world/resolve-media/resolve-media.class.ts:41](https://github.com/xr3ngine/xr3ngine/blob/7e8e151f1/packages/server-core/src/world/resolve-media/resolve-media.class.ts#L41)

___

### find

▸ **find**(`params?`: Params): *Promise*<Data[] \| Paginated<Data\>\>

#### Parameters:

| Name | Type |
| :------ | :------ |
| `params?` | Params |

**Returns:** *Promise*<Data[] \| Paginated<Data\>\>

Implementation of: ServiceMethods.find

Defined in: [packages/server-core/src/world/resolve-media/resolve-media.class.ts:31](https://github.com/xr3ngine/xr3ngine/blob/7e8e151f1/packages/server-core/src/world/resolve-media/resolve-media.class.ts#L31)

___

### get

▸ **get**(`id`: Id, `params?`: Params): *Promise*<Data\>

#### Parameters:

| Name | Type |
| :------ | :------ |
| `id` | Id |
| `params?` | Params |

**Returns:** *Promise*<Data\>

Implementation of: ServiceMethods.get

Defined in: [packages/server-core/src/world/resolve-media/resolve-media.class.ts:35](https://github.com/xr3ngine/xr3ngine/blob/7e8e151f1/packages/server-core/src/world/resolve-media/resolve-media.class.ts#L35)

___

### patch

▸ **patch**(`id`: NullableId, `data`: Data, `params?`: Params): *Promise*<Data\>

#### Parameters:

| Name | Type |
| :------ | :------ |
| `id` | NullableId |
| `data` | Data |
| `params?` | Params |

**Returns:** *Promise*<Data\>

Implementation of: ServiceMethods.patch

Defined in: [packages/server-core/src/world/resolve-media/resolve-media.class.ts:73](https://github.com/xr3ngine/xr3ngine/blob/7e8e151f1/packages/server-core/src/world/resolve-media/resolve-media.class.ts#L73)

___

### processAndGetMediaTypeHandler

▸ `Private`**processAndGetMediaTypeHandler**(`mediaUrl`: *string*): *any*

#### Parameters:

| Name | Type |
| :------ | :------ |
| `mediaUrl` | *string* |

**Returns:** *any*

Defined in: [packages/server-core/src/world/resolve-media/resolve-media.class.ts:81](https://github.com/xr3ngine/xr3ngine/blob/7e8e151f1/packages/server-core/src/world/resolve-media/resolve-media.class.ts#L81)

___

### remove

▸ **remove**(`id`: NullableId, `params?`: Params): *Promise*<Data\>

#### Parameters:

| Name | Type |
| :------ | :------ |
| `id` | NullableId |
| `params?` | Params |

**Returns:** *Promise*<Data\>

Implementation of: ServiceMethods.remove

Defined in: [packages/server-core/src/world/resolve-media/resolve-media.class.ts:77](https://github.com/xr3ngine/xr3ngine/blob/7e8e151f1/packages/server-core/src/world/resolve-media/resolve-media.class.ts#L77)

___

### update

▸ **update**(`id`: NullableId, `data`: Data, `params?`: Params): *Promise*<Data\>

#### Parameters:

| Name | Type |
| :------ | :------ |
| `id` | NullableId |
| `data` | Data |
| `params?` | Params |

**Returns:** *Promise*<Data\>

Implementation of: ServiceMethods.update

Defined in: [packages/server-core/src/world/resolve-media/resolve-media.class.ts:69](https://github.com/xr3ngine/xr3ngine/blob/7e8e151f1/packages/server-core/src/world/resolve-media/resolve-media.class.ts#L69)
