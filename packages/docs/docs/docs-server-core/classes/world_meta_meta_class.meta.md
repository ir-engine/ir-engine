---
id: "world_meta_meta_class.meta"
title: "Class: Meta"
sidebar_label: "Meta"
custom_edit_url: null
hide_title: true
---

# Class: Meta

[world/meta/meta.class](../modules/world_meta_meta_class.md).Meta

## Implements

* *ServiceMethods*<Data\>

## Constructors

### constructor

\+ **new Meta**(`options?`: ServiceOptions, `app`: Application): [*Meta*](world_meta_meta_class.meta.md)

#### Parameters:

Name | Type | Default value |
:------ | :------ | :------ |
`options` | ServiceOptions | {} |
`app` | Application | - |

**Returns:** [*Meta*](world_meta_meta_class.meta.md)

Defined in: [packages/server-core/src/world/meta/meta.class.ts:11](https://github.com/xr3ngine/xr3ngine/blob/77d12cea0/packages/server-core/src/world/meta/meta.class.ts#L11)

## Properties

### app

• **app**: Application

Defined in: [packages/server-core/src/world/meta/meta.class.ts:9](https://github.com/xr3ngine/xr3ngine/blob/77d12cea0/packages/server-core/src/world/meta/meta.class.ts#L9)

___

### docs

• **docs**: *any*

Defined in: [packages/server-core/src/world/meta/meta.class.ts:11](https://github.com/xr3ngine/xr3ngine/blob/77d12cea0/packages/server-core/src/world/meta/meta.class.ts#L11)

___

### options

• **options**: ServiceOptions

Defined in: [packages/server-core/src/world/meta/meta.class.ts:10](https://github.com/xr3ngine/xr3ngine/blob/77d12cea0/packages/server-core/src/world/meta/meta.class.ts#L10)

## Methods

### create

▸ **create**(`data`: Data, `params?`: Params): *Promise*<Data\>

A function which is used to create new meta

**`author`** Vyacheslav Solovjov

#### Parameters:

Name | Type | Description |
:------ | :------ | :------ |
`data` | Data | for new meta   |
`params?` | Params |  |

**Returns:** *Promise*<Data\>

{@Object} created meta

Implementation of: ServiceMethods.create

Defined in: [packages/server-core/src/world/meta/meta.class.ts:53](https://github.com/xr3ngine/xr3ngine/blob/77d12cea0/packages/server-core/src/world/meta/meta.class.ts#L53)

___

### find

▸ **find**(`params?`: Params): *Promise*<Data\>

A function which is used to find meta

#### Parameters:

Name | Type |
:------ | :------ |
`params?` | Params |

**Returns:** *Promise*<Data\>

{@Object}

Implementation of: ServiceMethods.find

Defined in: [packages/server-core/src/world/meta/meta.class.ts:24](https://github.com/xr3ngine/xr3ngine/blob/77d12cea0/packages/server-core/src/world/meta/meta.class.ts#L24)

___

### get

▸ **get**(`id`: Id, `params?`: Params): *Promise*<Data\>

A function which is used to get specific meta

**`author`** Vyacheslav Solovjov

#### Parameters:

Name | Type | Description |
:------ | :------ | :------ |
`id` | Id | of specific id   |
`params?` | Params |  |

**Returns:** *Promise*<Data\>

{@Object} contains meta id and message

Implementation of: ServiceMethods.get

Defined in: [packages/server-core/src/world/meta/meta.class.ts:39](https://github.com/xr3ngine/xr3ngine/blob/77d12cea0/packages/server-core/src/world/meta/meta.class.ts#L39)

___

### patch

▸ **patch**(`id`: NullableId, `data`: Data, `params?`: Params): *Promise*<Data\>

A function which used to update meta

**`author`** Vyacheslav Solovjov

#### Parameters:

Name | Type | Description |
:------ | :------ | :------ |
`id` | NullableId |  |
`data` | Data | used to update meta   |
`params?` | Params |  |

**Returns:** *Promise*<Data\>

{@Object} update meta

Implementation of: ServiceMethods.patch

Defined in: [packages/server-core/src/world/meta/meta.class.ts:83](https://github.com/xr3ngine/xr3ngine/blob/77d12cea0/packages/server-core/src/world/meta/meta.class.ts#L83)

___

### remove

▸ **remove**(`id`: NullableId, `params?`: Params): *Promise*<Data\>

A function which is used to remove specific meta

#### Parameters:

Name | Type | Description |
:------ | :------ | :------ |
`id` | NullableId | of specific meta   |
`params?` | Params |  |

**Returns:** *Promise*<Data\>

{@Object} removed data

Implementation of: ServiceMethods.remove

Defined in: [packages/server-core/src/world/meta/meta.class.ts:94](https://github.com/xr3ngine/xr3ngine/blob/77d12cea0/packages/server-core/src/world/meta/meta.class.ts#L94)

___

### update

▸ **update**(`id`: NullableId, `data`: Data, `params?`: Params): *Promise*<Data\>

A function which used to update meta

**`author`** Vyacheslav Solovjov

#### Parameters:

Name | Type | Description |
:------ | :------ | :------ |
`id` | NullableId |  |
`data` | Data | used to update meta   |
`params?` | Params |  |

**Returns:** *Promise*<Data\>

{@Object} update meta

Implementation of: ServiceMethods.update

Defined in: [packages/server-core/src/world/meta/meta.class.ts:70](https://github.com/xr3ngine/xr3ngine/blob/77d12cea0/packages/server-core/src/world/meta/meta.class.ts#L70)
