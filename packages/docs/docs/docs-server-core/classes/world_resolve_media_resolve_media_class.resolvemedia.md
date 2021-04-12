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

Name | Type |
:------ | :------ |
`options` | ServiceOptions |
`app` | Application |

**Returns:** [*ResolveMedia*](world_resolve_media_resolve_media_class.resolvemedia.md)

Defined in: [packages/server-core/src/world/resolve-media/resolve-media.class.ts:22](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/server-core/src/world/resolve-media/resolve-media.class.ts#L22)

## Properties

### app

• **app**: Application

Defined in: [packages/server-core/src/world/resolve-media/resolve-media.class.ts:18](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/server-core/src/world/resolve-media/resolve-media.class.ts#L18)

___

### docs

• **docs**: *any*

Defined in: [packages/server-core/src/world/resolve-media/resolve-media.class.ts:22](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/server-core/src/world/resolve-media/resolve-media.class.ts#L22)

___

### models

• **models**: *any*

Defined in: [packages/server-core/src/world/resolve-media/resolve-media.class.ts:20](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/server-core/src/world/resolve-media/resolve-media.class.ts#L20)

___

### options

• **options**: ServiceOptions

Defined in: [packages/server-core/src/world/resolve-media/resolve-media.class.ts:19](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/server-core/src/world/resolve-media/resolve-media.class.ts#L19)

___

### storage

• **storage**: *any*

Defined in: [packages/server-core/src/world/resolve-media/resolve-media.class.ts:21](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/server-core/src/world/resolve-media/resolve-media.class.ts#L21)

## Methods

### create

▸ **create**(`data`: *any*, `params?`: Params): *Promise*<Data\>

#### Parameters:

Name | Type |
:------ | :------ |
`data` | *any* |
`params?` | Params |

**Returns:** *Promise*<Data\>

Implementation of: void

Defined in: [packages/server-core/src/world/resolve-media/resolve-media.class.ts:41](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/server-core/src/world/resolve-media/resolve-media.class.ts#L41)

___

### find

▸ **find**(`params?`: Params): *Promise*<Data[] \| Paginated<Data\>\>

#### Parameters:

Name | Type |
:------ | :------ |
`params?` | Params |

**Returns:** *Promise*<Data[] \| Paginated<Data\>\>

Implementation of: void

Defined in: [packages/server-core/src/world/resolve-media/resolve-media.class.ts:31](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/server-core/src/world/resolve-media/resolve-media.class.ts#L31)

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

Defined in: [packages/server-core/src/world/resolve-media/resolve-media.class.ts:35](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/server-core/src/world/resolve-media/resolve-media.class.ts#L35)

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

Defined in: [packages/server-core/src/world/resolve-media/resolve-media.class.ts:90](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/server-core/src/world/resolve-media/resolve-media.class.ts#L90)

___

### processAndGetMediaTypeHandler

▸ `Private`**processAndGetMediaTypeHandler**(`mediaUrl`: *string*): *any*

#### Parameters:

Name | Type |
:------ | :------ |
`mediaUrl` | *string* |

**Returns:** *any*

Defined in: [packages/server-core/src/world/resolve-media/resolve-media.class.ts:98](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/server-core/src/world/resolve-media/resolve-media.class.ts#L98)

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

Defined in: [packages/server-core/src/world/resolve-media/resolve-media.class.ts:94](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/server-core/src/world/resolve-media/resolve-media.class.ts#L94)

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

Defined in: [packages/server-core/src/world/resolve-media/resolve-media.class.ts:86](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/server-core/src/world/resolve-media/resolve-media.class.ts#L86)
